
import sqlite3
import json
import os
from typing import List, Optional, Any
from pydantic import BaseModel
from datetime import date, time

DB_PATH = "charts.db"

class SavedChart(BaseModel):
    id: int
    name: str
    date: str # YYYY-MM-DD
    time: str # HH:MM:SS
    latitude: float
    longitude: float
    ayanamsa_mode: str
    created_at: str

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS charts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            ayanamsa_mode TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def save_chart(name: str, d: Any, t: Any, lat: float, lon: float, mode: str):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Convert date/time objects to strings if needed
    date_str = d.isoformat() if hasattr(d, 'isoformat') else str(d)
    time_str = t.isoformat() if hasattr(t, 'isoformat') else str(t)
    
    # Check for existing chart with same name
    c.execute('SELECT id FROM charts WHERE name = ?', (name,))
    row = c.fetchone()
    
    if row:
        # Update existing
        chart_id = row[0]
        c.execute('''
            UPDATE charts 
            SET date=?, time=?, latitude=?, longitude=?, ayanamsa_mode=?, created_at=CURRENT_TIMESTAMP
            WHERE id=?
        ''', (date_str, time_str, lat, lon, mode, chart_id))
        action = "updated"
    else:
        # Insert new
        c.execute('''
            INSERT INTO charts (name, date, time, latitude, longitude, ayanamsa_mode)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (name, date_str, time_str, lat, lon, mode))
        chart_id = c.lastrowid
        action = "created"
        
    conn.commit()
    conn.close()
    return {"id": chart_id, "action": action}

def list_charts() -> List[SavedChart]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT * FROM charts ORDER BY created_at DESC')
    rows = c.fetchall()
    conn.close()
    
    charts = []
    for row in rows:
        charts.append(SavedChart(
            id=row['id'],
            name=row['name'],
            date=row['date'],
            time=row['time'],
            latitude=row['latitude'],
            longitude=row['longitude'],
            ayanamsa_mode=row['ayanamsa_mode'],
            created_at=row['created_at']
        ))
    return charts

def delete_chart(chart_id: int):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('DELETE FROM charts WHERE id = ?', (chart_id,))
    conn.commit()
    conn.close()
