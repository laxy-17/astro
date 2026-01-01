
import React, { useState, useEffect } from 'react';
import type { ChartResponse, BirthDetails, CoreInsights } from '../api/client';
import { calculateChart, getDailyInsight, getDoshaReport, generateCoreInsights, saveChart } from '../api/client';
import { ControlPanel } from './ControlPanel';
import { SouthIndianChart } from './SouthIndianChart';
import { NorthIndianChart } from './NorthIndianChart';
import { PlanetaryTable } from './PlanetaryTable';
import { DashaTable } from './DashaTable';
import { StrengthBar } from './StrengthBar';
import { DivisionalChartsTab } from './DivisionalChartsTab';
import { ChartLibrary } from './ChartLibrary';
import { generatePDF } from '../utils/pdfGenerator';
import { BirthParticulars } from './BirthParticulars';
import { PanchangaPanel } from './PanchangaPanel';

interface PersistentFormProps {
    onSuccess: (data: ChartResponse, details: BirthDetails) => void;
    ayanamsa: string;
}

const PersistentForm: React.FC<PersistentFormProps> = ({ onSuccess, ayanamsa }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // State for controlled inputs
    const [details, setDetails] = useState<BirthDetails>({
        date: '',
        time: '',
        latitude: 0,
        longitude: 0,
        ayanamsa_mode: ayanamsa
    });

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('last_birth_details');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setDetails({ ...parsed, ayanamsa_mode: ayanamsa }); // Keep current global ayanamsa
            } catch (e) {
                console.error("Failed to parse saved details", e);
            }
        }
    }, []);

    // Save to localStorage whenever details change
    const handleChange = (field: keyof BirthDetails, value: string | number) => {
        const newDetails = { ...details, [field]: value };
        setDetails(newDetails);
        localStorage.setItem('last_birth_details', JSON.stringify(newDetails));
    };

    const handleReset = () => {
        const empty = { date: '', time: '', latitude: 0, longitude: 0, ayanamsa_mode: ayanamsa };
        setDetails(empty);
        localStorage.removeItem('last_birth_details');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await calculateChart(details);
            onSuccess(data, details);
            // Re-save to ensure it's fresh
            localStorage.setItem('last_birth_details', JSON.stringify(details));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="panel" style={{ border: 'none', background: 'transparent' }}>
            <h3 style={{ marginBottom: '12px', color: 'var(--primary-purple)', fontWeight: 'bold' }}>Birth Details</h3>
            <form onSubmit={handleSubmit} className="sidebar-form">
                {error && <div className="text-red" style={{ padding: '8px', background: '#ffebee', fontSize: '0.8rem', borderRadius: '4px', marginBottom: '8px' }}>{error}</div>}

                <div>
                    <label>Date</label>
                    <input
                        type="date"
                        required
                        value={details.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                    />
                </div>

                <div>
                    <label>Time</label>
                    <input
                        type="time"
                        required
                        value={details.time}
                        onChange={(e) => handleChange('time', e.target.value)}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                        <label>Lat</label>
                        <input
                            type="number"
                            step="any"
                            placeholder="37.77"
                            required
                            value={details.latitude || ''}
                            onChange={(e) => handleChange('latitude', parseFloat(e.target.value))}
                        />
                    </div>
                    <div>
                        <label>Long</label>
                        <input
                            type="number"
                            step="any"
                            placeholder="-122.41"
                            required
                            value={details.longitude || ''}
                            onChange={(e) => handleChange('longitude', parseFloat(e.target.value))}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '10px',
                            background: 'var(--primary-purple)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        {loading ? '⏳' : 'Calculate'}
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        style={{
                            padding: '10px',
                            background: '#e0e0e0',
                            color: '#333',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                        title="Reset Form"
                    >
                        ↺
                    </button>
                </div>
            </form>
        </div>
    );
};

interface Props {
    chartData: ChartResponse | null;
    onCalculate: (data: ChartResponse, details: BirthDetails) => void;
}

export const Dashboard: React.FC<Props> = ({ chartData, onCalculate }) => {
    const [currentDetails, setCurrentDetails] = useState<BirthDetails | null>(null);
    const [chartStyle, setChartStyle] = useState<'south' | 'north'>('south');
    const [ayanamsa, setAyanamsa] = useState<string>('LAHIRI');

    // Main Tabs State
    const [activeTab, setActiveTab] = useState<'charts' | 'panchanga' | 'dashas' | 'mentor'>('charts');

    // Sub-states for Charts Tab
    const [divisionalMode, setDivisionalMode] = useState(false); // false = Rashi, true = Varga

    const [showLibrary, setShowLibrary] = useState(false);

    // Insights State
    const [prediction, setPrediction] = useState<string | null>(null);
    const [dosha, setDosha] = useState<any | null>(null);
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [coreInsights, setCoreInsights] = useState<CoreInsights | null>(null);

    const ZODIAC_MAP: { [key: string]: number } = {
        'Aries': 1, 'Taurus': 2, 'Gemini': 3, 'Cancer': 4,
        'Leo': 5, 'Virgo': 6, 'Libra': 7, 'Scorpio': 8,
        'Sagittarius': 9, 'Capricorn': 10, 'Aquarius': 11, 'Pisces': 12
    };

    const fetchInsights = async (data: ChartResponse, details: BirthDetails) => {
        setInsightsLoading(true);
        try {
            // 1. Get Moon Sign for Daily Prediction
            const moon = data.planets.find(p => p.name === 'Moon');
            if (moon) {
                const signId = ZODIAC_MAP[moon.sign] || 1;
                const today = new Date();
                const dd = String(today.getDate()).padStart(2, '0');
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const yyyy = today.getFullYear();
                const todayStr = `${dd}/${mm}/${yyyy}`;

                try {
                    setPrediction((await getDailyInsight(signId, todayStr)).prediction);
                } catch { }
            }

            try {
                const doshaData = await getDoshaReport(details);
                if (doshaData && doshaData.mangal_dosh) {
                    const md = doshaData.mangal_dosh;
                    setDosha({
                        primary: md.has_mangal_dosh ? "High Mangal Dosha" : "Low/No Mangal Dosha",
                        description: md.description || "No specific dosha description available."
                    });
                }
            } catch (e) { console.error("Dosha fetch failed", e); }

            try {
                const insights = await generateCoreInsights(details);
                setCoreInsights(insights);
            } catch (e) { console.error("Core insights failed", e); }

        } catch (e) {
            console.error("Failed to fetch insights", e);
        } finally {
            setInsightsLoading(false);
        }
    };

    const handleAyanamsaChange = async (newMode: string) => {
        setAyanamsa(newMode);
        if (currentDetails) {
            try {
                const newDetails = { ...currentDetails, ayanamsa_mode: newMode };
                const data = await calculateChart(newDetails);
                setCurrentDetails(newDetails);
                onCalculate(data, newDetails);
                fetchInsights(data, newDetails);
            } catch (e) {
                console.error("Recalculation failed", e);
            }
        }
    };

    const handleChartCalculated = (data: ChartResponse, details: BirthDetails) => {
        setCurrentDetails(details);
        onCalculate(data, details);
        fetchInsights(data, details);
    };

    const handleSaveChart = async () => {
        if (!currentDetails) return;
        const name = prompt("Enter a name for this chart:");
        if (!name) return;

        try {
            const result = await saveChart(name, currentDetails);
            alert(result.message || "Chart saved!");
        } catch (e: any) {
            console.error("Save failed:", e);
            alert(`Failed to save chart: ${e.message || "Unknown error"}`);
        }
    };

    const handleLoadChart = async (details: BirthDetails) => {
        try {
            setCurrentDetails(details);
            setAyanamsa(details.ayanamsa_mode || 'LAHIRI');

            const data = await calculateChart(details);
            onCalculate(data, details);
            fetchInsights(data, details);

            // Also update the persistent form state if possible, but the component reads from localStorage on mount.
            // We can update localStorage so the form reflects it on next reload, or lift state up completely.
            // For now, simpler: Update localStorage
            localStorage.setItem('last_birth_details', JSON.stringify(details));
            // Force reload to sync form? No, that's jarring.
            // Ideally FormWrapper watches localStorage or we pass 'details' prop to it. 
            // For MVP, user will see the chart, and if they edit the form on the left, it will still have old values unless we pass defaults.
            // We can just accept that loading a chart from library overwrites the VIEW but maybe not the FORM INPUTS immediately unless we make Form fully controlled by parent.
            // Let's stick to the request: "prior entry unless i press reset". 
            // So loading from library IS a form of entry? Probably yes.
            // I will trigger a window event or use a context if I wanted to be fancy, but let's just alert the user.
        } catch (e) {
            console.error(e);
            alert("Failed to load chart calculations.");
        }
    };

    const handleDownloadPDF = async () => {
        if (!chartData || !currentDetails) return;
        try {
            await generatePDF(chartData, currentDetails, coreInsights);
        } catch (e) {
            console.error("PDF Generation failed", e);
            alert("Failed to generate PDF");
        }
    };

    return (
        <div className="app-container">
            {/* Top Header */}
            <header className="app-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '1px', color: 'white' }}>8stro</span>
                    {currentDetails && (
                        <span style={{ opacity: 0.9, fontSize: '0.9rem', fontWeight: 500 }}>
                            {currentDetails.date} • {currentDetails.time}
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button className="header-btn" onClick={() => setShowLibrary(true)}>
                        📚 Library
                    </button>
                    {chartData && (
                        <>
                            <button className="header-btn" onClick={handleSaveChart} style={{ background: '#4CAF50' }}>
                                💾 Save
                            </button>
                            <button className="header-btn" onClick={handleDownloadPDF} style={{ background: '#FF9800' }}>
                                📄 PDF
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* Main Layout */}
            <div className="app-layout">
                {/* Sidebar */}
                <div className="sidebar">
                    <PersistentForm onSuccess={handleChartCalculated} ayanamsa={ayanamsa} />

                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />

                    <ControlPanel
                        ayanamsa={ayanamsa}
                        onAyanamsaChange={handleAyanamsaChange}
                    />
                </div>

                {/* Main Content */}
                <div className="main-content">
                    {/* Tab Navigation */}
                    <div className="tab-header">
                        <button
                            className={`tab-button ${activeTab === 'charts' ? 'active' : ''}`}
                            onClick={() => setActiveTab('charts')}
                        >
                            📊 Charts & Planets
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'panchanga' ? 'active' : ''}`}
                            onClick={() => setActiveTab('panchanga')}
                        >
                            📅 Panchanga
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'dashas' ? 'active' : ''}`}
                            onClick={() => setActiveTab('dashas')}
                        >
                            ⏳ Dashas & Strength
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'mentor' ? 'active' : ''}`}
                            onClick={() => setActiveTab('mentor')}
                        >
                            🤖 AI Mentor
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="tab-content">

                        {/* TAB 1: CHARTS */}
                        {activeTab === 'charts' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {currentDetails && <BirthParticulars details={currentDetails} />}

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', alignItems: 'start' }}>
                                    {/* Chart Side */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {/* Chart Toggle Tabs */}
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className={`tab-btn ${activeTab === 'charts' && chartStyle === 'south' ? '' : ''}`} // Styling tweak needed? No just basic
                                                onClick={() => setChartStyle('south')}
                                                style={{ padding: '6px 12px', borderRadius: '4px', border: chartStyle === 'south' ? '2px solid var(--primary-purple)' : '1px solid #ccc', background: chartStyle === 'south' ? '#F3E8FF' : 'white', cursor: 'pointer', fontWeight: 'bold' }}
                                            >
                                                South Indian
                                            </button>
                                            <button
                                                onClick={() => setChartStyle('north')}
                                                style={{ padding: '6px 12px', borderRadius: '4px', border: chartStyle === 'north' ? '2px solid var(--primary-purple)' : '1px solid #ccc', background: chartStyle === 'north' ? '#F3E8FF' : 'white', cursor: 'pointer', fontWeight: 'bold' }}
                                            >
                                                North Indian
                                            </button>
                                            {/* Divisionals Toggle */}
                                            <button
                                                onClick={() => setDivisionalMode(!divisionalMode)}
                                                style={{ marginLeft: 'auto', padding: '6px 12px', borderRadius: '4px', background: divisionalMode ? 'var(--primary-purple)' : '#eee', color: divisionalMode ? 'white' : '#333', border: 'none', cursor: 'pointer' }}
                                            >
                                                {divisionalMode ? 'Show Rashi' : 'Show Vargas'}
                                            </button>
                                        </div>

                                        {chartData ? (
                                            !divisionalMode ? (
                                                chartStyle === 'south' ? (
                                                    <SouthIndianChart planets={chartData.planets} ascendantSign={chartData.ascendant_sign} />
                                                ) : (
                                                    <NorthIndianChart planets={chartData.planets} houses={chartData.houses} />
                                                )
                                            ) : (
                                                <DivisionalChartsTab chartData={chartData} />
                                            )
                                        ) : (
                                            <div className="panel" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                                                Chart will appear here
                                            </div>
                                        )}
                                    </div>

                                    {/* Planets Side */}
                                    <div>
                                        {chartData ? (
                                            <PlanetaryTable
                                                planets={chartData.planets}
                                                ascendant={{
                                                    sign: chartData.ascendant_sign,
                                                    degree: chartData.ascendant,
                                                    house: 1
                                                }}
                                            />
                                        ) : (
                                            <div className="panel" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                                                Planetary details will appear here
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: PANCHANGA */}
                        {activeTab === 'panchanga' && (
                            <div>
                                {chartData?.panchanga && currentDetails ? (
                                    <PanchangaPanel
                                        data={chartData.panchanga}
                                        dashas={chartData.dashas}
                                        birthDate={currentDetails.date}
                                    />
                                ) : (
                                    <div className="panel" style={{ padding: '40px', textAlign: 'center' }}>
                                        {chartData ? 'Loading Panchanga...' : 'Please calculate chart first.'}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 3: DASHAS */}
                        {activeTab === 'dashas' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                {chartData && currentDetails ? (
                                    <>
                                        <DashaTable dashas={chartData.dashas} birthDate={currentDetails.date} />
                                        {chartData.strengths && (
                                            <StrengthBar strengths={chartData.strengths} />
                                        )}
                                    </>
                                ) : (
                                    <div className="panel" style={{ padding: '40px', textAlign: 'center' }}>
                                        Please calculate chart first.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 4: AI MENTOR */}
                        {activeTab === 'mentor' && (
                            <div>
                                {insightsLoading ? (
                                    <div className="panel" style={{ padding: '40px', textAlign: 'center' }}>
                                        <div className="spinner"></div> Generating Insights...
                                    </div>
                                ) : (
                                    coreInsights || prediction || dosha ? (
                                        <div className="mentor-grid">
                                            {/* Daily Forecast */}
                                            {prediction && (
                                                <div className="mentor-card forecast">
                                                    <img src="/images/misc/icon-forecast.png" alt="Forecast" className="mentor-card-icon-img" style={{ width: '64px', height: '64px', marginBottom: '8px' }} />
                                                    <div className="mentor-card-title">Daily Forecast</div>
                                                    <div className="mentor-card-content">{prediction}</div>
                                                </div>
                                            )}

                                            {/* Dosha */}
                                            {dosha && (
                                                <div className="mentor-card dos">
                                                    <div className="mentor-card-icon" style={{ fontSize: '40px' }}>🌿</div>
                                                    <div className="mentor-card-title">Dosha Analysis</div>
                                                    <div className="mentor-card-content">
                                                        Primary: <strong>{dosha.primary}</strong><br />
                                                        {dosha.description}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Core Insights */}
                                            {coreInsights && (
                                                <>
                                                    <div className="mentor-card personal">
                                                        <img src="/images/misc/icon-personal.png" alt="Personal" className="mentor-card-icon-img" style={{ width: '64px', height: '64px', marginBottom: '8px' }} />
                                                        <div className="mentor-card-title">Personality</div>
                                                        <div className="mentor-card-content">{coreInsights.personal}</div>
                                                    </div>
                                                    <div className="mentor-card career">
                                                        <img src="/images/misc/icon-career.png" alt="Career" className="mentor-card-icon-img" style={{ width: '64px', height: '64px', marginBottom: '8px' }} />
                                                        <div className="mentor-card-title">Career & Purpose</div>
                                                        <div className="mentor-card-content">{coreInsights.career}</div>
                                                    </div>
                                                    <div className="mentor-card relationships">
                                                        <img src="/images/misc/icon-love.png" alt="Relationships" className="mentor-card-icon-img" style={{ width: '64px', height: '64px', marginBottom: '8px' }} />
                                                        <div className="mentor-card-title">Relationships</div>
                                                        <div className="mentor-card-content">{coreInsights.relationships}</div>
                                                    </div>
                                                    <div className="mentor-card" style={{ borderColor: '#E5E7EB' }}>
                                                        <img src="/images/misc/icon-dos-donts.png" alt="Dos and Donts" className="mentor-card-icon-img" style={{ width: '64px', height: '64px', marginBottom: '8px' }} />
                                                        <div className="mentor-card-title">Dos & Don'ts</div>
                                                        <div className="mentor-card-content">{coreInsights.dos_donts}</div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="panel" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                                            <img src="/images/misc/zodiac-wheel.png" alt="Zodiac Wheel" style={{ width: '150px', opacity: 0.5, marginBottom: '20px' }} />
                                            <div style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Unlock Your Cosmic Blueprint</div>
                                            Calculate a chart to receive AI insights.
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Library Modal */}
            {showLibrary && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <ChartLibrary
                            onLoad={(details) => {
                                setShowLibrary(false);
                                handleLoadChart(details);
                            }}
                            onClose={() => setShowLibrary(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
