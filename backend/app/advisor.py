import logging
from datetime import date
from .models import ChartResponse, Panchanga
from .engine import get_nakshatra

logger = logging.getLogger(__name__)

# Scoring Constants (Weights)
WEIGHT_PANCHANGA = 0.40
WEIGHT_MOON_TRANSIT = 0.30
WEIGHT_DASHA = 0.20
WEIGHT_VARA = 0.10

def calculate_daily_energy(chart: ChartResponse, current_date: date, panchang: Panchanga) -> dict:
    """
    Calculate the Daily Energy Score (0-100) based on multiple factors.
    Returns a dict with total score, breakdown, and label.
    """
    
    # 1. Panchanga Score (40%)
    panchanga_score = calculate_panchanga_score(panchang)
    
    # 2. Moon Transit Score (30%)
    # Requires analyzing current Moon position vs Natal Moon
    # Using a simplified model for MVP: Look at Tara Bala (Compat) or simply Moon Sign friendliness?
    # Enhanced Strategy: Use Tara Bala (Nakshatra relationships)
    
    # Extract User's Moon Nakshatra
    user_moon = next((p for p in chart.planets if p.name == 'Moon'), None)
    user_moon_nak = user_moon.nakshatra if user_moon else "Ashwini" # Fallback
    
    moon_transit_score = calculate_tara_bala(user_moon_nak, panchang.nakshatra.name)
    
    # 3. Dasha Score (20%)
    # Current Dasha lord's relationship to Lagna Lord OR generalized "Good/Bad" nature
    # Simplified MVP: Check if Dasha Lord is a benefic/malefic generally? 
    # Better: Check functional nature. For now, we'll use a neutral default + benefic bonus
    current_dasha_lord = chart.dashas[0].lord.split('-')[0] # "Sun-Moon" -> "Sun"
    dasha_score = calculate_dasha_score(current_dasha_lord, chart.ascendant_sign)
    
    # 4. Vara Score (10%)
    # Weekday Lord vs Natal Day Lord (or Ascendant Lord)
    # Using Vara vs Ascendant Lord relationship
    # Current Vara is in panchang.vara (e.g., "Sunday")
    asc_lord = get_lord_of_sign(chart.ascendant_sign)
    vara_lord = get_lord_of_weekday(panchang.vara)
    vara_score = get_friendship_score(asc_lord, vara_lord)

    # Total Calculation
    total_score = (
        (panchanga_score * WEIGHT_PANCHANGA) +
        (moon_transit_score * WEIGHT_MOON_TRANSIT) +
        (dasha_score * WEIGHT_DASHA) +
        (vara_score * WEIGHT_VARA)
    )

    # Determine Label & Colors
    if total_score >= 80:
        label = "Super Push Day"
        color = "Green"
        auspiciousness = "✨ Highly Favorable Day"
    elif total_score >= 60:
        label = "Push Day"
        color = "Green"
        auspiciousness = "✅ Favorable Day"
    elif total_score >= 40:
        label = "Balanced Day"
        color = "Amber"
        auspiciousness = "⚖️ Balanced Day"
    else:
        label = "Reflect Day"
        color = "Red"
        auspiciousness = "⚠️ Caution Advised"

    # Generate Vibe & Theme
    vibe = get_nakshatra_vibe(panchang.nakshatra.name)
    theme = generate_daily_theme(total_score, panchang.nakshatra.name)

    return {
        "score": round(total_score, 1),
        "label": label,
        "color": color,
        "auspiciousness": auspiciousness,
        "vibe": vibe,
        "theme": theme,
        "breakdown": {
            "panchanga": round(panchanga_score, 1),
            "moon": round(moon_transit_score, 1),
            "dasha": round(dasha_score, 1),
            "vara": round(vara_score, 1)
        }
    }

def get_nakshatra_vibe(nak_name: str) -> str:
    """Return a short vibe string for the Nakshatra."""
    vibes = {
        'Ashwini': 'Fast & energetic',
        'Bharani': 'Transformative & intense',
        'Krittika': 'Sharp & determining',
        'Rohini': 'Creative & growing',
        'Mrigashira': 'Curious & exploring',
        'Ardra': 'Stormy & renewing',
        'Punarvasu': 'Nurturing & safe',
        'Pushya': 'Spiritual & nourishing',
        'Ashlesha': 'Instinctive & deep',
        'Magha': 'Regal & ancestral',
        'Purva Phalguni': 'Relaxed & creative',
        'Uttara Phalguni': 'Supportive & social',
        'Hasta': 'Skilled & detailed',
        'Chitra': 'Artistic & brilliant',
        'Swati': 'Independent & moving',
        'Vishakha': 'Focus & goal-oriented',
        'Anuradha': 'Devoted & friendly',
        'Jyeshtha': 'Senior & protective',
        'Mula': 'Rooting & inquiring',
        'Purva Ashadha': 'Invincible & optimistic',
        'Uttara Ashadha': 'Enduring & steady',
        'Shravana': 'Learning & listening',
        'Dhanishta': 'Rhythmic & wealthy',
        'Shatabhisha': 'Healing & secretive',
        'Purva Bhadrapada': 'Visionary & intense',
        'Uttara Bhadrapada': 'Deep & stable',
        'Revati': 'Gentle & concluding'
    }
    return vibes.get(nak_name, 'Mysterious & subtle')

def calculate_panchanga_score(panchang: Panchanga) -> float:
    """Calculate score based on Tithi, Nakshatra quality, Yoga."""
    score = 50.0 # Start neutral
    
    # Tithi Analysis (Simple)
    # Good: 2, 3, 5, 7, 10, 11, 13 (Shukla/Krishna)
    # Bad: 4, 8, 9, 14, 15 (Amavasya), 1 (sometimes)
    good_tithis = [2, 3, 5, 7, 10, 11, 13]
    bad_tithis = [4, 8, 9, 14, 1, 6, 12, 15] # 15 Amavasya roughly
    
    t_num = panchang.tithi.number % 15
    if t_num == 0: t_num = 15 # Handle 0/15 logic
    
    if t_num in good_tithis:
        score += 20
    elif t_num in bad_tithis:
        score -= 20
        
    # Yoga Analysis (Simple)
    # Bad yogas: Vishkumbha(1), Ganda(10), Atiganda(6), Shula(9), Vyaghata(13), Vajra(15), Vyatipata(17), Parigha(19), Vaidhriti(27)
    bad_yogas = [1, 6, 9, 10, 13, 15, 17, 19, 27]
    if panchang.yoga.number in bad_yogas:
        score -= 15
    else:
        score += 10
        
    # Clamp
    return max(0, min(100, score))

def calculate_tara_bala(user_nak: str, current_nak: str) -> float:
    """
    Calculate Tara Bala (Star Strength).
    Count from User Nak to Current Nak.
    """
    nak_list = [
        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
        'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
        'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
        'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
        'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ]
    
    try:
        idx_user = nak_list.index(user_nak)
        idx_curr = nak_list.index(current_nak)
    except ValueError:
        return 50.0 # Error fallback
        
    # Distance
    distance = (idx_curr - idx_user + 27) % 27
    remainder = distance % 9
    
    # Tara Values (0-8)
    # 0 (1st) - Janma (Birth) - Medium/Bad (unless benefic) -> 40
    # 1 (2nd) - Sampat (Wealth) - Excellent -> 100
    # 2 (3rd) - Vipat (Danger) - Bad -> 10
    # 3 (4th) - Kshema (Well-being) - Good -> 80
    # 4 (5th) - Pratyak (Obstacles) - Bad -> 20
    # 5 (6th) - Sadhana (Achievement) - Good -> 90
    # 6 (7th) - Naidhana (Death/Danger) - Very Bad -> 0
    # 7 (8th) - Mitra (Friend) - Good -> 85
    # 8 (9th) - Parama Mitra (Best Friend) - Excellent -> 95
    
    scores = {
        0: 40, 1: 100, 2: 10, 3: 80, 4: 20, 5: 90, 6: 0, 7: 85, 8: 95
    }
    
    return float(scores.get(remainder, 50))

def calculate_dasha_score(dasha_lord: str, asc_sign: str) -> float:
    """Check relationship between Dasha Lord and Ascendant."""
    asc_lord = get_lord_of_sign(asc_sign)
    if not asc_lord: return 50.0
    
    friendship = get_friendship_score(asc_lord, dasha_lord)
    return friendship

def get_friendship_score(planet1: str, planet2: str) -> float:
    """Return 0-100 score based on planetary relationship."""
    if planet1 == planet2: return 100.0 # Own
    
    # Simplified Friend/Enemy Table
    # (In real app, import from engine.PLANET_INFO)
    friends = {
        'Sun': ['Moon', 'Mars', 'Jupiter'],
        'Moon': ['Sun', 'Mercury'],
        'Mars': ['Sun', 'Moon', 'Jupiter'],
        'Mercury': ['Sun', 'Venus'],
        'Jupiter': ['Sun', 'Moon', 'Mars'],
        'Venus': ['Mercury', 'Saturn'],
        'Saturn': ['Mercury', 'Venus'],
        'Rahu': ['Venus', 'Saturn'],
        'Ketu': ['Mars', 'Jupiter'] # Classic view
    }
    
    if planet2 in friends.get(planet1, []):
        return 90.0
    if planet1 in friends.get(planet2, []):
        return 90.0
        
    # Enemies (simplified)
    enemies = {
        'Sun': ['Venus', 'Saturn', 'Rahu', 'Ketu'],
        'Moon': ['Rahu', 'Ketu'],
        'Mars': ['Mercury', 'Rahu'],
        'Mercury': ['Moon'],
        'Jupiter': ['Mercury', 'Venus'],
        'Venus': ['Sun', 'Moon'],
        'Saturn': ['Sun', 'Moon', 'Mars']
    }
    
    if planet2 in enemies.get(planet1, []):
        return 20.0
        
    return 60.0 # Neutral

def get_lord_of_sign(sign: str) -> str:
    """Simple sign-lord mapping."""
    mapping = {
        'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
        'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
        'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
    }
    return mapping.get(sign)

def get_lord_of_weekday(weekday: str) -> str:
    """Map weekday string to planet."""
    # "Sunday" -> "Sun"
    return weekday.replace("day", "").replace("nes", "ness").replace("ur", "urs").strip() 
    # Wait, simpler:
    w_map = {
        'Sunday': 'Sun', 'Monday': 'Moon', 'Tuesday': 'Mars', 
        'Wednesday': 'Mercury', 'Thursday': 'Jupiter', 'Friday': 'Venus', 'Saturday': 'Saturn'
    }
    return w_map.get(weekday, 'Sun')

def generate_daily_theme(energy_score: float, nakshatra_name: str) -> str:
    """Generate a one-sentence theme based on score and nakshatra."""
    # In future, use Gemini API. For MVP, use template.
    
    tone = "balanced"
    if energy_score >= 70: tone = "powerful"
    elif energy_score <= 40: tone = "cautious"
    
    templates = [
        f"A {tone} day guided by the energy of {nakshatra_name}. Focus on your core goals.",
        f"With {nakshatra_name} active, it's a {tone} time for connection and progress.",
        f"Embrace the {tone} vibes of {nakshatra_name} today."
    ]
    
    import random
    return random.choice(templates)
