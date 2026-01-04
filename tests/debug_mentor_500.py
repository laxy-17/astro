import sys
import os
from datetime import date

# Add the backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app import engine, models, advisor

def debug_mentor():
    print("Starting Debug...")
    try:
        details = models.BirthDetails(
            date="1991-04-28",
            time="13:51:00",
            latitude=34.0522,
            longitude=-118.2437,
            location_timezone="America/Los_Angeles"
        )
        current_date = "2026-01-04"
        timezone_str = "America/Los_Angeles"
        
        print(f"1. Calculating Chart for {details.date}...")
        chart = engine.calculate_chart(details)
        print("Chart calculated successfully (first 3 planets):")
        for p in chart.planets[:3]:
            print(f"  - {p.name}: {p.sign} {p.house}")
        
        current_dt = date.fromisoformat(current_date)
        print(f"\n2. Calculating Daily Panchanga for {current_date}...")
        panchang = engine.calculate_daily_panchanga(
            current_dt, 
            details.latitude, 
            details.longitude, 
            timezone_str
        )
        print(f"Panchanga: Tithi={panchang.tithi.name}, Nakshatra={panchang.nakshatra.name}")
        
        print("\n3. Calculating Daily Energy...")
        energy = advisor.calculate_daily_energy(chart, current_dt, panchang)
        print(f"Energy Score: {energy['score']} - {energy['label']}")
        
        print("\n4. Generating Theme...")
        theme = advisor.generate_daily_theme(energy['score'], panchang.nakshatra.name)
        print(f"Theme: {theme}")
        
        print("\n5. Calculating Horas...")
        timeline = engine.calculate_horas(
            current_dt, 
            details.latitude, 
            details.longitude, 
            timezone_str
        )
        print(f"Calculating Horas done. Found {len(timeline.horas)} horas.")
        
        print("\n6. Calculating Special Times...")
        special_times = engine.calculate_special_times(
            current_dt, 
            details.latitude, 
            details.longitude, 
            timezone_str
        )
        print(f"Special Times calculated: {len(special_times)}")
        
        print("\nSUCCESS: All steps completed.")
        
    except Exception as e:
        print("\nERROR FAILED:")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_mentor()
