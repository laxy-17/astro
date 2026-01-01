
import os
import logging
import requests
from typing import Optional, Dict, Any
from ..models import BirthDetails

logger = logging.getLogger(__name__)

class VedicAstroService:
    BASE_URL = "https://api.vedicastroapi.com/v3-json"
    
    def __init__(self):
        # Default to the provided key if not in env, for seamless testing
        self.api_key = os.getenv("VEDIC_ASTRO_API_KEY", "c9469cdf-9171-5811-bff6-b8a251fa8ae3")
        self.lang = "en"

    def _make_request(self, endpoint: str, params: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Helper to make GET requests to the API."""
        url = f"{self.BASE_URL}/{endpoint}"
        
        # Add API Key to params (verified working via curl)
        params['api_key'] = self.api_key
        
        try:
            logger.info(f"Calling VedicAstroAPI: {endpoint}")
            # we can still send header just in case, but rely on param
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # API returns {status: 200, response: ...} usually
                if data.get("status") == 200:
                   return data.get("response")
                else:
                   logger.error(f"API Error: {data}")
                   return None
            else:
                logger.error(f"HTTP Error {response.status_code}: {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Request failed: {e}")
            return None

    def get_daily_prediction(self, zodiac_sign_id: int, date_str: str, tz: float, lat: float, lon: float) -> str:
        """
        Get daily prediction for a zodiac sign.
        Endpoint: prediction/daily-sun (or daily-moon/prediction/daily-zodiac)
        According to docs/verification, daily-sun works but needs 'zodiac' param.
        Zodiac ID: 1=Aries, ..., 12=Pisces
        """
        params = {
            "zodiac": zodiac_sign_id,
            "date": date_str, # DD/MM/YYYY
            "tz": tz,
            "lat": lat,
            "lon": lon,
            "lang": self.lang
        }
        
        # Using prediction/daily-sun based on my curl test finding (it exists)
        # Note: 'daily-zodiac' might be the general one. Let's try daily-sun as verified.
        result = self._make_request("prediction/daily-sun", params)
        
        # Result is typically a breakdown. We want the summary or general text.
        if result:
            # Structure depends on API. Usually { "prediction": "...", ... }
            if isinstance(result, list):
                 # Sometimes returns list of predictions?
                 return " ".join([str(r) for r in result])
            if isinstance(result, dict):
                 return result.get("prediction", str(result))
            return str(result)
            
        return "Could not fetch prediction."

    def get_dosha_report(self, details: BirthDetails) -> Dict[str, Any]:
        """
        Check for Mangal Dosh and other major doshas.
        Endpoint: dosha/mangal-dosh
        """
        # API expects 'dob' and 'tob' for this endpoint, not 'date' and 'time'
        params = {
            "dob": details.date.strftime("%d/%m/%Y"),
            "tob": details.time.strftime("%H:%M"),
            "tz": 5.5, # Defaulting to IST for testing/MVP if no better option. Ideally we use the calc value.
            "lat": details.latitude,
            "lon": details.longitude,
            "lang": self.lang
        }
        
        # Calculate real TZ if possible, otherwise use 0 or standard
        # Re-using the logic from get_daily_prediction if needed
        # But let's reuse the tz logic I wrote earlier or simplify
        try:
           from timezonefinder import TimezoneFinder
           import pytz
           from datetime import datetime
           tf = TimezoneFinder()
           tz_str = tf.timezone_at(lng=details.longitude, lat=details.latitude) or 'UTC'
           local_tz = pytz.timezone(tz_str)
           dt = datetime.combine(details.date, details.time)
           offset = local_tz.utcoffset(dt).total_seconds() / 3600.0
           params['tz'] = offset
        except:
           pass # Fallback to 5.5 or whatever is set

        mangal_result = self._make_request("dosha/mangal-dosh", params)
        
        return {
            "mangal_dosh": mangal_result
        }

