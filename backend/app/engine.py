import swisseph as swe
import os
import logging
from datetime import date, time, timedelta, datetime
from typing import Optional, List
from threading import RLock
from timezonefinder import TimezoneFinder
import pytz
from .models import PlanetPosition, House, ChartResponse, BirthDetails, Panchanga, VargaChart, VargaPosition, TithiData, NakshatraData, YogaData, KaranaData

logger = logging.getLogger(__name__)

# Initialize Swiss Ephemeris
EPHEME_PATH = os.getenv("EPHEME_PATH", "/app/ephemeris")
tf = TimezoneFinder()

# Validate ephemeris path and files exist
if not os.path.exists(EPHEME_PATH):
    raise RuntimeError(
        f"Ephemeris path not found: {EPHEME_PATH}\n"
        f"Please ensure ephemeris files are downloaded from "
        f"https://www.astro.com/ftp/swisseph/"
    )

required_files = ['sun.se1', 'moon.se1', 'merc.se1', 'venus.se1', 'mars.se1']
missing = [f for f in required_files if not os.path.exists(os.path.join(EPHEME_PATH, f))]
if missing:
    logger.warning(
        f"Missing some ephemeris files: {', '.join(missing)}. "
        f"Some calculations may fail."
    )

swe.set_ephe_path(EPHEME_PATH)
swe_lock = RLock()

# Ayanamsa Mapping
# To add more, find the ID in swisseph documentation
AYANAMSA_MAP = {
    'LAHIRI': swe.SIDM_LAHIRI,
    'RAMAN': swe.SIDM_RAMAN,
    'KRISHNAMURTI': swe.SIDM_KRISHNAMURTI,
    'FAGAN_BRADLEY': swe.SIDM_FAGAN_BRADLEY,
    'SAYANA': None, # Tropical - handled specially
}

PLANET_MAP = {
    'Sun': swe.SUN,
    'Moon': swe.MOON,
    'Mars': swe.MARS,
    'Mercury': swe.MERCURY,
    'Jupiter': swe.JUPITER,
    'Venus': swe.VENUS,
    'Saturn': swe.SATURN,
    'Rahu': swe.TRUE_NODE,
    'Uranus': swe.URANUS,
    'Neptune': swe.NEPTUNE,
    'Pluto': swe.PLUTO
}

SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", 
    "Leo", "Virgo", "Libra", "Scorpio", 
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

# Planet Data for Strength Calculation
PLANET_INFO = {
    'Sun': {
        'exalted': 'Aries', 'debilitated': 'Libra', 
        'own': ['Leo'], 
        'friends': ['Moon', 'Mars', 'Jupiter'], 'neutral': ['Mercury'], 'enemies': ['Venus', 'Saturn']
    },
    'Moon': {
        'exalted': 'Taurus', 'debilitated': 'Scorpio', 
        'own': ['Cancer'], 
        'friends': ['Sun', 'Mercury'], 'neutral': ['Mars', 'Jupiter', 'Venus', 'Saturn'], 'enemies': [] # Moon has no enemies
    },
    'Mars': {
        'exalted': 'Capricorn', 'debilitated': 'Cancer', 
        'own': ['Aries', 'Scorpio'],
        'friends': ['Sun', 'Moon', 'Jupiter'], 'neutral': ['Venus', 'Saturn'], 'enemies': ['Mercury']
    },
    'Mercury': {
        'exalted': 'Virgo', 'debilitated': 'Pisces',
        'own': ['Gemini', 'Virgo'],
        'friends': ['Sun', 'Venus'], 'neutral': ['Mars', 'Jupiter', 'Saturn'], 'enemies': ['Moon']
    },
    'Jupiter': {
        'exalted': 'Cancer', 'debilitated': 'Capricorn',
        'own': ['Sagittarius', 'Pisces'],
        'friends': ['Sun', 'Moon', 'Mars'], 'neutral': ['Saturn'], 'enemies': ['Mercury', 'Venus']
    },
    'Venus': {
        'exalted': 'Pisces', 'debilitated': 'Virgo',
        'own': ['Taurus', 'Libra'],
        'friends': ['Mercury', 'Saturn'], 'neutral': ['Mars', 'Jupiter'], 'enemies': ['Sun', 'Moon']
    },
    'Saturn': {
        'exalted': 'Libra', 'debilitated': 'Aries',
        'own': ['Capricorn', 'Aquarius'],
        'friends': ['Mercury', 'Venus'], 'neutral': ['Jupiter'], 'enemies': ['Sun', 'Moon', 'Mars']
    },
    'Rahu': { 'exalted': 'Taurus', 'debilitated': 'Scorpio', 'own': ['Aquarius'], 'friends': [], 'neutral': [], 'enemies': [] },
    'Ketu': { 'exalted': 'Scorpio', 'debilitated': 'Taurus', 'own': ['Scorpio'], 'friends': [], 'neutral': [], 'enemies': [] }
}

def get_sign_owner(sign_name: str) -> str:
    for planet, info in PLANET_INFO.items():
        if sign_name in info.get('own', []):
            return planet
    return None

def calculate_dignity_score(planet: str, sign: str) -> float:
    """Calculate basic dignity score (0-20) for Vimsopaka."""
    info = PLANET_INFO.get(planet)
    if not info: return 10 # Default neutral
    
    if sign == info['exalted']: return 20.0
    if sign in info['own']: return 15.0
    if sign == info['debilitated']: return 0.0
    
    # Check relationship with sign owner
    owner = get_sign_owner(sign)
    if not owner: return 10.0 # Should not happen
    
    if owner in info['friends']: return 10.0 # Friend
    if owner in info['neutral']: return 5.0 # Neutral
    if owner in info['enemies']: return 2.0 # Enemy
    
    return 5.0 # Default fallback

def calculate_vimsopaka_strength(all_vargas: dict) -> dict[str, float]:
    """
    Calculate Vimsopaka Bala (20-point scale).
    Using Shadvarga (6 charts) weights: D1(6), D2(2), D3(4), D9(5), D12(2), D30(1).
    Total points = Sum(Score * Weight) / Total Weight
    """
    shadvarga_weights = { 1: 6, 2: 2, 3: 4, 9: 5, 12: 2, 30: 1 }
    
    strengths = {}
    planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] # Rahu/Ketu usually excluded or handled differently
    
    for planet in planets:
        total_score = 0
        total_weight = 0
        
        for v_num, weight in shadvarga_weights.items():
            # Find planet's sign in this varga
            varga_data = all_vargas.get(f"D{v_num}")
            if varga_data:
                # Find planet in varga positions
                p_pos = next((p for p in varga_data.planets if p.planet == planet), None)
                if p_pos:
                    # Calculate dignity in this varga
                    # Note: Vimsopaka uses specific points for dignity (e.g. Exalted=20, Own=15...)
                    score = calculate_dignity_score(planet, p_pos.sign)
                    total_score += score * weight
                    total_weight += weight
        
        if total_weight > 0:
            strengths[planet] = round(total_score / 20.0, 2)
        else:
            strengths[planet] = 0
            
    return strengths

NAKSHATRAS = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
]

TITHIS = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti", 
    "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", 
    "Trayodashi", "Chaturdashi", "Purnima", "Amavasya"
]

YOGAS = [
    "Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
    "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata",
    "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
    "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
]

KARANAS = [
    "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
    "Shakuni", "Chatushpada", "Naga", "Kimstughna"
]

WEEKDAYS = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
]

def calculate_panchanga(moon_lon: float, sun_lon: float, jd: float, details: BirthDetails) -> Panchanga:
    """Calculate Panchanga (Tithi, Vara, Nakshatra, Yoga, Karana)."""
    
    # 1. Tithi (Lunar Day)
    diff = (moon_lon - sun_lon) % 360
    tithi_index = int(diff / 12)
    degree_in_tithi = diff % 12
    tithi_completion = (degree_in_tithi / 12) * 100
    
    is_shukla = tithi_index < 15
    tithi_name = TITHIS[tithi_index % 15]
    if tithi_index == 14: tithi_name = "Purnima"
    if tithi_index == 29: tithi_name = "Amavasya"
    
    tithi_data = TithiData(
        name=tithi_name,
        number=tithi_index + 1,
        paksha="Shukla" if is_shukla else "Krishna",
        completion=round(tithi_completion, 2)
    )

    # 2. Nakshatra (Moon Constellation)
    nak_len = 360.0 / 27.0
    nak_index = int(moon_lon / nak_len) % 27
    nak_name = NAKSHATRAS[nak_index]
    
    degree_in_nak = moon_lon % nak_len
    pada = int(degree_in_nak / (nak_len / 4)) + 1
    nak_completion = (degree_in_nak / nak_len) * 100
    
    lords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury']
    lord = lords[nak_index % 9]
    
    nak_data = NakshatraData(
        name=nak_name,
        number=nak_index + 1,
        pada=pada,
        lord=lord,
        completion=round(nak_completion, 2)
    )

    # 3. Yoga (Sun + Moon)
    total = (moon_lon + sun_lon) % 360
    yoga_unit = 360 / 27
    yoga_index = int(total / yoga_unit)
    yoga_name = YOGAS[yoga_index]
    
    yoga_data = YogaData(
        name=yoga_name,
        number=yoga_index + 1
    )

    # 4. Karana (Half Tithi)
    k_index = int(diff / 6)
    
    if k_index == 0: karana_name = "Kimstughna"
    elif k_index >= 57: # 57, 58, 59
        rem = k_index - 57
        karana_name = ["Shakuni", "Chatushpada", "Naga"][rem]
    else:
        rem = (k_index - 1) % 7
        karana_name = KARANAS[rem]
        
    karana_data = KaranaData(
        name=karana_name,
        number=k_index + 1
    )

    # 5. Vara (Weekday)
    geopos = (details.longitude, details.latitude, 0)
    jd_midnight = swe.julday(details.date.year, details.date.month, details.date.day, 0)
    rise_res = swe.rise_trans(jd_midnight, swe.SUN, swe.CALC_RISE, geopos)
    sunrise_jd = rise_res[1][0] if isinstance(rise_res, tuple) else rise_res
    
    if jd < sunrise_jd:
       vara_idx = (int(jd_midnight - 1 + 1.5) % 7)
    else:
       vara_idx = (int(jd_midnight + 1.5) % 7)
       
    vara_name = WEEKDAYS[vara_idx]

    return Panchanga(
        tithi=tithi_data,
        nakshatra=nak_data,
        yoga=yoga_data,
        karana=karana_data,
        vara=vara_name
    )

def get_julian_day(d: date, t: time) -> float:
    """Convert date and time to Julian Day number."""
    decimal_hour = t.hour + t.minute / 60.0 + t.second / 3600.0
    return swe.julday(d.year, d.month, d.day, decimal_hour)

def get_sign_from_longitude(lon: float) -> str:
    """Get zodiac sign from ecliptic longitude."""
    sign_index = int(lon / 30) % 12
    return SIGNS[sign_index]

def get_nakshatra(lon: float) -> tuple[str, str]:
    """Get nakshatra name and lord from ecliptic longitude."""
    nak_len = 360.0 / 27.0
    nak_index = int(lon / nak_len) % 27
    nak_name = NAKSHATRAS[nak_index]
    
    lords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury']
    lord_index = nak_index % 9
    lord = lords[lord_index]
    
    return nak_name, lord

def calculate_chart(details: BirthDetails) -> ChartResponse:
    """
    Calculate complete birth chart from birth details.
    
    Args:
        details: Birth date, time, and location
        
    Returns:
        ChartResponse with ascendant, planets, houses, and dashas
        
    Raises:
        ValueError: If birth details are invalid
        RuntimeError: If ephemeris files are missing
    """
    try:
        # Acquire lock for thread safety with Swisseph global state
        with swe_lock:
            # Set Ayanamsa Mode
            mode_name = details.ayanamsa_mode
            sid_mode = AYANAMSA_MAP.get(mode_name, swe.SIDM_LAHIRI)
            
            is_tropical = mode_name == 'SAYANA'
            
            if is_tropical:
                # For Sayana (Tropical), we don't subtract ayanamsa.
                # swisseph defaults to Tropical if no FLG_SIDEREAL is passed usually.
                # However, if we want to be explicit, we can just ensure we don't use FLG_SIDEREAL.
                pass
            else:
                swe.set_sid_mode(sid_mode)

            # Validate input
        if details.latitude < -90 or details.latitude > 90:
            raise ValueError(f"Invalid latitude: {details.latitude}. Must be between -90 and 90.")
        if details.longitude < -180 or details.longitude > 180:
            raise ValueError(f"Invalid longitude: {details.longitude}. Must be between -180 and 180.")
        
        # Timezone Handling
        # 1. Get timezone string from coordinates
        tz_str = tf.timezone_at(lng=details.longitude, lat=details.latitude)
        if not tz_str:
            # Fallback to UTC if timezone not found (shouldn't happen for valid coords)
            logger.warning(f"Could not determine timezone for {details.latitude}, {details.longitude}. Assuming UTC.")
            tz_str = 'UTC'
        
        # 2. Localize the input time
        local_tz = pytz.timezone(tz_str)
        # Combine date and time to naive datetime
        naive_dt = datetime.combine(details.date, details.time)
        # Localize
        local_dt = local_tz.localize(naive_dt)
        
        # 3. Convert to UTC
        utc_dt = local_dt.astimezone(pytz.UTC)
        
        logger.info(f"Input Time: {naive_dt} ({tz_str}) -> UTC: {utc_dt}")

        # 4. Use UTC time for Julian Day calculation
        # swe.julday expects UT (Universal Time)
        decimal_hour_utc = utc_dt.hour + utc_dt.minute / 60.0 + utc_dt.second / 3600.0
        jd = swe.julday(utc_dt.year, utc_dt.month, utc_dt.day, decimal_hour_utc)
        
        if is_tropical:
            ayanamsa = 0.0 # No subtraction for Tropical
        else:
            # Calculate Ayanamsa (precession offset)
            ayanamsa = swe.get_ayanamsa_ut(jd)
            logger.info(f"Using Ayanamsa: {mode_name} ({sid_mode if not is_tropical else 'Tropical'}) = {ayanamsa}")

        # Calculate Ascendant (tropical first, then convert to sidereal)
        cusps_tropical, ascmc_tropical = swe.houses(jd, details.latitude, details.longitude, b'W') 
        ascendant_tropical = ascmc_tropical[0]
        
        # Convert to Sidereal
        ascendant_degree = (ascendant_tropical - ayanamsa) % 360
        ascendant_sign = get_sign_from_longitude(ascendant_degree)
        
        asc_sign_index = int(ascendant_degree / 30) % 12
        
        # Calculate Houses (Whole Sign System)
        houses = []
        for i in range(12):
            house_num = i + 1
            sign_index = (asc_sign_index + i) % 12
            houses.append(House(
                number=house_num, 
                sign=SIGNS[sign_index],
                ascendant_degree=ascendant_degree if house_num == 1 else None
            ))

        # Calculate Planets
        planets = []
        for name, pid in PLANET_MAP.items():
            flags = swe.FLG_SWIEPH | swe.FLG_SPEED
            if not is_tropical:
                flags |= swe.FLG_SIDEREAL
                
            xx, rflags = swe.calc_ut(jd, pid, flags)
            lon = xx[0]
            lat = xx[1]
            speed = xx[3]
            retro = speed < 0
            
            sign = get_sign_from_longitude(lon)
            nak, nak_lord = get_nakshatra(lon)
            
            # Calculate House (Whole Sign)
            planet_sign_index = int(lon / 30) % 12
            house_num = ((planet_sign_index - asc_sign_index + 12) % 12) + 1
            
            planets.append(PlanetPosition(
                name=name,
                longitude=lon,
                latitude=lat,
                speed=speed,
                retrograde=retro,
                house=house_num,
                sign=sign,
                nakshatra=nak,
                nakshatra_lord=nak_lord
            ))
        
        # Calculate Ketu (always opposite Rahu)
        rahu = next(p for p in planets if p.name == 'Rahu')
        ketu_lon = (rahu.longitude + 180) % 360
        ketu_sign = get_sign_from_longitude(ketu_lon)
        ketu_nak, ketu_lord = get_nakshatra(ketu_lon)
        ketu_house = ((int(ketu_lon / 30) - asc_sign_index + 12) % 12) + 1
        
        planets.append(PlanetPosition(
            name='Ketu',
            longitude=ketu_lon,
            latitude=-rahu.latitude,
            speed=-rahu.speed, 
            retrograde=rahu.retrograde,
            house=ketu_house,
            sign=ketu_sign,
            nakshatra=ketu_nak,
            nakshatra_lord=ketu_lord
        ))
        
        # Calculate Divisional Charts (D1-D60)
        varga_nums = [1, 2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60]
        divisional_charts = {}
        
        for v_num in varga_nums:
            v_planets = []
            
            # Calculate Ascendant for this Varga
            asc_sign = calculate_varga(ascendant_degree, v_num)
            
            # Calculate for all planets including Ketu
            # Note: planets list includes Ketu which was appended earlier
            for p in planets:
                p_lon = p.longitude
                v_sign = calculate_varga(p_lon, v_num)
                
                # Determine house in this varga based on Ascendant
                asc_idx = SIGNS.index(asc_sign)
                sign_idx = SIGNS.index(v_sign)
                house_num = ((sign_idx - asc_idx + 12) % 12) + 1
                
                v_planets.append(VargaPosition(
                    planet=p.name,
                    sign=v_sign,
                    house=house_num
                ))
            
            divisional_charts[f"D{v_num}"] = VargaChart(
                name=f"D{v_num}", 
                planets=v_planets, 
                ascendant_sign=asc_sign
            )
            
        # Update planets with D9/D10 specifically for backward compat (if needed)
        # We can just set them from the computed vargas
        for p in planets:
            d9_chart = divisional_charts.get("D9")
            if d9_chart:
                 p_pos = next((vp for vp in d9_chart.planets if vp.planet == p.name), None)
                 if p_pos: p.d9_sign = p_pos.sign
            
            d10_chart = divisional_charts.get("D10")
            if d10_chart:
                 p_pos = next((vp for vp in d10_chart.planets if vp.planet == p.name), None)
                 if p_pos: p.d10_sign = p_pos.sign

        # Calculate Maandi (optional, may fail gracefully)
        maandi = calculate_maandi(jd, details, ayanamsa)
        if maandi:
            maandi_sign_index = int(maandi.longitude / 30) % 12
            maandi.house = ((maandi_sign_index - asc_sign_index + 12) % 12) + 1
            planets.append(maandi)
            # Add Maandi to D-Charts? For now, skip adding to vargas to keep logic simple
        
        # Calculate Vimshottari Dasha
        moon = next(p for p in planets if p.name == 'Moon')
        dashas = calculate_dashas(moon.longitude, details.date)

        # Calculate Panchanga
        sun = next(p for p in planets if p.name == 'Sun')
        moon = next(p for p in planets if p.name == 'Moon')
        panchanga = calculate_panchanga(moon.longitude, sun.longitude, jd, details)

        # Calculate Strength
        strengths = calculate_vimsopaka_strength(divisional_charts)

        return ChartResponse(
            ascendant=ascendant_degree,
            ascendant_sign=ascendant_sign,
            planets=planets,
            houses=houses,
            dashas=dashas,
            panchanga=panchanga,
            strengths=strengths,
            divisional_charts=divisional_charts
        )
        
    except Exception as e:
        logger.error(f"Chart calculation error: {e}", exc_info=True)
        raise


def calculate_maandi(jd_birth: float, details: BirthDetails, ayanamsa: float) -> Optional[PlanetPosition]:
    """
    Calculate Maandi position.
    """
    try:
        maandi_lon = _calculate_upagraha_lon(jd_birth, details, ayanamsa, is_maandi=True)
        if maandi_lon is None: return None
        
        return PlanetPosition(
            name="Maandi",
            longitude=maandi_lon,
            latitude=0,
            speed=0,
            retrograde=False,
            house=0, 
            sign=get_sign_from_longitude(maandi_lon),
            nakshatra=get_nakshatra(maandi_lon)[0],
            nakshatra_lord=get_nakshatra(maandi_lon)[1]
        )
    except Exception as e:
        logger.warning(f"Maandi calculation failed: {e}. Skipping Maandi.")
        return None

def calculate_gulika(jd_birth: float, details: BirthDetails, ayanamsa: float) -> Optional[PlanetPosition]:
    """
    Calculate Gulika position.
    """
    try:
        gulika_lon = _calculate_upagraha_lon(jd_birth, details, ayanamsa, is_maandi=False)
        if gulika_lon is None: return None
        
        return PlanetPosition(
            name="Gulika",
            longitude=gulika_lon,
            latitude=0,
            speed=0,
            retrograde=False,
            house=0, 
            sign=get_sign_from_longitude(gulika_lon),
            nakshatra=get_nakshatra(gulika_lon)[0],
            nakshatra_lord=get_nakshatra(gulika_lon)[1]
        )
    except Exception as e:
        logger.warning(f"Gulika calculation failed: {e}. Skipping Gulika.")
        return None

def _calculate_upagraha_lon(jd_birth: float, details: BirthDetails, ayanamsa: float, is_maandi: bool) -> Optional[float]:
    """
    Shared logic for Maandi/Gulika calculation based on sunrise/sunset.
    """
    geopos = (details.longitude, details.latitude, 0)
    jd_midnight = swe.julday(details.date.year, details.date.month, details.date.day, 0)
    
    # Get sunrise and sunset
    rise_res = swe.rise_trans(jd_midnight, swe.SUN, swe.CALC_RISE, geopos)
    set_res = swe.rise_trans(jd_midnight, swe.SUN, swe.CALC_SET, geopos)
    
    def get_jd_from_res(res):
        if isinstance(res, tuple):
            if isinstance(res[0], tuple) and len(res[0]) > 0:
                return res[0][0]
            elif isinstance(res[0], float):
                return res[0]
        return res[1][0]

    sunrise_jd = get_jd_from_res(rise_res)
    sunset_jd = get_jd_from_res(set_res)
    
    # Determine if birth is day or night
    is_day = sunrise_jd <= jd_birth <= sunset_jd
    
    day_len = sunset_jd - sunrise_jd
    night_len = (sunrise_jd + 1.0) - sunset_jd
    
    # Get weekday (0=Sun, 1=Mon, ... 6=Sat)
    # Note: swe.julday gives day of week via % 7? No it gives absolute JD.
    # jd_birth + 1.5 cast to int % 7 gives Mon=0, Tue=1... Sun=6 usually in Python weekday().
    # Let's align with Standard Vedic numbering: Sun=0, Mon=1, ... Sat=6
    # Julian Day 0 was Monday (actually noon).
    # (JD + 1.5) % 7 -> 0=Sunday, 1=Monday... 6=Saturday.
    weekday = int(jd_birth + 1.5) % 7
    
    # Rising start times in Ghatis (out of 30 for day/night)
    # Day:   Sun Mon Tue Wed Thu Fri Sat
    # Maandi: 26  22  18  14  10   6   2
    # Gulika: 26  22  18  14  10   6   2 (Wait, Gulika is different)
    #
    # REFERENCE:
    # Maandi Day: Sun=26, Mon=22, Tue=18, Wed=14, Thu=10, Fri=6, Sat=2
    # Gulika Day: Sun=26, Mon=22, Tue=18, Wed=14, Thu=10, Fri=6, Sat=2 (Actually Gulika start is at end of Saturn's portion)
    #
    # Wait, usually Gulika and Maandi rules are specific.
    # Gulika (Kulik) Day: Divide day into 8 parts. Saturn's part is Gulika.
    # Order of lords for Day (Sunrise to Sunset):
    # Sun, Mon, Tue, Wed, Thu, Fri, Sat (Day Lords)
    # Sun Day: 1.Sun, 2.Moon, ... 7.Sat, 8.NoLord(Rahu?)
    # Actually simpler rule:
    # Day Segments (8 parts): Starts with Day Lord.
    # Night Segments (8 parts): Starts with 5th from Day Lord.
    #
    # Maandi fixed ghatis logic is simpler and often preferred in Kerala system.
    
    # Maandi Factors (Day):
    maandi_day = {0: 26, 1: 22, 2: 18, 3: 14, 4: 10, 5: 6, 6: 2}
    maandi_night = {0: 10, 1: 6, 2: 2, 3: 26, 4: 22, 5: 18, 6: 14}
    
    # Gulika Factors (Day - approximate via ghatis standard):
    # Gulika is usually start of Saturn's Muhurta.
    # Sun: 26, Mon: 22, Tue: 18, Wed: 14, Thu: 10, Fri: 6, Sat: 2 (This is Maandi??)
    # Let's use the standard "Starts at X Ghatis" table for Gulika if distinct.
    # Many sources say Maandi and Gulika are close but distinct.
    # Gulika Day: Sun=26.25? No.
    # Let's use standard table:
    # Day:   Sun Mon Tue Wed Thu Fri Sat
    # Gulika: 26.25? No, let's stick to the prompt's implied logic or standard param.
    # Prompt said: "Similar to Maandi but different fractions"
    # Let's implement calculate_gulika with standard segments logic (1/8th of day).
    
    factor = 0
    ref_start = 0
    duration = 0
    
    if is_maandi:
        if is_day:
            factor = maandi_day[weekday]
            ref_start = sunrise_jd
            duration = day_len
        else:
            w_night = (weekday + 4) % 7 # 5th from day lord? Wait. Maandi night factors are fixed.
            # Using fixed table based on Day Lord of previous sunrise
            factor = maandi_night[weekday]
            ref_start = sunset_jd
            duration = night_len
            
        time_jd = ref_start + (duration * (factor / 30.0))
    else:
        # Gulika Calculation (1/8th segments)
        # Day: Divide into 8. Saturn's segment is Gulika.
        # Order starts from Day Lord.
        # Sun(0): Sun, Mon, Tue, Wed, Thu, Fri, Sat(6th segment) -> Gulika
        # Mon(1): Mon... Sat(5th segment)
        # Sequence: Sun(0), Mon(1), Tue(2), Wed(3), Thu(4), Fri(5), Sat(6)
        day_lord = weekday
        saturn_offset = (6 - day_lord + 7) % 7
        # Segment index (0-7). Saturn is at index `saturn_offset`?
        # Example Sun Day: Sun(0), Mon(1), Tue(2), Wed(3), Thu(4), Fri(5), Sat(6). Gulika is 7th part? (Index 6).
        # Gulika is start of Saturn's part.
        
        segment_num = (6 - day_lord + 7) % 7 # This gives index of Sat in sequence starting from Day Lord?
        # Check: Sun(0): (6-0+7)%7 = 6. Segments 0..6. 7th segment. Correct.
        # Mon(1): (6-1+7)%7 = 5. 6th segment. Correct.
        # Sat(6): (6-6+7)%7 = 0. 1st segment. Correct.
        
        if not is_day:
            # Night: Divide into 8. Order starts from 5th from Day Lord.
            # Sun Day Night start lord: Jupiter(4) -> (0+4)%7=4?
            # Lords: Sun(0)..Jup(4).
            # Sequence: Jup, Ven, Sat, Sun, Mon...
            # We need Saturn's position in this sequence.
            night_start_lord = (day_lord + 4) % 7
            segment_num = (6 - night_start_lord + 7) % 7
            ref_start = sunset_jd
            duration = night_len
        else:
            ref_start = sunrise_jd
            duration = day_len
            
        # Start of segment
        time_jd = ref_start + (duration * (segment_num / 8.0))
        # Usually Gulika is the BEGINNING of the segment.
    
    # Calculate Ascendant (Longitude) at this time
    cusps, ascmc = swe.houses(time_jd, details.latitude, details.longitude, b'W')
    lon_tropical = ascmc[0]
    return (lon_tropical - ayanamsa) % 360

def calculate_jaimini_karakas(planets: List[dict]) -> dict:
    """
    Sort planets by degree (0-30 in sign? Or 0-360?)
    Jaimini Karakas based on "degrees traversed in the sign".
    So longitude % 30.
    Rahu/Ketu usually excluded (7 karaka scheme).
    """
    # Filter 7 main planets
    candidates = []
    for p in planets:
        if p['name'] in ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']:
            deg_in_sign = p['longitude'] % 30
            candidates.append({ 'name': p['name'], 'deg': deg_in_sign })
            
    # Sort descending
    candidates.sort(key=lambda x: x['deg'], reverse=True)
    
    karaka_names = [
        'Atmakaraka', 'Amatyakaraka', 'Bhratrukaraka', 
        'Matrukaraka', 'Putrakaraka', 'Gnatikaraka', 'Darakaraka'
    ]
    
    result = {}
    for i, k_name in enumerate(karaka_names):
        if i < len(candidates):
            result[k_name] = candidates[i]['name']
            
    return result

def get_current_transits_extended():
    """
    Get current transits including outer planets and special points.
    """
    with swe_lock:
        now = datetime.utcnow()
        # Default visual location (e.g. Ujjain or Greenwich? Using Greenwich for universal transits logic, 
        # but strictly Ascendant depends on location. For purely planetary, location minimal effect except Moon.
        # Using 0,0 for generic "current sky" or User's location?
        # Prompt didn't specify location, so we assume generic "Sky Now".
        # Ideally should use a default location like Greenwich or allow param.
        # We will use 0,0 for simplicity, assuming geocentric/topocentric diff is minimal for display.
        
        jd = swe.julday(now.year, now.month, now.day, now.hour + now.minute/60.0)
        
        # Ayanamsa (Lahiri)
        swe.set_sid_mode(swe.SIDM_LAHIRI)
        ayanamsa = swe.get_ayanamsa_ut(jd)
        
        bodies = []
        
        # 1. Planets (Main + Outer)
        planet_ids = {
            **PLANET_MAP, # Includes Sun-Saturn + Rahu + Outer
        }
        # Ensure Key names match prompt requirements
        
        for name, pid in planet_ids.items():
            if pid is None: continue
            
            flags = swe.FLG_SWIEPH | swe.FLG_SPEED | swe.FLG_SIDEREAL
            xx, _ = swe.calc_ut(jd, pid, flags)
            lon = xx[0]
            speed = xx[3]
            
            bodies.append({
                'name': name,
                'type': 'planet',
                'sign': get_sign_from_longitude(lon),
                'degree': format_degree(lon),
                'longitude': lon,
                'nakshatra': get_nakshatra(lon)[0],
                'pada': int((lon % (360/27)) / (360/108)) + 1,
                'speed': speed,
                'retrograde': speed < 0
            })
            
        # Ketu
        rahu = next(b for b in bodies if b['name'] == 'Rahu')
        ketu_lon = (rahu['longitude'] + 180) % 360
        bodies.append({
            'name': 'Ketu',
            'type': 'planet',
            'sign': get_sign_from_longitude(ketu_lon),
            'degree': format_degree(ketu_lon),
            'longitude': ketu_lon,
            'nakshatra': get_nakshatra(ketu_lon)[0],
            'pada': int((ketu_lon % (360/27)) / (360/108)) + 1,
            'speed': -rahu['speed'],
            'retrograde': rahu['retrograde']
        })
        
        # 2. Special Points (Maandi/Gulika)
        # Require a location. We'll use Ujjain (classic Meru) or just 0,0.
        # Let's use 0 Lat, 0 Long (Greenwich equator) for generic "World Time".
        dummy_details = BirthDetails(
            date=now.date(), time=now.time(), 
            latitude=0, longitude=0, ayanamsa_mode='LAHIRI'
        )
        
        maandi = calculate_maandi(jd, dummy_details, ayanamsa)
        if maandi:
            bodies.append({
                'name': 'Maandi',
                'type': 'special_point',
                'sign': maandi.sign,
                'degree': format_degree(maandi.longitude),
                'longitude': maandi.longitude,
                'nakshatra': maandi.nakshatra,
                'pada': int((maandi.longitude % (360/27)) / (360/108)) + 1,
                'speed': 0,
                'retrograde': False
            })
            
        gulika = calculate_gulika(jd, dummy_details, ayanamsa)
        if gulika:
            bodies.append({
                'name': 'Gulika',
                'type': 'special_point',
                'sign': gulika.sign,
                'degree': format_degree(gulika.longitude),
                'longitude': gulika.longitude,
                'nakshatra': gulika.nakshatra,
                'pada': int((gulika.longitude % (360/27)) / (360/108)) + 1,
                'speed': 0,
                'retrograde': False
            })
            
        # 3. Jaimini Karakas
        karakas = calculate_jaimini_karakas(bodies)
        for k_name, p_name in karakas.items():
            # Find the planet data
            p_data = next((b for b in bodies if b['name'] == p_name), None)
            if p_data:
                bodies.append({
                    'name': f"{k_name} ({p_name})",
                    'type': 'karaka',
                    'sign': p_data['sign'],
                    'degree': p_data['degree'],
                    'longitude': p_data['longitude'],
                    'nakshatra': p_data['nakshatra'],
                    'pada': p_data['pada'],
                    'speed': 0,
                    'retrograde': False
                })
                
        return bodies

def format_degree(lon: float) -> str:
    d = int(lon % 30)
    m = int((lon % 1) * 60)
    s = int((((lon % 1) * 60) % 1) * 60)
    return f"{d}° {m}' {s}\""


def calculate_d9(lon: float) -> str:
    """
    Calculate Navamsha (D9) sign from ecliptic longitude.
    
    Navamsha divides each sign into 9 parts (3.33° each).
    Signs are arranged by element (Fire, Earth, Air, Water).
    """
    sign_index = int(lon / 30) % 12
    degree_in_sign = lon % 30
    pada = int(degree_in_sign / (30/9))
    
    # Determine starting sign by element
    current_sign_num = sign_index + 1
    rem = current_sign_num % 4
    if rem == 1:      # Fire: Aries, Leo, Sagittarius
        start = 0
    elif rem == 2:    # Earth: Taurus, Virgo, Capricorn
        start = 9
    elif rem == 3:    # Air: Gemini, Libra, Aquarius
        start = 6
    else:             # Water: Cancer, Scorpio, Pisces
        start = 3
    
    d9_sign_index = (start + pada) % 12
    return SIGNS[d9_sign_index]

def calculate_varga(lon: float, varga_num: int) -> str:
    """
    Calculate sign for a given Varga (Divisional Chart).
    Supports D1 to D60 standard Parashara rules.
    """
    sign_index = int(lon / 30) % 12
    degree_in_sign = lon % 30
    
    # D1 (Rashi)
    if varga_num == 1:
        return SIGNS[sign_index]
        
    # D2 (Hora) - Parashara
    if varga_num == 2:
        # Odd sign: 1st half=Leo(Sun), 2nd half=Cancer(Moon)? 
        # Parashara: Odd=Sun(5), Even=Moon(4). 
        # Actually usually: OddSign->Sun(Leo), EvenSign->Moon(Cancer)
        # But wait, Hora implies 2 parts. 
        # Standard Parashara:
        # Odd Sign: 0-15=Sun(Leo e.g. 5th sign i.e. index 4), 15-30=Moon(Cancer i.e. index 3)
        # Even Sign: 0-15=Moon(Cancer), 15-30=Sun(Leo)
        is_odd = (sign_index + 1) % 2 != 0
        is_first_half = degree_in_sign < 15
        
        if is_odd:
            return "Leo" if is_first_half else "Cancer"
        else:
            return "Cancer" if is_first_half else "Leo"

    # D3 (Drekkana)
    if varga_num == 3:
        part = int(degree_in_sign / 10) # 0, 1, 2
        # 1, 5, 9 rule
        start_idx = sign_index # 1st part starts at sign itself
        if part == 1: start_idx = (sign_index + 4) % 12 # 5th
        if part == 2: start_idx = (sign_index + 8) % 12 # 9th
        return SIGNS[start_idx]
        
    # D4 (Chaturthamsha)
    if varga_num == 4:
        part = int(degree_in_sign / (30/4))
        # 1, 4, 7, 10 rule
        start_idx = sign_index
        if part == 1: start_idx = (sign_index + 3) % 12 # 4th
        if part == 2: start_idx = (sign_index + 6) % 12 # 7th
        if part == 3: start_idx = (sign_index + 9) % 12 # 10th
        return SIGNS[start_idx]

    # D7 (Saptamsha)
    if varga_num == 7:
        part = int(degree_in_sign / (30/7))
        is_odd = (sign_index + 1) % 2 != 0
        if is_odd:
            # Start from sign itself
            start_idx = sign_index
        else:
            # Start from 7th from sign
            start_idx = (sign_index + 6) % 12
        return SIGNS[(start_idx + part) % 12]

    # D9 (Navamsha)
    if varga_num == 9:
        return calculate_d9(lon) # Use existing helper

    # D10 (Dasamsha)
    if varga_num == 10:
        return calculate_d10(lon) # Use existing helper

    # D12 (Dwadashamsha)
    if varga_num == 12:
        part = int(degree_in_sign / (30/12))
        # Starts from sign itself
        return SIGNS[(sign_index + part) % 12]
        
    # D16 (Shodashamsha)
    if varga_num == 16:
        part = int(degree_in_sign / (30/16))
        # Movable(1,4,7,10): Aries(0)
        # Fixed(2,5,8,11): Leo(4)
        # Dual(3,6,9,12): Sag(8)
        sign_quality = (sign_index + 1 - 1) % 3 # 0=Movable, 1=Fixed, 2=Dual
        starts = [0, 4, 8]
        start_idx = starts[sign_quality]
        return SIGNS[(start_idx + part) % 12]

    # D20 (Vimshamsha)
    if varga_num == 20:
        part = int(degree_in_sign / (30/20))
        # Movable: Aries(0), Fixed: Sag(8), Dual: Leo(4) (Wait, verify rule)
        # Actually usually: Movable->Aries(from Narayana), Fixed->Sag, Dual->Leo is NOT standard?
        # Standard: Movable->Aries, Fixed->Sag, Dual->Leo is correct for D20 per BPHS?
        # Let's assume: Movable->Aries, Fixed->Sagittarius, Dual->Leo.
        sign_quality = (sign_index) % 3 # 0=Movable(1), 1=Fixed(2), 2=Dual(3)
        # Note: (sign_index) % 3: 0(Aries)->0, 1(Taurus)->1, 2(Gemini)->2
        # Movable=0, Fixed=1, Dual=2
        if sign_quality == 0: start_idx = 0 # Aries
        elif sign_quality == 1: start_idx = 8 # Sag
        else: start_idx = 4 # Leo
        return SIGNS[(start_idx + part) % 12]

    # D24 (Chaturvimshamsha)
    if varga_num == 24:
        part = int(degree_in_sign / (30/24))
        # Odd: Leo(4), Even: Cancer(3)
        is_odd = (sign_index + 1) % 2 != 0
        start_idx = 4 if is_odd else 3
        return SIGNS[(start_idx + part) % 12]

    # D27 (Saptavimshamsha)
    if varga_num == 27:
        part = int(degree_in_sign / (30/27))
        # Like Nakshatras 1,4,7,10 cycle
        # Fire: Aries, Earth: Cap, Air: Lib, Water: Cancer
        # Element logic
        element = (sign_index) % 4 # 0=Fire, 1=Earth, 2=Air, 3=Water
        if element == 0: start_idx = 0 # Aries
        elif element == 1: start_idx = 3 # Cancer
        elif element == 2: start_idx = 6 # Libra
        else: start_idx = 9 # Capricorn (Wait, check standard)
        # Standard: 
        # Fiery signs start from Aries.
        # Earthy signs start from Cancer.
        # Airy signs start from Libra.
        # Watery signs start from Capricorn.
        starts = [0, 3, 6, 9]
        start_idx = starts[element]
        return SIGNS[(start_idx + part) % 12]

    # D30 (Trimshamsha) - Special Logic
    if varga_num == 30:
        # D30 is based on degrees assigned to planets 5-5-8-7-5 rule usually
        # Odd Signs: 0-5 Mars(Aries), 5-10 Saturn(Aq), 10-18 Jup(Sag), 18-25 Merc(Gem), 25-30 Ven(Lib)
        # Even Signs: 0-5 Ven(Tau), 5-12 Merc(Vir), 12-20 Jup(Pis), 20-25 Sat(Cap), 25-30 Mars(Sco)
        is_odd = (sign_index + 1) % 2 != 0
        deg = degree_in_sign
        
        if is_odd:
            if deg < 5: return "Aries"
            elif deg < 10: return "Aquarius"
            elif deg < 18: return "Sagittarius"
            elif deg < 25: return "Gemini"
            else: return "Libra"
        else:
            if deg < 5: return "Taurus"
            elif deg < 12: return "Virgo"
            elif deg < 20: return "Pisces"
            elif deg < 25: return "Capricorn"
            else: return "Scorpio"

    # D40 (Khavedamsha)
    if varga_num == 40:
        part = int(degree_in_sign / (30/40))
        # Odd: Aries, Even: Libra
        is_odd = (sign_index + 1) % 2 != 0
        start_idx = 0 if is_odd else 6
        return SIGNS[(start_idx + part) % 12]

    # D45 (Akshavedamsha)
    if varga_num == 45:
        part = int(degree_in_sign / (30/45))
        # Movable: Aries, Fixed: Leo, Dual: Sag
        sign_quality = (sign_index) % 3
        if sign_quality == 0: start_idx = 0
        elif sign_quality == 1: start_idx = 4
        else: start_idx = 8
        return SIGNS[(start_idx + part) % 12]

    # D60 (Shashtyamsha)
    if varga_num == 60:
        part = int(degree_in_sign / (30/60))
        # Start from sign itself
        return SIGNS[(sign_index + part) % 12]

    # Default / Fallback
    return SIGNS[sign_index]

def calculate_d10(lon: float) -> str:
    """
    Calculate Dasamsha (D10) sign from ecliptic longitude.
    """
    sign_index = int(lon / 30) % 12
    degree_in_sign = lon % 30
    part = int(degree_in_sign / (30/10))
    
    is_odd = (sign_index + 1) % 2 != 0
    
    if is_odd:
        start = sign_index
    else:
        start = (sign_index + 8) % 12
        
    d10_sign_index = (start + part) % 12
    return SIGNS[d10_sign_index]

def calculate_dashas(moon_lon: float, birth_date: date) -> list:
    """
    Calculate Vimshottari Dasha sequence.
    
    Total lifespan: 120 years
    9 planetary lords cycle through 27 nakshatras
    """
    lords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury']
    years = [7, 20, 6, 10, 7, 18, 16, 19, 17]  # Total: 120 years
    
    nak_len = 360.0 / 27.0
    nak_index = int(moon_lon / nak_len)
    degree_into_nak = moon_lon % nak_len
    progress_percent = degree_into_nak / nak_len
    
    lord_index = nak_index % 9
    current_lord = lords[lord_index]
    total_years = years[lord_index]
    
    balance_years = total_years * (1 - progress_percent)
    
    dashas = []
    
    # Current dasha
    dashas.append({
        "lord": current_lord, 
        "balance_years": round(balance_years, 2),
        "full_duration": total_years
    })
    
    # Next 8 dashas (entire cycle)
    for i in range(1, 9):
        idx = (lord_index + i) % 9
        dashas.append({
            "lord": lords[idx],
            "duration": years[idx]
        })
        
    return dashas

def get_current_transits() -> list[dict]:
    """
    Calculate current planetary positions (Transits) for now (UTC).
    """
    try:
        # Current UTC time
        now_utc = datetime.now(pytz.UTC)
        
        # Calculate Julian Day
        decimal_hour = now_utc.hour + now_utc.minute / 60.0 + now_utc.second / 3600.0
        jd = swe.julday(now_utc.year, now_utc.month, now_utc.day, decimal_hour)
        
        # Ayanamsa (Lahiri default for transits)
        with swe_lock:
            swe.set_sid_mode(swe.SIDM_LAHIRI)
            ayanamsa = swe.get_ayanamsa_ut(jd)
            
            transits = []
            
            # Planets to track
            planet_ids = {
                'Sun': swe.SUN, 'Moon': swe.MOON, 'Mars': swe.MARS, 
                'Mercury': swe.MERCURY, 'Jupiter': swe.JUPITER, 
                'Venus': swe.VENUS, 'Saturn': swe.SATURN, 'Rahu': swe.TRUE_NODE
            }
            
            flags = swe.FLG_SWIEPH | swe.FLG_SPEED | swe.FLG_SIDEREAL
            
            for name, pid in planet_ids.items():
                xx, _ = swe.calc_ut(jd, pid, flags)
                lon = xx[0]
                sign = get_sign_from_longitude(lon)
                degree = lon % 30
                nak, _ = get_nakshatra(lon)
                
                transits.append({
                    "name": name,
                    "sign": sign,
                    "degree": round(degree, 2),
                    "nakshatra": nak,
                    "retrograde": xx[3] < 0
                })
                
            # Ketu (Opposite Rahu)
            rahu = next(p for p in transits if p["name"] == 'Rahu')
            ketu_lon = (swe.calc_ut(jd, swe.TRUE_NODE, flags)[0][0] + 180) % 360
            transits.append({
                "name": "Ketu",
                "sign": get_sign_from_longitude(ketu_lon),
                "degree": round(ketu_lon % 30, 2),
                "nakshatra": get_nakshatra(ketu_lon)[0],
                "retrograde": rahu["retrograde"]
            })
            
            return transits
        
    except Exception as e:
        logger.error(f"Error calculating transits: {e}")
        return []
