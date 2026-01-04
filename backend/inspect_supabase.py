import os
from sqlalchemy.orm import Session
from app.database import engine, DBChart, SessionLocal
from dotenv import load_dotenv

load_dotenv()

from app.database import engine, DBChart, SessionLocal, SavedChart

load_dotenv()

def inspect():
    db = SessionLocal()
    try:
        print(f"OS ENV DATABASE_URL: {os.getenv('DATABASE_URL')}")
        print(f"DATABASE ENGINE URL:  {engine.url}")
        charts = db.query(DBChart).order_by(DBChart.created_at.desc()).all()
        print(f"Total charts in DB: {len(charts)}")
        for c in charts:
            print(f"ID: {c.id}, Name: {c.name}, CreatedAt: {c.created_at}")
            try:
                sc = SavedChart.model_validate(c)
                print(f"  Validated: {sc.name}")
            except Exception as ve:
                print(f"  Validation Error: {ve}")
    finally:
        db.close()


if __name__ == "__main__":
    inspect()
