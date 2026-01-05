from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

class TimeRange(BaseModel):
    start: str
    end: str

class TithiDetail(BaseModel):
    name: str
    paksha: str  # "Krishna Paksha" or "Shukla Paksha"
    start_time: str
    end_time: str
    moon_phase: int  # 0-29 for moon icon

class NakshatraDetail(BaseModel):
    name: str
    name_tamil: Optional[str] = None
    start_time: str
    end_time: str
    lord: str
    pada: int  # 1-4

class KaranaDetail(BaseModel):
    name: str
    start_time: str
    end_time: str

class YogaDetail(BaseModel):
    name: str
    start_time: str
    end_time: str

class GowriPeriod(BaseModel):
    name: str  # Uthi, Amridha, Rogam, etc.
    start_time: str
    end_time: str
    is_auspicious: bool

class GowriPanchangam(BaseModel):
    day_periods: List[GowriPeriod]
    night_periods: List[GowriPeriod]

class VaaraSoolai(BaseModel):
    direction: str  # "West", "East", etc.
    remedy: str  # "Jaggery", etc.

class TamilYogam(BaseModel):
    name: str
    timing: str

class LunarMonthYear(BaseModel):
    amanta: str
    purnimanta: str
    vikram_year: str
    shaka_year: str
    saka_national: str

class AuspiciousYoga(BaseModel):
    name: str
    timing: str
    description: str

class CompletePanchangResponse(BaseModel):
    # Header info
    date: str  # "January 4, 2026"
    location: str
    
    # Sun & Moon timing (for header bar)
    sunrise: str
    sunset: str
    moonrise: str
    moonset: str
    ayanam: str  # "Dakshinayanam" or "Uttarayanam"
    drik_ritu: str  # "Shishir (Winter)"
    
    # Tamil Date
    tamil_year: str  # "Visuvasuva"
    tamil_month: str  # "Maargazhi"
    tamil_date: int  # 20
    naal: str  # "Mel Nokku Naal"
    pirai: str  # "Theipirai" or "Valarpirai"
    
    # Main Panchanga
    tithi: List[TithiDetail]
    nakshatra: List[NakshatraDetail]
    karana: List[KaranaDetail]
    yoga: List[YogaDetail]
    vaaram: str  # "Nyayiru (Sunday)"
    
    # Inauspicious periods
    rahu_kaalam: TimeRange
    yamagandam: TimeRange
    gulikai: TimeRange
    dur_muhurtham: List[TimeRange]
    varjyam: List[TimeRange]
    
    # Auspicious periods
    abhijit_muhurtham: TimeRange
    amrita_kaalam: TimeRange
    brahma_muhurtham: TimeRange
    
    # Additional details
    anandadi_yogam: List[TamilYogam]
    vaara_soolai: VaaraSoolai
    soorya_rasi: str  # "Dhanus (Sagittarius)"
    chandra_rasi: str  # "Katakam (Cancer)"
    lunar_month_year: LunarMonthYear
    tamil_yogam: List[TamilYogam]
    auspicious_yogas: List[AuspiciousYoga]
    chandrashtamam: List[str]  # List of nakshatra names
    
    # Agnivasa etc
    agnivasa: str  # "Prithvi (Earth)"
    chandra_vasa: str  # "North"
    rahukala_vasa: str  # "North"
    
    # Gowri Panchangam
    gowri_panchangam: GowriPanchangam
