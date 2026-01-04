import React, { useMemo, useState } from 'react';
import type { Panchanga, Dasha, SpecialTime, Hora } from '../api/client';
import { calculateDashaDates } from '../utils/astroUtils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Sparkles, Sun, Clock } from "lucide-react";

interface Props {
    data: Panchanga;
    dashas: Dasha[];
    birthDate: string;
    specialTimes?: SpecialTime[];
    horaTimeline?: Hora[];
    ayanamsa?: number;
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

export const PanchangaPanel: React.FC<Props> = ({ data, dashas, birthDate, specialTimes = [], horaTimeline = [], ayanamsa }) => {
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

            {/* Muhurta & Special Timings Section */}
            <Card className="glass-panel border-white/10 bg-black/40 overflow-hidden">
                <CardHeader className="pb-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <Sun className="w-5 h-5 text-amber-400" />
                        <div>
                            <CardTitle className="text-lg font-bold text-white">Muhurta & Important Timings</CardTitle>
                            <CardDescription className="text-muted-foreground">Auspicious and inauspicious time periods</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Auspicious Column */}
                        <div className="border border-green-500/30 rounded-lg bg-green-50/90 overflow-hidden">
                            <div className="bg-green-100/50 px-4 py-2 border-b border-green-500/30 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-green-700" />
                                <h4 className="font-bold text-green-800">Auspicious Times</h4>
                            </div>
                            <div className="p-4 space-y-3">
                                {specialTimes.filter(t => t.quality === 'Auspicious').map((st, idx) => (
                                    <div key={idx} className="p-3 rounded-lg border border-green-600/20 bg-green-100/50 space-y-1">
                                        <div className="text-green-900 font-bold flex justify-between">
                                            <span>{st.name}</span>
                                            <span className="text-sm font-mono text-green-800">{st.start_time} - {st.end_time}</span>
                                        </div>
                                        <div className="text-xs text-green-800/80">{st.description}</div>
                                    </div>
                                ))}
                                {specialTimes.filter(t => t.quality === 'Auspicious').length === 0 && (
                                    <p className="text-sm text-green-800/60 italic">No specific auspicious timings highlighted for this window.</p>
                                )}
                            </div>
                        </div>

                        {/* Inauspicious Column */}
                        <div className="border border-red-500/30 rounded-lg bg-red-50/90 overflow-hidden">
                            <div className="bg-red-100/50 px-4 py-2 border-b border-red-500/30 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-700" />
                                <h4 className="font-bold text-red-800">Inauspicious Times</h4>
                            </div>
                            <div className="p-4 space-y-3">
                                {specialTimes.filter((t: SpecialTime) => ['Inauspicious', 'Neutral/Mixed'].includes(t.quality)).map((st: SpecialTime, idx: number) => {
                                    return (
                                        <div key={idx} className="p-3 rounded-lg border border-red-600/20 bg-red-100/50 space-y-1">
                                            <div className="text-red-900 font-bold flex justify-between">
                                                <span>{st.name}</span>
                                                <span className="text-sm font-mono text-red-800">{st.start_time} - {st.end_time}</span>
                                            </div>
                                            <div className="text-xs text-red-800/80">{st.description}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </CardContent>

                {/* Hora Timeline Section */}
                {horaTimeline && horaTimeline.length > 0 && (
                    <div className="border-t border-white/5 bg-black/20 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-5 h-5 text-skyblue-400" />
                            <h4 className="text-lg font-bold text-white">Hora Timeline</h4>
                        </div>

                        <div className="border border-white/10 rounded-xl overflow-hidden bg-black/20">
                            <table className="w-full text-sm">
                                <thead className="bg-white/5 text-muted-foreground border-b border-white/10">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Time Range</th>
                                        <th className="px-4 py-3 text-left font-medium">Ruler</th>
                                        <th className="px-4 py-3 text-left font-medium">Quality</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {horaTimeline.map((hora, idx) => (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 font-mono text-neutral-300">
                                                {hora.start_time} - {hora.end_time}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white">
                                                        {hora.ruler.substring(0, 2)}
                                                    </div>
                                                    <span className="text-neutral-300 font-medium">{hora.ruler} Hora</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className={`
                                                    font-normal border-0
                                                    ${hora.quality === 'Good' ? 'bg-green-500/20 text-green-300' :
                                                        hora.quality === 'Average' ? 'bg-yellow-500/20 text-yellow-300' :
                                                            'bg-red-500/20 text-red-300'}
                                                `}>
                                                    {hora.quality}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Ayanamsha Display */}
                {ayanamsa !== undefined && (
                    <div className="p-6 bg-white/90 border-t border-border/10">
                        <div className="text-sm font-medium text-neutral-600 mb-2">Ayanamsha (Lahiri)</div>
                        <div className="text-4xl font-mono text-black tracking-tight">
                            {ayanamsa.toFixed(6)}°
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};
