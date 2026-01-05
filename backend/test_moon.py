import swisseph as swe
import datetime

# Jan 4, 2026
jd = swe.julday(2026, 1, 4)
# Frisco, TX approx 33.1, -96.8
lat, lon = 33.1, -96.8
geopos = (lon, lat, 0)
# Testing with 4 arguments as seen in timezone_helper.py
try:
    res = swe.rise_trans(jd, swe.MOON, swe.CALC_RISE, geopos)
    print(f"Result: {res}")
    # res should be (status, tret) where tret[0] is JD
    status, tret = res
    if status == 0:
        print(f"Rise JD: {tret[0]}")
        y,m,d,h = swe.revjul(tret[0])
        print(f"Rise Time: {y}-{m}-{d} {h}")
    else:
        print(f"Status non-zero: {status}")
except Exception as e:
    print(f"Error: {e}")
