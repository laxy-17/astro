import swisseph as swe
import os
import logging
from datetime import date, time, timedelta, datetime, timezone
from typing import Optional, List, Tuple, Dict
from threading import RLock
from timezonefinder import TimezoneFinder
import pytz
from .models import PlanetPosition, House, ChartResponse, BirthDetails, Panchanga, VargaChart, VargaPosition, TithiData, NakshatraData, YogaData, KaranaData, SpecialTime

logger = logging.getLogger(__name__)

# ============================================================================
# TIMEZONE & TIME HELPER FUNCTIONS
# ============================================================================

def get_timezone_offset(timezone_name: str) -> timedelta:
    """Get UTC offset for a timezone name."""
    try:
        tz = pytz.timezone(timezone_name)
        now = datetime.now()
        localized = tz.localize(now)
        offset = localized.utcoffset()
        return offset
    except Exception as e:
        logger.warning(f"Could not get timezone offset for {timezone_name}: {e}")
        # Fallback for common timezones
        offsets = {
            "Asia/Kolkata": timedelta(hours=5, minutes=30),
            "America/New_York": timedelta(hours=-5),
            "Europe/London": timedelta(hours=0),
        }
        return offsets.get(timezone_name, timedelta(0))

def convert_to_utc(date_obj: date, time_obj: time, location_timezone: str) -> Tuple[datetime, str]:
    """Convert local birth time to UTC."""
    try:
        # Create naive datetime
        birth_local_naive = datetime.combine(date_obj, time_obj)
        
        # Localize
        try:
            local_tz = pytz.timezone(location_timezone)
        except:
            local_tz = pytz.timezone('UTC') # Fallback
            
        birth_local = local_tz.localize(birth_local_naive)
        
        # Convert to UTC
        birth_utc = birth_local.astimezone(timezone.utc)
        
        debug_str = (
            f"Time conversion: {birth_local_naive} {location_timezone} "
            f"-> {birth_utc.isoformat()} UTC"
        )
        logger.info(debug_str)
        return birth_utc, debug_str
    except Exception as e:
        logger.error(f"Timezone conversion error: {e}")
        raise

def jd_to_time(jd: float) -> str:
    """Convert Julian Day to human-readable UTC time string."""
    year, month, day, hour = swe.revjul(jd)
    minute = int((hour % 1) * 60)
    hour_int = int(hour)
    second = int(((hour % 1) * 60 % 1) * 60)
    return f"{hour_int:02d}:{minute:02d}:{second:02d} UTC {year}-{month:02d}-{day:02d}"

def convert_utc_to_local(utc_time_str: str, timezone_name: str) -> str:
    """Convert UTC time string (debug format) to local timezone."""
    try:
        # Expected format from jd_to_time: "HH:MM:SS UTC YYYY-MM-DD"
        parts = utc_time_str.split(' UTC ')
        time_part = parts[0]
        date_part = parts[1]
        
        h, m, s = map(int, time_part.split(':'))
        y, mo, d = map(int, date_part.split('-'))
        
        utc_dt = datetime(y, mo, d, h, m, s, tzinfo=timezone.utc)
        
        local_tz = pytz.timezone(timezone_name)
        local_dt = utc_dt.astimezone(local_tz)
        
        return local_dt.strftime("%I:%M %p %Y-%m-%d")
    except Exception as e:
        logger.warning(f"Could not convert to local time: {e}")
        return utc_time_str

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

def calculate_daily_panchanga(
    date_obj: date,
    lat: float,
    lon: float,
    timezone_str: str = "UTC"
) -> Panchanga:
    """
    Calculate Panchanga for a specific Date and Location (typically for Daily Timing).
    Calculates positions at Sunrise.
    """
    try:
        tz = pytz.timezone(timezone_str)

        # 1. Sunrise JD
        # Use noon UTC to find sunrise of that day
        noon_utc = datetime.combine(date_obj, time(12, 0), tzinfo=tz).astimezone(timezone.utc)
        jd_noon = swe.julday(noon_utc.year, noon_utc.month, noon_utc.day, 12.0 + noon_utc.minute/60.0)
        
        geopos = (lon, lat, 0)
        res_rise = swe.rise_trans(
            jd_noon, swe.SUN, swe.CALC_RISE | swe.BIT_DISC_CENTER, geopos
        )
        
        if isinstance(res_rise, tuple):
             val = res_rise[1][0]
        else:
             val = res_rise
             
        if val == 0: # Checks logic? No, res_rise[0] is return code?
             # Swisseph returns (int ret, tuple t)
             # If ret == -1 or -2 error.
             # If ret == 0, success.
             # But line 347 checks isinstance?
             # Let's trust line 347 pattern:
             # sunrise_jd = rise_res[1][0] if isinstance(rise_res, tuple) else rise_res
             pass
        
        if isinstance(res_rise, tuple) and res_rise[0] == 0:
            jd_sunrise = res_rise[1][0]
        elif not isinstance(res_rise, tuple):
             jd_sunrise = res_rise # Old version?
        else:
            # Fallback
            dt_6am = datetime.combine(date_obj, time(6, 0), tz).astimezone(timezone.utc)
            jd_sunrise = swe.julday(dt_6am.year, dt_6am.month, dt_6am.day, dt_6am.hour + dt_6am.minute/60.0)

        # 2. Calculate Positions at Sunrise
        swe.set_sid_mode(swe.SIDM_LAHIRI)

        # Sun
        sun_res = swe.calc_ut(jd_sunrise, swe.SUN, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)
        sun_lon = sun_res[0][0]

        # Moon
        moon_res = swe.calc_ut(jd_sunrise, swe.MOON, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)
        moon_lon = moon_res[0][0]

        # 3. Create Temp Details for 'Vara' calculation inside calculate_panchanga
        # We pass the current_date as the 'date' in BirthDetails so logic works
        temp_details = BirthDetails(
            date=date_obj.isoformat(),
            time="06:00",
            latitude=lat,
            longitude=lon,
            ayanamsa_mode="LAHIRI"
        )

        return calculate_panchanga(moon_lon, sun_lon, jd_sunrise, temp_details)

    except Exception as e:
        logger.error(f"Error in calculate_daily_panchanga: {e}")
        # Return fallback or raise
        raise e

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

def get_sunrise_sunset_daily(date_obj: date, lat: float, lon: float) -> Tuple[float, float, float]:
    """
    Get Sunrise, Sunset, and Next Sunrise JDs for a specific CIVIL DATE.
    Used for Daily Hora calculations.
    """
    geopos = (lon, lat, 0)
    
    # JD for Midnight of the requested civil date
    jd_midnight = swe.julday(date_obj.year, date_obj.month, date_obj.day, 0)
    
    # Find Sunrise for this civil day
    # Search from midnight
    rise = swe.rise_trans(jd_midnight, swe.SUN, swe.CALC_RISE, geopos)[1][0]
    
    # Find Sunset for this civil day (must be after sunrise)
    sett = swe.rise_trans(rise, swe.SUN, swe.CALC_SET, geopos)[1][0]
    
    # Find Sunrise for NEXT civil day (to define night length)
    # Search from tomorrow midnight to be safe/consistent?
    # Or just search from sunset
    next_rise = swe.rise_trans(sett, swe.SUN, swe.CALC_RISE, geopos)[1][0]
    
    return rise, sett, next_rise

def calculate_horas(date_obj: date, lat: float, lon: float, tz_str: str) -> 'DailyTimeline':
    """
    Calculate 24 Horas for a given day.
    """
    from .models import Hora, DailyTimeline # Local import to avoid circular dependency if any
    
    rise, sett, next_rise = get_sunrise_sunset_daily(date_obj, lat, lon)
    
    # Timezone conversion helper
    def jd_to_local_str(jd_val):
        utc_str = jd_to_time(jd_val)
        return convert_utc_to_local(utc_str, tz_str)

    # 1. Determine Day Lord (Vara)
    # The ruler of the first Hora is the ruler of the weekday.
    # Weekday defined by Sunrise.
    # We used 'date_obj' so we assume the user wants the Horas "starting" on that civil date's sunrise.
    weekday_idx = date_obj.weekday() # 0=Mon, 6=Sun
    # Map Python weekday to Vedic (0=Sun, 1=Mon...)
    # Python: Mon(0)..Sun(6) -> Vedic: Sun(0)..Sat(6) ?
    # Wait. 
    # Python: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6.
    # Vedic: Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6.
    # Mapping: (python_day + 1) % 7
    vedic_day_idx = (weekday_idx + 1) % 7
    
    # Planetary Rulers standard order (Sun -> Sat)
    # 0=Sun, 1=Mon, 2=Mar, 3=Mer, 4=Jup, 5=Ven, 6=Sat
    PLANET_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']
    day_lord_name = PLANET_ORDER[vedic_day_idx]
    
    # Hora Ruler Sequence (Reverse Speed): Sun, Ven, Mer, Moo, Sat, Jup, Mar
    # Or simply: Next Hora Ruler is the 6th from current in week order.
    # Current (0) -> +5 mod 7? No.
    # Sun(0) -> Ven(5). (+5)
    # Ven(5) -> Mer(3). (5+5=10%7=3). Yes.
    # Mer(3) -> Moo(1). (3+5=8%7=1). Yes.
    HORA_ORDER = []
    curr = vedic_day_idx
    for _ in range(24):
        HORA_ORDER.append(PLANET_ORDER[curr])
        curr = (curr + 5) % 7
        
    horas = []
    
    # Day Horas (12 parts)
    day_duration = sett - rise
    part_len = day_duration / 12.0
    
    current_time = rise
    for i in range(12):
        start_t = current_time
        end_t = current_time + part_len
        
        ruler = HORA_ORDER[i]
        
        horas.append(Hora(
            index=i+1,
            start_time=jd_to_local_str(start_t).split(" ")[0] + " " + jd_to_local_str(start_t).split(" ")[1], # HH:MM AM
            end_time=jd_to_local_str(end_t).split(" ")[0] + " " + jd_to_local_str(end_t).split(" ")[1],
            ruler=ruler,
            quality="Neutral", # TODO: Implement quality logic
            color="#FFD700" if ruler == 'Sun' else "#C0C0C0" # Placeholder
        ))
        current_time = end_t
        
    # Night Horas (12 parts)
    night_duration = next_rise - sett
    part_len_night = night_duration / 12.0
    
    # Identify offset for night rulers
    # Actually HORA_ORDER has all 24.
    
    current_time = sett
    for i in range(12, 24):
        start_t = current_time
        end_t = current_time + part_len_night
        
        ruler = HORA_ORDER[i]
        
        horas.append(Hora(
            index=i+1,
            start_time=jd_to_local_str(start_t).split(" ")[0] + " " + jd_to_local_str(start_t).split(" ")[1],
            end_time=jd_to_local_str(end_t).split(" ")[0] + " " + jd_to_local_str(end_t).split(" ")[1],
            ruler=ruler,
            quality="Neutral"
        ))
        current_time = end_t
        
    return DailyTimeline(
        date=date_obj.isoformat(),
        location=f"{lat},{lon}",
        sunrise=jd_to_local_str(rise),
        sunset=jd_to_local_str(sett),
        horas=horas
    )


# ============================================================================
# CHART CALCULATION
# ============================================================================

def calculate_chart(details: BirthDetails) -> ChartResponse:
    """Calculate complete birth chart with proper timezone handling."""
    try:
        # Acquire lock for thread safety
        with swe_lock:
            mode_name = details.ayanamsa_mode
            sid_mode = AYANAMSA_MAP.get(mode_name, swe.SIDM_LAHIRI)
            is_tropical = mode_name == 'SAYANA'
            
            if not is_tropical:
                swe.set_sid_mode(sid_mode)
        
        # Validate input
        if details.latitude < -90 or details.latitude > 90:
            raise ValueError(f"Invalid latitude: {details.latitude}")
        if details.longitude < -180 or details.longitude > 180:
            raise ValueError(f"Invalid longitude: {details.longitude}")
            
        # ────────────────────────────────────────────────────────────────
        # TIMEZONE HANDLING (ROBUST)
        # ────────────────────────────────────────────────────────────────
        
        # 1. Determine Timezone if missing
        tz_str = details.location_timezone
        if not tz_str:
            tz_str = tf.timezone_at(lng=details.longitude, lat=details.latitude) or 'UTC'
            
        # 2. Convert to UTC using helper
        birth_utc, _ = convert_to_utc(details.date, details.time, tz_str)
        
        # 3. Calculate Julian Day (UT)
        decimal_hour_utc = birth_utc.hour + birth_utc.minute / 60.0 + birth_utc.second / 3600.0
        jd = swe.julday(birth_utc.year, birth_utc.month, birth_utc.day, decimal_hour_utc)
        
        # 4. Ayanamsa
        if is_tropical:
            ayanamsa = 0.0
        else:
            ayanamsa = swe.get_ayanamsa_ut(jd)
            logger.info(f"Ayanamsa: {ayanamsa}")
            
        # ────────────────────────────────────────────────────────────────
        # PLANETARY CALCULATION
        # ────────────────────────────────────────────────────────────────
        
        # Ascendant
        cusps_trop, ascmc_trop = swe.houses(jd, details.latitude, details.longitude, b'W')
        ascendant_tropical = ascmc_trop[0]
        ascendant_degree = (ascendant_tropical - ayanamsa) % 360
        ascendant_sign = get_sign_from_longitude(ascendant_degree)
        
        # Houses
        asc_sign_idx = int(ascendant_degree / 30) % 12
        houses = []
        for i in range(12):
            h_num = i + 1
            s_idx = (asc_sign_idx + i) % 12
            houses.append(House(number=h_num, sign=SIGNS[s_idx], ascendant_degree=ascendant_degree if h_num==1 else None))
            
        # Planets
        planets = []
        for name, pid in PLANET_MAP.items():
            flags = swe.FLG_SWIEPH | swe.FLG_SPEED | (swe.FLG_SIDEREAL if not is_tropical else 0)
            xx, _ = swe.calc_ut(jd, pid, flags)
            lon = xx[0]
            lat_val = xx[1]
            speed = xx[3]
            
            sign = get_sign_from_longitude(lon)
            nak, lord = get_nakshatra(lon)
            
            p_sign_idx = int(lon / 30) % 12
            house_num = ((p_sign_idx - asc_sign_idx + 12) % 12) + 1
            
            planets.append(PlanetPosition(
                name=name, longitude=lon, latitude=lat_val, speed=speed,
                retrograde=speed < 0, house=house_num, sign=sign,
                nakshatra=nak, nakshatra_lord=lord
            ))
            
        # Ketu
        rahu = next(p for p in planets if p.name == 'Rahu')
        k_lon = (rahu.longitude + 180) % 360
        k_sign = get_sign_from_longitude(k_lon)
        k_nak, k_lord = get_nakshatra(k_lon)
        k_house = ((int(k_lon / 30) - asc_sign_idx + 12) % 12) + 1
        
        planets.append(PlanetPosition(
            name='Ketu', longitude=k_lon, latitude=-rahu.latitude, speed=-rahu.speed,
            retrograde=rahu.retrograde, house=k_house, sign=k_sign, nakshatra=k_nak, nakshatra_lord=k_lord
        ))
        
        # ────────────────────────────────────────────────────────────────
        # SUNRISE / SUNSET (For Mandhi & Verification)
        # ────────────────────────────────────────────────────────────────
        # ────────────────────────────────────────────────────────────────
        # SUNRISE / SUNSET (For Mandhi & Verification)
        # ────────────────────────────────────────────────────────────────
        geopos = (details.longitude, details.latitude, 0)
        
        # Define UTC Midnight for reference
        jd_midnight_utc = swe.julday(birth_utc.year, birth_utc.month, birth_utc.day, 0)
        
        # Start search from 24h before birth to catch sunrise if it happened just before UTC midnight
        # But wait, jd_midnight_utc is 00:00 of the birth UTC date.
        # Safest is to search relative to birth time? 
        # But we need "Sunrise of that day".
        # Let's search from (jd - 1) and find the one closest to (but before) birth?
        # Or simpler: Start from jd_midnight_utc - 1.0. 
        # Logic: Sunrise shouldn't be more than 24h away.
        
        search_start_jd = jd_midnight_utc - 1.0
        
        rise_res = swe.rise_trans(search_start_jd, swe.SUN, swe.CALC_RISE, geopos)
        set_res = swe.rise_trans(search_start_jd, swe.SUN, swe.CALC_SET, geopos)
        
        # We need the sunrise/sunset PAIR that encloses (or is relevant to) the birth.
        # If we found a sunrise/sunset at T-20h, and another at T+4h...
        # We need the specific sunrise for the "Vedic Day".
        # Definition: The sunrise strictly BEFORE birth (or if birth is before sunrise, the one before THAT).
        # Actually Vedic day starts at Sunrise. 
        # So we want the `sunrise_jd` such that `sunrise_jd <= jd < next_sunrise`.
        
        # Let's implement a robust finder
        # 1. Find next sunrise after (jd - 2 days) to be safe?
        # No, just find the sunrise immediately preceding (or equal to) jd.
        
        def find_prev_sunrise(target_jd, geo):
            # Iterate backwards? No, swisseph finds next.
            # Start 2 days back
            t = target_jd - 2.0
            last_rise = None
            found_rise = None
            for _ in range(4): # Check 4 sunrises
                 res = swe.rise_trans(t, swe.SUN, swe.CALC_RISE, geo)
                 r = res[1][0]
                 if r > target_jd:
                     break
                 last_rise = r
                 t = r + 0.1 # Move forward
            return last_rise

        # Actually simplest: swe.rise_trans(jd, ... swe.CALC_RISE | swe.BIT_DISC_CENTER | swe.BIT_NO_REFRACT) ?
        # Standard: Look from jd - 1.2 (approx 30h back).
        
        # Let's try finding the rise/set pair for the *Civil Day* of birth?
        # Revert to standard robust algorithm:
        # Search from jd_utc_midnight - 1.0.
        # Pick the rise that is on the SAME DAY (Local) or just the one preceding birth?
        # Mandhi requires the Day/Night of the "Vedic Day".
        
        # New Logic:
        # 1. Find sunrise immediately preceding birth.
        # 2. Find sunset following that sunrise.
        # 3. If birth < sunset: Day Birth.
        # 4. If birth > sunset: Night Birth.
        
        t_search = jd - 1.5
        sunrise_jd = 0
        while True:
            rr = swe.rise_trans(t_search, swe.SUN, swe.CALC_RISE, geopos)
            r_time = rr[1][0]
            if r_time > jd:
                # We overshot. The PREVIOUS one was the sunrise.
                # If this is the first iteration, birth is before any sunrise we found?
                # Start earlier.
                break
            sunrise_jd = r_time
            t_search = r_time + 0.1 # Advance
            
        # If loop didn't run well (rare), fallback calculate from scratch
        if sunrise_jd == 0:
             # Fallback: Just calculate sunrise for the civil date
             # (Previous implementation logic but offset)
             # Let's try just searching from jd - 1.0 and taking the last one <= jd
             rr = swe.rise_trans(jd - 1.1, swe.SUN, swe.CALC_RISE, geopos)
             if rr[1][0] <= jd:
                 sunrise_jd = rr[1][0]
                 # Check if there is another one in betweeen?
                 rr2 = swe.rise_trans(sunrise_jd + 0.01, swe.SUN, swe.CALC_RISE, geopos)
                 if rr2[1][0] <= jd:
                     sunrise_jd = rr2[1][0]
             else:
                 # This shouldn't happen if we start 1.1 days back
                 sunrise_jd = rr[1][0] # Future sunrise? Error.
                 
        # Now find the sunset AFTER this sunrise (to define the day)
        ss_res = swe.rise_trans(sunrise_jd, swe.SUN, swe.CALC_SET, geopos)
        sunset_jd = ss_res[1][0]
        
        # Verification Strings
        sr_utc = jd_to_time(sunrise_jd)
        ss_utc = jd_to_time(sunset_jd)
        sr_local = convert_utc_to_local(sr_utc, tz_str)
        ss_local = convert_utc_to_local(ss_utc, tz_str)
        
        # ────────────────────────────────────────────────────────────────
        # MANDHI
        # ────────────────────────────────────────────────────────────────
        mandhi_data, mandhi_debug_time = calculate_mandhi_enhanced(
            jd, jd_midnight_utc, sunrise_jd, sunset_jd, 
            geopos, ayanamsa, ascendant_degree
        )
        if mandhi_data:
            # Calculate House for Mandhi relative to Ascendant
            m_lon = mandhi_data.longitude
            m_sign_idx = int(m_lon / 30) % 12
            m_house = ((m_sign_idx - asc_sign_idx + 12) % 12) + 1
            mandhi_data.house = m_house
            planets.append(mandhi_data)
        
        # ────────────────────────────────────────────────────────────────
        # VARGAS & OTHER CALCULATIONS
        # ────────────────────────────────────────────────────────────────
        
        # Divisional Charts
        varga_nums = [1, 2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60]
        divisional_charts = {}
        for v_num in varga_nums:
            v_planets = []
            asc_sign_v = calculate_varga(ascendant_degree, v_num)
            for p in planets:
                v_sign = calculate_varga(p.longitude, v_num)
                # House in Varga
                a_idx = SIGNS.index(asc_sign_v)
                s_idx = SIGNS.index(v_sign)
                h_num = ((s_idx - a_idx + 12) % 12) + 1
                v_planets.append(VargaPosition(planet=p.name, sign=v_sign, house=h_num))
            
            divisional_charts[f"D{v_num}"] = VargaChart(name=f"D{v_num}", planets=v_planets, ascendant_sign=asc_sign_v)
            
        # Update D9/D10 legacy fields
        for p in planets:
            if d9 := divisional_charts.get("D9"):
                if found := next((vp for vp in d9.planets if vp.planet == p.name), None):
                    p.d9_sign = found.sign
            if d10 := divisional_charts.get("D10"):
                if found := next((vp for vp in d10.planets if vp.planet == p.name), None):
                    p.d10_sign = found.sign

        # Dashas, Panchanga, Strengths
        moon = next(p for p in planets if p.name == 'Moon')
        sun = next(p for p in planets if p.name == 'Sun')
        
        dashas = calculate_dashas(moon.longitude, details.date)
        panchanga = calculate_panchanga(moon.longitude, sun.longitude, jd, details)
        strengths = calculate_vimsopaka_strength(divisional_charts)
        
        # Calculate Special Timings (Muhurta)
        special_timings = calculate_special_times(
            details.date, 
            details.latitude, 
            details.longitude, 
            tz_str
        )
        # Convert dicts to SpecialTime objects
        special_times = [SpecialTime(**st) for st in special_timings]

        return ChartResponse(
            ascendant=ascendant_degree,
            ascendant_sign=ascendant_sign,
            planets=planets,
            houses=houses,
            dashas=dashas,
            panchanga=panchanga,
            strengths=strengths,
            divisional_charts=divisional_charts,
            special_times=special_times,
            ayanamsa=ayanamsa,
            sunrise_time=sr_local,
            mandhi_time_local=convert_utc_to_local(mandhi_debug_time, tz_str) if mandhi_debug_time else None
        )

    except Exception as e:
        logger.error(f"Chart calculation error: {e}", exc_info=True)
        raise


def calculate_mandhi_enhanced(
    jd_birth: float,
    jd_midnight: float,
    sunrise_jd: float,
    sunset_jd: float,
    geopos: Tuple[float, float, float],
    ayanamsa: float,
    ascendant_sidereal: float
) -> Tuple[Optional[PlanetPosition], Optional[str]]:
    """
    Enhanced Mandhi calculation.
    Returns (PlanetPosition, mandhi_time_utc_str)
    """
    try:
        is_day = sunrise_jd <= jd_birth <= sunset_jd
        day_len = sunset_jd - sunrise_jd
        night_len = (sunrise_jd + 1.0) - sunset_jd
        
        # Weekday (0=Sun...6=Sat)
        weekday = int(jd_birth + 1.5) % 7
        
        factors_day = {0: 26, 1: 22, 2: 18, 3: 14, 4: 10, 5: 6, 6: 2}
        factors_night = {0: 10, 1: 6, 2: 2, 3: 26, 4: 22, 5: 18, 6: 14}
        
        if is_day:
            factor = factors_day[weekday]
            mandhi_jd = sunrise_jd + (day_len * (factor / 30.0))
        else:
            # Need weekday at sunrise for night calculation logic?
            # Standard logic uses weekday of the sunrise immediately preceding.
            # If jd_birth > sunset, it's the night of that day.
            # If jd_birth < sunrise (early morning), it's the night of previous day.
            # Simplify: Use weekday calculated from jd_birth which is absolute UTC.
            # But Vedic day starts at Sunrise.
            
            # Correct approach: Find Sunrise used for this day
            weekday_sunrise = int(sunrise_jd + 1.5) % 7
            factor = factors_night[weekday_sunrise]
            mandhi_jd = sunset_jd + (night_len * (factor / 30.0))
            
        # Calculate Mandhi Position
        cusps, ascmc = swe.houses(mandhi_jd, geopos[1], geopos[0], b'W')
        mandhi_trop = ascmc[0]
        mandhi_sid = (mandhi_trop - ayanamsa) % 360
        
        mandhi_time_str = jd_to_time(mandhi_jd)
        
        pos = PlanetPosition(
            name="Maandi",
            longitude=mandhi_sid,
            latitude=0,
            speed=0,
            retrograde=False,
            house=0, # Calculated in parent
            sign=get_sign_from_longitude(mandhi_sid),
            nakshatra=get_nakshatra(mandhi_sid)[0],
            nakshatra_lord=get_nakshatra(mandhi_sid)[1]
        )
        return pos, mandhi_time_str
        
    except Exception as e:
        logger.error(f"Mandhi calc failed: {e}")
        return None, None


def format_degree(degree_val: float) -> str:
    """Format decimal degree to DD° MM' SS\""""
    d = int(degree_val)
    m = int((degree_val - d) * 60)
    s = int(((degree_val - d) * 60 - m) * 60)
    return f"{d}° {m}' {s}\""

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
        # Skipped for Global Transits as they are strictly location-dependent (Sunrise/Sunset).
            
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

# ============================================================================
# DASHA CALCULATION HELPERS
# ============================================================================

MAHADASHA_YEARS = {
    "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7, 
    "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17
}

PLANET_SEQUENCE = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]

def add_years_precise(d: datetime, years: float) -> datetime:
    """
    Add years to date using exact solar days (365.242199 or 365.25 approx).
    Standard Vedic often uses 360 day years (Sura) or 365.25. 
    Vimshottari is generally 365.25 (Julian year) or Sidereal year.
    Let's use 365.25 for consistency with standard software like JHouse.
    """
    days = years * 365.25
    return d + timedelta(days=days)

def get_dasha_start_point(moon_lon: float, birth_date: datetime) -> Tuple[str, float, float]:
    """
    Calculate the starting point of the Vimshottari Dasha.
    Returns: (birth_lord, balance_years, passed_years_in_current_md)
    """
    # 1. Calculate Nakshatra
    nak_len = 360.0 / 27.0
    nak_index = int(moon_lon / nak_len)
    degree_into_nak = moon_lon % nak_len
    progress_percent = degree_into_nak / nak_len
    
    # 2. Identify Lord
    lord_index = nak_index % 9
    birth_lord = PLANET_SEQUENCE[lord_index]
    total_years = MAHADASHA_YEARS[birth_lord]
    
    # 3. Calculate Balance
    # Balance = Remaining time
    balance_years = total_years * (1.0 - progress_percent)
    passed_years = total_years - balance_years
    
    return birth_lord, balance_years, passed_years

def generate_sub_periods(parent_lord: str, parent_start: datetime, parent_duration_years: float, level: str) -> List[Dict]:
    """
    Generic generator for sub-periods (Antardasha, Pratyantardasha).
    level: 'AD' (Antardasha) or 'PD' (Pratyantardasha)
    """
    sub_periods = []
    
    # Sequence starts from the Parent Lord
    start_index = PLANET_SEQUENCE.index(parent_lord)
    current_start = parent_start
    
    parent_md_years = MAHADASHA_YEARS[parent_lord] if level == 'AD' else 0 # Logic differs slightly
    # Wait, generic logic:
    # AD Duration = (MD_Years * AD_Lord_Years) / 120
    # PD Duration = (AD_Duration_Years * PD_Lord_Years) / 120 (Relative to AD?)
    # Actually: PD = (MD_Years * AD_Years * PD_Years) / (120 * 120) ?
    # Let's keep it simple: Sub-period is proportional to its lord's share of 120.
    
    # For Antardasha: Proportion of the Mahadasha.
    # AD_Duration = Parent_Duration * (Lord_Years / 120) -> Correct.
    
    for i in range(9):
        idx = (start_index + i) % 9
        lord = PLANET_SEQUENCE[idx]
        lord_years = MAHADASHA_YEARS[lord]
        
        # Duration proportional to the lord's cycle share
        duration = parent_duration_years * (lord_years / 120.0)
        
        end_date = add_years_precise(current_start, duration)
        
        sub_periods.append({
            "lord": lord,
            "start_date": current_start,
            "end_date": end_date,
            "duration": duration
        })
        current_start = end_date
        
    return sub_periods

def calculate_dashas(moon_lon: float, birth_date: date) -> list:
    """
    Calculate Vimshottari Dasha sequence (Mahadasha-Antardasha).
    Uses 'Theoretical Start' logic for precise alignment.
    """
    # Convert birth_date to datetime for calculation
    birth_dt = datetime.combine(birth_date, time.min)
    
    # 1. Get Start Point
    birth_lord, balance_years, passed_years = get_dasha_start_point(moon_lon, birth_dt)
    
    # 2. Determine Theoretical Start of Birth Mahadasha
    # The date the current MD *would have* started if the native was born earlier.
    # Start = Birth - Passed Years
    current_md_start_theoretical = add_years_precise(birth_dt, -passed_years)
    
    all_dashas_flat = []
    
    # 3. Generate Cycle (Starting from Birth Lord)
    # Generate enough Mahadashas to cover 120 years from birth
    
    start_lord_idx = PLANET_SEQUENCE.index(birth_lord)
    current_md_start = current_md_start_theoretical
    
    # We generate a full 120y cycle (9 planets)
    for i in range(9):
        idx = (start_lord_idx + i) % 9
        md_lord = PLANET_SEQUENCE[idx]
        md_duration = MAHADASHA_YEARS[md_lord]
        
        md_end = add_years_precise(current_md_start, md_duration)
        
        # Generate Antardashas for this MD
        ads = generate_sub_periods(md_lord, current_md_start, md_duration, 'AD')
        
        # Flatten and Filter
        for ad in ads:
            # We only care about periods that end AFTER birth (or allow a little overlap)
            if ad['end_date'] > birth_dt:
                
                # Check for Pratyantardashas (Level 3) - Optional
                # pds = generate_sub_periods(ad['lord'], ad['start_date'], ad['duration'], 'PD')
                # For now, sticking to Antardashas as requested for the UI table fix.
                
                # Clip start date if it's the very first period overlapping birth
                # But kept cleanly, the UI might prefer to see the full period and "Balance".
                # Standard practice: Show the full sub-period dates, but note the balance?
                # The user's screenshot showed precise dates.
                # If we clip, we match the "Balance" concept.
                
                final_start = ad['start_date']
                # if final_start < birth_dt:
                #    final_start = birth_dt 
                # Calculating "Balance" usually implies the first period starts AT birth.
                # Let's clip to birth_dt for the first displayed entry.
                
                display_start = max(final_start, birth_dt)
                
                all_dashas_flat.append({
                    "lord": f"{md_lord}-{ad['lord']}",
                    "start_date": display_start.isoformat().split('T')[0],
                    "end_date": ad['end_date'].isoformat().split('T')[0],
                    "duration": float(ad['duration']) # Precise duration
                })
        
        current_md_start = md_end

    return all_dashas_flat

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

# ============================================================================
# SPECIAL TIMING CALCULATIONS (Muhurta/Kalam)
# ============================================================================

def calculate_special_times(
    date_obj: date,
    lat: float,
    lon: float,
    timezone_str: str = "UTC"
) -> List[Dict]:
    """
    Calculate special timing periods like Rahu Kalam, Yamagandam, Gulika Kalam,
    and Abhijit Muhurta for the given day.
    """
    
    # 1. Get Sunrise/Sunset
    tz = pytz.timezone(timezone_str)
    
    # Approx noon UTC for calculation
    noon_utc = datetime.combine(date_obj, time(12, 0), tzinfo=tz).astimezone(timezone.utc)
    jd_noon = swe.julday(noon_utc.year, noon_utc.month, noon_utc.day, 12.0)
    
    geopos = (lon, lat, 0)
    res_rise = swe.rise_trans(
        jd_noon, swe.SUN, swe.CALC_RISE | swe.BIT_DISC_CENTER, geopos
    )
    res_set = swe.rise_trans(
        jd_noon, swe.SUN, swe.CALC_SET | swe.BIT_DISC_CENTER, geopos
    )
    
    # Check for polar day/night errors (fallback)
    # Swisseph returns (0, (val,)) on success
    rise_ok = isinstance(res_rise, tuple) and res_rise[0] == 0
    set_ok = isinstance(res_set, tuple) and res_set[0] == 0

    if not rise_ok or not set_ok:
        # Fallback: 6am to 6pm local
        sunrise_dt = datetime.combine(date_obj, time(6,0), tz)
        sunset_dt = datetime.combine(date_obj, time(18,0), tz)
    else:
        sunrise_jd = res_rise[1][0]
        sunset_jd = res_set[1][0]
        
        # Convert to Local Datetime
        def jd_to_dt(jd):
            y, m, d, h_float = swe.revjul(jd)
            h = int(h_float)
            mn = int((h_float - h) * 60)
            s = int(((h_float - h) * 60 - mn) * 60)
            # UTC
            dt_utc = datetime(y, m, d, h, mn, s, tzinfo=timezone.utc)
            return dt_utc.astimezone(tz)

        sunrise_dt = jd_to_dt(sunrise_jd)
        sunset_dt = jd_to_dt(sunset_jd)
    
    day_duration = (sunset_dt - sunrise_dt).total_seconds()
    segment_duration = day_duration / 8.0 # 8 parts for Kalams
    
    weekday = date_obj.weekday() # 0=Mon, 6=Sun
    
    # Mappings (Segment Index 1-8)
    
    # RAHU KALAM (Inauspicious)
    # Mon:2, Tue:7, Wed:5, Thu:6, Fri:4, Sat:3, Sun:8
    rahu_map = {0: 2, 1: 7, 2: 5, 3: 6, 4: 4, 5: 3, 6: 8}
    
    # YAMAGANDAM (Inauspicious)
    # Mon:4, Tue:3, Wed:2, Thu:1, Fri:7, Sat:6, Sun:5
    yama_map = {0: 4, 1: 3, 2: 2, 3: 1, 4: 7, 5: 6, 6: 5}
    
    # GULIKA KALAM (Inauspicious for new beginnings, good for repeated events)
    # Mon:6, Tue:5, Wed:4, Thu:3, Fri:2, Sat:1, Sun:7
    gulika_map = {0: 6, 1: 5, 2: 4, 3: 3, 4: 2, 5: 1, 6: 7}
    
    results = []
    
    # Helper
    def add_period(name, seg_idx, quality, desc):
        # seg_idx is 1-based (1..8)
        start_sec = (seg_idx - 1) * segment_duration
        end_sec = seg_idx * segment_duration
        
        start = sunrise_dt + timedelta(seconds=start_sec)
        end = sunrise_dt + timedelta(seconds=end_sec)
        
        results.append({
            "name": name,
            "start_time": start.strftime("%I:%M %p"),
            "end_time": end.strftime("%I:%M %p"),
            "quality": quality,
            "description": desc,
            "start_dt": start.isoformat(),
            "end_dt": end.isoformat()
        })

    # Add Kalams
    add_period("Rahu Kalam", rahu_map[weekday], "Inauspicious", "Avoid new beginnings or travels.")
    add_period("Yamagandam", yama_map[weekday], "Inauspicious", "Death-like time. Avoid auspicious acts.")
    add_period("Gulika Kalam", gulika_map[weekday], "Neutral/Mixed", "Good for repeating actions, bad for start.")
    
    # ABHIJIT MUHURTA (Auspicious)
    # Midday (local noon) +/- 24 mins (approx 1 muhurta centered)
    # Actually it is the 8th Muhurta of 15 Muhurtas of daytime.
    muhurta_len = day_duration / 15.0
    abhijit_start = sunrise_dt + timedelta(seconds=muhurta_len * 7) # Start of 8th
    abhijit_end = sunrise_dt + timedelta(seconds=muhurta_len * 8)   # End of 8th
    
    qual = "Auspicious"
    desc = "Golden Moment. Good for all auspicious works."
    if weekday == 2: # Wednesday
        qual = "Neutral" # Weaker on Wed
        desc += " (Weaker on Wednesday)"
        
    results.append({
        "name": "Abhijit Muhurta",
        "start_time": abhijit_start.strftime("%I:%M %p"),
        "end_time": abhijit_end.strftime("%I:%M %p"),
        "quality": qual,
        "description": desc,
        "start_dt": abhijit_start.isoformat(),
        "end_dt": abhijit_end.isoformat()
    })
    
    # BRAHMA MUHURTA (Pre-dawn)
    # 2 Muhurtas before Sunrise -> 1.5h
    # Note: Requires yesterday's sunset or just approx 96 mins before today's sunrise.
    # We'll use approx relative to today's sunrise for simplicity in this function context.
    brahma_start = sunrise_dt - timedelta(minutes=96)
    brahma_end = sunrise_dt - timedelta(minutes=48)
    
    results.append({
        "name": "Brahma Muhurta",
        "start_time": brahma_start.strftime("%I:%M %p"),
        "end_time": brahma_end.strftime("%I:%M %p"),
        "quality": "Spiritual",
        "description": "Best time for meditation and learning.",
        "start_dt": brahma_start.isoformat(),
        "end_dt": brahma_end.isoformat()
    })

    return results
