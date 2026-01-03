import React, { useMemo, useState } from 'react';
import type { Panchanga, Dasha } from '../api/client';
import { calculateDashaDates } from '../utils/astroUtils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Props {
    data: Panchanga;
    dashas: Dasha[];
    birthDate: string;
}

// Helper for meanings
const getTithiMeaning = (name: string) => {
    if (name.includes('Purnima')) return 'Full Moon - Completion, fullness, emotional intensity';
    if (name.includes('Amavasya')) return 'New Moon - New beginnings, introspection, rest';
    if (name.includes('Ashtami')) return 'Conflict, tension, hard work';
    return name.includes('Shukla') ? 'Growth, expansion, accumulation' : 'Reduction, introspection, release';
};

const getNakshatraMeaning = (_name: string) => {
    return 'Influences emotional nature and mental outlook';
};

const getYogaMeaning = (_name: string) => {
    return 'Auspiciousness of the day for activities';
};

const getKaranaMeaning = (_name: string) => {
    return 'Action, capacity for work';
};

const getVaraMeaning = (_name: string) => {
    return 'General energy of the day';
};

export const PanchangaPanel: React.FC<Props> = ({ data, dashas, birthDate }) => {
    const [today] = useState(new Date());

    const dashaInfo = useMemo(() => {
        const dates = calculateDashaDates(dashas, birthDate);
        const current = dates.find(d => {
            const start = new Date(d.startDate);
            const end = new Date(d.endDate);
            return today >= start && today <= end;
        });

        if (!current && dates.length > 0) {
            if (today < new Date(dates[0].startDate)) return { ...dates[0], status: 'Future' };
            return { ...dates[dates.length - 1], status: 'Completed' };
        }
        return current ? { ...current, status: 'Active Now' } : null;
    }, [dashas, birthDate, today]);

    return (
        <div className="space-y-6">
            {/* Current Mahadasha Context */}
            {dashaInfo && (
                <Card className="bg-gradient-to-r from-purple-50/50 to-blue-50/50 border-purple-100/50 shadow-sm backdrop-blur-sm">
                    <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {dashaInfo.lord} Mahadasha
                        </h3>
                        <p className="text-sm text-gray-600 font-mono">
                            {dashaInfo.startDate} — {dashaInfo.endDate} ({dashaInfo.status})
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Panchanga Elements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Tithi Card */}
                <Card className="hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl filter drop-shadow-md">🌙</span>
                            <div>
                                <CardTitle>Tithi</CardTitle>
                                <CardDescription>Lunar Day</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-2xl font-bold text-foreground leading-none">
                                {data.tithi.name}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1 font-medium">
                                {data.tithi.paksha} Paksha
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Progress value={data.tithi.completion} className="h-2" />
                            <p className="text-xs text-muted-foreground text-right font-mono">
                                {data.tithi.completion.toFixed(1)}% complete
                            </p>
                        </div>
                        <div className="pt-3 border-t border-border/50">
                            <p className="text-sm text-muted-foreground italic">
                                "{getTithiMeaning(data.tithi.name)}"
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Nakshatra Card */}
                <Card className="hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl filter drop-shadow-md">⭐</span>
                            <div>
                                <CardTitle>Nakshatra</CardTitle>
                                <CardDescription>Lunar Mansion</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-2xl font-bold text-foreground leading-none">
                                {data.nakshatra.name}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1 font-medium">
                                Pada {data.nakshatra.pada} • Lord: {data.nakshatra.lord}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Progress value={data.nakshatra.completion} className="h-2 bg-indigo-100" />
                            <p className="text-xs text-muted-foreground text-right font-mono">
                                {data.nakshatra.completion.toFixed(1)}% complete
                            </p>
                        </div>
                        <div className="pt-3 border-t border-border/50">
                            <p className="text-sm text-muted-foreground italic">
                                "{getNakshatraMeaning(data.nakshatra.name)}"
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Yoga Card */}
                <Card className="hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl filter drop-shadow-md">✨</span>
                            <div>
                                <CardTitle>Yoga</CardTitle>
                                <CardDescription>Sun-Moon Union</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-2xl font-bold text-foreground">
                            {data.yoga.name}
                        </p>
                        <div className="pt-3 border-t border-border/50">
                            <p className="text-sm text-muted-foreground italic">
                                "{getYogaMeaning(data.yoga.name)}"
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Karana Card */}
                <Card className="hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl filter drop-shadow-md">🔄</span>
                            <div>
                                <CardTitle>Karana</CardTitle>
                                <CardDescription>Half Tithi</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-2xl font-bold text-foreground">
                            {data.karana.name}
                        </p>
                        <div className="pt-3 border-t border-border/50">
                            <p className="text-sm text-muted-foreground italic">
                                "Action: {getKaranaMeaning(data.karana.name)}"
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Vara Card */}
                <Card className="hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl filter drop-shadow-md">📅</span>
                            <div>
                                <CardTitle>Vara</CardTitle>
                                <CardDescription>Weekday</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-2xl font-bold text-foreground">
                            {data.vara}
                        </p>
                        <div className="pt-3 border-t border-border/50">
                            <p className="text-sm text-muted-foreground italic">
                                "{getVaraMeaning(data.vara)}"
                            </p>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
};
