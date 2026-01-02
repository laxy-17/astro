# Project 8Stro - Vedic Astrology App (MVP)

**Version**: 1.0.0
**Date**: January 1, 2026
**Status**: Feature Complete (Ready for Beta) - *UI Polished*

## 1. Project Overview
Project 8Stro is a modern, premium Vedic Astrology web application designed to provide accurate chart calculations and AI-driven astrological insights. It bridges traditional Jyotish calculations (using Swiss Ephemeris) with cutting-edge Generative AI (Google Gemini 2.0) to act as a personalized astrological mentor.

## 2. Technology Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Language**: TypeScript
- **Styling**: TailwindCSS (Custom "Cosmic" Dark Mode Theme, Shadcn/UI integration)
- **State Management**: React Hooks
- **Routing**: React Router
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **PDF Generation**: jsPDF + html2canvas

### Backend
- **Framework**: FastAPI (Python 3.13)
- **Server**: Uvicorn (ASGI)
- **Database**: SQLite (local persistence)
- **Authentication**: None (MVP - Open Access)
- **Deployment**: Docker (Single container serving both frontend static files and backend API)

### Astrological Engine
- **Core Library**: `swisseph` (Swiss Ephemeris via `pyswisseph`)
- **Timezone**: `timezonefinder` + `pytz` (Automatic coordinate-to-timezone resolution)
- **Calculations**: 
    - Planetary Longitudes (0-360, DMS format)
    - House Systems (Whole Sign default, Placidus supported in engine)
    - Divisional Charts: D1 (Rashi), D9 (Navamsha), D10 (Dashamsha)
    - Ayanamsa: Lahiri (Chitra Paksha)
    - Strength: Vimsopaka Bala (0-20 scale)
    - Dashas: Vimshottari Mahadasha system
    - Panchanga: Tithi, Nakshatra, Yoga, Karana, Vara (with visualization)

### AI Integration
- **Provider**: Google Gemini API
- **Model**: `gemini-2.0-flash-exp`
- **SDK**: `google-genai` (Official Python SDK)
- **Features**: 
    - "Ask Mentor" (Context-aware chat)
    - Core Insights (Personal, Career, Relationships, Do's/Dont's)
    - Daily Horoscopes
    - **High-contrast accessible UI for insights**
- **Caching**: JSON file-based caching to minimize API costs/latency.

## 3. Implementation Details

### Data Flow
1. **User Input**: Name, Date, Time, Place (Lat/Lon).
2. **Backend**: 
    - Calculates high-precision planetary positions using Swiss Ephemeris.
    - Computes divisional charts and strengths.
    - (Optional) Generates AI prompts with chart context for qualitative insights.
    - Saves/Updates data in `charts.db`.
3. **Frontend**: 
    - Renders North/South Indian Chart Styles (SVG/Canvas).
    - Displays interactive data tables and strength bars.
    - **New**: Card-based Panchanga Grid with progress bars.
    - **New**: Tabular Vimshottari Dasha view with active period highlighting.
    - Streaming markdown response for AI Mentor.

### Key Features Implemented
- **Accuracy**: Verified against standard reference charts (e.g., Steve Jobs).
- **Persistence**: Save, Load, and Delete charts (Upsert logic implemented).
- **Export**: One-click PDF download of the entire dashboard.
- **Responsiveness**: Fully mobile-responsive grid layout.
- **Resilience**: Graceful error handling for missing API keys or offline states.
- **UI Polish**:
    - High-contrast text for accessibility.
    - Single-line longitude formatting.
    - Clean, modern table structures for planetary data.

## 4. Project Structure
```
vedic-astro-app/
├── backend/
│   ├── app/
│   │   ├── engine.py       # Core Astrology Logic
│   │   ├── models.py       # Pydantic Schemas
│   │   ├── database.py     # SQLite Interactions
│   │   ├── main.py         # FastAPI Routes
│   │   └── integrations/   # Gemini & Vedic API Services
│   ├── ephemeris/          # Swiss Ephemeris Data Files (.se1)
│   ├── charts.db           # SQLite Database
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # UI Components (Chart, Dashboard, etc.)
│   │   ├── api/            # Axios Client
│   │   └── utils/          # Calculations & formatting
│   └── tailwind.config.js
```

## 5. Roadmap & Improvements (For AI Analysis)
- **User Accounts**: Migrate from local SQLite to PostgreSQL/Supabase for multi-user support.
- **Payment Integration**: Stripe integration for premium insights (unlocking further Divisional Charts).
- **Performance**: Move heavy Swiss Ephemeris calculations to a separate worker or optimize caching.
- **UI/UX**: Transition to Shadcn/UI for more consistent component design.
- **Testing**: Expand current Python `tests/` coverage to include full E2E frontend testing (Cypress/Playwright).
