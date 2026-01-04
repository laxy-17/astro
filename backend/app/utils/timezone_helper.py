from timezonefinder import TimezoneFinder
import pytz
from datetime import datetime
import swisseph as swe
import os

tf = TimezoneFinder()

def get_timezone_for_coordinates(lat: float, lon: float) -> str:
    """Get IANA timezone string for given coordinates."""
    tz_name = tf.timezone_at(lat=lat, lng=lon)
    return tz_name or 'UTC'

def get_local_datetime(lat: float, lon: float) -> datetime:
    """Get current local datetime for given coordinates."""
    tz_name = get_timezone_for_coordinates(lat, lon)
    tz = pytz.timezone(tz_name)
    return datetime.now(tz)

def jd_to_datetime(jd: float, lat: float, lon: float) -> datetime:
    """Convert Julian Day (UT) to local datetime."""
    # swe.revjul returns (year, month, day, decimal_hour)
    year, month, day, hour = swe.revjul(jd)
    
    # Calculate components from decimal hour
    h = int(hour)
    m = int((hour % 1) * 60)
    s = int(((hour * 60) % 1) * 60)
    
    # Create UTC datetime
    dt_utc = datetime(year, month, day, h, m, s, tzinfo=pytz.UTC)
    
    # Convert to local timezone
    tz_name = get_timezone_for_coordinates(lat, lon)
    tz = pytz.timezone(tz_name)
    return dt_utc.astimezone(tz)

def get_sunrise_sunset(lat: float, lon: float, target_date: datetime) -> tuple:
    """
    Calculate sunrise and sunset times for given location and date.
    Returns (sunrise_dt, sunset_dt) in local time.
    """
    # Use midnight UT for the calculation base to avoid skipping today's sunrise if > 12:00 UT
    jd = swe.julday(target_date.year, target_date.month, target_date.day, 0.0)
    geopos = (lon, lat, 0) # lon, lat, alt
    
    # CALC_RISE/SET flags
    # We want visible sunrise/sunset (with refraction)
    flags = swe.CALC_RISE | swe.CALC_SET
    
    # Sunrise
    rise_result = swe.rise_trans(jd, swe.SUN, swe.CALC_RISE, geopos)
    sunrise_jd = rise_result[1][0]
    
    # Sunset
    set_result = swe.rise_trans(jd, swe.SUN, swe.CALC_SET, geopos)
    sunset_jd = set_result[1][0]
    
    sunrise_dt = jd_to_datetime(sunrise_jd, lat, lon)
    sunset_dt = jd_to_datetime(sunset_jd, lat, lon)
    
    return sunrise_dt, sunset_dt
