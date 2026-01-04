from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()
from .models import BirthDetails, ChartResponse, PlanetPosition, House, Panchanga
from .engine import calculate_chart, get_current_transits
from .database import init_db, save_chart, list_charts, delete_chart, SavedChart
from .integrations.vedic_astro_api import VedicAstroService
import logging
import os
from .routes import auth, daily

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Vedic Astrology API",
    description="Calculate Vedic astrological birth charts with Swiss Ephemeris",
    version="1.0.0"
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

class MentorRequest(BaseModel):
    query: str
    chart_data: ChartResponse
    birth_details: BirthDetails

@app.post("/mentor/ask", tags=["Mentor"])
def ask_mentor(req: MentorRequest):
    """
    Ask the AI Mentor a question based on the chart.
    """
    try:
        response = ai_service.get_mentor_response(
            req.query,
            req.chart_data,
            req.birth_details
        )
        return {"response": response}
    except Exception as e:
        logger.error(f"Mentor error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get mentor response")

@app.post("/insights/generate", tags=["Insights"])
def generate_insights(details: BirthDetails):
    """
    Generate the 4 Core Insights (Personal, Career, Relationships, Do's/Don'ts).
    """
    try:
        # 1. Calculate Chart First (Ensure we have fresh data)
        chart = calculate_chart(details)
        
        # 2. Generate Insights
        insights = ai_service.generate_core_insights(chart, details)
        
        return {
            "chart_id": "temp_id", # MVP: No DB persistence for now
            "insights": insights
        }
    except Exception as e:
        logger.error(f"Insight Generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate insights")

# Enable CORS for frontend development and production
# Configure allowed origins from environment variable or default to localhost
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:5177,http://localhost:5178,http://localhost:5179,http://localhost:8000,http://127.0.0.1:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=600,  # Cache preflight requests for 10 minutes
)

@app.on_event("startup")
async def startup_event():
    init_db()



@app.post("/chart", response_model=ChartResponse, tags=["Charts"])
def create_chart(details: BirthDetails):
    """
    Calculate a birth chart from birth details.
    
    - **date**: Birth date (YYYY-MM-DD)
    - **time**: Birth time (HH:MM:SS)
    - **latitude**: Birth location latitude (-90 to 90)
    - **longitude**: Birth location longitude (-180 to 180)
    
    Returns complete birth chart with planets, houses, and dashas.
    """
    try:
        logger.info(
            f"Calculating chart for {details.date} {details.time} "
            f"at {details.latitude}, {details.longitude}"
        )
        chart = calculate_chart(details)
        logger.info(f"Chart calculated successfully with {len(chart.planets)} planets")
        return chart
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Error calculating chart: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Chart calculation failed: {str(e)}"
        )

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
            
        # Use AI Service for formatted output
        # If AI is unavailable (no key), falls back to plain text error message
        prediction = ai_service.generate_daily_horoscope(sign_name, date)
        
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
