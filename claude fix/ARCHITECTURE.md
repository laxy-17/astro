# 🏗️ Project Architecture & File Mapping

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                             │
│              http://localhost:3000                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           React TypeScript Application                    │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │  ChartForm Component                             │   │  │
│  │  │  - Birth date/time input                         │   │  │
│  │  │  - Coordinates input                             │   │  │
│  │  │  - Result display (planets, houses, dasha)       │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │                       ↓                                   │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │  API Client (axios)                              │   │  │
│  │  │  - calculateChart()                              │   │  │
│  │  │  - healthCheck()                                 │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓ HTTP POST                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                   ┌─────────────────┐
                   │  CORS Enabled   │
                   │  Port 8000      │
                   └─────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Server)                              │
│              http://localhost:8000                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           FastAPI Application                            │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │  Endpoints                                        │   │  │
│  │  │  POST /chart     (birth details) → ChartResponse │   │  │
│  │  │  GET  /health    → {"status": "healthy"}        │   │  │
│  │  │  GET  /docs      → Swagger UI                    │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │                       ↓                                   │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │  Pydantic Models (models.py)                     │   │  │
│  │  │  - BirthDetails                                  │   │  │
│  │  │  - PlanetPosition                                │   │  │
│  │  │  - House                                         │   │  │
│  │  │  - ChartResponse                                 │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │                       ↓                                   │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │  Calculation Engine (engine.py)                  │   │  │
│  │  │  - calculate_chart()                             │   │  │
│  │  │  - get_sign_from_longitude()                     │   │  │
│  │  │  - get_nakshatra()                               │   │  │
│  │  │  - calculate_maandi()                            │   │  │
│  │  │  - calculate_d9(), calculate_d10()               │   │  │
│  │  │  - calculate_dashas()                            │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │                       ↓                                   │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │  Swiss Ephemeris Library (pyswisseph)            │   │  │
│  │  │  - Planetary position calculations               │   │  │
│  │  │  - House cusps                                   │   │  │
│  │  │  - Sidereal zodiac conversion                    │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │                       ↓                                   │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │  Ephemeris Data Files (./ephemeris/)             │   │  │
│  │  │  - Sun (se_sun.se1)                              │   │  │
│  │  │  - Planets (.se1 files)                          │   │  │
│  │  │  - Nodes, Asteroids (.se1 files)                │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
vedic-astro-app/
│
├── 📁 frontend/                          [NEW - React App]
│   ├── src/
│   │   ├── 📁 api/
│   │   │   └── client.ts                 ✨ API client with types
│   │   │
│   │   ├── 📁 components/
│   │   │   ├── ChartForm.tsx             ✨ Main form component
│   │   │   └── ChartForm.css             ✨ Component styles
│   │   │
│   │   ├── App.tsx                       ✨ Main app component
│   │   ├── App.css                       ✨ App styles
│   │   ├── index.tsx                     ✅ Entry point (auto)
│   │   └── index.css                     ✅ Global styles (auto)
│   │
│   ├── public/                           ✅ Static assets (auto)
│   ├── package.json                      ✅ Dependencies (auto)
│   ├── tsconfig.json                     ✅ TS config (auto)
│   └── Dockerfile                        📝 For future Docker use
│
├── 📁 backend/
│   ├── 📁 app/
│   │   ├── main.py                       ✅ FastAPI app & endpoints
│   │   ├── models.py                     ✅ Pydantic models
│   │   └── engine.py                     ✅ Calculation logic
│   │
│   ├── requirements.txt                  ✅ Python dependencies
│   └── Dockerfile                        ✅ For Docker deployment
│
├── 📁 ephemeris/                         ✅ Swiss Ephemeris data
│   ├── sun.se1                           📥 Download from astro.com
│   ├── moon.se1                          📥 Download from astro.com
│   ├── merc.se1                          📥 Download from astro.com
│   ├── venus.se1                         📥 Download from astro.com
│   ├── mars.se1                          📥 Download from astro.com
│   ├── jupi.se1                          📥 Download from astro.com
│   ├── sat.se1                           📥 Download from astro.com
│   ├── mnode.se1                         📥 Download from astro.com
│   └── ...                               (other .se1 files)
│
├── docker-compose.yml                    ✅ Docker orchestration
├── docker-compose.local.yml              📝 For local development
│
├── venv_backend/                         ✅ Python venv (local only)
│   └── bin/
│       ├── python
│       ├── pip
│       ├── activate
│       └── ...
│
├── task.md                               ✨ Development tracker
├── QUICK_START.md                        ✨ Setup guide
├── DEPLOYMENT_RESOLUTION.md              ✨ Complete guide
│
└── README.md                             📝 Project overview
```

---

## Data Flow Diagram

### Birth Chart Calculation Request

```
Frontend (React)
    ↓
┌─────────────────────────────────────────┐
│  User Input Form                        │
│  - Date: 1990-01-15                     │
│  - Time: 12:00:00                       │
│  - Lat: 40.7128                         │
│  - Lon: -74.0060                        │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  API Client (client.ts)                 │
│  POST /chart                            │
│  { date, time, latitude, longitude }    │
└─────────────────────────────────────────┘
    ↓ HTTP
Backend (FastAPI)
    ↓
┌─────────────────────────────────────────┐
│  Route Handler                          │
│  @app.post("/chart")                    │
│  def create_chart(details: BirthDetails)│
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  Calculation Engine                     │
│  calculate_chart(BirthDetails)          │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  1. Convert to Julian Day               │
│     get_julian_day(date, time)          │
│                                         │
│  2. Calculate Ayanamsa                  │
│     swe.get_ayanamsa_ut(jd)             │
│                                         │
│  3. Get House Cusps                     │
│     swe.houses(jd, lat, lon)            │
│                                         │
│  4. Calculate Planets                   │
│     for each planet:                    │
│     - swe.calc_ut() → position          │
│     - get_sign_from_longitude()         │
│     - get_nakshatra()                   │
│                                         │
│  5. Calculate Maandi                    │
│     calculate_maandi(jd, details)       │
│                                         │
│  6. Calculate Dashas                    │
│     calculate_dashas(moon_lon, date)    │
│                                         │
│  7. Add Divisional Charts               │
│     calculate_d9(), calculate_d10()     │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  Swiss Ephemeris                        │
│  ephemeris/*.se1                        │
│  Returns: Planet positions, houses      │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  Response Model                         │
│  ChartResponse {                        │
│    ascendant: float                     │
│    ascendant_sign: str                  │
│    planets: List[PlanetPosition]        │
│    houses: List[House]                  │
│    dashas: List[DashaPeriod]            │
│  }                                      │
└─────────────────────────────────────────┘
    ↓ JSON
Frontend (React)
    ↓
┌─────────────────────────────────────────┐
│  Display Results                        │
│  - Ascendant Card                       │
│  - Planets Grid                         │
│  - Houses Grid                          │
│  - Dasha Timeline                       │
└─────────────────────────────────────────┘
```

---

## Component Tree

```
App
├── Health Check Status (top banner)
├── ChartForm
│   ├── Form Section
│   │   ├── Birth Info Fieldset
│   │   │   ├── Date Input
│   │   │   └── Time Input
│   │   ├── Location Fieldset
│   │   │   ├── Latitude Input
│   │   │   ├── Longitude Input
│   │   │   └── Quick Location Buttons
│   │   └── Form Actions
│   │       ├── Calculate Button
│   │       └── Clear Button
│   │
│   ├── Error Display (conditional)
│   │
│   └── Chart Results (conditional)
│       ├── Ascendant Card
│       ├── Planets Grid
│       │   └── Planet Box × 12 planets
│       ├── Houses Grid
│       │   └── House Item × 12 houses
│       └── Dasha Timeline
│           ├── Current Period
│           └── Upcoming Periods
```

---

## API Contract

### Request
```json
POST /chart

{
  "date": "1990-01-15",
  "time": "12:00:00",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

### Response
```json
{
  "ascendant": 243.45,
  "ascendant_sign": "Sagittarius",
  "planets": [
    {
      "name": "Sun",
      "longitude": 295.23,
      "latitude": 0.01,
      "speed": 1.02,
      "retrograde": false,
      "house": 5,
      "sign": "Capricorn",
      "nakshatra": "Shravana",
      "nakshatra_lord": "Moon",
      "d9_sign": "Gemini",
      "d10_sign": "Virgo"
    },
    ...
  ],
  "houses": [
    {
      "number": 1,
      "sign": "Sagittarius",
      "ascendant_degree": 243.45
    },
    ...
  ],
  "dashas": [
    {
      "lord": "Moon",
      "balance_years": 5.23,
      "full_duration": 10
    },
    ...
  ]
}
```

---

## Development Workflow

```
Morning: Start Services
├── Terminal 1: Backend
│   ├── source venv_backend/bin/activate
│   ├── export EPHEME_PATH=./ephemeris
│   ├── cd backend
│   └── uvicorn app.main:app --reload --port 8000
│
└── Terminal 2: Frontend
    ├── cd frontend
    └── npm start

Development Cycle
├── Edit Component
├── Save File
├── See Hot Reload
├── Test in Browser
└── Check Errors in Console

Testing Checklist
├── Fill Form
├── Submit with valid data
├── Check Results Display
├── Verify Planet Count (12)
├── Check House Count (12)
├── Verify Dasha Info
└── Test Error Cases

Debugging
├── Browser DevTools (F12)
│   ├── Console: JavaScript errors
│   ├── Network: HTTP requests/responses
│   └── Sources: Debug breakpoints
├── Backend Terminal
│   └── Check for Python errors
└── API Docs at http://localhost:8000/docs
```

---

## Dependency Graph

```
Frontend
├── React 18+
├── TypeScript
├── axios
│   └── HTTP Client
├── recharts (future)
│   └── Chart Visualization
└── react-router-dom (future)
    └── Navigation

Backend
├── FastAPI
│   ├── Pydantic
│   │   └── Data validation
│   └── Uvicorn
│       └── ASGI Server
├── pyswisseph
│   └── Astronomical Calculations
│       └── Ephemeris Data
└── python-dotenv
    └── Environment Variables
```

---

## Environment Variables

### Backend (.env or exports)
```bash
EPHEME_PATH=./ephemeris          # Path to ephemeris files
DATABASE_URL=sqlite:///vedic.db  # Optional, future use
DEBUG=False                       # Production flag
```

### Frontend (environment)
```bash
REACT_APP_API_URL=http://localhost:8000  # Backend URL
REACT_APP_ENV=development                # Environment
```

---

## Success Criteria

| Component | Status | Notes |
|-----------|--------|-------|
| Backend starts | ✅ | Port 8000 |
| Frontend starts | ✅ | Port 3000 |
| Form renders | ✅ | All inputs visible |
| Form submission | ✅ | No validation errors |
| Results display | ✅ | All cards render |
| Responsive design | ✅ | Mobile/tablet/desktop |
| Error handling | ✅ | Shows proper messages |
| Health check | ✅ | Status banner works |

---

**Last Updated**: December 27, 2024
**Status**: MVP Ready ✅
