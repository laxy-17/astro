import React, { useEffect, useState } from 'react';
import type { DailyMentorResponse, BirthDetails } from '../api/client';
import { getDailyMentor } from '../api/client';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";

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
        <div className="space-y-6 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Header date={data.date} />
            <DailyFocusCard data={data} />
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
