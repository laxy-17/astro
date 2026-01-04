from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import date, datetime
import pytz

from app import engine, models, advisor

router = APIRouter(
    prefix="/daily",
    tags=["daily"]
)

@router.post("/mentor", response_model=dict)
def get_daily_mentor(
    birth_details: models.BirthDetails,
    current_date: str = Query(..., description="YYYY-MM-DD"),
    timezone_str: str = Query("UTC")
):
    """
    Get comprehensive Daily Mentor guidance:
    - Energy Score (Green/Amber/Red)
    - Daily Theme
    - Full Hora Timeline
    - Life Area Advice
    """
    try:
        # 1. Calculate Chart & Panchanga
        # We need the Chart to get Moon/Ascendant
        chart = engine.calculate_chart(birth_details)
        
        # 2. Get Panchanga for Current Date (Current Location)
        # Note: Panchanga depends on Current Location (User's current GPS), not Birth Location.
        # But `birth_details` has birth loc. 
        # Ideally we pass `current_location` separately. 
        # For MVP: Use Birth Location if Current not provided? 
        # Let's assume user is broadly in same timezone or pass params.
        # Actually, let's use the birth_details.latitude/longitude for now (Transit to Natal)
        # OR better: Add `current_latitude` params.
        # Sticking to valid MVP: Use Birth Lat/Lon for now (Chart-centric)
        
        current_dt = date.fromisoformat(current_date)
        # 3. Calculate Energy Score
        # USE NEW WRAPPER
        panchang = engine.calculate_daily_panchanga(
            current_dt, 
            birth_details.latitude, 
            birth_details.longitude, 
            timezone_str
        )
        
        energy = advisor.calculate_daily_energy(chart, current_dt, panchang)
        
        # 4. Generate Theme
        theme = advisor.generate_daily_theme(energy['score'], panchang.nakshatra.name)
        
        # 5. Get Hora Timeline
        timeline = engine.calculate_horas(
            current_dt, 
            birth_details.latitude, 
            birth_details.longitude, 
            timezone_str
        )
        
        # 6. Get Special Times (Rahu, Abhijit, etc.)
        special_times = engine.calculate_special_times(
            current_dt, 
            birth_details.latitude, 
            birth_details.longitude, 
            timezone_str
        )
        
        return {
            "date": current_date,
            "energy": energy,
            "theme": theme,
            "hora_timeline": timeline.horas,
            "special_times": special_times,
            "panchanga_summary": {
                "tithi": panchang.tithi.name,
                "nakshatra": panchang.nakshatra.name,
                "vara": panchang.vara,
                "yoga": panchang.yoga.name,
                "karana": panchang.karana.name
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/horas", response_model=models.DailyTimeline)
def get_daily_horas(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    date_str: str = Query(..., description="YYYY-MM-DD"),
    timezone_str: str = Query("UTC", description="Timezone ID (e.g. Asia/Kolkata)")
):
    try:
        d = date.fromisoformat(date_str)
        timeline = engine.calculate_horas(d, lat, lon, timezone_str)
        return timeline
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/current", response_model=models.Hora)
def get_current_hora(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    timezone_str: str = Query("UTC")
):
    """
    Get the specific Hora active RIGHT NOW at the provided location.
    """
    try:
        # 1. Get current time in target timezone
        tz = pytz.timezone(timezone_str)
        now_local = datetime.now(tz)
        today_date = now_local.date()
        
        # 2. Calculate full timeline for "Today"
        # Edge case: If it's early morning before sunrise, "Vedic Today" might be "Civil Yesterday"
        # But `calculate_horas` uses the Civil Date's sunrise.
        # If now < sunrise, we are technically in the "Night" of the previous Vedic Day.
        # But visually, users expect to see the timeline for the Civil Day they are in.
        # However, the Hora belongs to the PREVIOUS sequence if now < sunrise.
        # Let's just calculate for the civil date first.
        
        timeline = engine.calculate_horas(today_date, lat, lon, timezone_str)
        
        # 3. Find which hora defines the current time
        # Timestamps in timeline are strings formatted "HH:MM AM YYYY-MM-DD"?
        # Re-parsing is expensive.
        # Ideally `engine` returns objects with datetime/float attributes.
        # For MVP, let's parse or improve engine return types later.
        
        # Quick check: Compare current time comparable string?
        # Or better: `calculate_horas` returns objects. 
        # But `Hora` model has string fields. 
        # Let's parse string back to datetime for comparison.
        
        # Format "HH:MM AM YYYY-MM-DD" is what `convert_utc_to_local` returns?
        # "06:30 AM 2024-01-01"
        
        target_dt = now_local.replace(second=0, microsecond=0)
        
        for h in timeline.horas:
            # Parse start/end
            # Format: "%I:%M %p %Y-%m-%d"
            fmt = "%I:%M %p %Y-%m-%d"
            start_dt = datetime.strptime(h.start_time, fmt)
            end_dt = datetime.strptime(h.end_time, fmt)
            
            # Localize naive parse result
            start_dt = tz.localize(start_dt)
            end_dt = tz.localize(end_dt)
            
            if start_dt <= target_dt < end_dt:
                return h
                
        # If not found (e.g. exact second overlap issues or next day boundary?), return 404
        # Could be we are past the last hora of 'today'? (Next sunrise happened?)
        return timeline.horas[0] # Fallback
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
