import datetime
from pydantic import BaseModel, Field
from typing import List, Optional, Any
from enum import Enum

class AyanamsaMode(str, Enum):
    LAHIRI = "LAHIRI"
    RAMAN = "RAMAN"
    KRISHNAMURTI = "KRISHNAMURTI"
    FAGAN_BRADLEY = "FAGAN_BRADLEY"
    SAYANA = "SAYANA"

class BirthDetails(BaseModel):
    date: datetime.date = Field(..., description="Birth date (YYYY-MM-DD)")
    time: datetime.time = Field(..., description="Birth time (HH:MM:SS)")
    latitude: float = Field(..., ge=-90, le=90, description="Birth latitude (-90 to 90)")
    longitude: float = Field(..., ge=-180, le=180, description="Birth longitude (-180 to 180)")
    ayanamsa_mode: AyanamsaMode = Field(default=AyanamsaMode.LAHIRI)
    # New Location Fields
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    location_country: Optional[str] = None
    location_timezone: Optional[str] = None

class PlanetPosition(BaseModel):
    name: str = Field(..., description="Name of the planet (e.g., Sun, Moon)")
    longitude: float = Field(..., description="Ecliptic longitude in degrees (0-360)")
    latitude: float = Field(..., description="Ecliptic latitude")
    speed: float = Field(..., description="Speed in longitude (negative means retrograde)")
    retrograde: bool = Field(..., description="True if the planet is retrograde")
    house: int = Field(..., description="House number (1-12) based on Whole Sign")
    sign: str = Field(..., description="Zodiac sign name")
    nakshatra: str = Field(..., description="Nakshatra name")
    nakshatra_lord: str = Field(..., description="Nakshatra lord name")
    # New fields for Divisional Charts
    d9_sign: Optional[str] = None
    d10_sign: Optional[str] = None
    # We will eventually replace individual d9/d10 fields with the general divisional_charts map in response
    # but keeping them for backward compatibility for now if needed.

class VargaPosition(BaseModel):
    planet: str
    sign: str
    house: int

class VargaChart(BaseModel):
    name: str # e.g. "D9", "Navamsha"
    planets: List[VargaPosition]
    ascendant_sign: str

class TithiData(BaseModel):
    name: str
    number: int # 1-30
    paksha: str # Shukla or Krishna
    completion: float = Field(..., description="Percentage of tithi traversed or degrees remaining")

class NakshatraData(BaseModel):
    name: str
    number: int # 1-27
    pada: int # 1-4
    lord: str
    completion: float = Field(..., description="Percentage traversed")

class YogaData(BaseModel):
    name: str
    number: int # 1-27

class KaranaData(BaseModel):
    name: str
    number: int # 1-60

class SpecialTime(BaseModel):
    name: str
    start_time: str
    end_time: str
    quality: str
    description: str
    start_dt: Optional[str] = None
    end_dt: Optional[str] = None

class Panchanga(BaseModel):
    tithi: TithiData
    nakshatra: NakshatraData
    yoga: YogaData
    karana: KaranaData
    vara: str

class House(BaseModel):
    number: int
    sign: str
    ascendant_degree: Optional[float] = None # Only for 1st house/Lagna

class DashaPeriod(BaseModel):
    lord: str
    duration: float = Field(..., description="Duration in years (or balance)")
    start_date: Optional[datetime.date] = None
    end_date: Optional[datetime.date] = None

class ChartResponse(BaseModel):
    ascendant: float
    ascendant_sign: str
    planets: List[PlanetPosition]
    houses: List[House]
    dashas: List[DashaPeriod]
    panchanga: Optional[Panchanga] = None
    special_times: Optional[List[SpecialTime]] = None
    ayanamsa: Optional[float] = None
    
    # Phase 2 Enhancements
    strengths: Optional[dict[str, float]] = None # Planet -> Score (0-20)
    divisional_charts: Optional[dict[str, VargaChart]] = None # D-Chart Name -> Chart Data
    
    # Debug / Verification Fields
    sunrise_time: Optional[str] = None
    sunset_time: Optional[str] = None
    mandhi_time_local: Optional[str] = None

# --- AUTH MODELS ---
class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# --- DAILY MENTOR MODELS ---
class Hora(BaseModel):
    index: int
    start_time: str
    end_time: str
    ruler: str # Planet Name
    quality: str # "Good", "Average", "Bad" (or specific energy)
    color: Optional[str] = None
    activity_suggestion: Optional[str] = None

class DailyTimeline(BaseModel):
    date: str
    location: str
    sunrise: str
    sunset: str
    horas: List[Hora]



# --- DAILY PANCHANGA MODELS ---
class DailyPanchangaRequest(BaseModel):
    latitude: float
    longitude: float
    date: Optional[datetime.date] = None  # If None, uses current local date
    city: Optional[str] = None
    timezone_str: Optional[str] = "UTC"
    ayanamsa_mode: str = "LAHIRI"

class LocationInfo(BaseModel):
    latitude: float
    longitude: float
    timezone: str
    city: str

class DateInfo(BaseModel):
    gregorian: str
    day_of_week: str
    sunrise: str
    sunset: str
    day_length: str

class TithiDataExtended(BaseModel):
    name: str
    number: int
    paksha: str
    completion: float
    end_time: str

class NakshatraDataExtended(BaseModel):
    name: str
    number: int
    pada: int
    lord: str
    completion: float
    end_time: str

class YogaDataExtended(BaseModel):
    name: str
    number: int
    end_time: str

class KaranaDataExtended(BaseModel):
    name: str
    number: int
    end_time: str

class VaraData(BaseModel):
    name: str
    lord: str

class PanchangaExtended(BaseModel):
    tithi: TithiDataExtended
    nakshatra: NakshatraDataExtended
    yoga: YogaDataExtended
    karana: KaranaDataExtended
    vara: VaraData
    sun_rasi: str
    moon_rasi: str

class HinduCalendar(BaseModel):
    month: str
    paksha: str
    year: str
    samvat: str

class AuspiciousTiming(BaseModel):
    start: str
    end: str

class AuspiciousTimings(BaseModel):
    abhijit_muhurta: AuspiciousTiming
    brahma_muhurta: AuspiciousTiming
    rahu_kaal: AuspiciousTiming
    gulika_kaal: Optional[AuspiciousTiming] = None
    yamaganda_kaal: Optional[AuspiciousTiming] = None

class PlanetaryPositionSmall(BaseModel):
    sign: str
    degree: float
    nakshatra: str

class DailyPanchangaResponse(BaseModel):
    location: LocationInfo
    date: DateInfo
    panchanga: PanchangaExtended
    hindu_calendar: HinduCalendar
    auspicious_timings: AuspiciousTimings
    planetary_positions: dict[str, PlanetaryPositionSmall]

class LocationDetails(BaseModel):
    place_id: str
    name: str
    formatted_address: str
    latitude: float
    longitude: float
    city: str
    state: str
    country: str
    timezone: str

class MentorRequest(BaseModel):
    query: str
    context: Optional[str] = None
    details: BirthDetails

class MentorResponse(BaseModel):
    response: str

class CoreInsightsData(BaseModel):
    personal: str
    career: str
    relationships: str
    dos_donts: str

class InsightsResponse(BaseModel):
    insights: CoreInsightsData

