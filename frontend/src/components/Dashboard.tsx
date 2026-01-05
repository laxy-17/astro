import React, { useState, useEffect } from 'react';
import type { ChartResponse, BirthDetails, CoreInsights } from '../api/client';
import { calculateChart, getDailyInsight, getDoshaReport, generateCoreInsights, saveChart } from '../api/client';
import { Logo } from './Logo';

import { ChartsTab } from './ChartsTab';
import { NorthIndianChartParchment } from './charts/NorthIndianChartParchment';
import { SouthIndianChartParchment } from './charts/SouthIndianChartParchment';
import { PlanetPositionsTable } from './tables/PlanetPositionsTable';
import { DashaTab } from './DashaTab';
import { ChartLibrary } from './ChartLibrary';
import { TransitsTab } from './TransitsTab';
import { InsightsPanel } from './InsightsPanel';
import { LocationSelector } from './LocationSelector';
import type { LocationData } from '../api/client';

import { DailyMentor } from './DailyMentor';
import { UnifiedPanchanga } from './UnifiedPanchanga';

// Shadcn UI Imports
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Save, FileText, Library, Compass, Layout, Layers, Orbit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SimpleToast } from "@/components/ui/SimpleToast";
import { PrintOptionsModal } from "@/components/PrintOptionsModal";
import { ChartsEmptyState } from './ChartsEmptyState';

interface PersistentFormProps {
    onSuccess: (data: ChartResponse, details: BirthDetails) => void;
    ayanamsa: string;
    details?: BirthDetails | null;
}

const PersistentForm: React.FC<PersistentFormProps> = ({ onSuccess, ayanamsa, details: externalDetails }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // State for controlled inputs
    const [details, setDetails] = useState<BirthDetails>({
        date: '1991-04-28',
        time: '13:51',
        location_city: 'Pomona',
        location_state: 'California',
        location_country: 'USA',
        latitude: 34.0553,
        longitude: -117.7514,
        location_timezone: 'America/Los_Angeles',
        ayanamsa_mode: ayanamsa
    });

    // Load from localStorage on mount OR sync with externalDetails
    useEffect(() => {
        if (externalDetails) {
            setDetails(externalDetails);
            return;
        }
        const saved = localStorage.getItem('last_birth_details');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setDetails({ ...parsed, ayanamsa_mode: ayanamsa }); // Keep current global ayanamsa
            } catch (e) {
                console.error("Failed to parse saved details", e);
            }
        }
    }, [externalDetails, ayanamsa]);

    // Save to localStorage whenever details change
    const handleChange = (field: keyof BirthDetails, value: string | number) => {
        const newDetails = { ...details, [field]: value };
        setDetails(newDetails);
        localStorage.setItem('last_birth_details', JSON.stringify(newDetails));
    };

    const handleLocationSelect = (loc: LocationData) => {
        const newDetails = {
            ...details,
            latitude: loc.latitude,
            longitude: loc.longitude,
            location_city: loc.city,
            location_state: loc.region, // LocationData uses 'region'
            location_country: loc.country,
            location_timezone: loc.timezone
        };
        setDetails(newDetails);
        localStorage.setItem('last_birth_details', JSON.stringify(newDetails));
    };

    const handleReset = () => {
        const defaultState = {
            date: '1991-04-28',
            time: '13:51',
            location_city: 'Pomona',
            location_state: 'California',
            location_country: 'USA',
            latitude: 34.0553,
            longitude: -117.7514,
            location_timezone: 'America/Los_Angeles',
            ayanamsa_mode: ayanamsa
        };
        setDetails(defaultState);
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
        <Card className="bg-white border-0 shadow-xl shadow-skyblue-500/5 overflow-hidden ring-1 ring-black/5">
            <CardContent className="p-6 space-y-8">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                        <span className="text-xl">✨</span> Birth Details
                    </h3>
                    <div className="text-sm italic text-neutral-400 bg-neutral-50 px-3 py-1 rounded-full border border-neutral-100">
                        Please enter
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-status-error/10 border border-status-error/30 rounded-lg text-status-error text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                required
                                value={details.date}
                                onChange={(e) => handleChange('date', e.target.value)}
                                placeholder="YYYY-MM-DD"
                                className="w-full bg-neutral-50 hover:bg-white border border-neutral-200 rounded-lg px-2 py-3 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                                Time of Birth
                            </label>
                            <input
                                type="time"
                                required
                                step="1"
                                value={details.time}
                                onChange={(e) => handleChange('time', e.target.value)}
                                placeholder="HH:MM:SS"
                                className="w-full bg-neutral-50 hover:bg-white border border-neutral-200 rounded-lg px-2 py-3 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                            Birth Location
                        </label>
                        {/* Simplified Location Section - No Outer Box */}
                        <div className="flex flex-col gap-3">
                            {details.location_city ? (
                                <div className="flex flex-col gap-2">
                                    <h4 className="text-base font-bold text-neutral-800 leading-snug break-words">
                                        {details.location_city}, {details.location_country}
                                    </h4>
                                    <div className="flex items-center justify-between gap-4">
                                        <LocationSelector
                                            variant="button"
                                            currentLocation={{
                                                city: details.location_city || '',
                                                region: details.location_state,
                                                country: details.location_country || '',
                                                latitude: details.latitude,
                                                longitude: details.longitude,
                                                timezone: details.location_timezone || 'UTC'
                                            }}
                                            onLocationChange={handleLocationSelect}
                                            buttonLabel="Change Location"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <LocationSelector
                                    currentLocation={{
                                        city: details.location_city || '',
                                        region: details.location_state,
                                        country: details.location_country || '',
                                        latitude: details.latitude,
                                        longitude: details.longitude,
                                        timezone: details.location_timezone || 'UTC'
                                    }}
                                    onLocationChange={handleLocationSelect}
                                />
                            )}
                        </div>

                        {/* Separate Lat/Long Inputs */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                                    Latitude
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={details.latitude}
                                    onChange={(e) => handleChange('latitude', parseFloat(e.target.value))}
                                    className="w-full bg-neutral-50 hover:bg-white border border-neutral-200 rounded-lg px-3 py-3 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                                    Longitude
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={details.longitude}
                                    onChange={(e) => handleChange('longitude', parseFloat(e.target.value))}
                                    className="w-full bg-neutral-50 hover:bg-white border border-neutral-200 rounded-lg px-3 py-3 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                            Ayanamsa System
                        </label>
                        <div className="flex flex-col gap-3">
                            <select
                                value={details.ayanamsa_mode || ayanamsa}
                                onChange={(e) => handleChange('ayanamsa_mode', e.target.value)}
                                className="w-full bg-neutral-50 hover:bg-white border border-neutral-200 rounded-lg px-4 py-3 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm font-medium appearance-none"
                            >
                                <option value="LAHIRI">Lahiri (Default)</option>
                                <option value="RAMAN">Raman</option>
                                <option value="KRISHNAMURTI">KP System</option>
                                <option value="FAGAN_BRADLEY">Fagan-Bradley</option>
                                <option value="SAYANA">Tropical (Sayana)</option>
                            </select>

                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-neutral-100">
                        <Button
                            type="submit"
                            disabled={loading}
                            size="lg"
                            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-lg shadow-violet-500/20 h-12 text-sm uppercase tracking-wide transition-all active:scale-[0.98]"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Calculating...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Calculate Chart
                                </span>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleReset}
                            className="text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
                        >
                            Reset
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

interface Props {
    initialData: ChartResponse | null;
    initialDetails: BirthDetails | null;
    activeView?: string;
}

export const Dashboard: React.FC<Props> = ({ initialData, initialDetails, activeView = 'dashboard' }) => {
    const [chartData, setChartData] = useState<ChartResponse | null>(initialData);
    const [currentDetails, setCurrentDetails] = useState<BirthDetails | null>(initialDetails);

    const [ayanamsa, setAyanamsa] = useState<string>(initialDetails?.ayanamsa_mode || 'LAHIRI');

    // Main Tabs State
    const [activeTab, setActiveTab] = useState<'charts' | 'unified-panchang' | 'dashas' | 'transits' | 'mentor'>('mentor');

    // Sub-states for Charts Tab


    const [showLibrary, setShowLibrary] = useState(false);

    // Toast State
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Print State
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [printSections, setPrintSections] = useState<string[]>([]);
    const [isPrintPreview, setIsPrintPreview] = useState(false);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setToastVisible(true);
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey) {
                switch (e.key) {
                    case '1': setActiveTab('mentor'); break;
                    case '2': setActiveTab('unified-panchang'); break;
                    case '3': setActiveTab('charts'); break;
                    case '4': setActiveTab('dashas'); break;
                    case '5': setActiveTab('transits'); break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Sync activeView prop with activeTab state
    useEffect(() => {
        if (activeView === 'panchang') {
            setActiveTab('unified-panchang');
        }
    }, [activeView]);

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



    const handleChartCalculated = (data: ChartResponse, details: BirthDetails) => {
        setCurrentDetails(details);
        setChartData(data);
        fetchInsights(data, details);
        setActiveTab('charts');
    };

    const handleSaveChart = async () => {
        if (!currentDetails) return;

        const name = prompt("Enter a name for this chart:");
        if (!name) return;

        try {
            await saveChart(name, currentDetails);
            showToast(`Chart "${name}" saved to library successfully!`);
        } catch (err) {
            console.error(err);
            showToast('Failed to save chart. Please try again.');
        }
    };

    const handleLoadChart = async (details: BirthDetails) => {
        try {
            setCurrentDetails(details);
            setAyanamsa(details.ayanamsa_mode || 'LAHIRI');

            const data = await calculateChart(details);
            setChartData(data);
            fetchInsights(data, details);
            localStorage.setItem('last_birth_details', JSON.stringify(details));
            setActiveTab('charts');
        } catch (e) {
            console.error(e);
            alert("Failed to load chart calculations.");
        }
    };

    const handleDownloadPDF = () => {
        if (!currentDetails || !chartData) {
            showToast("Please calculate a chart first");
            return;
        }
        setShowPrintModal(true);
    };

    const handlePrintConfirm = (sections: string[]) => {
        setPrintSections(sections);
        setIsPrintPreview(true); // Switch to preview mode
        // Small delay to allow render, then print could be auto-triggered or manual
    };

    const closePrintPreview = () => {
        setIsPrintPreview(false);
        setPrintSections([]);
    };

    return (
        <div className="min-h-screen bg-skyblue-100 text-neutral-500 font-sans">
            {/* Top Header */}
            <header className="flex items-center justify-between p-4 border-b border-skyblue-200/50 bg-skyblue-50/80 backdrop-blur-md sticky top-0 z-50 shadow-sm transition-shadow duration-200">
                <div className="flex items-center gap-3">
                    <Logo size="small" animated={true} withTagline={true} tagline="precision" />
                    {currentDetails && (
                        <div className="hidden md:flex flex-col ml-4 px-3 py-1 bg-white/40 rounded-lg border border-skyblue-200/30">
                            <span className="text-xs text-neutral-400 uppercase tracking-wider">Current Chart</span>
                            <span className="text-sm font-medium text-violet-600">
                                {currentDetails.date} • {currentDetails.time}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowLibrary(true)}
                        className="text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                    >
                        <Library className="w-4 h-4 mr-2" /> Library
                    </Button>
                    {chartData && (
                        <>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleSaveChart}
                                className="border-skyblue-500 text-skyblue-600 hover:bg-skyblue-50"
                            >
                                <Save className="w-4 h-4 mr-2" /> Save
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleDownloadPDF}
                                className="bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
                            >
                                <FileText className="w-4 h-4 mr-2" /> Export PDF
                            </Button>
                        </>
                    )}
                </div>
            </header>
            <div className="h-px bg-white/20 w-full" /> {/* Subtle Header Extender/Divider */}

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 p-6 max-w-[1920px] mx-auto">
                {/* Sidebar */}
                <aside className="space-y-6">


                    <Card className="glass-panel border-border bg-card/50">
                        <CardContent className="p-6">
                            <PersistentForm
                                onSuccess={handleChartCalculated}
                                ayanamsa={ayanamsa}
                                details={currentDetails}
                            />
                        </CardContent>
                    </Card>

                    {/* ControlPanel is now integrated into PersistentForm */}
                </aside>

                {/* Main Content */}
                <main className="space-y-6">


                    <Tabs defaultValue="mentor" value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-5 bg-white border border-skyblue-200/50 p-1 rounded-xl shadow-sm mb-6 h-auto">
                            <TabsTrigger value="mentor" aria-label="Daily Mentor" className="relative data-[state=active]:text-violet-600 data-[state=active]:bg-violet-50/50 rounded-lg transition-all py-2.5">
                                <Sparkles className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Daily Mentor</span>
                                <div className="absolute bottom-0 left-1/4 right-1/4 h-[3px] bg-violet-500 rounded-full scale-x-0 data-[state=active]:scale-x-100 transition-transform origin-center" />
                            </TabsTrigger>
                            <TabsTrigger value="unified-panchang" aria-label="Panchang" className="relative data-[state=active]:text-violet-600 data-[state=active]:bg-violet-50/50 rounded-lg transition-all py-2.5">
                                <Compass className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Panchang</span>
                                <div className="absolute bottom-0 left-1/4 right-1/4 h-[3px] bg-violet-500 rounded-full scale-x-0 data-[state=active]:scale-x-100 transition-transform origin-center" />
                            </TabsTrigger>
                            <TabsTrigger value="charts" aria-label="Birth Charts" className="relative data-[state=active]:text-violet-600 data-[state=active]:bg-violet-50/50 rounded-lg transition-all py-2.5">
                                <Layout className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Birth Charts</span>
                                <div className="absolute bottom-0 left-1/4 right-1/4 h-[3px] bg-violet-500 rounded-full scale-x-0 data-[state=active]:scale-x-100 transition-transform origin-center" />
                            </TabsTrigger>
                            <TabsTrigger value="dashas" aria-label="Dasha Periods" className="relative data-[state=active]:text-skyblue-600 data-[state=active]:bg-skyblue-50/50 rounded-lg transition-all py-2.5">
                                <Layers className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Dashas</span>
                                <div className="absolute bottom-0 left-1/4 right-1/4 h-[3px] bg-skyblue-500 rounded-full scale-x-0 data-[state=active]:scale-x-100 transition-transform origin-center" />
                            </TabsTrigger>
                            <TabsTrigger value="transits" aria-label="Planetary Transits" className="relative data-[state=active]:text-violet-700 data-[state=active]:bg-violet-50/50 rounded-lg transition-all py-2.5">
                                <Orbit className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Transits</span>
                                <div className="absolute bottom-0 left-1/4 right-1/4 h-[3px] bg-violet-600 rounded-full scale-x-0 data-[state=active]:scale-x-100 transition-transform origin-center" />
                            </TabsTrigger>
                        </TabsList>

                        {/* TAB 0: MENTOR */}
                        <TabsContent value="mentor" className="space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {currentDetails ? (
                                <div className="space-y-1">
                                    <DailyMentor birthDetails={currentDetails} />

                                    <div>

                                        <InsightsPanel
                                            prediction={prediction}
                                            dosha={dosha}
                                            coreInsights={coreInsights}
                                            loading={insightsLoading}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="glass-panel p-12 text-center space-y-4">
                                    <div className="text-6xl animate-pulse">✨</div>
                                    <h3 className="text-2xl font-bold text-neutral-500">Your Daily Guide Awaits</h3>
                                    <p className="text-neutral-400 max-w-md mx-auto">
                                        Enter your birth details in the panel on the left to unlock personalized daily energy scores, hora timings, and guidance.
                                    </p>
                                </div>
                            )}
                        </TabsContent>

                        {/* TAB 2: UNIFIED PANCHANG */}
                        <TabsContent value="unified-panchang" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === 'unified-panchang' && (
                                <UnifiedPanchanga birthDetails={currentDetails} />
                            )}
                        </TabsContent>

                        {/* TAB 1: CHARTS */}
                        <TabsContent value="charts" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-6">
                                {chartData && (
                                    <div className="flex justify-between items-center bg-white/40 p-2 rounded-xl border border-skyblue-100 backdrop-blur-sm">
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={handleDownloadPDF} className="bg-status-warning/10 hover:bg-status-warning/20 text-status-warning border border-status-warning/30">
                                                <FileText className="w-4 h-4 mr-2" /> Export PDF
                                            </Button>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 text-primary hover:bg-white/20"
                                            onClick={() => setShowLibrary(true)}
                                        >
                                            <Library className="w-4 h-4" />
                                            Chart Library
                                        </Button>
                                    </div>
                                )}

                                {chartData && currentDetails ? (
                                    <ChartsTab chartData={chartData} birthDetails={currentDetails} />
                                ) : (
                                    <ChartsEmptyState />
                                )}
                            </div>
                        </TabsContent>



                        {/* TAB 3: DASHAS */}
                        <TabsContent value="dashas" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === 'dashas' && (
                                <div className="space-y-6">
                                    {chartData && currentDetails ? (
                                        <DashaTab
                                            dashas={chartData.dashas}
                                            strengths={chartData.strengths}
                                            birthDate={currentDetails.date}
                                        />
                                    ) : (
                                        <div className="p-10 text-center text-neutral-400 bg-white/50 border-2 border-dashed border-skyblue-100 rounded-3xl min-h-[300px] flex flex-col items-center justify-center">
                                            <Layers className="w-12 h-12 mb-4 opacity-20" />
                                            <p className="font-medium">Calculate chart to view dynamic dasha periods</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </TabsContent>

                        {/* TAB 4: TRANSITS */}
                        <TabsContent value="transits" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === 'transits' && (
                                <Card className="glass-panel p-6 bg-card/40">
                                    <CardContent>
                                        <TransitsTab />
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* TAB 5: DAILY PANCHANGA */}
                        <TabsContent value="daily-panchanga" className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                        </TabsContent>


                    </Tabs>
                </main>
            </div>

            {/* Library Modal */}
            {
                showLibrary && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-500/40 backdrop-blur-sm p-4 print:hidden">
                        <div className="w-full max-w-2xl bg-white border border-skyblue-200/50 rounded-xl shadow-[0_10px_40px_rgba(91,163,208,0.15)] relative overflow-hidden">

                            <ChartLibrary
                                onLoad={(details) => {
                                    setShowLibrary(false);
                                    handleLoadChart(details);
                                }}
                                onClose={() => setShowLibrary(false)}
                            />
                        </div>
                    </div>
                )
            }

            <PrintOptionsModal
                isOpen={showPrintModal}
                onClose={() => setShowPrintModal(false)}
                onPrint={handlePrintConfirm}
            />

            {/* Print Preview Overlay - Renders selected sections linearly */}
            {isPrintPreview && (
                <div className="fixed inset-0 z-[200] bg-white overflow-auto print:static key-print-view">
                    {/* Print Preview Header (Screen Only) */}
                    <div className="sticky top-0 p-4 bg-white/90 backdrop-blur border-b border-border flex justify-between items-center no-print z-50 shadow-sm">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-violet-700">Print Preview</h2>
                            <span className="text-sm text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                                {printSections.length} sections selected
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={closePrintPreview}>Back to Dashboard</Button>
                            <Button onClick={() => window.print()} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
                                <FileText className="w-4 h-4" /> Print / Save as PDF
                            </Button>
                        </div>
                    </div>

                    {/* Actual Printable Content */}
                    <div className="max-w-4xl mx-auto p-8 space-y-8 bg-white min-h-screen">

                        {/* Report Header */}
                        <div className="text-center border-b-2 border-violet-500 pb-6 mb-8">
                            <h1 className="text-4xl font-bold text-violet-800 mb-2">Vedic Astrology Report</h1>
                            <div className="text-lg text-neutral-600">
                                Prepared for <span className="font-bold text-black">{currentDetails?.location_city || 'User'}</span>
                            </div>
                            <div className="text-sm text-neutral-400 mt-2">
                                {currentDetails?.date} at {currentDetails?.time} • {currentDetails?.location_city || 'Unknown Location'}
                            </div>
                        </div>

                        {/* Sections */}
                        {printSections.includes('charts') && chartData && (
                            <section className="space-y-4 break-inside-avoid">
                                <h2 className="text-2xl font-bold text-neutral-700 border-l-4 border-violet-400 pl-3">Birth Charts</h2>
                                <div className="grid grid-cols-2 gap-8 print-grid">
                                    <div className="space-y-2">
                                        <h3 className="text-center font-bold text-neutral-500">South Indian</h3>
                                        <div className="border border-neutral-200 rounded-lg p-2">
                                            <SouthIndianChartParchment planets={chartData.planets} ascendantSign={chartData.ascendant_sign} birthDetails={{ name: currentDetails!.location_city || 'Chart', date: currentDetails!.date, time: currentDetails!.time, location: currentDetails!.location_city || '' }} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-center font-bold text-neutral-500">North Indian</h3>
                                        <div className="border border-neutral-200 rounded-lg p-2 aspect-square flex items-center bg-white">
                                            <NorthIndianChartParchment planets={chartData.planets} houses={chartData.houses} birthDetails={{ name: currentDetails!.location_city || 'Chart', date: currentDetails!.date, time: currentDetails!.time, location: currentDetails!.location_city || '' }} />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {printSections.includes('planetary') && chartData && currentDetails && (
                            <section className="space-y-4 break-inside-avoid">
                                <h2 className="text-2xl font-bold text-neutral-700 border-l-4 border-violet-400 pl-3">Planetary Details</h2>
                                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                                    <PlanetPositionsTable
                                        planets={chartData.planets}
                                        ascendant={{ sign: chartData.ascendant_sign, degree: chartData.ascendant }}
                                    />
                                </div>
                            </section>
                        )}

                        {printSections.includes('panchanga') && currentDetails && (
                            <section className="space-y-4 break-inside-avoid">
                                <h2 className="text-2xl font-bold text-neutral-700 border-l-4 border-violet-400 pl-3">Unified Panchang</h2>
                                <UnifiedPanchanga birthDetails={currentDetails} />
                            </section>
                        )}

                        {printSections.includes('dashas') && chartData && currentDetails && (
                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-neutral-700 border-l-4 border-violet-400 pl-3">Vimshottari Dasha Periods</h2>
                                <DashaTab dashas={chartData.dashas} strengths={chartData.strengths} birthDate={currentDetails.date} />
                            </section>
                        )}

                        {printSections.includes('mentor') && currentDetails && (
                            <section className="space-y-4 break-inside-avoid">
                                <h2 className="text-2xl font-bold text-neutral-700 border-l-4 border-violet-400 pl-3">Daily Guidance</h2>
                                <DailyMentor birthDetails={currentDetails} />
                            </section>
                        )}

                    </div>
                </div>
            )}

            {/* Simple Toast Notification */}
            <SimpleToast
                message={toastMessage}
                isVisible={toastVisible}
                onClose={() => setToastVisible(false)}
            />
        </div >
    );
};
