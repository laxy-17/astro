import React, { useState, useEffect } from 'react';
import {
    fetchDailyPanchanga,
    getDailyMentor
} from '../api/client';
import type {
    DailyPanchangaResponse,
    DailyMentorResponse,
    BirthDetails,
    LocationData,
    AuspiciousTimings,
    SpecialTime
} from '../api/client';
import { getUserLocation, saveUserLocation, detectLocationFromIP } from '../utils/locationDetection';
import { LocationSelector } from './LocationSelector';
import { PanchangaCard } from './PanchangaCard';
import { Loader2, Calendar, Sun, Moon, Sparkles, AlertTriangle, Clock } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getTerm } from '../data/glossary';
import { HelpCircle } from "lucide-react";
import '../styles/daily-panchanga.css';

interface Props {
    birthDetails: BirthDetails | null;
}

const normalizeGenericTimings = (timings: AuspiciousTimings): SpecialTime[] => {
    const list: SpecialTime[] = [];
    if (timings.abhijit_muhurta) list.push({ name: 'Abhijit Muhurta', start_time: timings.abhijit_muhurta.start, end_time: timings.abhijit_muhurta.end, quality: 'Auspicious', description: 'Best time for any venture' });
    if (timings.brahma_muhurta) list.push({ name: 'Brahma Muhurta', start_time: timings.brahma_muhurta.start, end_time: timings.brahma_muhurta.end, quality: 'Auspicious', description: 'Best time for meditation' });
    if (timings.rahu_kaal) list.push({ name: 'Rahu Kaal', start_time: timings.rahu_kaal.start, end_time: timings.rahu_kaal.end, quality: 'Inauspicious', description: 'Avoid new beginnings' });
    if (timings.yamaganda_kaal) list.push({ name: 'Yamaganda', start_time: timings.yamaganda_kaal.start, end_time: timings.yamaganda_kaal.end, quality: 'Inauspicious', description: 'Inauspicious time' });
    if (timings.gulika_kaal) list.push({ name: 'Gulika', start_time: timings.gulika_kaal.start, end_time: timings.gulika_kaal.end, quality: 'Neutral/Mixed', description: 'Time of Saturn' });
    return list;
};

export const UnifiedPanchanga: React.FC<Props> = ({ birthDetails }) => {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [genericData, setGenericData] = useState<DailyPanchangaResponse | null>(null);
    const [personalizedData, setPersonalizedData] = useState<DailyMentorResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize location
    useEffect(() => {
        async function init() {
            // Priority: Birth Details Location -> Saved Location -> IP Detect
            if (birthDetails && birthDetails.latitude && birthDetails.longitude) {
                setLocation({
                    city: birthDetails.location_city || 'Custom Location',
                    region: birthDetails.location_state || '',
                    country: birthDetails.location_country || '',
                    latitude: birthDetails.latitude,
                    longitude: birthDetails.longitude,
                    timezone: birthDetails.location_timezone || 'UTC'
                });
            } else {
                const stored = getUserLocation();
                if (stored) {
                    setLocation(stored);
                } else {
                    const detected = await detectLocationFromIP();
                    setLocation(detected);
                    saveUserLocation(detected);
                }
            }
        }
        init();
    }, [birthDetails]);

    // Fetch Data
    useEffect(() => {
        if (!location) return;

        async function loadData() {
            setLoading(true);
            setError(null);
            try {
                // 1. Fetch Generic Panchang (Always valid for location)
                const genericRes = await fetchDailyPanchanga({
                    latitude: location!.latitude,
                    longitude: location!.longitude,
                    city: location!.city
                });
                setGenericData(genericRes);

                // 2. Fetch Personalized Data (If birth details exist)
                if (birthDetails && birthDetails.date) {
                    const today = new Date().toISOString().split('T')[0];
                    const personRes = await getDailyMentor(birthDetails, today);
                    setPersonalizedData(personRes);
                } else {
                    setPersonalizedData(null);
                }

            } catch (err: any) {
                console.error('Failed to fetch Panchanga:', err);
                setError('Failed to load data. Please check your connection.');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [location, birthDetails]);

    const handleLocationChange = (newLoc: LocationData) => {
        setLocation(newLoc);
        saveUserLocation(newLoc);
    };

    if (!location && loading) return <LoadingState />;
    if (error) return <ErrorState message={error} />;

    // Determine which data to use for Timings
    const displayTimings: SpecialTime[] = personalizedData?.special_times ||
        (genericData?.auspicious_timings ? normalizeGenericTimings(genericData.auspicious_timings) : []);

    const displayHora = personalizedData?.hora_timeline || [];

    return (
        <div className="daily-panchanga-dashboard p-6 min-h-screen space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <header className="panchanga-header bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-skyblue-100 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                    <div className="flex items-center gap-4">
                        {location && (
                            <LocationSelector
                                currentLocation={location}
                                onLocationChange={handleLocationChange}
                            />
                        )}
                        {birthDetails && (
                            <Badge variant="outline" className="bg-violet-50 text-violet-600 border-violet-200">
                                <Sparkles className="w-3 h-3 mr-1" /> Personalized
                            </Badge>
                        )}
                    </div>

                    {genericData && (
                        <div className="flex items-center gap-6 text-sm font-medium text-neutral-600">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-skyblue-500" />
                                <span>{genericData.date.day_of_week}, {new Date(genericData.date.gregorian).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-4 pl-6 border-l border-neutral-200">
                                <span className="flex items-center gap-1"><Sun className="w-4 h-4 text-amber-500" /> {genericData.date.sunrise}</span>
                                <span className="flex items-center gap-1"><Moon className="w-4 h-4 text-slate-400" /> {genericData.date.sunset}</span>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-500 mb-4" />
                    <p className="text-slate-500">Aligning with the cosmos...</p>
                </div>
            ) : genericData && (
                <>
                    {/* Hindu Calendar Banner */}
                    <div className="hindu-calendar-banner bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-center md:text-left">
                            <div className="space-y-2">
                                <h3 className="text-violet-200 text-xs uppercase tracking-[0.2em] font-black mb-1 opacity-80">Hindu Vedic Calendar</h3>
                                <div className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-sm">
                                    {genericData.hindu_calendar.month} <span className="text-violet-300 font-light mx-2">|</span> {genericData.hindu_calendar.paksha} Paksha
                                </div>
                            </div>
                            <div className="flex flex-col items-center md:items-end">
                                <div className="text-lg font-bold text-violet-100 mb-1">{genericData.hindu_calendar.samvat}</div>
                                <div className="text-5xl font-black text-white px-4 py-2 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
                                    {genericData.hindu_calendar.year}
                                </div>
                            </div>
                        </div>
                        <div className="absolute -top-12 -right-12 p-8 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000">
                            <Sun className="w-64 h-64 animate-spin-slow" />
                        </div>
                        <div className="absolute -bottom-8 -left-8 p-8 opacity-5">
                            <Moon className="w-48 h-48" />
                        </div>
                    </div>

                    {/* Panchanga Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <PanchangaCard
                            title="Tithi"
                            icon="🌙"
                            value={genericData.panchanga.tithi.name}
                            subValue={`${genericData.panchanga.tithi.paksha} Paksha`}
                            completion={genericData.panchanga.tithi.completion}
                            endTime={genericData.panchanga.tithi.end_time}
                        />
                        <PanchangaCard
                            title="Nakshatra"
                            icon="✨"
                            value={genericData.panchanga.nakshatra.name}
                            subValue={`Pada ${genericData.panchanga.nakshatra.pada}`}
                            completion={genericData.panchanga.nakshatra.completion}
                            endTime={genericData.panchanga.nakshatra.end_time}
                        />
                        <PanchangaCard
                            title="Yoga"
                            icon="⚖️"
                            value={genericData.panchanga.yoga.name}
                            endTime={genericData.panchanga.yoga.end_time}
                        />
                        <PanchangaCard
                            title="Karana"
                            icon="🌊"
                            value={genericData.panchanga.karana.name}
                            endTime={genericData.panchanga.karana.end_time}
                        />
                    </div>

                    {/* Timings Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Column 1 & 2: Auspicious/Inauspicious Grid */}
                        <div className="lg:col-span-2 space-y-6">
                            <h3 className="text-lg font-bold text-neutral-600 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-violet-500" /> Special Timings
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Auspicious */}
                                <div className="border border-green-500/20 rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col">
                                    <div className="bg-green-500 px-5 py-4 flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <Sparkles className="w-5 h-5 text-white" />
                                        </div>
                                        <h4 className="font-black text-white uppercase tracking-wider text-sm">Auspicious Periods</h4>
                                    </div>
                                    <div className="p-5 space-y-4 flex-grow">
                                        {displayTimings.filter(t => t.quality === 'Auspicious').map((st, idx) => (
                                            <div key={idx} className="group relative">
                                                <div className="flex flex-col sm:flex-row justify-between items-start gap-1 mb-2">
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="text-sm font-bold text-neutral-800 leading-tight">{st.name}</div>
                                                            {getTerm(st.name) && (
                                                                <TooltipProvider delayDuration={200}>
                                                                    <Tooltip>
                                                                        <TooltipTrigger>
                                                                            <HelpCircle className="w-3 h-3 text-neutral-400 hover:text-green-600 transition-colors" />
                                                                        </TooltipTrigger>
                                                                        <TooltipContent className="max-w-xs bg-violet-900 text-white border-violet-700">
                                                                            <p className="text-xs leading-relaxed">{getTerm(st.name)?.definition}</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-neutral-400 font-medium leading-normal">{st.description}</p>
                                                    </div>
                                                    <div className="sm:text-right shrink-0">
                                                        <div className="text-sm font-black text-green-600 font-mono tracking-tighter">{st.start_time} - {st.end_time}</div>
                                                    </div>
                                                </div>
                                                <div className="h-1.5 w-full bg-green-50 rounded-full overflow-hidden border border-green-100/50">
                                                    <div className="h-full bg-green-500/30 w-full animate-pulse-slow" />
                                                </div>
                                            </div>
                                        ))}
                                        {displayTimings.filter(t => t.quality === 'Auspicious').length === 0 && (
                                            <p className="text-sm text-neutral-400 text-center py-4 italic">No specific auspicious timings today.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Inauspicious */}
                                <div className="border border-red-500/20 rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col">
                                    <div className="bg-red-500 px-5 py-4 flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <AlertTriangle className="w-5 h-5 text-white" />
                                        </div>
                                        <h4 className="font-black text-white uppercase tracking-wider text-sm">Inauspicious Periods</h4>
                                    </div>
                                    <div className="p-5 space-y-4 flex-grow">
                                        {displayTimings.filter(t => ['Inauspicious', 'Neutral/Mixed', 'Bad'].includes(t.quality)).map((st, idx) => (
                                            <div key={idx} className="group relative">
                                                <div className="flex flex-col sm:flex-row justify-between items-start gap-1 mb-2">
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="text-sm font-bold text-neutral-800 leading-tight">{st.name}</div>
                                                            {getTerm(st.name) && (
                                                                <TooltipProvider delayDuration={200}>
                                                                    <Tooltip>
                                                                        <TooltipTrigger>
                                                                            <HelpCircle className="w-3 h-3 text-neutral-400 hover:text-red-500 transition-colors" />
                                                                        </TooltipTrigger>
                                                                        <TooltipContent className="max-w-xs bg-violet-900 text-white border-violet-700">
                                                                            <p className="text-xs leading-relaxed">{getTerm(st.name)?.definition}</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-neutral-400 font-medium leading-normal">{st.description}</p>
                                                    </div>
                                                    <div className="sm:text-right shrink-0">
                                                        <div className="text-sm font-black text-red-600 font-mono tracking-tighter">{st.start_time} - {st.end_time}</div>
                                                    </div>
                                                </div>
                                                <div className="h-1.5 w-full bg-red-50 rounded-full overflow-hidden border border-red-100/50">
                                                    <div className="h-full bg-red-500/30 w-full" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Column 3: Hora Table */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-neutral-600 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-skyblue-500" /> Hora Timeline
                            </h3>
                            <Card className="bg-white border-skyblue-200/50 overflow-hidden shadow-sm h-[400px]">
                                <div className="h-full overflow-auto scrollbar-thin scrollbar-thumb-skyblue-200">
                                    <Table>
                                        <TableHeader className="bg-skyblue-50 sticky top-0 backdrop-blur-sm z-10">
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableHead className="w-[80px] text-xs font-bold text-neutral-500">Hora</TableHead>
                                                <TableHead className="text-xs font-bold text-neutral-500">Time</TableHead>
                                                <TableHead className="text-xs font-bold text-neutral-500 text-right">Q</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {displayHora.length > 0 ? displayHora.map((h, i) => {
                                                const quality = (h.quality || 'Unknown');
                                                const qLower = quality.toLowerCase();
                                                const isGood = qLower.includes('good') || qLower.includes('auspicious') || qLower.includes('excellent');
                                                const isAvg = qLower.includes('average') || qLower.includes('neutral') || qLower.includes('mixed');

                                                // Check for active Hora
                                                const now = new Date();
                                                const currentMins = now.getHours() * 60 + now.getMinutes();
                                                const [sH, sM] = h.start_time.split(':').map(Number);
                                                const [eH, eM] = h.end_time.split(':').map(Number);
                                                let startMins = sH * 60 + sM;
                                                let endMins = eH * 60 + eM;
                                                if (endMins < startMins) endMins += 24 * 60; // Handle midnight crossing

                                                const isActive = currentMins >= startMins && currentMins < endMins;

                                                return (
                                                    <TableRow key={i} className={`
                                                        ${isActive ? 'bg-violet-100/50 border-l-4 border-l-violet-500 shadow-sm' : i % 2 === 0 ? 'bg-white' : 'bg-skyblue-50/20'} 
                                                        hover:bg-skyblue-100/30 transition-all duration-300
                                                    `}>
                                                        <TableCell className="font-medium text-neutral-500 py-3 relative">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isActive ? 'bg-violet-500 text-white animate-pulse' : 'bg-violet-100 text-violet-600'}`}>
                                                                    {h.ruler.substring(0, 2)}
                                                                </div>
                                                                <span className={isActive ? 'font-bold text-violet-700' : ''}>{h.ruler}</span>
                                                            </div>
                                                            {isActive && (
                                                                <span className="absolute top-0 right-2 text-[9px] font-bold text-violet-400 uppercase tracking-widest mt-1">
                                                                    Active
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className={`text-xs font-mono py-2 ${isActive ? 'text-violet-700 font-bold' : 'text-neutral-400'}`}>
                                                            {h.start_time.split(' ')[0]} - {h.end_time.split(' ')[0]}
                                                        </TableCell>
                                                        <TableCell className="text-right py-2">
                                                            <Badge variant="outline" className={`
                                                                text-[10px] px-2 py-0.5 border-0 font-medium
                                                                ${isGood ? 'bg-green-100 text-green-700' :
                                                                    isAvg ? 'bg-amber-100 text-amber-700' :
                                                                        'bg-red-100 text-red-700'}
                                                            `}>
                                                                {quality}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            }) : (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center text-muted-foreground p-4">
                                                        {birthDetails ? "Loading..." : "Enter birth details for Hora"}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Card>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const LoadingState = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-4" />
        <p className="text-muted-foreground animate-pulse">Consulting the Almanac...</p>
    </div>
);

const ErrorState = ({ message }: { message: string }) => (
    <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100 m-6">
        <p className="text-red-600 font-medium mb-4">{message}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Retry</button>
    </div>
);
