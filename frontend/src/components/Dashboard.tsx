import React, { useState, useEffect } from 'react';
import type { ChartResponse, BirthDetails, CoreInsights } from '../api/client';
import { calculateChart, getDailyInsight, getDoshaReport, generateCoreInsights, saveChart } from '../api/client';
import { Logo } from './Logo';
import { ControlPanel } from './ControlPanel';
import { SouthIndianChart } from './SouthIndianChart';
import { NorthIndianChart } from './NorthIndianChart';
import { PlanetaryTable } from './PlanetaryTable';
import { DashaTab } from './DashaTab';
import { DivisionalChartsTab } from './DivisionalChartsTab';
import { ChartLibrary } from './ChartLibrary';
import { generatePDF } from '../utils/pdfGenerator';
import { BirthParticulars } from './BirthParticulars';
import { TransitsTab } from './TransitsTab';
import { InsightsPanel } from './InsightsPanel';
import { LocationSelector } from './LocationSelector';
import type { LocationData } from '../api/client';

import { DailyMentor } from './DailyMentor';
import { UnifiedPanchanga } from './UnifiedPanchanga';
import { MapPin } from 'lucide-react';

// Shadcn UI Imports
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, BookOpen, User, Save, FileText, Library } from "lucide-react"
import { Button } from "@/components/ui/button"

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
        date: '',
        time: '',
        latitude: 0,
        longitude: 0,
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
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-violet-600 flex items-center gap-2">
                <span className="text-xl">✨</span> Birth Details
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-status-error/10 border border-status-error/30 rounded-lg text-status-error text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</label>
                    <input
                        type="date"
                        required
                        value={details.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                        className="w-full bg-white border border-skyblue-200 rounded-md px-3 py-2 text-neutral-500 focus:outline-none focus:ring-2 focus:ring-skyblue-400/30"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</label>
                    <input
                        type="time"
                        required
                        value={details.time}
                        onChange={(e) => handleChange('time', e.target.value)}
                        className="w-full bg-white border border-skyblue-200 rounded-md px-3 py-2 text-neutral-500 focus:outline-none focus:ring-2 focus:ring-skyblue-400/30"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</label>
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
                    <div className="flex gap-2 text-[10px] text-muted-foreground font-mono pt-1 px-1">
                        <span>Lat: {details.latitude?.toFixed(4)}</span>
                        <span>Long: {details.longitude?.toFixed(4)}</span>
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-skyblue-500 hover:bg-skyblue-600 text-white font-bold shadow-md shadow-skyblue-500/20"
                    >
                        {loading ? 'Calculating...' : 'Calculate Chart'}
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleReset}
                        className="bg-skyblue-50 hover:bg-skyblue-100 text-skyblue-600 border border-skyblue-200"
                        title="Reset Form"
                    >
                        ↺
                    </Button>
                </div>
            </form>
        </div>
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
    const [chartStyle, setChartStyle] = useState<'south' | 'north'>('south');
    const [ayanamsa, setAyanamsa] = useState<string>(initialDetails?.ayanamsa_mode || 'LAHIRI');

    // Main Tabs State
    const [activeTab, setActiveTab] = useState<'charts' | 'unified-panchang' | 'dashas' | 'transits' | 'mentor'>('mentor');

    // Sync activeView prop with activeTab state
    useEffect(() => {
        if (activeView === 'panchang') {
            setActiveTab('unified-panchang');
        }
    }, [activeView]);

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
                setChartData(data);
                fetchInsights(data, newDetails);
            } catch (e) {
                console.error("Recalculation failed", e);
            }
        }
    };

    const handleChartCalculated = (data: ChartResponse, details: BirthDetails) => {
        setCurrentDetails(details);
        setChartData(data);
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
            setChartData(data);
            fetchInsights(data, details);
            localStorage.setItem('last_birth_details', JSON.stringify(details));
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
        <div className="min-h-screen bg-skyblue-100 text-neutral-500 font-sans">
            {/* Top Header */}
            <header className="flex items-center justify-between p-4 border-b border-skyblue-200/50 bg-skyblue-100/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <Logo size="small" animated={true} />
                    {currentDetails && (
                        <div className="hidden md:flex flex-col ml-4 px-3 py-1 bg-white/40 rounded-lg border border-skyblue-200/30">
                            <span className="text-xs text-neutral-400 uppercase tracking-wider">Current Chart</span>
                            <span className="text-sm font-medium text-violet-500">
                                {currentDetails.date} • {currentDetails.time}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button size="sm" onClick={() => setShowLibrary(true)} className="bg-violet-100 hover:bg-violet-200 text-violet-600 border border-violet-200">
                        <Library className="w-4 h-4 mr-2" /> Library
                    </Button>
                    {chartData && (
                        <>
                            <Button size="sm" onClick={handleSaveChart} className="bg-status-success/10 hover:bg-status-success/20 text-status-success border border-status-success/30">
                                <Save className="w-4 h-4 mr-2" /> Save
                            </Button>
                            <Button size="sm" onClick={handleDownloadPDF} className="bg-status-warning/10 hover:bg-status-warning/20 text-status-warning border border-status-warning/30">
                                <FileText className="w-4 h-4 mr-2" /> PDF
                            </Button>
                        </>
                    )}
                </div>
            </header>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 p-6 max-w-[1920px] mx-auto">
                {/* Sidebar */}
                <aside className="space-y-6">
                    {/* Navigation Card */}
                    <Card className="glass-panel border-border bg-card/50">
                        <CardContent className="p-4 space-y-2">
                            <Button
                                variant={activeTab === 'mentor' ? 'secondary' : 'ghost'}
                                className="w-full justify-start text-sky-700 hover:text-sky-800 hover:bg-sky-50"
                                onClick={() => setActiveTab('mentor')}
                            >
                                <Sparkles className="w-4 h-4 mr-2" /> Daily Mentor
                            </Button>
                            <Button
                                variant={activeTab === 'unified-panchang' ? 'secondary' : 'ghost'}
                                className="w-full justify-start text-violet-700 hover:text-violet-800 hover:bg-violet-50"
                                onClick={() => setActiveTab('unified-panchang')}
                            >
                                <MapPin className="w-4 h-4 mr-2" /> Panchang
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="glass-panel border-border bg-card/50">
                        <CardContent className="p-6">
                            <PersistentForm
                                onSuccess={handleChartCalculated}
                                ayanamsa={ayanamsa}
                                details={currentDetails}
                            />
                        </CardContent>
                    </Card>

                    <Card className="glass-panel border-border bg-card/50">
                        <CardContent className="p-6">
                            <ControlPanel
                                ayanamsa={ayanamsa}
                                onAyanamsaChange={handleAyanamsaChange}
                            />

                        </CardContent>
                    </Card>
                </aside>

                {/* Main Content */}
                <main className="space-y-6">


                    {/* Tabs Navigation */}
                    <Tabs defaultValue="mentor" value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-7 bg-white border border-skyblue-200/50 p-1 rounded-xl shadow-sm">
                            <TabsTrigger value="mentor" className="data-[state=active]:bg-violet-500 data-[state=active]:text-white rounded-lg transition-all hidden md:flex">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Mentor
                            </TabsTrigger>
                            <TabsTrigger value="unified-panchang" className="data-[state=active]:bg-violet-500 data-[state=active]:text-white rounded-lg transition-all">
                                <MapPin className="w-4 h-4 mr-2" />
                                Panchang
                            </TabsTrigger>
                            <TabsTrigger value="charts" className="data-[state=active]:bg-violet-400 data-[state=active]:text-white rounded-lg transition-all">
                                <User className="w-4 h-4 mr-2" /> Charts
                            </TabsTrigger>
                            <TabsTrigger value="dashas" className="data-[state=active]:bg-skyblue-400 data-[state=active]:text-white rounded-lg transition-all">
                                <BookOpen className="w-4 h-4 mr-2" /> Dashas
                            </TabsTrigger>
                            <TabsTrigger value="transits" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg transition-all">
                                <div className="w-4 h-4 mr-2">🪐</div>
                                Transits
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
                            {(
                                <div className="space-y-6">
                                    {currentDetails && <BirthParticulars details={currentDetails} />}

                                    <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
                                        {/* Chart Visualization */}
                                        <div className="space-y-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setChartStyle('south')}
                                                    className={chartStyle === 'south' ? 'bg-skyblue-500 text-white' : 'text-neutral-400 hover:bg-skyblue-50'}
                                                >
                                                    South Indian
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setChartStyle('north')}
                                                    className={chartStyle === 'north' ? 'bg-skyblue-500 text-white' : 'text-neutral-400 hover:bg-skyblue-50'}
                                                >
                                                    North Indian
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDivisionalMode(!divisionalMode)}
                                                    className={`ml-auto ${divisionalMode ? 'bg-violet-500 text-white' : 'text-neutral-400 hover:bg-violet-50'}`}
                                                >
                                                    {divisionalMode ? 'Show Rashi' : 'Show Vargas'}
                                                </Button>
                                            </div>

                                            <Card className={`glass-panel border-border bg-card/40 p-4 relative ${divisionalMode ? 'flex flex-col h-auto min-h-[500px]' : 'aspect-square flex items-center justify-center overflow-hidden'}`}>
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
                                                    <div className="text-center text-muted-foreground p-10">
                                                        <div className="text-4xl mb-4 opacity-50">🌌</div>
                                                        <p>Enter birth details to generate chart</p>
                                                    </div>
                                                )}
                                            </Card>
                                        </div>

                                        {/* Planetary Table */}
                                        <Card className="glass-panel h-full bg-card/40">
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
                                                <div className="flex items-center justify-center h-full text-muted-foreground p-10">
                                                    Planetary details waiting...
                                                </div>
                                            )}
                                        </Card>
                                    </div>
                                </div>
                            )}
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
                                        <div className="p-10 text-center text-muted-foreground glass-panel rounded-xl">Calculate chart first</div>
                                    )}
                                </div>
                            )}
                        </TabsContent>

                        {/* TAB 4: TRANSITS */}
                        <TabsContent value="transits" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === 'transits' && (
                                <Card className="glass-panel p-6 bg-card/40">
                                    <TransitsTab />
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
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-500/40 backdrop-blur-sm p-4">
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
        </div >
    );
};
