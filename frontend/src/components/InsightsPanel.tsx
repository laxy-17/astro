import React from 'react';
import type { CoreInsights } from '../api/client';
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Sparkles, Briefcase, Heart, User } from "lucide-react";

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

    // Helper to format forecast into bullets
    const renderForecastBullets = (text: string) => {
        // Split by emoji markers or common section starts
        const sections = text.split(/(?=[✨💰🤝⚠️🌟🗓️🔮⚖️🎨])/g).filter(s => s.trim().length > 0);

        if (sections.length <= 1) {
            return <p className="text-purple-950/80 leading-relaxed text-[15px]">{text}</p>;
        }

        return (
            <ul className="space-y-4">
                {sections.map((sec, idx) => {
                    // Strip emojis, corrupted chars, and leading markers
                    // IMPORTANT: trim first to remove whitespace that might be hiding the bad chars
                    const cleanText = sec.trim().replace(/^[^a-zA-Z0-9\s]+/, '').trim();
                    if (!cleanText) return null;

                    return (
                        <li key={idx} className="flex gap-3 text-[15px] leading-relaxed text-purple-900/90 items-start">
                            <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                            <span className="flex-1 font-medium">{cleanText}</span>
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <Card className="glass-panel border-border bg-card/50 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-700 to-indigo-700 px-6 py-4 border-b border-white/10">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                    <span>🧙‍♂️</span> AI Vedic Mentor
                </h2>
            </div>

            <CardContent className="p-6 space-y-8">
                {/* Daily Prediction (Moved to Top - Now Violet) */}
                {prediction && (
                    <div className="border border-purple-200 rounded-xl bg-purple-50/30 overflow-hidden shadow-sm">
                        <div className="bg-purple-100/60 px-4 py-3 border-b border-purple-200 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            <h3 className="font-bold text-purple-800 uppercase tracking-wide text-xs md:text-sm">Daily Forecast</h3>
                        </div>
                        <div className="p-5">
                            {renderForecastBullets(prediction)}
                        </div>
                    </div>
                )}

                {/* Core Insights (Grid Layout) */}
                {coreInsights && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InsightCard
                            icon={<User className="w-4 h-4" />}
                            title="Personal Profile"
                            content={coreInsights.personal}
                            borderColor="border-orange-200 dark:border-orange-800"
                            headerBg="bg-orange-50 dark:bg-orange-900/30"
                            headerText="text-orange-700 dark:text-orange-300"
                            iconColor="text-orange-600"
                        />
                        <InsightCard
                            icon={<Briefcase className="w-4 h-4" />}
                            title="Career Guidance"
                            content={coreInsights.career}
                            borderColor="border-blue-200 dark:border-blue-800"
                            headerBg="bg-blue-50 dark:bg-blue-900/20"
                            headerText="text-blue-700 dark:text-blue-300"
                            iconColor="text-blue-600"
                        />
                        <InsightCard
                            icon={<Heart className="w-4 h-4" />}
                            title="Relationships"
                            content={coreInsights.relationships}
                            borderColor="border-pink-200 dark:border-pink-800"
                            headerBg="bg-pink-50 dark:bg-pink-900/20"
                            headerText="text-pink-700 dark:text-pink-300"
                            iconColor="text-pink-600"
                        />
                    </div>
                )}

                {/* Dosha Report */}
                {dosha && dosha.mangal_dosh && (
                    <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-5 border border-red-200 dark:border-red-800/30">
                        <h3 className="font-bold text-red-700 dark:text-red-300 mb-2 flex items-center gap-2 text-sm uppercase">
                            <span>🔥</span> Dosha Analysis
                        </h3>
                        <div className="flex items-center justify-between">
                            <div className="font-medium text-red-900 dark:text-red-100">Mangal Dosh (Mars Defect)</div>
                            <div>
                                {dosha.mangal_dosh.is_dosha_present_mars_from_lagna || dosha.mangal_dosh.is_dosha_present_mars_from_moon ? (
                                    <span className="text-red-700 bg-red-100 px-3 py-1 rounded-full text-xs font-bold border border-red-200">Present</span>
                                ) : (
                                    <span className="text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">Not Present</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Do's and Don'ts */}
                {coreInsights && (
                    <DosDontsGrid content={coreInsights.dos_donts} />
                )}

            </CardContent>
        </Card>
    );
};

const DosDontsGrid: React.FC<{ content: string }> = ({ content }) => {
    // Basic parsing: split by "**Don'ts:**" or similar
    const lowerContent = content.toLowerCase();

    // Normalize split markers
    let splitIndex = lowerContent.indexOf("**don'ts:**");
    if (splitIndex === -1) splitIndex = lowerContent.indexOf("don'ts:");
    if (splitIndex === -1) splitIndex = lowerContent.indexOf("**donts:**");

    let dosText = "";
    let dontsText = "";

    if (splitIndex !== -1) {
        // Extract parts
        const part1 = content.substring(0, splitIndex);
        const part2 = content.substring(splitIndex);

        // Remove header labels
        dosText = part1.replace(/(\*\*|__)?(Do's|Dos):?(\*\*|__)?/i, "").trim();
        dontsText = part2.replace(/(\*\*|__)?(Don'ts|Donts):?(\*\*|__)?/i, "").trim();
    } else {
        // Fallback: entire content is treated as generic text (Dos)
        dosText = content.replace(/(\*\*|__)?(Do's|Dos):?(\*\*|__)?/i, "").trim();
    }

    const parseList = (text: string) => {
        if (!text) return [];
        return text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => line.replace(/^[\*\-\•]\s*/, '') // Remove bullets
                .replace(/\*\*/g, '')          // Remove bold markdown
                .trim());
    };

    const dosList = parseList(dosText);
    const dontsList = parseList(dontsText);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Do's Column */}
            <div className="border border-emerald-200/60 rounded-xl bg-emerald-50/50 overflow-hidden shadow-sm">
                <div className="bg-emerald-100/40 px-4 py-3 border-b border-emerald-200/50 flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-emerald-800">Do's</h3>
                </div>
                <div className="p-5 space-y-3">
                    {dosList.length > 0 ? dosList.map((item, idx) => (
                        <div key={idx} className="flex gap-3 text-[15px] text-emerald-900/80 items-start leading-relaxed">
                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span>{item}</span>
                        </div>
                    )) : (
                        <span className="text-sm text-emerald-700/50 italic">No specific advice.</span>
                    )}
                </div>
            </div>

            {/* Don'ts Column */}
            <div className="border border-red-200/60 rounded-xl bg-red-50/50 overflow-hidden shadow-sm">
                <div className="bg-red-100/40 px-4 py-3 border-b border-red-200/50 flex items-center gap-2">
                    <X className="w-5 h-5 text-red-600" />
                    <h3 className="font-bold text-red-800">Don'ts</h3>
                </div>
                <div className="p-5 space-y-3">
                    {dontsList.length > 0 ? dontsList.map((item, idx) => (
                        <div key={idx} className="flex gap-3 text-[15px] text-red-900/80 items-start leading-relaxed">
                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                            <span>{item}</span>
                        </div>
                    )) : (
                        <span className="text-sm text-red-700/50 italic">No specific advice.</span>
                    )}
                </div>
            </div>
        </div>
    );
};

interface CardProps {
    title: string;
    content: string;
    borderColor: string;
    headerBg: string;
    headerText: string;
    icon?: React.ReactNode;
    iconColor?: string;
}

const InsightCard: React.FC<CardProps> = ({ title, content, borderColor, headerBg, headerText, icon, iconColor }) => (
    <div className={`border ${borderColor} rounded-xl overflow-hidden bg-white/50 hover:bg-white/80 transition-all shadow-sm flex flex-col`}>
        <div className={`${headerBg} px-4 py-3 border-b ${borderColor} flex items-center gap-2`}>
            <div className={iconColor}>{icon}</div>
            <h3 className={`font-bold ${headerText} text-sm uppercase tracking-wide`}>{title}</h3>
        </div>
        <div className="p-5 flex-grow">
            <p className="text-foreground/80 leading-relaxed text-[15px] whitespace-pre-wrap">
                {content}
            </p>
        </div>
    </div>
);
