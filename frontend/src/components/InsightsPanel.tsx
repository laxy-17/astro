import React from 'react';
import type { CoreInsights } from '../api/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
    prediction: string | null;
    dosha: any | null;
    coreInsights: CoreInsights | null;
    loading: boolean;
}

export const InsightsPanel: React.FC<Props> = ({ prediction, dosha, coreInsights, loading }) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                <div className="text-4xl mb-2 animate-bounce">🔮</div>
                <div className="text-sm font-medium">Connecting to Cosmic Consciousness...</div>
            </div>
        );
    }

    if (!prediction && !dosha && !coreInsights) {
        return null;
    }

    return (
        <Card className="glass-panel border-border bg-card/50 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900/80 to-indigo-900/80 px-6 py-4 border-b border-white/10">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                    <span>🧙‍♂️</span> AI Vedic Mentor
                </h2>
            </div>

            <CardContent className="p-6 space-y-6">
                {/* Core Insights */}
                {coreInsights && (
                    <div className="space-y-4">
                        <InsightCard
                            title="👤 Personal Profile"
                            content={coreInsights.personal}
                            borderColor="border-purple-500/30"
                            headerBg="bg-purple-500/10"
                            headerText="text-purple-300"
                        />
                        <InsightCard
                            title="💼 Career Guidance"
                            content={coreInsights.career}
                            borderColor="border-indigo-500/30"
                            headerBg="bg-indigo-500/10"
                            headerText="text-indigo-300"
                        />
                        <InsightCard
                            title="❤️ Relationships"
                            content={coreInsights.relationships}
                            borderColor="border-pink-500/30"
                            headerBg="bg-pink-500/10"
                            headerText="text-pink-300"
                        />
                        <InsightCard
                            title="✅ Do's & Don'ts"
                            content={coreInsights.dos_donts}
                            borderColor="border-emerald-500/30"
                            headerBg="bg-emerald-500/10"
                            headerText="text-emerald-300"
                        />
                    </div>
                )}

                {/* Daily Prediction */}
                {prediction && (
                    <div className="bg-purple-950/30 rounded-lg p-5 border border-purple-500/30">
                        <h3 className="font-bold text-purple-200 mb-2 flex items-center gap-2">
                            <span>📅</span> Daily Forecast
                        </h3>
                        <p className="text-foreground leading-relaxed text-[15px]">{prediction}</p>
                    </div>
                )}

                {/* Dosha Report */}
                {dosha && dosha.mangal_dosh && (
                    <div className="bg-red-950/30 rounded-lg p-5 border border-red-500/30">
                        <h3 className="font-bold text-red-200 mb-2 flex items-center gap-2">
                            <span>🔥</span> Dosha Analysis
                        </h3>
                        <div className="space-y-1">
                            <div className="font-semibold text-foreground">Mangal Dosh (Mars Defect)</div>
                            <div className="text-sm">
                                {dosha.mangal_dosh.is_dosha_present_mars_from_lagna || dosha.mangal_dosh.is_dosha_present_mars_from_moon ? (
                                    <span className="text-red-200 font-bold bg-red-900/50 px-2 py-0.5 rounded">Present</span>
                                ) : (
                                    <span className="text-green-200 font-bold bg-green-900/50 px-2 py-0.5 rounded">Not Present</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

interface CardProps {
    title: string;
    content: string;
    borderColor: string;
    headerBg: string;
    headerText: string;
}

const InsightCard: React.FC<CardProps> = ({ title, content, borderColor, headerBg, headerText }) => (
    <div className={`border ${borderColor} rounded-lg overflow-hidden bg-card/40 hover:bg-card/60 transition-colors`}>
        <div className={`${headerBg} px-4 py-2 border-b ${borderColor}`}>
            <h3 className={`font-semibold ${headerText} text-sm`}>{title}</h3>
        </div>
        <div className="p-4">
            <p className="text-foreground leading-relaxed text-[15px] whitespace-pre-wrap">
                {content}
            </p>
        </div>
    </div>
);
