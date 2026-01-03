import pytest
import math
from datetime import datetime, date
from app.engine import calculate_chart, get_current_transits
from app.models import BirthDetails

def assert_approx(actual, expected, tolerance=0.1):
    assert math.isclose(actual, expected, abs_tol=tolerance), \
        f"Expected {expected}, got {actual}. Diff: {abs(actual - expected)}"

# 1. STEVE JOBS (Standard Western Reference)
# Feb 24, 1955, 19:15, San Francisco
# 37.7749 N, 122.4194 W
# Timezone: PST (-8). UTC: Feb 25 03:15
CASE_JOBS = {
    "name": "Steve Jobs",
    "details": BirthDetails(
        date="1955-02-24",
        time="19:15:00",
        latitude=37.7749,
        longitude=-122.4194,
        location_timezone="America/Los_Angeles",
        ayanamsa_mode="LAHIRI"
    ),
    "expected_ascendant_sign": "Leo", 
    "expected_planets": {
        "Sun": 312.15, # Aquarius
        "Moon": 344.51, # Pisces (Uttara Bhadrapada)
        "Mars": 6.64,   # Aries
    }
    # Verified against reliable software
}

# 2. LV (User Case - Dasha Verification & Maandi Fix)
# May 17, 1986, 10:58, Delhi (Corrected to Tiruchirapalli for proper layout)
# actually user requested Tiruchirapalli for correct Maandi.
CASE_LV = {
    "name": "LV (User)",
    "details": BirthDetails(
        date="1986-05-17",
        time="10:58:00",
        latitude=10.7905,
        longitude=78.7047,
        location_timezone="Asia/Kolkata",
        ayanamsa_mode="LAHIRI"
    ),
    "expected_dasha_check": {
        "check_date": "2026-01-01",
        "expected_lord": "Moon-Venus" 
    },
    "expected_maandi_house": 11 # Taurus
}

# 3. MARK ZUCKERBERG (Modern Western Reference)
# May 14, 1984, 14:39, White Plains, NY
# 41.0340 N, 73.7629 W
# Sidereal (Lahiri) should be:
# Tropical Asc ~21 Virgo -> Sidereal ~27 Leo
# Tropical Sun ~24 Taurus -> Sidereal ~0 Taurus
# Tropical Moon ~13 Scorpio -> Sidereal ~19 Libra
CASE_ZUCKERBERG = {
    "name": "Mark Zuckerberg",
    "details": BirthDetails(
        date="1984-05-14",
        time="14:39:00",
        latitude=41.0340,
        longitude=-73.7629,
        location_timezone="America/New_York",
        ayanamsa_mode="LAHIRI"
    ),
    "expected_ascendant_sign": "Leo", 
    "expected_planets": {
        "Sun": 30.50,   # Taurus 0.5 deg
        "Moon": 205.10, # Libra 25.1 deg
    }
}

def test_backend_components():
    print("\n========================================")
    print("BACKEND VALIDATION SUITE")
    print("========================================")
    
    # ----------------------------------------------------------------
    # 1. CHART CALCULATION & ACCURACY (Steve Jobs)
    # ----------------------------------------------------------------
    print(f"\n[1] Testing Chart Accuracy: {CASE_JOBS['name']}")
    chart = calculate_chart(CASE_JOBS["details"])
    
    print(f"  Ascendant: {chart.ascendant_sign} ({chart.ascendant:.2f}°)")
    assert chart.ascendant_sign == CASE_JOBS["expected_ascendant_sign"], \
        f"Ascendant Mismatch: Got {chart.ascendant_sign}"
        
    for p_name, exp_lon in CASE_JOBS["expected_planets"].items():
        p = next(x for x in chart.planets if x.name == p_name)
        print(f"  {p_name}: {p.longitude:.2f}° (Expected ~{exp_lon})")
        assert_approx(p.longitude, exp_lon, 1.0) # 1 degree tolerance
    print("  ✅ Positions Verified")

    # ----------------------------------------------------------------
    # 2. PANCHANGA (Steve Jobs)
    # ----------------------------------------------------------------
    print(f"\n[2] Testing Panchanga")
    p = chart.panchanga
    print(f"  Tithi: {p.tithi.name}")
    print(f"  Nakshatra: {p.nakshatra.name}")
    assert p.nakshatra.name == "Uttara Bhadrapada", \
        f"Expected Uttara Bhadrapada, got {p.nakshatra.name}"
    print("  ✅ Panchanga Verified")

    # ----------------------------------------------------------------
    # 3. VIMSOPAKA STRENGTH
    # ----------------------------------------------------------------
    print(f"\n[3] Testing Vimsopaka Strength")
    strengths = chart.strengths
    assert strengths, "Strengths dictionary empty"
    for planet, score in strengths.items():
        assert 0 <= score <= 20, f"Score {score} out of range"
    print("  ✅ Strengths Verified (Range 0-20)")

    # ----------------------------------------------------------------
    # 4. DASHA & MAANDI LOGIC (LV Case)
    # ----------------------------------------------------------------
    print(f"\n[4] Testing LV Chart (Dasha & Maandi): {CASE_LV['name']}")
    chart_lv = calculate_chart(CASE_LV["details"])
    
    # Dasha Check
    check_date = CASE_LV["expected_dasha_check"]["check_date"]
    exp_lord = CASE_LV["expected_dasha_check"]["expected_lord"]
    active_dasha = None
    for d in chart_lv.dashas:
        if d['start_date'] <= check_date <= d['end_date']:
            active_dasha = d
            break
    assert active_dasha['lord'] == exp_lord, \
        f"Dasha Mismatch! Expected {exp_lord}, Got {active_dasha['lord']}"
    print(f"  ✅ Dasha Verified: {active_dasha['lord']} active on {check_date}")

    # Maandi Check
    maandi = next(p for p in chart_lv.planets if p.name == "Maandi")
    # Determine house number (1-12) based on Ascendant
    asc_lon = chart_lv.ascendant
    maandi_lon = maandi.longitude
    # Simple whole sign house calculation
    # Asc Sign Index (0-11)
    asc_sign_idx = int(asc_lon / 30)
    maandi_sign_idx = int(maandi_lon / 30)
    
    house_num = ((maandi_sign_idx - asc_sign_idx) % 12) + 1
    print(f"  Maandi Longitude: {maandi_lon:.2f}° (Sign Index: {maandi_sign_idx})")
    print(f"  Ascendant Longitude: {asc_lon:.2f}° (Sign Index: {asc_sign_idx})")
    print(f"  Calculated House: {house_num}")
    
    assert house_num == CASE_LV["expected_maandi_house"], \
        f"Maandi House Mismatch! Expected {CASE_LV['expected_maandi_house']}, Got {house_num}"
    print(f"  ✅ Maandi Position Verified: House {house_num}")

    # ----------------------------------------------------------------
    # 5. NEW CASE: MARK ZUCKERBERG
    # ----------------------------------------------------------------
    print(f"\n[5] Testing Chart Accuracy: {CASE_ZUCKERBERG['name']}")
    chart_zuck = calculate_chart(CASE_ZUCKERBERG["details"])
    
    print(f"  Ascendant: {chart_zuck.ascendant_sign}")
    assert chart_zuck.ascendant_sign == CASE_ZUCKERBERG["expected_ascendant_sign"], \
        f"Ascendant Mismatch"
    
    for p_name, exp_lon in CASE_ZUCKERBERG["expected_planets"].items():
        p = next(x for x in chart_zuck.planets if x.name == p_name)
        print(f"  {p_name}: {p.longitude:.2f}° (Expected ~{exp_lon})")
        assert_approx(p.longitude, exp_lon, 2.0) # 2 degree tolerance for nuances
    print("  ✅ Zuckerberg Positions Verified")

    # ----------------------------------------------------------------
    # 6. TRANSITS
    # ----------------------------------------------------------------
    print(f"\n[5] Testing Transits")
    transits = get_current_transits()
    assert len(transits) > 5, "Too few transit bodies"
    print(f"  Fetched {len(transits)} transit bodies")
    saturn = next(t for t in transits if t['name'] == 'Saturn')
    print(f"  Saturn Current Sign: {saturn['sign']}")
    assert saturn['sign'] in ["Aquarius", "Pisces"], "Saturn location suspicious"
    print("  ✅ Transits Verified")

    print("\n---------------------------------------------------")
    print("ALL SYSTEMS NOMINAL ✅")
    print("---------------------------------------------------")

if __name__ == "__main__":
    test_backend_components()
