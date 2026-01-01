import React, { useEffect, useState } from 'react';
import { ChartForm } from './components/ChartForm';
import { healthCheck } from './api/client';
import './App.css';

function App() {
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      setChecking(true);
      const healthy = await healthCheck();
      setBackendHealthy(healthy);
      setChecking(false);
    };

    checkHealth();
    // Check again every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      {backendHealthy === false && !checking && (
        <div className="backend-warning">
          <div className="warning-content">
            <span className="warning-icon">⚠️</span>
            <div className="warning-text">
              <strong>Backend API unavailable</strong>
              <p>
                The API server is not running at <code>http://localhost:8000</code>
              </p>
              <p>
                Please start the backend server first:
              </p>
              <code className="command">
                uvicorn app.main:app --reload --port 8000
              </code>
            </div>
          </div>
        </div>
      )}
      
      {backendHealthy === true && (
        <div className="backend-success">
          <span className="success-icon">✅</span>
          Backend connected
        </div>
      )}

      <ChartForm />
    </div>
  );
}

export default App;
