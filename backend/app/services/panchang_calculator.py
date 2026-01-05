import swisseph as swe
from datetime import datetime, timedelta, date, time
from typing import List, Tuple, Dict
from ..panchang_models import (
    TimeRange, TithiDetail, NakshatraDetail, KaranaDetail,
    YogaDetail, GowriPeriod, GowriPanchangam, VaaraSoolai,
    TamilYogam, LunarMonthYear, AuspiciousYoga
)

# Constants
NAKSHATRA_NAMES = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
]

NAKSHATRA_TAMIL = {
    'Ashwini': 'Aswini', 'Bharani': 'Bharani', 'Krittika': 'Karthigai', 'Rohini': 'Rohini', 
    'Mrigashira': 'Mirugasheeridam', 'Ardra': 'Thiruvadhirai', 'Punarvasu': 'Punarpoosam', 
    'Pushya': 'Poosam', 'Ashlesha': 'Ayilyam', 'Magha': 'Magam', 'Purva Phalguni': 'Pooram', 
    'Uttara Phalguni': 'Uthiram', 'Hasta': 'Astam', 'Chitra': 'Chithirai', 'Swati': 'Swathi', 
    'Vishakha': 'Visakam', 'Anuradha': 'Anusham', 'Jyeshtha': 'Kettai', 'Mula': 'Moolam', 
    'Purva Ashadha': 'Pooradam', 'Uttara Ashadha': 'Uthiradam', 'Shravana': 'Thiruvonam', 
    'Dhanishta': 'Avittam', 'Shatabhisha': 'Saadhayam', 'Purva Bhadrapada': 'Poorattadhi', 
    'Uttara Bhadrapada': 'Uthirattadhi', 'Revati': 'Revathi'
}

NAKSHATRA_LORDS = [
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
    'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun',
    'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
    'Jupiter', 'Saturn', 'Mercury'
]

TITHI_NAMES = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", 
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", 
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima"
]

KARANA_NAMES = [
    "Bava", "Balava", "Kaulava", "Taitila", "Garija", 
    "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kimstughna"
]

YOGA_NAMES = [
    "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
    "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata",
    "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
    "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
]

TAMIL_MONTHS = [
    "Chithirai", "Vaikasi", "Aani", "Aadi", "Aavani", "Purattasi",
    "Aippasi", "Karthigai", "Maargazhi", "Thai", "Maasi", "Panguni"
]

# Gowri Periods Mapping (simplified for reference, actual logic in calculation)
GOWRI_PERIODS = ["Uthi", "Amridha", "Rogam", "Labam", "Dhanam", "Sugam", "Soram", "Visham"]
GOWRI_AUSPICIOUS_INDICES = [0, 1, 3, 4, 5]  # Uthi, Amridha, Labam, Dhanam, Sugam

def format_time_12h(dt: datetime) -> str:
    """Format datetime to 12-hour format"""
    return dt.strftime("%I:%M %p").lstrip('0').replace(' 0', ' ')

def calculate_gowri_panchangam(sunrise: datetime, sunset: datetime, weekday_idx: int) -> GowriPanchangam:
    """
    Calculate Gowri Panchangam
    Divides day into 8 parts and night into 8 parts
    Period order rotates based on weekday.
    """
    # Day duration
    day_duration = (sunset - sunrise).total_seconds()
    day_part = timedelta(seconds=day_duration / 8)
    
    # Night duration (sunset to next sunrise)
    next_sunrise = sunrise + timedelta(days=1)
    night_duration = (next_sunrise - sunset).total_seconds()
    night_part = timedelta(seconds=night_duration / 8)
    
    # Gowri order base per Weekday (0=Mon, 6=Sun)
    # Mapping: Weekday -> Start Index in [Uthi, Amridha...] or specific sequence
    # Common mappings:
    # Sun: Uthi, Amridha, Rogam, Labam, Dhanam, Sugam, Soram, Visham (Standard)
    # Mon: Amridha, Rogam, Labam, Dhanam, Sugam, Soram, Visham, Uthi (Shift 1)
    # But traditional Gowri sequences vary. Using standard ProKerala/Vakya reference:
    
    # Let's use a explicit mapping for accuracy
    # Day Periods:
    # Sun: Uthi, Amridha, Rogam, Labam, Dhanam, Sugam, Soram, Visham
    # Mon: Amridha, Rogam, Labam, Dhanam, Sugam, Soram, Visham, Uthi
    # Tue: Rogam, Labam, Dhanam, Sugam, Soram, Visham, Uthi, Amridha
    # Wed: Labam, Dhanam, Sugam, Soram, Visham, Uthi, Amridha, Rogam
    # Thu: Dhanam, Sugam, Soram, Visham, Uthi, Amridha, Rogam, Labam
    # Fri: Sugam, Soram, Visham, Uthi, Amridha, Rogam, Labam, Dhanam
    # Sat: Soram, Visham, Uthi, Amridha, Rogam, Labam, Dhanam, Sugam
    
    # Note: Python Weekday 0=Mon, 6=Sun
    # Map Python weekday to shift
    # Sun(6) -> 0 shift
    # Mon(0) -> 1 shift
    # Tue(1) -> 2 shift
    # etc...
    # So Shift = (weekday_idx + 1) % 7 if we treat Sun as 0? No.
    # Mon(0): shift 1
    # Tue(1): shift 2
    # Wed(2): shift 3
    # Thu(3): shift 4
    # Fri(4): shift 5
    # Sat(5): shift 6
    # Sun(6): shift 0
    
    shift = (weekday_idx + 1) % 7
    
    # Calculate day periods
    day_periods = []
    current_time = sunrise
    for i in range(8):
        idx = (i + shift) % 8
        period_name = GOWRI_PERIODS[idx]
        is_auspicious = idx in GOWRI_AUSPICIOUS_INDICES
        
        day_periods.append(GowriPeriod(
            name=period_name,
            start_time=format_time_12h(current_time),
            end_time=format_time_12h(current_time + day_part),
            is_auspicious=is_auspicious
        ))
        current_time += day_part
    
    # Night Periods
    # Can be different order. Often starts with specific period.
    # Detailed lookup is best, but for MVP standard logic:
    # Day + 4 shift is common approximation or independent lookup?
    # Let's use standard rotation for Night:
    # Sun Night: Labam... (Starts from 5th of Day Sequence?)
    # Let's rely on the plan's logic: "Shifted by 4 from day"
    
    night_shift = (shift + 4) % 8
    
    night_periods = []
    current_time = sunset
    for i in range(8):
        idx = (i + night_shift) % 8
        period_name = GOWRI_PERIODS[idx]
        is_auspicious = idx in GOWRI_AUSPICIOUS_INDICES
        
        night_periods.append(GowriPeriod(
            name=period_name,
            start_time=format_time_12h(current_time),
            end_time=format_time_12h(current_time + night_part),
            is_auspicious=is_auspicious
        ))
        current_time += night_part
    
    return GowriPanchangam(
        day_periods=day_periods,
        night_periods=night_periods
    )

def calculate_vaara_soolai(weekday: str) -> VaaraSoolai:
    """
    Calculate Vaara Soolai (direction to avoid)
    Different for each weekday
    """
    soolai_map = {
        "Monday": ("East", "Salt"),
        "Tuesday": ("North", "Oil"),
        "Wednesday": ("West", "Ghee"),
        "Thursday": ("South", "Curd"),
        "Friday": ("South-West", "Tamarind"),
        "Saturday": ("West", "Sesame"),
        "Sunday": ("West", "Jaggery")
    }
    
    direction, remedy = soolai_map.get(weekday, ("West", "Jaggery"))
    return VaaraSoolai(direction=direction, remedy=remedy)

def get_tamil_month_and_year(gregorian_date: date) -> Tuple[str, int, str]:
    """
    Convert Gregorian date to Tamil calendar
    Simplified calculation - can be enhanced with proper solar month calculation
    """
    # Simplified mapping (should use actual solar ingress)
    month_map = {
        1: ("Margazhi", 20),  # Mid-Dec to Mid-Jan
        2: ("Thai", 15),
        3: ("Maasi", 15),
        4: ("Panguni", 14),
        5: ("Chithirai", 14),
        6: ("Vaikasi", 15),
        7: ("Aani", 16),
        8: ("Aadi", 17),
        9: ("Aavani", 17),
        10: ("Purattasi", 17),
        11: ("Aippasi", 17),
        12: ("Karthigai", 16)
    }
    
    month, approx_date = month_map.get(gregorian_date.month, ("Margazhi", 1))
    
    # Tamil year calculation (simplified)
    # Actual would be based on solar ingress into Mesha
    tamil_year_names = [
        "Prabhava", "Vibhava", "Shukla", "Pramoda", "Prajapati",
        "Angirasa", "Shrimukha", "Bhava", "Yuva", "Dhatru",
        "Ishvara", "Bahudhanya", "Pramathi", "Vikrama", "Vishnu",
        "Chitrabhanu", "Subhanu", "Tarana", "Parthiva", "Vyaya",
        "Sarvajit", "Sarvadharin", "Virodhin", "Vikrita", "Khara",
        "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukha",
        "Hevilambi", "Vilambi", "Vikari", "Sharvari", "Plava",
        "Shubhakrit", "Sobhana", "Krodhin", "Vishvavasu", "Parabhava",
        "Plavanga", "Kilaka", "Saumya", "Sadharana", "Virodhikrit",
        "Paridhavi", "Pramadi", "Ananda", "Rakshasa", "Nala",
        "Pingala", "Kalayukti", "Siddharthi", "Raudra", "Durmati",
        "Dundubhi", "Rudhirodgarin", "Raktakshi", "Krodhana", "Akshaya"
    ]
    
    # Calculate Tamil year (60-year cycle)
    # 2026 CE ≈ Shaka 1947 ≈ Visuvasuva (39th year in cycle)
    # Adjustment: 2026 is actually Parthiva/Vyaya etc.
    # Visuvasuva is 2025-2026? 
    # Let's align with user's snapshot: "Visuvasuva" for Jan 2026.
    
    years_from_start = gregorian_date.year - 1987  # Reference point
    # 1987 was Prabhava (0)? No. 1987-1988 was Prabhava.
    # Actually 1987 April was Prabhava.
    # Let's approximate based on user input.
    # If Jan 2026 is Visuvasuva:
    # 2026 - offset = Visuvasuva index.
    # Visuvasuva is 39th (Index 38).
    # 2026 -> 38.
    
    # If we use 1987 as cycle start (Prabhava), then 20'26' - 1987 = 39.
    # So 2026 roughly corresponds to index 38/39.
    # This logic matches the plan.
    
    year_index = (38 + (gregorian_date.year - 2026)) % 60
    tamil_year = tamil_year_names[year_index]
    
    return month, approx_date, tamil_year

def detect_auspicious_yogas(
    nakshatra_name: str,
    weekday: str,
    tithi_name: str,
    sunrise: datetime
) -> List[AuspiciousYoga]:
    """Detect special auspicious yogas"""
    yogas = []
    
    # Ravi Pushya (Sunday + Pushya)
    if weekday == "Sunday" and nakshatra_name == "Pushya":
        yogas.append(AuspiciousYoga(
            name="Ravi Pushya",
            timing=f"{format_time_12h(sunrise)} - Next Nakshatra",
            description="Pushya and Sunday - Highly auspicious for new beginnings"
        ))
    
    # Sarvartha Siddhi
    sarvartha_combos = [
        ("Sunday", "Pushya"),
        ("Monday", "Ashwini"),
        ("Monday", "Rohini"),
        ("Tuesday", "Ashlesha"),
        ("Wednesday", "Anuradha"),
        ("Thursday", "Pushya"),
        ("Thursday", "Punarvasu"),
        ("Friday", "Revati"),
        ("Saturday", "Rohini")
    ]
    
    if (weekday, nakshatra_name) in sarvartha_combos:
        yogas.append(AuspiciousYoga(
            name="Sarvartha Siddhi",
            timing=f"{format_time_12h(sunrise)} - Next Nakshatra",
            description="All objectives accomplished - Excellent for important activities"
        ))
    
    return yogas
