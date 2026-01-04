import React, { useState, useEffect } from 'react';
import {
    fetchDailyPanchanga
} from '../api/client';
import type {
    DailyPanchangaResponse,
    LocationData
} from '../api/client';
import { detectLocationFromIP, getUserLocation, saveUserLocation } from '../utils/locationDetection';
import { LocationSelector } from './LocationSelector';
import { PanchangaCard } from './PanchangaCard';
import { AuspiciousTimings } from './AuspiciousTimings';
import { Loader2, Calendar, Sun, Moon } from 'lucide-react';
import '../styles/daily-panchanga.css';

export const DailyPanchangaDashboard: React.FC = () => {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [data, setData] = useState<DailyPanchangaResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize location
    useEffect(() => {
        async function init() {
            const stored = getUserLocation();
            if (stored) {
                setLocation(stored);
            } else {
                const detected = await detectLocationFromIP();
                setLocation(detected);
                saveUserLocation(detected);
            }
        }
        init();
    }, []);

    // Fetch data when location changes
    useEffect(() => {
        if (!location) return;

        async function loadData() {
            setLoading(true);
            setError(null);
            try {
                const response = await fetchDailyPanchanga({
                    latitude: location!.latitude,
                    longitude: location!.longitude,
                    city: location!.city
                });
                setData(response);
            } catch (err: any) {
                console.error('Failed to fetch Panchanga:', err);
                setError('Failed to load local Panchanga data. Please check your connection.');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [location]);

    const handleLocationChange = (newLoc: LocationData) => {
        setLocation(newLoc);
        saveUserLocation(newLoc);
    };

    if (!location && loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500 mb-4" />
                <p className="text-slate-500 font-medium">Detecting your location...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
                <p className="text-red-600 font-medium mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="daily-panchanga-dashboard p-6 min-h-screen">
            <header className="panchanga-header">
                <div className="left-side">
                    {location && (
                        <LocationSelector
                            currentLocation={location}
                            onLocationChange={handleLocationChange}
                        />
                    )}
                </div>

                {data && (
                    <div className="date-info">
                        <h2>{data.date.day_of_week}, {new Date(data.date.gregorian).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h2>
                        <div className="solar-times">
                            <span><Sun className="w-4 h-4 text-amber-500" /> Sunrise: {data.date.sunrise}</span>
                            <span><Moon className="w-4 h-4 text-slate-400" /> Sunset: {data.date.sunset}</span>
                        </div>
                    </div>
                )}
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-500 mb-4" />
                    <p className="text-slate-500">Calculating cosmic timings for {location?.city}...</p>
                </div>
            ) : data && (
                <>
                    <div className="hindu-calendar-banner">
                        <div>
                            <h3>Hindu Calendar</h3>
                            <div className="main-info">{data.hindu_calendar.month} • {data.hindu_calendar.paksha} Paksha</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm opacity-80">{data.hindu_calendar.samvat}</div>
                            <div className="font-bold">{data.hindu_calendar.year}</div>
                        </div>
                    </div>

                    <div className="panchanga-grid">
                        <PanchangaCard
                            title="Tithi"
                            icon="🌙"
                            value={data.panchanga.tithi.name}
                            subValue={`${data.panchanga.tithi.paksha} Paksha`}
                            completion={data.panchanga.tithi.completion}
                            endTime={data.panchanga.tithi.end_time}
                        />
                        <PanchangaCard
                            title="Nakshatra"
                            icon="✨"
                            value={data.panchanga.nakshatra.name}
                            subValue={`Pada ${data.panchanga.nakshatra.pada}`}
                            completion={data.panchanga.nakshatra.completion}
                            endTime={data.panchanga.nakshatra.end_time}
                        />
                        <PanchangaCard
                            title="Yoga"
                            icon="⚖️"
                            value={data.panchanga.yoga.name}
                            endTime={data.panchanga.yoga.end_time}
                        />
                        <PanchangaCard
                            title="Karana"
                            icon="🌊"
                            value={data.panchanga.karana.name}
                            endTime={data.panchanga.karana.end_time}
                        />
                    </div>

                    <AuspiciousTimings timings={data.auspicious_timings} />

                    <div className="planetary-card">
                        <h3 className="section-title">
                            <Calendar className="w-5 h-5 text-sky-500" /> At Sunrise
                        </h3>
                        <div className="planets-list">
                            {Object.entries(data.planetary_positions).map(([planet, pos]) => (
                                <div key={planet} className="planet-entry text-sky-300">
                                    <div className="planet-icon">{planet === 'sun' ? '☀️' : '🌙'}</div>
                                    <div className="planet-details">
                                        <span className="planet-name-label">{planet}</span>
                                        <span className="planet-pos-val">{pos.sign} {pos.degree.toFixed(1)}°</span>
                                    </div>
                                </div>
                            ))}
                            <div className="planet-entry">
                                <div className="planet-icon">📅</div>
                                <div className="planet-details">
                                    <span className="planet-name-label">Day Lord</span>
                                    <span className="planet-pos-val">{data.panchanga.vara.name} ({data.panchanga.vara.lord})</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
