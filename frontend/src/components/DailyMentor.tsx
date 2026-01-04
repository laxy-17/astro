import React, { useEffect, useState } from 'react';
import type { DailyMentorResponse, BirthDetails, Hora, SpecialTime } from '../api/client';
import { getDailyMentor } from '../api/client';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Briefcase, Heart, AlertTriangle, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Props {
    birthDetails: BirthDetails;
}

export const DailyMentor: React.FC<Props> = ({ birthDetails }) => {
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
                setError("Unable to load Daily Guidance. " + (err.message || ""));
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
            <Header date={data.date} />
            <DailyFocusCard data={data} />
            <MomentsTimeline horaTimeline={data.hora_timeline} specialTimes={data.special_times} />
            <LifeAreaGuidance />
        </div>
    );
};

// Sub-components

const Header: React.FC<{ date: string }> = ({ date }) => (
    <div className="px-1">
        <h1 className="text-2xl font-bold text-neutral-500">Your Day</h1>
        <p className="text-neutral-400">{new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
);

const DailyFocusCard: React.FC<{ data: DailyMentorResponse }> = ({ data }) => {
    const { energy, theme } = data;

    return (
        <Card className="glass-panel border-skyblue-200/50 bg-gradient-to-br from-skyblue-100/60 to-violet-100/60 overflow-hidden relative shadow-[0_2px_8px_rgba(91,163,208,0.08)]">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-24 h-24 text-skyblue-500" />
            </div>
            <CardContent className="p-6 space-y-6 relative z-10">
                <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-skyblue-600 uppercase tracking-wider">Today's Vibe</h3>
                    <p className="text-2xl font-serif italic text-neutral-500 leading-tight">{energy.vibe}</p>
                </div>

                <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-skyblue-600 uppercase tracking-wider">Theme</h3>
                    <p className="text-lg text-neutral-400">{theme}</p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <Badge variant="outline" className={`${energy.color === 'Green' ? 'bg-status-success/10 text-status-success border-status-success/30' : energy.color === 'Red' ? 'bg-status-error/10 text-status-error border-status-error/30' : 'bg-status-warning/10 text-status-warning border-status-warning/30'} px-3 py-1 text-sm font-medium`}>
                        {energy.auspiciousness}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
};

const MomentsTimeline: React.FC<{ horaTimeline: Hora[], specialTimes: SpecialTime[] }> = ({ horaTimeline, specialTimes }) => {
    // Merge and Sort Timeline
    // This is simplified. Ideally we interleave special times.
    // For MVP, we show Horas list, with Special Times highlighted at top or interleaved?
    // User Mockup: "Moments Timeline (Scrollable)" -> "Sun 8:15...", "Golden Moment..."

    // We need real start/end timestamps to sort properly.
    // The API returns localized formatted strings "HH:MM AM" which matches UI but hard to sort.
    // However, the LIST is already sorted by time usually for Horas.
    // Special times might overlap.

    // For MVP 2: Just show Special Times distinctively, then Horas. Or interleaving requires parsing time.
    // Let's just list Special Times first (Golden, Avoid) then current/upcoming Horas.

    const relevantSpecial = specialTimes.filter(t => t.description.includes("Golden") || t.quality === "Inauspicious");

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-500 px-1">Moments Timeline</h3>
            <div className="space-y-3">
                {/* Special Highlights */}
                {relevantSpecial.map((st, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border ${st.quality === 'Auspicious' ? 'bg-status-warning/5 border-status-warning/30' : 'bg-status-error/5 border-status-error/20'} flex items-center gap-4`}>
                        <div className={`p-2 rounded-full ${st.quality === 'Auspicious' ? 'bg-status-warning/20 text-status-warning' : 'bg-status-error/20 text-status-error'}`}>
                            {st.quality === 'Auspicious' ? <Sparkles className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        </div>
                        <div>
                            <div className={`font-bold text-sm ${st.quality === 'Auspicious' ? 'text-status-warning' : 'text-status-error'}`}>{st.name}</div>
                            <div className="text-xs text-neutral-400">{st.start_time} - {st.end_time}</div>
                            <div className="text-xs text-neutral-500 mt-1">{st.description}</div>
                        </div>
                    </div>
                ))}

                {/* Horas */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {horaTimeline.map((hora, idx) => (
                        <div key={idx} className="p-3 bg-white/60 border border-skyblue-200/50 rounded-lg flex items-center justify-between hover:bg-skyblue-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-skyblue-50 border border-skyblue-100 flex items-center justify-center text-xs font-bold text-skyblue-600">
                                    {hora.ruler.substring(0, 2)}
                                </div>
                                <div>
                                    <div className="font-medium text-neutral-500">{hora.ruler} Hora</div>
                                    <div className="text-xs text-neutral-400">{hora.quality}</div>
                                </div>
                            </div>
                            <div className="text-xs font-mono text-neutral-400 text-right">
                                <div>{hora.start_time}</div>
                                <div className="opacity-50">to</div>
                                <div>{hora.end_time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const LifeAreaGuidance: React.FC = () => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral-500 px-1">Life Area Guidance</h3>
        <Accordion type="single" collapsible className="w-full space-y-2">
            <AccordionItem value="career" className="border-none">
                <AccordionTrigger className="px-4 py-3 bg-white border border-skyblue-200/50 hover:bg-skyblue-50 rounded-lg text-neutral-500 no-underline transition-all shadow-sm">
                    <div className="flex items-center gap-3">
                        <Briefcase className="w-4 h-4 text-skyblue-500" />
                        <span>Career & Work</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-3 bg-skyblue-50/50 rounded-b-lg border-x border-b border-skyblue-200/30 text-sm text-neutral-400 space-y-2">
                    <div className="flex gap-2">
                        <span className="text-status-success font-bold">Do:</span>
                        <span>Schedule meetings during Sun Hora</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-status-error font-bold">Don't:</span>
                        <span>Sign contracts during Rahu Kalam</span>
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="relationships" className="border-none">
                <AccordionTrigger className="px-4 py-3 bg-white border border-skyblue-200/50 hover:bg-skyblue-50 rounded-lg text-neutral-500 no-underline transition-all shadow-sm">
                    <div className="flex items-center gap-3">
                        <Heart className="w-4 h-4 text-violet-400" />
                        <span>Relationships</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-3 bg-violet-50/50 rounded-b-lg border-x border-b border-violet-200/30 text-sm text-neutral-400">
                    <div className="flex gap-2">
                        <span className="text-status-success font-bold">Do:</span>
                        <span>Plan dates during Venus Hora</span>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground h-[60vh]">
        <div className="text-6xl mb-4 opacity-50">🧭</div>
        <h3 className="text-xl font-medium mb-2">Setup Your Profile</h3>
        <p>Enter your birth details to unlock your Daily Mentor.</p>
    </div>
);

const LoadingState = () => (
    <div className="flex flex-col items-center justify-center p-12 h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-violet-500 mb-4" />
        <p className="text-muted-foreground animate-pulse">Consulting the Stars...</p>
    </div>
);

const ErrorState = ({ message }: { message: string }) => (
    <div className="p-8 text-center text-status-error bg-status-error/5 rounded-lg border border-status-error/20 m-4">
        <p>{message}</p>
    </div>
);
