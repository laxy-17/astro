import React, { useEffect, useState } from 'react';
import type { DailyMentorResponse, BirthDetails, Hora, SpecialTime } from '../api/client';
import { getDailyMentor } from '../api/client';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Sun, Moon, AlertTriangle, Sparkles, Clock, Star } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Props {
    birthDetails: BirthDetails;
}

export const TodaysTimings: React.FC<Props> = ({ birthDetails }) => {
    // Reusing the same API endpoint /daily/mentor as it has all the data
    // In a real app, we might split this if payload is huge, but for now it's efficient.
    const [data, setData] = useState<DailyMentorResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const result = await getDailyMentor(birthDetails, today);
                setData(result);
            } catch (err: any) {
                setError("Unable to load Timings. " + (err.message || ""));
            } finally {
                setLoading(false);
            }
        };

        if (birthDetails.date) {
            fetchData();
        }
    }, [birthDetails]);

    if (!birthDetails.date) return <EmptyState />;
    if (loading) return <LoadingState />;
    if (error || !data) return <ErrorState message={error || "Unknown error"} />;

    return (
        <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-xl font-bold text-neutral-500 px-1">Today's Timings</h2>

            <PanchangaGrid summary={data.panchanga_summary} />
            <SpecialTimesList times={data.special_times} />
            <HoraTable hours={data.hora_timeline} />
        </div>
    );
};

// Sub-components

const PanchangaGrid: React.FC<{ summary: DailyMentorResponse['panchanga_summary'] }> = ({ summary }) => (
    <div className="space-y-4">
        <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider px-1">Panchanga</h3>
        <div className="grid grid-cols-2 gap-3">
            <PanchangaCard icon={<Moon className="w-5 h-5 text-violet-400" />} label="Tithi" value={summary.tithi} />
            <PanchangaCard icon={<Star className="w-5 h-5 text-status-warning" />} label="Nakshatra" value={summary.nakshatra} />
            <PanchangaCard icon={<Sun className="w-5 h-5 text-status-warning" />} label="Yoga" value={summary.yoga || "N/A"} />
            <PanchangaCard icon={<Clock className="w-5 h-5 text-skyblue-500" />} label="Karana" value={summary.karana || "N/A"} />
            <div className="col-span-2">
                <PanchangaCard icon={<Calendar className="w-5 h-5 text-status-success" />} label="Vara (Day)" value={summary.vara} />
            </div>
        </div>
    </div>
);

const PanchangaCard: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
    <Card className="bg-white border-skyblue-200/50 shadow-[0_2px_8px_rgba(91,163,208,0.08)]">
        <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <div className="p-2 rounded-full bg-skyblue-50 mb-1">
                {icon}
            </div>
            <div className="text-xs text-neutral-400 uppercase">{label}</div>
            <div className="font-medium text-neutral-500 text-sm line-clamp-2 leading-tight">{value}</div>
        </CardContent>
    </Card>
);

const SpecialTimesList: React.FC<{ times: SpecialTime[] }> = ({ times }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider px-1">Special Times</h3>
            <div className="space-y-2">
                {times.map((t, idx) => (
                    <div key={idx} className={`p-4 rounded-lg flex items-center justify-between border ${t.quality.includes("Auspicious") ? 'bg-status-warning/5 border-status-warning/30' : 'bg-status-error/5 border-status-error/30'}`}>
                        <div className="flex items-center gap-3">
                            {t.quality.includes("Auspicious") ? <Sparkles className="w-5 h-5 text-status-warning" /> : <AlertTriangle className="w-5 h-5 text-status-error" />}
                            <div>
                                <div className="font-semibold text-neutral-500">{t.name}</div>
                                <div className="text-xs text-neutral-400">{t.description}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-mono text-neutral-500">{t.start_time}</div>
                            <div className="text-xs text-neutral-400">to {t.end_time}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const HoraTable: React.FC<{ hours: Hora[] }> = ({ hours }) => (
    <div className="space-y-4">
        <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider px-1">Planetary Hours (Hora)</h3>
        <Card className="bg-white border-skyblue-200/50 overflow-hidden shadow-[0_2px_8px_rgba(91,163,208,0.08)]">
            <div className="max-h-[400px] overflow-auto">
                <Table>
                    <TableHeader className="bg-skyblue-100 sticky top-0 backdrop-blur-sm border-b-2 border-skyblue-200/50">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[100px] text-xs font-bold text-neutral-500">Planet</TableHead>
                            <TableHead className="text-xs font-bold text-neutral-500">Time Range</TableHead>
                            <TableHead className="text-xs font-bold text-neutral-500 text-right">Quality</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {hours.map((h, i) => (
                            <TableRow key={i} className={`border-skyblue-100 ${i % 2 === 0 ? 'bg-white' : 'bg-skyblue-50/30'} hover:bg-skyblue-100/50 transition-colors`}>
                                <TableCell className="font-medium text-neutral-500 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-violet-400"></span>
                                    {h.ruler}
                                </TableCell>
                                <TableCell className="text-xs font-mono text-neutral-400">
                                    {h.start_time} - {h.end_time}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge variant="secondary" className="text-[10px] bg-skyblue-100 text-skyblue-600 hover:bg-skyblue-200 border-none">
                                        {h.quality}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </Card>
    </div>
);

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground h-[60vh]">
        <div className="text-6xl mb-4 opacity-50">📅</div>
        <h3 className="text-xl font-medium mb-2">Panchanga & Timings</h3>
        <p>Enter your birth details to see today's auspicious times.</p>
    </div>
);

const LoadingState = () => (
    <div className="flex flex-col items-center justify-center p-12 h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-violet-500 mb-4" />
        <p className="text-muted-foreground animate-pulse">Calculating Moments...</p>
    </div>
);

const ErrorState = ({ message }: { message: string }) => (
    <div className="p-8 text-center text-red-400 bg-red-950/20 rounded-lg border border-red-900/50 m-4">
        <p>{message}</p>
    </div>
);
