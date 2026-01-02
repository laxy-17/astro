
import type { CoreInsights } from '../api/client';

interface Props {
    prediction: string | null;
    dosha: any | null;
    coreInsights: CoreInsights | null;
    loading: boolean;
}

export const InsightsPanel: React.FC<Props> = ({ prediction, dosha, coreInsights, loading }) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                <div className="text-4xl mb-2 animate-bounce">🔮</div>
                <div className="text-sm font-medium">Connecting to Cosmic Consciousness...</div>
            </div>
        );
    }

    if (!prediction && !dosha && !coreInsights) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-700 to-purple-600 px-6 py-4">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                    <span>🧙‍♂️</span> AI Vedic Mentor
                </h2>
            </div>

            <div className="p-6 space-y-6">
                {/* Core Insights */}
                {coreInsights && (
                    <div className="space-y-4">
                        <InsightCard
                            title="👤 Personal Profile"
                            content={coreInsights.personal}
                            borderColor="border-purple-200"
                            headerBg="bg-purple-100"
                            headerText="text-purple-900"
                        />
                        <InsightCard
                            title="💼 Career Guidance"
                            content={coreInsights.career}
                            borderColor="border-indigo-200"
                            headerBg="bg-indigo-100"
                            headerText="text-indigo-900"
                        />
                        <InsightCard
                            title="❤️ Relationships"
                            content={coreInsights.relationships}
                            borderColor="border-pink-200"
                            headerBg="bg-pink-100"
                            headerText="text-pink-900"
                        />
                        <InsightCard
                            title="✅ Do's & Don'ts"
                            content={coreInsights.dos_donts}
                            borderColor="border-emerald-200"
                            headerBg="bg-emerald-100"
                            headerText="text-emerald-900"
                        />
                    </div>
                )}

                {/* Daily Prediction */}
                {prediction && (
                    <div className="bg-purple-50 rounded-lg p-5 border border-purple-100">
                        <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                            <span>📅</span> Daily Forecast
                        </h3>
                        <p className="text-gray-800 leading-relaxed text-[15px]">{prediction}</p>
                    </div>
                )}

                {/* Dosha Report */}
                {dosha && dosha.mangal_dosh && (
                    <div className="bg-red-50 rounded-lg p-5 border border-red-100">
                        <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                            <span>🔥</span> Dosha Analysis
                        </h3>
                        <div className="space-y-1">
                            <div className="font-semibold text-gray-900">Mangal Dosh (Mars Defect)</div>
                            <div className="text-sm">
                                {dosha.mangal_dosh.is_dosha_present_mars_from_lagna || dosha.mangal_dosh.is_dosha_present_mars_from_moon ? (
                                    <span className="text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded">Present</span>
                                ) : (
                                    <span className="text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded">Not Present</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
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
}

const InsightCard: React.FC<CardProps> = ({ title, content, borderColor, headerBg, headerText }) => (
    <div className={`border ${borderColor} rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow`}>
        <div className={`${headerBg} px-4 py-2 border-b ${borderColor}`}>
            <h3 className={`font-semibold ${headerText} text-sm`}>{title}</h3>
        </div>
        <div className="p-4">
            <p className="text-gray-800 leading-relaxed text-[15px] whitespace-pre-wrap">
                {content}
            </p>
        </div>
    </div>
);
