import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { DailyPanchangaDashboard } from './components/DailyPanchangaDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { ChartResponse, BirthDetails, LocationData } from './api/client';
import { Logo } from './components/Logo';
import './App.css';

// Wrapper to pass props to Dashboard since element prop expects component
const DashboardWrapper: React.FC<{ view?: string }> = ({ view = 'dashboard' }) => {
  // We pass null for initial data as the Dashboard will handle its own state or load from localStorage
  return <Dashboard initialData={null} initialDetails={null} activeView={view} />;
};

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Artificial delay for brand impact
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Logo size="xl" animated={true} withTagline={true} tagline="destiny" />
        <div className="mt-12 w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-sky-400 to-violet-500 animate-loading-bar"></div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/dashboard" element={<DashboardWrapper />} />
          <Route path="/panchang" element={<DashboardWrapper view="panchang" />} />
          <Route path="/test-panchang" element={<DailyPanchangaDashboard />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
