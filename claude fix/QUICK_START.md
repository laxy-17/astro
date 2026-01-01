# 🚀 Quick Start Checklist - Vedic Astrology App

## Pre-Flight Check
- [ ] Mac with Node.js 14+ installed (`node --version`)
- [ ] Python 3.9+ installed (`python3 --version`)
- [ ] No Docker required ✅

---

## STEP 1: Backend Setup (5 minutes)

### 1a. Navigate to Project
```bash
cd ~/Documents/Projects/Gemini\ Antigravity/Project\ 8Stro/vedic-astro-app
```

### 1b. Create Virtual Environment
```bash
python3 -m venv venv_backend
source venv_backend/bin/activate
```

### 1c. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 1d. Set Up Ephemeris Files
```bash
# Download from https://www.astro.com/ftp/swisseph/
# Place files in ephemeris/ directory
mkdir -p ephemeris

# Verify files exist (or skip this if files already there)
ls -la ephemeris/
```

### 1e. Start Backend Server
```bash
export EPHEME_PATH=./ephemeris
cd backend
uvicorn app.main:app --reload --port 8000
```

✅ **Wait for**: `Application startup complete [INFO]`
✅ **Test at**: http://localhost:8000/docs

---

## STEP 2: Frontend Setup (10 minutes)

### 2a. In a NEW terminal, navigate to project
```bash
cd ~/Documents/Projects/Gemini\ Antigravity/Project\ 8Stro/vedic-astro-app
```

### 2b. Create React App
```bash
npx create-react-app frontend --template typescript
cd frontend
```

### 2c. Install Dependencies
```bash
npm install axios react-router-dom @tanstack/react-query recharts
```

### 2d. Create Required Directories
```bash
mkdir -p src/api
mkdir -p src/components
```

### 2e. Copy Files from Output
Copy these files to your frontend:

```
frontend/src/api/client.ts              ← copy from outputs
frontend/src/components/ChartForm.tsx   ← copy from outputs
frontend/src/components/ChartForm.css   ← copy from outputs
frontend/src/App.tsx                    ← copy from outputs
frontend/src/App.css                    ← copy from outputs
```

### 2f. Start Frontend Dev Server
```bash
npm start
```

✅ **Wait for**: Browser opens at http://localhost:3000
✅ **Check**: Connection status in top banner (should show ✅ or ⚠️)

---

## STEP 3: Test the Application (2 minutes)

1. **Frontend loads** at http://localhost:3000 ✅
2. **Fill in form**:
   - Birth Date: Any date (e.g., 1990-01-15)
   - Birth Time: 12:00:00
   - Click "New York" button for coordinates
3. **Click "Calculate Chart"** ✅
4. **See results**: Planet positions, houses, dashas

---

## STEP 4: Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 8000 already in use | `lsof -i :8000` then `kill -9 <PID>` |
| Port 3000 already in use | `lsof -i :3000` then `kill -9 <PID>` |
| "Backend not available" | Check terminal 1 - backend must be running |
| "ModuleNotFoundError" | Run `pip install -r backend/requirements.txt` in activated venv |
| "npm ERR" | Run `npm install` again, or `rm -rf node_modules && npm install` |
| Swiss Ephemeris error | Download .se1 files from https://www.astro.com/ftp/swisseph/ |
| Blank page | Check browser console (F12) for errors |

---

## STEP 5: Next Steps After MVP

- [ ] Add planet wheel visualization
- [ ] Add divisional charts (D9, D10)
- [ ] Add Kundali matching
- [ ] Deploy to production
- [ ] Add user authentication

---

## Terminal Setup (Recommended)

**Terminal 1 - Backend:**
```bash
cd ~/Documents/Projects/Gemini\ Antigravity/Project\ 8Stro/vedic-astro-app
source venv_backend/bin/activate
export EPHEME_PATH=./ephemeris
cd backend
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd ~/Documents/Projects/Gemini\ Antigravity/Project\ 8Stro/vedic-astro-app/frontend
npm start
```

---

## Files You'll Have Created

```
vedic-astro-app/
├── backend/
│   ├── app/
│   │   ├── main.py          ✅
│   │   ├── engine.py        ✅
│   │   └── models.py        ✅
│   └── requirements.txt      ✅
│
├── frontend/                 ✨ NEW
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts         ✨ Copy from outputs
│   │   ├── components/
│   │   │   ├── ChartForm.tsx      ✨ Copy from outputs
│   │   │   └── ChartForm.css      ✨ Copy from outputs
│   │   ├── App.tsx               ✨ Copy from outputs
│   │   ├── App.css               ✨ Copy from outputs
│   │   └── index.tsx             ✅ Auto-generated
│   ├── package.json              ✅ Auto-generated
│   └── public/                   ✅ Auto-generated
│
├── ephemeris/               ✅ (create & populate)
├── venv_backend/            ✅ (local only)
└── docker-compose.yml       ✅ (for future)
```

---

## Status After Completion

- ✅ Backend: Running at http://localhost:8000
- ✅ Frontend: Running at http://localhost:3000
- ✅ Chart Calculation: Working
- ✅ No Docker needed
- ✅ No system dependencies

**You're ready for MVP! 🚀**

---

## Quick Reference Links

- **Frontend Dev**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Backend Health**: http://localhost:8000/health

---

## Save This Checklist

Keep this file in your project root for easy reference during setup.
