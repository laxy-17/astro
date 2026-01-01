# Vedic Astrology App — Deployment & Frontend Resolution

## Current Status
- ✅ Backend: FastAPI + Swiss Ephemeris (production-ready)
- ❌ Frontend: Empty/non-existent
- ❌ Docker: Unavailable on local Mac
- ❌ Database: PostgreSQL (optional for MVP, skip initially)

---

## Phase 1: Backend Setup (Local Development)

### Step 1.1: Prepare Backend Environment
```bash
# Navigate to project
cd ~/Documents/Projects/Gemini\ Antigravity/Project\ 8Stro/vedic-astro-app

# Create Python virtual environment
python3 -m venv venv_backend

# Activate it
source venv_backend/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

### Step 1.2: Verify Swiss Ephemeris Data
```bash
# Create ephemeris directory if missing
mkdir -p ephemeris

# Check if files exist (download if needed)
# Download from: https://www.astro.com/ftp/swisseph/
# Place .se1 files in ephemeris/ directory
# Required: sun.se1, moon.se1, etc.
ls -la ephemeris/
```

### Step 1.3: Run Backend Server
```bash
# From project root, with venv activated
export EPHEME_PATH=./ephemeris
cd backend
uvicorn app.main:app --reload --port 8000 --host 127.0.0.1
```

✅ Backend runs at: `http://localhost:8000`
- Health check: `http://localhost:8000/health`
- API docs: `http://localhost:8000/docs`
- Test endpoint: `POST http://localhost:8000/chart`

---

## Phase 2: Create Frontend from Scratch

### Step 2.1: Initialize React Project
```bash
# Go to project root
cd ~/Documents/Projects/Gemini\ Antigravity/Project\ 8Stro/vedic-astro-app

# Create frontend
npx create-react-app frontend --template typescript

cd frontend
npm install
```

### Step 2.2: Install Frontend Dependencies
```bash
npm install axios react-router-dom @tanstack/react-query

# Optional (for charts visualization)
npm install recharts
```

### Step 2.3: Create API Client
Create `frontend/src/api/client.ts`:
```typescript
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export interface BirthDetails {
  date: string;      // YYYY-MM-DD
  time: string;      // HH:MM:SS
  latitude: number;
  longitude: number;
}

export interface PlanetPosition {
  name: string;
  longitude: number;
  latitude: number;
  speed: number;
  retrograde: boolean;
  house: number;
  sign: string;
  nakshatra: string;
  nakshatra_lord: string;
  d9_sign?: string;
  d10_sign?: string;
}

export interface ChartResponse {
  ascendant: number;
  ascendant_sign: string;
  planets: PlanetPosition[];
  houses: any[];
  dashas: any[];
}

export const calculateChart = async (details: BirthDetails): Promise<ChartResponse> => {
  const response = await axios.post<ChartResponse>(`${API_BASE}/chart`, details);
  return response.data;
};

export const healthCheck = async (): Promise<boolean> => {
  try {
    await axios.get(`${API_BASE}/health`);
    return true;
  } catch {
    return false;
  }
};
```

### Step 2.4: Create Birth Chart Form Component
Create `frontend/src/components/ChartForm.tsx`:
```typescript
import React, { useState } from 'react';
import { BirthDetails, calculateChart, ChartResponse } from '../api/client';
import './ChartForm.css';

export const ChartForm: React.FC = () => {
  const [formData, setFormData] = useState<BirthDetails>({
    date: '',
    time: '12:00:00',
    latitude: 0,
    longitude: 0,
  });

  const [chart, setChart] = useState<ChartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'date' || name === 'time' ? value : parseFloat(value) || value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await calculateChart(formData);
      setChart(result);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate chart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chart-form-container">
      <h1>Vedic Astrology Chart Calculator</h1>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Birth Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Birth Time (HH:MM:SS):</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Latitude:</label>
          <input
            type="number"
            name="latitude"
            step="0.0001"
            value={formData.latitude}
            onChange={handleChange}
            placeholder="e.g., 40.7128"
            required
          />
        </div>

        <div className="form-group">
          <label>Longitude:</label>
          <input
            type="number"
            name="longitude"
            step="0.0001"
            value={formData.longitude}
            onChange={handleChange}
            placeholder="e.g., -74.0060"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate Chart'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {chart && (
        <div className="chart-results">
          <h2>Birth Chart Results</h2>
          
          <div className="ascendant-info">
            <h3>Ascendant (Lagna)</h3>
            <p><strong>{chart.ascendant_sign}</strong> at {chart.ascendant.toFixed(2)}°</p>
          </div>

          <div className="planets-section">
            <h3>Planet Positions</h3>
            <table className="planets-table">
              <thead>
                <tr>
                  <th>Planet</th>
                  <th>Sign</th>
                  <th>Degree</th>
                  <th>House</th>
                  <th>Nakshatra</th>
                  <th>Retrograde</th>
                </tr>
              </thead>
              <tbody>
                {chart.planets.map((planet, idx) => (
                  <tr key={idx}>
                    <td><strong>{planet.name}</strong></td>
                    <td>{planet.sign}</td>
                    <td>{planet.longitude.toFixed(2)}°</td>
                    <td>{planet.house}</td>
                    <td>{planet.nakshatra}</td>
                    <td>{planet.retrograde ? '✓' : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="dashas-section">
            <h3>Vimshottari Dasha</h3>
            {chart.dashas.length > 0 && (
              <div>
                <p><strong>Current: {chart.dashas[0].lord}</strong></p>
                <p>Balance: {(chart.dashas[0].balance_years || 0).toFixed(2)} years</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
```

### Step 2.5: Create Styles
Create `frontend/src/components/ChartForm.css`:
```css
.chart-form-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

h1 {
  color: #333;
  text-align: center;
  margin-bottom: 30px;
}

.form {
  background: #f5f5f5;
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 30px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.form-group input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
}

button[type="submit"] {
  grid-column: 1 / -1;
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

button[type="submit"]:hover:not(:disabled) {
  background: #0056b3;
}

button[type="submit"]:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  background: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.chart-results {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.ascendant-info {
  margin-bottom: 30px;
  padding: 15px;
  background: #f0f7ff;
  border-left: 4px solid #007bff;
  border-radius: 4px;
}

.ascendant-info h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.ascendant-info p {
  margin: 0;
  font-size: 18px;
  color: #007bff;
}

.planets-section,
.dashas-section {
  margin-bottom: 30px;
}

.planets-section h3,
.dashas-section h3 {
  color: #333;
  margin-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
}

.planets-table {
  width: 100%;
  border-collapse: collapse;
}

.planets-table th {
  background: #f5f5f5;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #ddd;
}

.planets-table td {
  padding: 12px;
  border-bottom: 1px solid #ddd;
}

.planets-table tr:hover {
  background: #f9f9f9;
}

@media (max-width: 768px) {
  .form {
    grid-template-columns: 1fr;
  }

  .planets-table {
    font-size: 12px;
  }

  .planets-table td,
  .planets-table th {
    padding: 8px;
  }
}
```

### Step 2.6: Update Main App Component
Create `frontend/src/App.tsx`:
```typescript
import React, { useEffect, useState } from 'react';
import { ChartForm } from './components/ChartForm';
import { healthCheck } from './api/client';
import './App.css';

function App() {
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      const healthy = await healthCheck();
      setBackendHealthy(healthy);
    };

    checkHealth();
  }, []);

  return (
    <div className="App">
      {backendHealthy === false && (
        <div className="backend-warning">
          ⚠️ Backend API not available at http://localhost:8000
          <br />
          Make sure to start the backend server first.
        </div>
      )}
      <ChartForm />
    </div>
  );
}

export default App;
```

### Step 2.7: Add Styles
Update `frontend/src/App.css`:
```css
.App {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.backend-warning {
  max-width: 1000px;
  margin: 0 auto 20px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  color: #856404;
  padding: 15px;
  border-radius: 4px;
  text-align: center;
  font-weight: 600;
}
```

---

## Phase 3: Run Both Services Locally

### Step 3.1: Terminal Window 1 - Backend
```bash
cd ~/Documents/Projects/Gemini\ Antigravity/Project\ 8Stro/vedic-astro-app
source venv_backend/bin/activate
export EPHEME_PATH=./ephemeris
cd backend
uvicorn app.main:app --reload --port 8000
```

### Step 3.2: Terminal Window 2 - Frontend
```bash
cd ~/Documents/Projects/Gemini\ Antigravity/Project\ 8Stro/vedic-astro-app/frontend
npm start
```

✅ Frontend opens at: `http://localhost:3000`

---

## Phase 4: Docker-Compose Adaptation (Local Dev Only)

### Step 4.1: Create `docker-compose.local.yml`
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: vedic_backend_dev
    volumes:
      - ./backend:/app
      - ./ephemeris:/app/ephemeris
    ports:
      - "8000:8000"
    environment:
      - EPHEME_PATH=/app/ephemeris
      - DATABASE_URL=sqlite:///./vedic.db
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: vedic_frontend_dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - REACT_APP_API_URL=http://localhost:8000
    command: npm start
```

### Step 4.2: Create Backend Dockerfile
Create `backend/Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Step 4.3: Create Frontend Dockerfile
Create `frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

---

## Phase 5: Update Task Tracking

### Step 5.1: Create `task.md` for Frontend Development
```markdown
# Frontend Development Tasks

## Completed ✅
- [x] Backend API functional (FastAPI + Swiss Ephemeris)
- [x] React project scaffolding
- [x] Birth chart form component
- [x] API client integration
- [x] Planet positions table display

## In Progress 🔄
- [ ] Add planet visualization (chart wheel)
- [ ] Add divisional charts (D9, D10)
- [ ] Add dasha timeline visualization
- [ ] Add compatibility/Kundali matching form

## TODO 📋
- [ ] House visualization
- [ ] Remedial suggestions UI
- [ ] User authentication (optional for MVP)
- [ ] Responsive design testing
- [ ] Performance optimization
- [ ] Deploy to production

## Known Issues
- None currently blocking MVP
```

---

## Phase 6: Troubleshooting Checklist

| Issue | Solution |
|-------|----------|
| Backend won't start | Check EPHEME_PATH, verify ephemeris files exist |
| CORS errors | Backend needs `pip install python-cors`, add middleware |
| Frontend blank | Check `npm install` completed, no build errors |
| Port 8000/3000 in use | `lsof -i :8000` / `kill -9 <PID>` |
| Swiss Ephemeris missing | Download from https://www.astro.com/ftp/swisseph/ |
| React errors | Clear `node_modules/`, reinstall: `rm -rf node_modules package-lock.json && npm install` |

---

## Summary: What You'll Have

```
vedic-astro-app/
├── backend/
│   ├── app/
│   │   ├── main.py           ✅ (ready)
│   │   ├── engine.py         ✅ (ready)
│   │   └── models.py         ✅ (ready)
│   ├── Dockerfile            ✨ (new)
│   └── requirements.txt       ✅ (ready)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChartForm.tsx  ✨ (new)
│   │   │   └── ChartForm.css  ✨ (new)
│   │   ├── api/
│   │   │   └── client.ts      ✨ (new)
│   │   ├── App.tsx            ✨ (updated)
│   │   └── App.css            ✨ (new)
│   ├── Dockerfile             ✨ (new)
│   └── package.json           ✅ (generated)
├── docker-compose.yml         ✅ (existing)
├── docker-compose.local.yml   ✨ (new)
├── ephemeris/                 ✅ (needed)
├── task.md                    ✨ (new)
└── venv_backend/              ✅ (local only)
```

**Status: Ready for MVP deployment** 🚀

