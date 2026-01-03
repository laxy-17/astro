import googlemaps
import os
import requests
from datetime import datetime
from typing import Dict, List, Optional
from dotenv import load_dotenv

load_dotenv()

# Initialize Google Maps client if key is present
GOOGLE_KEY = os.getenv('GOOGLE_MAPS_API_KEY')
gmaps = googlemaps.Client(key=GOOGLE_KEY) if GOOGLE_KEY else None

def search_locations(query: str, limit: int = 5) -> List[Dict]:
    """
    Search for locations using Google Places Autocomplete or Nominatim Fallback
    """
    results = []
    if gmaps:
        try:
            results = _search_google(query, limit)
        except Exception as e:
            print(f"Google search failed, falling back: {e}")
            
    # If Google failed or returned no results, try Nominatim
    if not results:
        print("Using Nominatim fallback for search...")
        return _search_nominatim(query, limit)
        
    return results

def get_location_details(place_id: str) -> Optional[Dict]:
    """
    Get full location details including lat/long
    """
    if gmaps and not place_id.startswith('nominatim_'):
        return _details_google(place_id)
    
    # If using Nominatim, we likely already have the details, but we can't fetch by ID easily same way
    # Ideally Nominatim details would be passed or we'd just use what we have. 
    # For now, let's assume if it starts with 'nominatim_', we might need to handle it or just rely on search results.
    # Actually Nominatim search returns lat/long directly, so frontend probably already selected them?
    # But to keep API consistent, let's implement a lookup if possible or return dummy if data passed differently.
    
    # HACK: For Nominatim, 'place_id' in our search result is actually the OSM ID.
    if place_id.startswith('nominatim_'):
        real_id = place_id.replace('nominatim_', '')
        return _details_nominatim(real_id)
        
    return None

def reverse_geocode(latitude: float, longitude: float) -> Optional[Dict]:
    """
    Get location name from coordinates
    """
    if gmaps:
        try:
            results = gmaps.reverse_geocode((latitude, longitude))
            if results:
                return {'formatted_address': results[0]['formatted_address']}
        except Exception as e:
            print(f"Google reverse geocode error: {e}")
    
    # Fallback to Nominatim
    try:
        response = requests.get(
            'https://nominatim.openstreetmap.org/reverse',
            params={
                'lat': latitude,
                'lon': longitude,
                'format': 'json'
            },
            headers={'User-Agent': '8stro-vedic-astrology/1.0'}
        )
        data = response.json()
        return {'formatted_address': data.get('display_name')}
    except Exception as e:
        print(f"Nominatim reverse geocode error: {e}")
        return None

# --- GOOGLE IMPLEMENTATION ---

def _search_google(query: str, limit: int) -> List[Dict]:
    try:
        predictions = gmaps.places_autocomplete(
            input_text=query,
            types='(cities)',
            language='en'
        )
        
        results = []
        for prediction in predictions[:limit]:
            results.append({
                'place_id': prediction['place_id'],
                'description': prediction['description'],
                'main_text': prediction['structured_formatting']['main_text'],
                'secondary_text': prediction['structured_formatting'].get('secondary_text', '')
            })
        return results
    except Exception as e:
        print(f"Google search error detail: {e}")
        return []

def _details_google(place_id: str) -> Optional[Dict]:
    try:
        place = gmaps.place(place_id=place_id, fields=[
            'name',
            'formatted_address',
            'geometry',
            'address_components'
        ])
        
        if place['status'] != 'OK':
            return None
        
        result = place['result']
        location = result['geometry']['location']
        
        timezone_result = gmaps.timezone(
            location=(location['lat'], location['lng']),
            timestamp=datetime.now()
        )
        
        components = result.get('address_components', [])
        city = None
        state = None
        country = None
        
        for component in components:
            types = component['types']
            if 'locality' in types:
                city = component['long_name']
            elif 'administrative_area_level_1' in types:
                state = component['long_name']
            elif 'country' in types:
                country = component['long_name']
        
        return {
            'place_id': place_id,
            'name': result['name'],
            'formatted_address': result['formatted_address'],
            'latitude': location['lat'],
            'longitude': location['lng'],
            'city': city,
            'state': state,
            'country': country,
            'timezone': timezone_result['timeZoneId']
        }
    except Exception as e:
        print(f"Google details error: {e}")
        return None

# --- NOMINATIM IMPLEMENTATION ---

def _search_nominatim(query: str, limit: int) -> List[Dict]:
    try:
        response = requests.get(
            'https://nominatim.openstreetmap.org/search',
            params={
                'q': query,
                'format': 'json',
                'limit': limit,
                'addressdetails': 1
            },
            headers={'User-Agent': '8stro-vedic-astrology/1.0'}
        )
        
        results = []
        for place in response.json():
            # Construct a Google-like structure
            city = place['address'].get('city') or place['address'].get('town') or place['address'].get('village')
            state = place['address'].get('state')
            country = place['address'].get('country')
            
            main_text = city if city else place['display_name'].split(',')[0]
            secondary = f"{state}, {country}" if state and country else place['display_name']
            
            results.append({
                'place_id': f"nominatim_{place['place_id']}", # Prefix to identify
                'description': place['display_name'],
                'main_text': main_text,
                'secondary_text': secondary,
                # Store lat/long directly in metadata if we can't fetch details later easily?
                # Actually we can just fetch details using the OSM ID if needed or just return standard structure
            })
        return results
    except Exception as e:
        print(f"Nominatim search error: {e}")
        return []

def _details_nominatim(osm_id: str) -> Optional[Dict]:
    # Nominatim "details" endpoint isn't exactly like Place Details by ID in the same way for search results
    # But reverse geocoding or lookup by OSM ID works. 
    # For now, let's assume the flow is: Search -> Get ID -> Get Details.
    # However, Nominatim search result ALREADY has lat/long. 
    # So we might need to handle this differently. 
    # But to keep the API consistent, let's just do a 'lookup' if we can, or 
    # simpler: we'll have to cache the search results or re-query.
    # Actually, let's just use the 'lookup' endpoint if possible.
    
    # https://nominatim.openstreetmap.org/lookup?osm_ids=R146656,W104393803,N240109189
    try:
        # We need the OSM type usually (N, W, R). The search result usually gives 'osm_type' and 'osm_id'. 
        # But our simple ID storage `nominatim_{place_id}` stores `place_id` which acts as internal ID. 
        # Retrying search is inefficient. 
        # Let's try to just search specifically? No.
        
        # Real-world fallback: Just use search again with a specific query if needed, 
        # or better: The frontend could pass the logic? No backend should handle.
        
        # Let's try the 'details' endpoint of nominatim using place_id?
        # https://nominatim.openstreetmap.org/details?place_id=...
        
        response = requests.get(
            'https://nominatim.openstreetmap.org/details',
            params={
                'place_id': osm_id,
                'format': 'json',
                'addressdetails': 1
            },
            headers={'User-Agent': '8stro-vedic-astrology/1.0'}
        )
        
        place = response.json()
        # Note: 'details' format might differ from 'search'.
        
        city = place['address'].get('city') or place['address'].get('town') or place['address'].get('village')
        state = place['address'].get('state')
        country = place['address'].get('country')
        
        # Timezone lookup (since Nominatim doesn't provide it directly usually, unless extratags?)
        # We will use `timezonefinder` which we already have!
        from timezonefinder import TimezoneFinder
        tf = TimezoneFinder()
        lat = float(place['lat'])
        lng = float(place['lon'])
        tz = tf.timezone_at(lng=lng, lat=lat) or 'UTC'

        return {
            'place_id': f"nominatim_{osm_id}",
            'name': place.get('name') or city,
            'formatted_address': place.get('display_name'), # display_name is usually the full address
            'latitude': lat,
            'longitude': lng,
            'city': city,
            'state': state,
            'country': country,
            'timezone': tz
        }

    except Exception as e:
        print(f"Nominatim details error: {e}")
        return None
