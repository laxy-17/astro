
import swisseph as swe
from datetime import datetime
import os

# Mock setup
EPHEME_PATH = os.getenv("EPHEME_PATH", "/Users/lv/Documents/Projects/Gemini Antigravity/Project 8Stro/vedic-astro-app/backend/ephemeris") # Adjust if needed
swe.set_ephe_path(EPHEME_PATH)

def test_rise_trans():
    target_date = datetime(2026, 1, 4)
    jd = swe.julday(target_date.year, target_date.month, target_date.day, 12.0)
    lat = 28.6139
    lon = 77.2090
    geopos = (lon, lat, 0)
    
    print(f"Testing swe.rise_trans with JD={jd}, geopos={geopos}")
    
    try:
        # Exact call from timezone_helper.py
        # rise_result = swe.rise_trans(jd, swe.SUN, "", swe.CALC_RISE, geopos)
        
        # NOTE: swisseph python documentation might differ from C
        # Correct usage based on docstring
        rise_result = swe.rise_trans(jd, swe.SUN, swe.CALC_RISE, geopos)
        print("Success:", rise_result)
        
    except Exception as e:
        print("Error:", e)
        print("Type:", type(e))

if __name__ == "__main__":
    test_rise_trans()
