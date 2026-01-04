import os
import json
from typing import List, Optional, Any
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.sql import func
from pydantic import BaseModel

# --- CONFIGURATION ---
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./charts.db")

# Handle Supabase "transaction mode" (postgres:// vs postgresql://)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLAlchemy Engine
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- SQLALCHEMY MODELS ---
class DBChart(Base):
    __tablename__ = "charts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    date = Column(String) # YYYY-MM-DD
    time = Column(String) # HH:MM:SS
    latitude = Column(Float)
    longitude = Column(Float)
    ayanamsa_mode = Column(String)
    
    # Location Metadata
    location_city = Column(String, nullable=True)
    location_state = Column(String, nullable=True)
    location_country = Column(String, nullable=True)
    location_timezone = Column(String, nullable=True)
    
    # AI/Context
    notes = Column(Text, nullable=True)
    
    # Auditing
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class DBUser(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# --- PYDANTIC SCHEMAS ---
class SavedChart(BaseModel):
    id: int
    name: str
    date: str
    time: str
    latitude: float
    longitude: float
    ayanamsa_mode: str
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    location_country: Optional[str] = None
    location_timezone: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- DB INIT ---
def init_db():
    Base.metadata.create_all(bind=engine)

# --- CRUD OPERATIONS ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def save_chart(name: str, d: Any, t: Any, lat: float, lon: float, mode: str, 
               loc_city: str = None, loc_state: str = None, loc_country: str = None, loc_tz: str = None) -> dict:
    
    db = SessionLocal()
    try:
        # Normalize date/time
        date_str = d.isoformat() if hasattr(d, 'isoformat') else str(d)
        time_str = t.isoformat() if hasattr(t, 'isoformat') else str(t)
        
        # Check if exists (by name for now, simulating user update)
        chart = db.query(DBChart).filter(DBChart.name == name).first()
        
        if chart:
            chart.date = date_str
            chart.time = time_str
            chart.latitude = lat
            chart.longitude = lon
            chart.ayanamsa_mode = mode
            chart.location_city = loc_city
            chart.location_state = loc_state
            chart.location_country = loc_country
            chart.location_timezone = loc_tz
            action = "updated"
        else:
            chart = DBChart(
                name=name, date=date_str, time=time_str, 
                latitude=lat, longitude=lon, ayanamsa_mode=mode,
                location_city=loc_city, location_state=loc_state, 
                location_country=loc_country, location_timezone=loc_tz
            )
            db.add(chart)
            action = "created"
        
        db.commit()
        db.refresh(chart)
        return {"id": chart.id, "action": action}
    finally:
        db.close()

def list_charts() -> List[SavedChart]:
    db = SessionLocal()
    try:
        charts = db.query(DBChart).order_by(DBChart.created_at.desc()).all()
        # Pydantic conversion
        return [SavedChart.model_validate(c) for c in charts]
    finally:
        db.close()

def delete_chart(chart_id: int):
    db = SessionLocal()
    try:
        chart = db.query(DBChart).filter(DBChart.id == chart_id).first()
        if chart:
            db.delete(chart)
            db.commit()
    finally:
        db.close()
