import React, { useState, useEffect } from 'react';
import type { ChartResponse, BirthDetails, CoreInsights } from '../api/client';
import { calculateChart, getDailyInsight, getDoshaReport, generateCoreInsights, saveChart } from '../api/client';
import { ControlPanel } from './ControlPanel';
import { SouthIndianChart } from './SouthIndianChart';
import { NorthIndianChart } from './NorthIndianChart';
import { PlanetaryTable } from './PlanetaryTable';
import { DashaTab } from './DashaTab';
import { DivisionalChartsTab } from './DivisionalChartsTab';
import { ChartLibrary } from './ChartLibrary';
import { generatePDF } from '../utils/pdfGenerator';
import { BirthParticulars } from './BirthParticulars';
import { PanchangaPanel } from './PanchangaPanel';
import { TransitsTab } from './TransitsTab';
import { InsightsPanel } from './InsightsPanel';

// Shadcn UI Imports
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Calendar, BookOpen, User, Save, FileText, Library } from "lucide-react"
import { Button } from "@/components/ui/button"

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
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-cosmic-starlight flex items-center gap-2">
                <span className="text-xl">✨</span> Birth Details
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
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
                        className="w-full bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-cosmic-nebula"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</label>
                    <input
                        type="time"
                        required
                        value={details.time}
                        onChange={(e) => handleChange('time', e.target.value)}
                        className="w-full bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-cosmic-nebula"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Lat</label>
                        <input
                            type="number"
                            step="any"
                            placeholder="37.77"
                            required
                            value={details.latitude || ''}
                            onChange={(e) => handleChange('latitude', parseFloat(e.target.value))}
                            className="w-full bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-cosmic-nebula"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Long</label>
                        <input
                            type="number"
                            step="any"
                            placeholder="-122.41"
                            required
                            value={details.longitude || ''}
                            onChange={(e) => handleChange('longitude', parseFloat(e.target.value))}
                            className="w-full bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-cosmic-nebula"
                        />
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-cosmic-nebula hover:bg-purple-700 text-white font-bold"
                    >
                        {loading ? 'Calculating...' : 'Calculate Chart'}
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleReset}
                        className="bg-white/10 hover:bg-white/20 text-white"
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
    chartData: ChartResponse | null;
    onCalculate: (data: ChartResponse, details: BirthDetails) => void;
}

export const Dashboard: React.FC<Props> = ({ chartData, onCalculate }) => {
    const [currentDetails, setCurrentDetails] = useState<BirthDetails | null>(null);
    const [chartStyle, setChartStyle] = useState<'south' | 'north'>('south');
    const [ayanamsa, setAyanamsa] = useState<string>('LAHIRI');

    // Main Tabs State
    const [activeTab, setActiveTab] = useState<'charts' | 'panchanga' | 'dashas' | 'transits' | 'mentor'>('charts');

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
        <div className="min-h-screen bg-background dark:bg-[url('/images/backgrounds/stars-bg.png')] dark:bg-cover dark:bg-fixed text-foreground font-sans">
            {/* Top Header */}
            <header className="flex items-center justify-between p-4 border-b border-border bg-background/80 dark:bg-cosmic-void/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cosmic-nebula to-cosmic-starlight flex items-center justify-center shadow-glow">
                        <span className="text-white font-bold text-lg">8</span>
                    </div>
                    <span className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-muted-foreground">
                        8STRO
                    </span>
                    {currentDetails && (
                        <div className="hidden md:flex flex-col ml-4 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Current Chart</span>
                            <span className="text-sm font-medium text-cosmic-starlight">
                                {currentDetails.date} • {currentDetails.time}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowLibrary(true)} className="bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10">
                        <Library className="w-4 h-4 mr-2" /> Library
                    </Button>
                    {chartData && (
                        <>
                            <Button size="sm" onClick={handleSaveChart} className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30">
                                <Save className="w-4 h-4 mr-2" /> Save
                            </Button>
                            <Button size="sm" onClick={handleDownloadPDF} className="bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-600/30">
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
                    <Card className="glass-panel border-border bg-card/50">
                        <CardContent className="p-6">
                            <PersistentForm onSuccess={handleChartCalculated} ayanamsa={ayanamsa} />
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
                    <Tabs defaultValue="charts" className="w-full" onValueChange={(val) => setActiveTab(val as any)}>
                        <TabsList className="grid w-full grid-cols-5 bg-muted border border-border h-12 p-1 mb-6">
                            <TabsTrigger value="charts" className="data-[state=active]:bg-cosmic-nebula data-[state=active]:text-white">
                                <Sparkles className="w-4 h-4 mr-2" /> Charts
                            </TabsTrigger>
                            <TabsTrigger value="panchanga" className="data-[state=active]:bg-cosmic-nebula data-[state=active]:text-white">
                                <Calendar className="w-4 h-4 mr-2" /> Panchanga
                            </TabsTrigger>
                            <TabsTrigger value="dashas" className="data-[state=active]:bg-cosmic-nebula data-[state=active]:text-white">
                                <BookOpen className="w-4 h-4 mr-2" /> Dashas
                            </TabsTrigger>
                            <TabsTrigger value="transits" className="data-[state=active]:bg-cosmic-nebula data-[state=active]:text-white">
                                <Sparkles className="w-4 h-4 mr-2" /> Transits
                            </TabsTrigger>
                            <TabsTrigger value="mentor" className="data-[state=active]:bg-cosmic-nebula data-[state=active]:text-white">
                                <User className="w-4 h-4 mr-2" /> AI Mentor
                            </TabsTrigger>
                        </TabsList>

                        {/* TAB 1: CHARTS */}
                        <TabsContent value="charts" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === 'charts' && (
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
                                                    className={chartStyle === 'south' ? 'bg-cosmic-nebula text-white' : 'text-muted-foreground'}
                                                >
                                                    South Indian
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setChartStyle('north')}
                                                    className={chartStyle === 'north' ? 'bg-cosmic-nebula text-white' : 'text-muted-foreground'}
                                                >
                                                    North Indian
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDivisionalMode(!divisionalMode)}
                                                    className={`ml-auto ${divisionalMode ? 'bg-cosmic-starlight text-black' : 'text-muted-foreground'}`}
                                                >
                                                    {divisionalMode ? 'Show Rashi' : 'Show Vargas'}
                                                </Button>
                                            </div>

                                            <Card className="glass-panel overflow-hidden border-border bg-card/40 p-4 aspect-square flex items-center justify-center relative">
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

                        {/* TAB 2: PANCHANGA */}
                        <TabsContent value="panchanga" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === 'panchanga' && (
                                <Card className="glass-panel border-white/10 bg-black/40">
                                    {chartData?.panchanga && currentDetails ? (
                                        <PanchangaPanel
                                            data={chartData.panchanga}
                                            dashas={chartData.dashas}
                                            birthDate={currentDetails.date}
                                        />
                                    ) : (
                                        <div className="p-10 text-center text-muted-foreground">Calculate chart first</div>
                                    )}
                                </Card>
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

                        {/* TAB 5: MENTOR */}
                        <TabsContent value="mentor" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === 'mentor' && (
                                <InsightsPanel
                                    prediction={prediction}
                                    dosha={dosha}
                                    coreInsights={coreInsights}
                                    loading={insightsLoading}
                                />
                            )}
                        </TabsContent>
                    </Tabs>
                </main>
            </div>

            {/* Library Modal */}
            {showLibrary && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl bg-card border border-white/10 rounded-xl shadow-2xl relative overflow-hidden">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowLibrary(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            ✕
                        </Button>
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
