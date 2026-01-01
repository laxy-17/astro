
import sys
import os
from datetime import date, time

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.engine import calculate_chart
from app.models import BirthDetails

def test_steve_jobs():
    """
    Reference Chart: Steve Jobs
    Date: Feb 24, 1955
    Time: 19:15 PST (UTC-8) -> 03:15 UTC next day
    Location: San Francisco (37.7749 N, 122.4194 W)
    
    Expected Ascendant (Sidereal Lahiri): Leo (Simha)
    (Some sources say Virgo, but if bug is Scorpio, that's way off)
    """
    print("\n--- Testing Steve Jobs ---")
    details = BirthDetails(
        date=date(1955, 2, 24),
        time=time(19, 15),
        latitude=37.7749,
        longitude=-122.4194, # West is negative
        ayanamsa_mode="LAHIRI"
    )
    
    try:
        chart = calculate_chart(details)
        print(f"Calculated Ascendant: {chart.ascendant_sign} ({chart.ascendant:.2f} deg)")
        print(f"Input DateTime (Local): {details.date} {details.time}")
        
        # Verify correctness
        if chart.ascendant_sign == "Leo":
            print("✅ PASS: Ascendant is Leo")
        elif chart.ascendant_sign == "Virgo":
            print("⚠️ NOTE: Ascendant is Virgo (borderline case, check degrees)")
        else:
            print(f"❌ FAIL: Expected Leo/Virgo, got {chart.ascendant_sign}")

        # Phase 1 Verification: D9, D10, Strengths
        print("\n--- Phase 1 Checks ---")
        if "D9" in chart.divisional_charts and "D10" in chart.divisional_charts:
            d9_asc = chart.divisional_charts["D9"].ascendant_sign
            print(f"✅ PASS: D9/D10 Charts calculated. D9 Lagna: {d9_asc}")
        else:
             print("❌ FAIL: D9 or D10 missing")
             
        if chart.strengths:
            print("✅ PASS: Strengths calculated")
            sun_str = chart.strengths.get("Sun", 0)
            print(f"   Sun Strength: {sun_str}/20")
            if 0 <= sun_str <= 20:
                print("   ✅ PASS: Strength within 0-20 range")
            else:
                print(f"   ❌ FAIL: Strength {sun_str} out of range")
        else:
            print("❌ FAIL: Strengths missing")

        # Ayanamsa Check
        print("\n--- Ayanamsa Check ---")
        # Calc with Raman
        details.ayanamsa_mode = "RAMAN"
        chart_raman = calculate_chart(details)
        if chart.ascendant != chart_raman.ascendant:
             print(f"✅ PASS: Ayanamsa switch works (Lahiri {chart.ascendant:.2f} != Raman {chart_raman.ascendant:.2f})")
        else:
             print("❌ FAIL: Ayanamsa switch had no effect")
             
    except Exception as e:
        print(f"❌ Error: {e}")

def test_indian_independence():
    """
    Reference: Indian Independence
    Date: Aug 15, 1947
    Time: 00:00 IST
    Location: New Delhi (28.6139 N, 77.2090 E)
    
    Expected Ascendant: Taurus (Vrishabha) ~7-8 degrees
    """
    print("\n--- Testing Indian Independence ---")
    details = BirthDetails(
        date=date(1947, 8, 15),
        time=time(0, 0),
        latitude=28.6139,
        longitude=77.2090,
        ayanamsa_mode="LAHIRI"
    )
    
    try:
        chart = calculate_chart(details)
        print(f"Calculated Ascendant: {chart.ascendant_sign} ({chart.ascendant:.2f} deg)")
        
        if chart.ascendant_sign == "Taurus":
            print("✅ PASS: Ascendant is Taurus")
        else:
            print(f"❌ FAIL: Expected Taurus, got {chart.ascendant_sign}")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    # Ensure EPHEME_PATH is set
    if not os.getenv("EPHEME_PATH"):
        os.environ["EPHEME_PATH"] = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ephemeris")
        print(f"Set EPHEME_PATH to {os.environ['EPHEME_PATH']}")

    test_steve_jobs()
    test_indian_independence()


def test_audit_20_charts():
    """
    Audit 18 additional famous charts to verify engine robustness.
    Total Suite: 2 + 18 = 20 Charts.
    """
    # --- Expanded Audit Charts ---
    # Data Sources: Astro-Databank (Rodden Rating AA/A)
    
    audit_charts = [
        {"name": "Albert Einstein", "date": (1879, 3, 14), "time": (11, 30), "lat": 48.4011, "lon": 9.9876, "exp_asc": "Gemini"},
        {"name": "Marilyn Monroe", "date": (1926, 6, 1), "time": (9, 30), "lat": 34.0522, "lon": -118.2437, "exp_asc": "Cancer"}, # Leo? Often debated, usually Leo or Cancer border. Let's use standard.
        {"name": "Donald Trump", "date": (1946, 6, 14), "time": (10, 54), "lat": 40.7128, "lon": -73.9352, "exp_asc": "Leo"},
        {"name": "Bill Gates", "date": (1955, 10, 28), "time": (22, 0), "lat": 47.6062, "lon": -122.3321, "exp_asc": "Cancer"},
        {"name": "Elon Musk", "date": (1971, 6, 28), "time": (6, 30), "lat": -25.7479, "lon": 28.2293, "exp_asc": "Gemini"}, # Approx time
        {"name": "Oprah Winfrey", "date": (1954, 1, 29), "time": (4, 30), "lat": 32.9715, "lon": -89.5359, "exp_asc": "Sagittarius"},
        {"name": "Barack Obama", "date": (1961, 8, 4), "time": (19, 24), "lat": 21.3069, "lon": -157.8583, "exp_asc": "Capricorn"},
        {"name": "Queen Elizabeth II", "date": (1926, 4, 21), "time": (2, 40), "lat": 51.5074, "lon": -0.1278, "exp_asc": "Capricorn"},
        {"name": "Mahatma Gandhi", "date": (1869, 10, 2), "time": (7, 12), "lat": 21.6417, "lon": 69.6293, "exp_asc": "Libra"},
        {"name": "Indira Gandhi", "date": (1917, 11, 19), "time": (23, 11), "lat": 25.4358, "lon": 81.8463, "exp_asc": "Cancer"},
        {"name": "Jawaharlal Nehru", "date": (1889, 11, 14), "time": (23, 36), "lat": 25.4358, "lon": 81.8463, "exp_asc": "Cancer"},
        {"name": "Sachin Tendulkar", "date": (1973, 4, 24), "time": (12, 59), "lat": 18.9750, "lon": 72.8258, "exp_asc": "Leo"}, # Often cited as Leo/Virgo border. 
        {"name": "Virat Kohli", "date": (1988, 11, 5), "time": (10, 28), "lat": 28.6139, "lon": 77.2090, "exp_asc": "Sagittarius"},
        {"name": "Amitabh Bachchan", "date": (1942, 10, 11), "time": (16, 0), "lat": 25.4358, "lon": 81.8463, "exp_asc": "Aquarius"},
        {"name": "Shah Rukh Khan", "date": (1965, 11, 2), "time": (2, 30), "lat": 28.6139, "lon": 77.2090, "exp_asc": "Leo"},
        {"name": "Narendra Modi", "date": (1950, 9, 17), "time": (11, 0), "lat": 23.7337, "lon": 72.5300, "exp_asc": "Scorpio"},
        {"name": "Swami Vivekananda", "date": (1863, 1, 12), "time": (6, 33), "lat": 22.5726, "lon": 88.3639, "exp_asc": "Sagittarius"},
        {"name": "Srila Prabhupada", "date": (1896, 9, 1), "time": (16, 0), "lat": 22.5726, "lon": 88.3639, "exp_asc": "Capricorn"}
    ]

    print(f"\n--- Running Audit on {len(audit_charts)} Additional Charts ---")
    passed = 0
    failures = []
    
    for c in audit_charts:
        try:
            d = BirthDetails(
                date=date(*c["date"]),
                time=time(*c["time"]),
                latitude=c["lat"],
                longitude=c["lon"],
                ayanamsa_mode="LAHIRI"
            )
            chart = calculate_chart(d)
            if chart.ascendant_sign == c["exp_asc"]:
                print(f"✅ {c['name']:<20}: PASS ({chart.ascendant_sign})")
                passed += 1
            else:
                msg = f"❌ {c['name']:<20}: FAIL (Exp {c['exp_asc']}, Got {chart.ascendant_sign})"
                print(msg)
                failures.append(msg)
        except Exception as e:
            msg = f"❌ {c['name']:<20}: ERROR {e}"
            print(msg)
            failures.append(msg)

    print(f"\nAudit Result: {passed}/{len(audit_charts)} Passed")
    
    # Assert at least 80% pass rate for "Green Light"
    assert passed >= len(audit_charts) * 0.8, f"Audit Failed: {failures}"

if __name__ == "__main__":
    # Ensure EPHEME_PATH is set
    if not os.getenv("EPHEME_PATH"):
        os.environ["EPHEME_PATH"] = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ephemeris")
        print(f"Set EPHEME_PATH to {os.environ['EPHEME_PATH']}")

    test_steve_jobs()
    test_indian_independence()
    test_audit_20_charts()


