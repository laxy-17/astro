import os
import sqlite3
from dotenv import load_dotenv

# MUST LOAD ENV BEFORE IMPORTING DATABASE ENGINE
load_dotenv()

from sqlalchemy.orm import Session
from app.database import engine, DBChart, SessionLocal, init_db

def migrate():
    print("Starting migration from SQLite to Supabase...")
    
    # 1. Initialize Supabase DB (ensure tables exist)
    init_db()
    
    # 2. Connect to SQLite
    sqlite_conn = sqlite3.connect('charts.db')
    sqlite_conn.row_factory = sqlite3.Row
    cursor = sqlite_conn.cursor()
    
    # Get all columns from SQLite
    cursor.execute("SELECT * FROM charts")
    rows = cursor.fetchall()
    
    print(f"Found {len(rows)} charts in SQLite.")
    
    # 3. Insert into Supabase
    supabase_db = SessionLocal()
    try:
        count = 0
        for row in rows:
            # Check if already exists in Supabase by name (simple check)
            existing = supabase_db.query(DBChart).filter(DBChart.name == row['name']).first()
            if existing:
                print(f"Skipping {row['name']} - already exists in Supabase.")
                continue
            
            chart = DBChart(
                name=row['name'],
                date=row['date'],
                time=row['time'],
                latitude=row['latitude'],
                longitude=row['longitude'],
                ayanamsa_mode=row['ayanamsa_mode'],
                location_city=row['location_city'],
                location_state=row['location_state'],
                location_country=row['location_country'],
                location_timezone=row['location_timezone'],
                notes=row['notes']
            )
            supabase_db.add(chart)
            count += 1
            print(f"Adding {row['name']} to Supabase...")
        
        supabase_db.commit()
        print(f"Migration complete! Migrated {count} records.")
    except Exception as e:
        print(f"Error during migration: {e}")
        supabase_db.rollback()
    finally:
        supabase_db.close()
        sqlite_conn.close()

if __name__ == "__main__":
    migrate()
