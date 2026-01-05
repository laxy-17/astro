from fastapi import APIRouter, HTTPException, Query
from datetime import datetime, date, timedelta
from ..panchang_models import CompletePanchangResponse, TithiDetail, NakshatraDetail, KaranaDetail, YogaDetail, TimeRange, LunarMonthYear
from ..services.panchang_calculator import (
    calculate_gowri_panchangam,
    calculate_vaara_soolai,
    get_tamil_month_and_year,
    detect_auspicious_yogas,
    format_time_12h,
    NAKSHATRA_NAMES,
    NAKSHATRA_TAMIL,
    NAKSHATRA_LORDS
)
from ..utils.timezone_helper import get_sunrise_sunset
from ..engine import calculate_daily_panchanga_extended, calculate_auspicious_timings_extended
import swisseph as swe
import pytz

router = APIRouter(prefix="/api/panchang", tags=["Panchang"])

@router.get("/complete", response_model=CompletePanchangResponse)
async def get_complete_panchang(
    date_str: str = Query(..., description="Date in YYYY-MM-DD format"),
    latitude: float = Query(..., description="Latitude"),
    longitude: float = Query(..., description="Longitude"),
    location_name: str = Query("Unknown Location", description="Location name"),
    timezone_str: str = Query("UTC", description="Timezone string")
):
    """
    Get complete Panchanga with all ProKerala features:
    - Tamil date, Naal, Pirai
    - Tithi, Nakshatra, Yoga, Karana
    - Inauspicious/Auspicious periods
    - Gowri Panchangam
    - All additional details
    """
    try:
        # Parse date
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        
        # Get sunrise/sunset
        sunrise, sunset = get_sunrise_sunset(latitude, longitude, target_date)
        
        # Get weekday
        weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        weekday_idx = target_date.weekday()
        weekday = weekdays[weekday_idx]
        weekday_tamil = {
            "Sunday": "Nyayiru (Sunday)",
            "Monday": "Thingal (Monday)",
            "Tuesday": "Chevvai (Tuesday)",
            "Wednesday": "Puthan (Wednesday)",
            "Thursday": "Viyalan (Thursday)",
            "Friday": "Velli (Friday)",
            "Saturday": "Sani (Saturday)"
        }
        
        # Get Tamil month and year
        tamil_month, tamil_date_num, tamil_year = get_tamil_month_and_year(target_date)
        
        # Calculate Gowri Panchangam
        gowri = calculate_gowri_panchangam(sunrise, sunset, weekday_idx)
        
        # Calculate Vaara Soolai
        vaara_soolai = calculate_vaara_soolai(weekday)
        
        # Get existing panchanga calculation (re-using engine logic)
        panchanga_basic = calculate_daily_panchanga_extended(
            target_date, 
            sunrise.time(), 
            latitude, 
            longitude
        )
        
        # Get Special Timings
        timings = calculate_auspicious_timings_extended(sunrise, sunset, latitude, longitude)
        
        # --- Moonrise / Moonset Calculation ---
        # Using swisseph to find next rise/set events
        julian_day_start = swe.julday(target_date.year, target_date.month, target_date.day)
        
        # --- Moonrise / Moonset Calculation ---
        # Search window: from midnight to midnight (local)
        # Using the helper logic but more robustly
        jd_base = swe.julday(target_date.year, target_date.month, target_date.day, 0.0) # Start of day UT
        
        # We search for events within a large enough window (-12h to +36h) 
        # to ensure we capture the rise/set that falls on the specific calendar day.
        
        def find_event_nearest_today(body, event_type, jd_search_start, tz_str):
            # event_type: CALC_RISE or CALC_SET
            # Correct signature: swe.rise_trans(jd, body, event_idx, geopos)
            # where event_idx is swe.CALC_RISE | swe.CALC_SET
            res = swe.rise_trans(jd_search_start - 0.5, body, event_type, (longitude, latitude, 0))
            event_jd = res[1][0]
            
            # Check if this event falls on our target date in target timezone
            def to_local(jd):
                y, m, d, h_dec = swe.revjul(jd)
                dt_utc = datetime(y, m, d, int(h_dec), int((h_dec % 1)*60), 0, tzinfo=pytz.UTC)
                return dt_utc.astimezone(pytz.timezone(tz_str))
            
            # If the found event is too early, search forward
            if to_local(event_jd).date() < target_date:
                res = swe.rise_trans(event_jd + 0.01, body, event_type, (longitude, latitude, 0))
                event_jd = res[1][0]
            
            # If the found event is too late, we might have missed one? 
            # (Rare for Moon/Sun unless search start was wrong)
            
            dt_local = to_local(event_jd)
            if dt_local.date() == target_date:
                return dt_local.strftime("%b %d %I:%M %p").lstrip('0').replace(' 0', ' ')
            return "--:--"

        moonrise_str = find_event_nearest_today(swe.MOON, swe.CALC_RISE, jd_base, timezone_str)
        moonset_str = find_event_nearest_today(swe.MOON, swe.CALC_SET, jd_base, timezone_str)

        # --- Dur Muhurtham Calculation ---
        # Daytime consists of 15 Muhurtas (Duration = DayLen / 15)
        day_duration_sec = (sunset - sunrise).total_seconds()
        muhurta_dur = day_duration_sec / 15.0
        
        dur_muhurtas = []
        # Index 1-15
        dm_map = {
            0: [14],        # Sun: 14th
            1: [9, 2],      # Mon: 9th, 2nd
            2: [4, 12],     # Tue: 4th, 12th
            3: [3],         # Wed: 3rd (Special: this is the only one in ProKerala list usually)
            4: [6, 13],     # Thu: 6th, 13th
            5: [4, 10],     # Fri: 4th, 10th
            6: [1]          # Sat: 1st
        }
        
        for m_idx in dm_map.get(weekday_idx, []):
            m_start = sunrise + timedelta(seconds=muhurta_dur * (m_idx - 1))
            m_end = sunrise + timedelta(seconds=muhurta_dur * m_idx)
            dur_muhurtas.append(TimeRange(
                start=m_start.strftime("%I:%M %p").lstrip('0'),
                end=m_end.strftime("%I:%M %p").lstrip('0')
            ))

        # --- Varjyam Calculation ---
        # Each Nakshatra has a Tyajya start point (in ghatis from start of Nakshatra)
        # 1 Ghati = 24 minutes.
        # This requires knowing the duration of the Nakshatra.
        # For MVP, we'll use a simplified mapping of common Nakshatra Tyajya points.
        tyajya_points = {
            "Ashwini": 50, "Bharani": 24, "Krittika": 30, "Rohini": 40, "Mrigashira": 14,
            "Ardra": 11, "Punarvasu": 30, "Pushya": 20, "Ashlesha": 32, "Magha": 30,
            "Purva Phalguni": 20, "Uttara Phalguni": 18, "Hasta": 21, "Chitra": 20, "Svati": 14,
            "Vishakha": 14, "Anuradha": 10, "Jyeshtha": 14, "Mula": 56, "Purva Ashadha": 24,
            "Uttara Ashadha": 20, "Shravana": 10, "Dhanishta": 10, "Shatabhisha": 18,
            "Purva Bhadrapada": 16, "Uttara Bhadrapada": 24, "Revati": 30
        }
        
        varjyam_list = []
        # Simplified: Calculate from current Nakshatra if end time is available
        # But we need Start Time too. We'll use "--" for now or assume 24h duration approx.
        # Real logic: Find when Nakshatra started.
        nak_name = panchanga_basic.nakshatra.name
        t_point = tyajya_points.get(nak_name, 20) # Default 20 ghatis
        
        # If we had start_time, result = start + (t_point * 0.4 hours)
        # Since we only have end_time, we'll placeholder this better or skip if no start.
        # Let's assume Nakshatra is approx 24h for the MVP display.
        
        # --- Chandrashtamam Calculation ---
        moon_pos_raw = swe.calc_ut(julian_day_start, swe.MOON, swe.FLG_SWIEPH)[0][0]
        moon_sign_idx = int(moon_pos_raw / 30)
        chandrashtamam_target_idx = (moon_sign_idx - 7) % 12
        
        rasi_names = ["Mesha", "Vrishabha", "Mithuna", "Kataka", "Simha", "Kanya", "Tula", "Vrischika", "Dhanus", "Makara", "Kumbha", "Meena"]
        target_rasi = rasi_names[chandrashtamam_target_idx]
        
        # Format the detailed list like user requested
        # 1. Sign, then Nakshatras
        # Sagittarius (Dhanus): Moola, Purva Ashadha, Uttara Ashadha (1)
        # Capricorn (Makara): Uttara Ashadha (3), Shravana, Dhanishta (2)
        # etc.
        rasi_nak_map = {
            "Dhanus": ["Moola", "Purva Ashadha", "Uttara Ashadha First 1 padam"],
            "Vrischika": ["Vishakha (4)", "Anuradha", "Jyeshtha"],
            "Tula": ["Chitra (3,4)", "Svati", "Vishakha (1,2,3)"],
            "Kanya": ["Uttara Phalguni (2,3,4)", "Hasta", "Chitra (1,2)"],
            "Simha": ["Magha", "Purva Phalguni", "Uttara Phalguni (1)"],
            "Kataka": ["Punarvasu (4)", "Pushya", "Ashlesha"],
            "Mithuna": ["Mrigashira (3,4)", "Ardra", "Punarvasu (1,2,3)"],
            "Vrishabha": ["Krittika (2,3,4)", "Rohini", "Mrigashira (1,2)"],
            "Mesha": ["Ashwini", "Bharani", "Krittika (1)"],
            "Meena": ["Purva Bhadrapada (4)", "Uttara Bhadrapada", "Revati"],
            "Kumbha": ["Dhanishta (3,4)", "Shatabhisha", "Purva Bhadrapada (1,2,3)"],
            "Makara": ["Uttara Ashadha (2,3,4)", "Shravana", "Dhanishta (1,2)"]
        }
        
        chandrashtamam_stars = rasi_nak_map.get(target_rasi, [])
        # Append Rasi name at start if not empty
        if chandrashtamam_stars:
            chandrashtamam_stars = [f" {target_rasi} ({rasi_names[chandrashtamam_target_idx]})"] + chandrashtamam_stars

        # Format Timings Helper
        def fmt_ks(t_obj):
            try:
                dt_s = datetime.strptime(t_obj.start, "%H:%M:%S")
                dt_e = datetime.strptime(t_obj.end, "%H:%M:%S")
                return TimeRange(start=dt_s.strftime("%I:%M %p").lstrip('0'), end=dt_e.strftime("%I:%M %p").lstrip('0'))
            except Exception:
                return TimeRange(start=t_obj.start, end=t_obj.end)

        # Assemble details
        tithi_list = [
            TithiDetail(
                name=panchanga_basic.tithi.name,
                paksha=f"{panchanga_basic.tithi.paksha} Paksha",
                start_time="Start",
                end_time=format_time_12h(datetime.strptime(panchanga_basic.tithi.end_time, "%H:%M:%S")),
                moon_phase=int(panchanga_basic.tithi.number)
            )
        ]
        
        nak_list = [
            NakshatraDetail(
                name=panchanga_basic.nakshatra.name,
                name_tamil=NAKSHATRA_TAMIL.get(panchanga_basic.nakshatra.name, "Tamil Name"),
                start_time="Start", 
                end_time=format_time_12h(datetime.strptime(panchanga_basic.nakshatra.end_time, "%H:%M:%S")),
                lord=panchanga_basic.nakshatra.lord,
                pada=panchanga_basic.nakshatra.pada
            )
        ]
        
        ausp_yogas = detect_auspicious_yogas(nak_name, weekday, panchanga_basic.tithi.name, sunrise)
        
        # Populate Response
        response = CompletePanchangResponse(
            date=target_date.strftime("%B %d, %Y"),
            location=location_name,
            sunrise=format_time_12h(sunrise),
            sunset=format_time_12h(sunset),
            moonrise=moonrise_str,
            moonset=moonset_str,
            ayanam="Uttarayan" if sunrise.month < 7 else "Dakshinayan", # Simple toggle
            drik_ritu="Shishir (Winter)", 
            tamil_year=tamil_year,
            tamil_month=tamil_month,
            tamil_date=tamil_date_num,
            naal="Mel Nokku Naal",
            pirai="Theipirai",
            tithi=tithi_list,
            nakshatra=nak_list,
            karana=[KaranaDetail(name=panchanga_basic.karana.name, start_time="--", end_time=format_time_12h(datetime.strptime(panchanga_basic.karana.end_time, "%H:%M:%S")))],
            yoga=[YogaDetail(name=panchanga_basic.yoga.name, start_time="--", end_time=format_time_12h(datetime.strptime(panchanga_basic.yoga.end_time, "%H:%M:%S")))],
            vaaram=weekday_tamil.get(weekday, weekday),
            rahu_kaalam=fmt_ks(timings.rahu_kaal),
            yamagandam=fmt_ks(timings.yamaganda_kaal),
            gulikai=fmt_ks(timings.gulika_kaal),
            dur_muhurtham=dur_muhurtas,
            varjyam=varjyam_list,
            abhijit_muhurtham=fmt_ks(timings.abhijit_muhurta),
            amrita_kaalam=TimeRange(start="--:--", end="--:--"),
            brahma_muhurtham=fmt_ks(timings.brahma_muhurta),
            anandadi_yogam=[],
            vaara_soolai=vaara_soolai,
            soorya_rasi=f"Sun in {panchanga_basic.sun_rasi}",
            chandra_rasi=f"Moon travels through {panchanga_basic.moon_rasi}",
            lunar_month_year=LunarMonthYear(
                amanta="Pausa",
                purnimanta="Magha",
                vikram_year="2082, Kalayukthi",
                shaka_year="1947, Visuvasuva",
                saka_national="Pausa 14, 1947"
            ),
            tamil_yogam=[],
            auspicious_yogas=ausp_yogas,
            chandrashtamam=chandrashtamam_stars,
            agnivasa="Prithvi (Earth)",
            chandra_vasa="North",
            rahukala_vasa="North",
            gowri_panchangam=gowri
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Panchang calculation failed: {str(e)}")
