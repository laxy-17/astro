import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { DailyTimeline } from './components/DailyTimeline';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { ChartResponse } from './api/client';
import './App.css';

// Wrapper to pass props to Dashboard since element prop expects component
function DashboardWrapper() {
  const [chartData, setChartData] = useState<ChartResponse | null>(null);
  const navigate = useNavigate();

  const handleChartCalculated = (data: ChartResponse) => {
    setChartData(data);
  };

  return (
    <div>
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => navigate('/daily')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          Try Daily Mentor 🌟
        </button>
      </div>
      <Dashboard
        chartData={chartData}
        onCalculate={handleChartCalculated}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardWrapper />} />
          <Route path="/daily" element={<DailyTimeline />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
