import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { ChartResponse } from './api/client';
import './App.css';
// Note: App.css can stay but index.css overrides most things.

function App() {
  const [chartData, setChartData] = useState<ChartResponse | null>(null);

  const handleChartCalculated = (data: ChartResponse) => {
    setChartData(data);
  };

  return (
    <ErrorBoundary>
      <Dashboard
        chartData={chartData}
        onCalculate={handleChartCalculated}
      />
    </ErrorBoundary>
  );
}

export default App;
