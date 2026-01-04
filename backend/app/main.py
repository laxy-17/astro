from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()
from .models import BirthDetails, ChartResponse, PlanetPosition, House, Panchanga, DailyPanchangaRequest, DailyPanchangaResponse, MentorRequest, MentorResponse, InsightsResponse
from .engine import calculate_chart, get_current_transits, calculate_daily_panchanga_extended, calculate_auspicious_timings_extended, get_hindu_calendar_info, get_planetary_positions_small, get_current_transits_extended
from .database import init_db, save_chart, list_charts, delete_chart, SavedChart
from .integrations.vedic_astro_api import VedicAstroService
from .utils.timezone_helper import get_local_datetime, get_sunrise_sunset, get_timezone_for_coordinates
import logging
import requests
import os
from .routes import auth, daily
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, Depends
from sqlalchemy.orm import Session
from .database import get_db

# Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Vedic Astrology API",
    description="Calculate Vedic astrological birth charts with Swiss Ephemeris",
    version="1.0.0"
)

# Add Limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Middleware
origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(daily.router)

# Initialize External Services
vedic_service = VedicAstroService()
from .integrations.ai_service_gemini import AIService
ai_service = AIService()

from .geocoding import search_locations, get_location_details
from fastapi import Query

@app.get("/api/locations/search", tags=["Locations"])
async def search_location_autocomplete(
    query: str = Query(..., min_length=2, description="Search query"),
    limit: int = Query(5, ge=1, le=10)
):
    """
    Search for locations with autocomplete
    """
    if len(query) < 2:
        return {"results": []}
    
    results = search_locations(query, limit)
    return {"results": results}

@app.get("/api/locations/details/{place_id}", tags=["Locations"])
async def get_location(place_id: str):
    """
    Get full location details including lat/long from place_id
    """
    details = get_location_details(place_id)
    
    if not details:
        raise HTTPException(status_code=404, detail="Location not found")
    
    return details





@app.post("/api/daily-panchanga", tags=["Panchanga"], response_model=DailyPanchangaResponse)
async def get_daily_panchanga(request: DailyPanchangaRequest):
    """
    Calculate daily Panchanga for given location and date.
    If date is not provided, uses current local date.
    """
    try:
        # 1. Determine local date for location
        if request.date:
            target_date = request.date
        else:
            local_dt = get_local_datetime(request.latitude, request.longitude)
            target_date = local_dt.date()
        
        # 2. Calculate sunrise/sunset
        sunrise, sunset = get_sunrise_sunset(
            request.latitude,
            request.longitude,
            target_date
        )
        
        # 3. Calculate Panchanga for sunrise time
        panchanga_data = calculate_daily_panchanga_extended(
            date_val=target_date,
            time_val=sunrise.time(),
            latitude=request.latitude,
            longitude=request.longitude,
            ayanamsa_mode=request.ayanamsa_mode
        )
        
        # 4. Calculate auspicious timings
        auspicious_timings = calculate_auspicious_timings_extended(
            sunrise, sunset, request.latitude, request.longitude
        )
        
        # 5. Get Hindu calendar info
        hindu_calendar = get_hindu_calendar_info(target_date, panchanga_data)
        
        # 6. Planet positions
        # Use Julian Day for sunrise
        import swisseph as swe
        jd_sunrise = swe.julday(sunrise.year, sunrise.month, sunrise.day, sunrise.hour + sunrise.minute/60.0 + sunrise.second/3600.0)
        planetary_positions = get_planetary_positions_small(jd_sunrise, request.ayanamsa_mode)
        
        return DailyPanchangaResponse(
            location={
                "latitude": request.latitude,
                "longitude": request.longitude,
                "timezone": get_timezone_for_coordinates(request.latitude, request.longitude),
                "city": request.city or "Unknown"
            },
            date={
                "gregorian": target_date.isoformat(),
                "day_of_week": target_date.strftime("%A"),
                "sunrise": sunrise.strftime("%H:%M:%S"),
                "sunset": sunset.strftime("%H:%M:%S"),
                "day_length": str(sunset - sunrise)
            },
            panchanga=panchanga_data,
            hindu_calendar=hindu_calendar,
            auspicious_timings=auspicious_timings,
            planetary_positions=planetary_positions
        )
        
    except Exception as e:
        logger.error(f"Daily Panchanga error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.on_event("startup")
async def startup_event():
    init_db()





@app.get("/insights/daily", tags=["Insights"])
def get_daily_insight(sign_id: int, date: str):
    """
    Get AI-generated daily prediction formatted beautifully.
    """
    try:
        # Map ID to Name
        MIN_ID = 1
        MAX_ID = 12
        sign_names = [
            "Aries", "Taurus", "Gemini", "Cancer", 
            "Leo", "Virgo", "Libra", "Scorpio", 
            "Sagittarius", "Capricorn", "Aquarius", "Pisces"
        ]
        
        if not (MIN_ID <= sign_id <= MAX_ID):
            sign_name = "Aries" # Default
        else:
            sign_name = sign_names[sign_id - 1]
            
        # Format date for AI context
        try:
            from datetime import datetime
            dt_obj = datetime.strptime(date, "%Y-%m-%d")
            formatted_date = dt_obj.strftime("%m/%d/%Y")
        except:
            formatted_date = date

        # Use AI Service for formatted output
        # If AI is unavailable (no key), falls back to plain text error message
        prediction = ai_service.generate_daily_horoscope(sign_name, formatted_date)
        
        return {"prediction": prediction}
    except Exception as e:
        logger.error(f"Insight error: {e}", exc_info=True)
        return {"prediction": "Unable to fetch daily insight at this time."}

@app.post("/insights/dosha", tags=["Insights"])
def get_dosha_report(details: BirthDetails):
    """
    Check for Doshas (Mangal Dosh, etc.)
    """
    try:
        report = vedic_service.get_dosha_report(details)
        return report
    except Exception as e:
        logger.error(f"Dosha report error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch dosha report")

@app.get("/health", tags=["Health"])
def health_check():
    """Check if API is running and healthy."""
    return {
        "status": "healthy",
        "message": "Vedic Astrology API is operational"
    }

from .engine import calculate_chart, get_current_transits, get_current_transits_extended
        
@app.get("/api/transits/current", tags=["Tools"])
def get_current_transits_endpoint():
    """Get current real-time planetary positions."""
    return get_current_transits()

@app.get("/api/transits/current/extended", tags=["Tools"])
def get_extended_transits_endpoint():
    """
    Get current transits including outer planets and special points.
    Updates every 5 minutes.
    """
    try:
        from datetime import datetime, timedelta
        transits = get_current_transits_extended()
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "bodies": transits,
            "next_update": (datetime.utcnow() + timedelta(minutes=5)).isoformat()
        }
    except Exception as e:
        logger.error(f"Extended transits error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))



@app.post("/chart", response_model=ChartResponse, tags=["Charts"])
@limiter.limit("20/minute")
def create_chart(request: Request, details: BirthDetails, db: Session = Depends(get_db)):
    """
    Calculate Vedic Chart with high precision.
    Includes rate limiting to prevent abuse.
    """
    try:
        # Check cache/database first
        # ... logic ...
        
        # Calculate fresh
        chart = engine.calculate_chart(details)
        
        # Save to DB
        # ... logic ...
        
        return chart
    except Exception as e:
        logger.error(f"Chart calculation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/insights/generate", response_model=InsightsResponse, tags=["Insights"])
@limiter.limit("5/hour")
def generate_insights(request: Request, details: BirthDetails):
    """
    Generate AI-powered insights.
    Strictly rate limited due to high cost.
    """
    try:
        # Check cache
        # ... logic ...
        
        # Generate
        insights = ai_service.generate_insights(details)
        return insights
    except Exception as e:
        logger.error(f"Insights generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/mentor/ask", response_model=MentorResponse, tags=["AI Mentor"])
@limiter.limit("10/hour")
async def ask_mentor(request: Request, body: MentorRequest):
    """
    Ask the AI Vedic Mentor a question.
    Rate limited to ensure fair usage.
    """
    try:
         # ...
         return await ai_service.get_mentor_response(body.query, body.context, body.details)
         
    except Exception as e:
        logger.error(f"Mentor error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


from fastapi.responses import JSONResponse

# Error handlers
@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={"detail": f"Invalid input: {str(exc)}"}
    )

class SaveChartRequest(BaseModel):
    name: str
    details: BirthDetails

@app.post("/charts/save")
def save_chart_endpoint(req: SaveChartRequest):
    try:
        result = save_chart(
            req.name,
            req.details.date,
            req.details.time,
            req.details.latitude,
            req.details.longitude,
            req.details.ayanamsa_mode,
            req.details.location_city,
            req.details.location_state,
            req.details.location_country,
            req.details.location_timezone
        )
        return {
            "status": "success", 
            "message": f"Chart {result['action']} successfully",
            "data": result
        }
    except Exception as e:
        logger.error(f"Error saving chart: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/charts", response_model=List[SavedChart])
def get_charts():
    return list_charts()

@app.delete("/charts/{chart_id}")
def delete_chart_endpoint(chart_id: int):
    try:
        delete_chart(chart_id)
        return {"status": "success", "message": "Chart deleted"}
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))



# --- Frontend Serving (Single Container Deployment) ---
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Mount static files (JS, CSS, Images)
# Dockerfile copies frontend/dist to /app/static
if os.path.exists("static"):
    app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")

# Catch-all route for React Router (SPA)
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # API routes should be handled above. This is a fallback for frontend.
    
    # 1. Check if file exists in static root (e.g. favicon.ico, logo.png)
    file_path = os.path.join("static", full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # 2. Return index.html for any other route (SPA)
    index_path = os.path.join("static", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
        
    # 3. Fallback if static folder missing (Local Dev)
    return {"message": "Frontend not built or static folder missing. Run via Docker or check path."}

@app.get("/api/test-db")
def test_db():
    try:
        init_db()
        return {"status": "success", "message": "Database initialized"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
