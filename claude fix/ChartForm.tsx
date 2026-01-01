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
      [name]: (name === 'date' || name === 'time') 
        ? value 
        : parseFloat(value) || value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date) {
      setError('Birth date is required');
      return;
    }

    setLoading(true);
    setError(null);
    setChart(null);

    try {
      const result = await calculateChart(formData);
      setChart(result);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate chart. Please check that the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      date: '',
      time: '12:00:00',
      latitude: 0,
      longitude: 0,
    });
    setChart(null);
    setError(null);
  };

  // Quick location presets for testing
  const setLocation = (lat: number, lon: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lon,
    }));
  };

  return (
    <div className="chart-form-container">
      <header className="app-header">
        <h1>🌟 Vedic Astrology Chart Calculator</h1>
        <p className="subtitle">Calculate your birth chart based on Vedic principles</p>
      </header>

      <div className="content-wrapper">
        <form onSubmit={handleSubmit} className="form">
          <fieldset>
            <legend>Birth Information</legend>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Birth Date *</label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="time">Birth Time</label>
                <input
                  id="time"
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Birth Location</legend>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="latitude">Latitude *</label>
                <input
                  id="latitude"
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
                <label htmlFor="longitude">Longitude *</label>
                <input
                  id="longitude"
                  type="number"
                  name="longitude"
                  step="0.0001"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="e.g., -74.0060"
                  required
                />
              </div>
            </div>

            <div className="quick-locations">
              <p className="quick-label">Quick locations for testing:</p>
              <div className="location-buttons">
                <button type="button" onClick={() => setLocation(40.7128, -74.0060)}>
                  New York
                </button>
                <button type="button" onClick={() => setLocation(51.5074, -0.1278)}>
                  London
                </button>
                <button type="button" onClick={() => setLocation(28.6139, 77.2090)}>
                  Delhi
                </button>
              </div>
            </div>
          </fieldset>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? '⏳ Calculating...' : '✨ Calculate Chart'}
            </button>
            <button type="reset" onClick={handleReset} className="btn-secondary">
              Clear
            </button>
          </div>
        </form>

        {error && (
          <div className="error-box">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {chart && (
          <div className="chart-results">
            <h2>Birth Chart Results</h2>
            
            <div className="ascendant-card">
              <h3>🌙 Ascendant (Lagna)</h3>
              <div className="ascendant-value">
                <span className="sign">{chart.ascendant_sign}</span>
                <span className="degree">{chart.ascendant.toFixed(2)}°</span>
              </div>
            </div>

            <div className="planets-card">
              <h3>⭐ Planet Positions</h3>
              <div className="planets-grid">
                {chart.planets.map((planet, idx) => (
                  <div key={idx} className="planet-box">
                    <div className="planet-name">{planet.name}</div>
                    <div className="planet-sign">{planet.sign}</div>
                    <div className="planet-degree">{planet.longitude.toFixed(1)}°</div>
                    <div className="planet-house">House {planet.house}</div>
                    <div className="planet-nakshatra">{planet.nakshatra}</div>
                    {planet.retrograde && <div className="retrograde-badge">↺ Retrograde</div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="houses-card">
              <h3>🏠 Houses</h3>
              <div className="houses-grid">
                {chart.houses.map((house, idx) => (
                  <div key={idx} className="house-item">
                    <span className="house-number">H{house.number}</span>
                    <span className="house-sign">{house.sign}</span>
                  </div>
                ))}
              </div>
            </div>

            {chart.dashas.length > 0 && (
              <div className="dasha-card">
                <h3>⏱️ Vimshottari Dasha</h3>
                <div className="dasha-timeline">
                  <div className="current-dasha">
                    <h4>Current Period</h4>
                    <p className="dasha-lord">{chart.dashas[0].lord}</p>
                    {chart.dashas[0].balance_years !== undefined && (
                      <p className="balance-years">
                        Balance: {chart.dashas[0].balance_years.toFixed(2)} years
                      </p>
                    )}
                  </div>
                  
                  <div className="upcoming-dashas">
                    <h4>Upcoming Periods</h4>
                    <ul>
                      {chart.dashas.slice(1, 4).map((dasha, idx) => (
                        <li key={idx}>
                          {dasha.lord} - {dasha.duration || 'TBD'} years
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
