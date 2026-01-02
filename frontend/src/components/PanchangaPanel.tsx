import React, { useMemo, useState } from 'react';
import type { Panchanga, Dasha } from '../api/client';
import { calculateDashaDates } from '../utils/astroUtils';

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
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {dashaInfo.lord} Mahadasha
                    </h3>
                    <p className="text-sm text-gray-600 font-mono">
                        {dashaInfo.startDate} — {dashaInfo.endDate} ({dashaInfo.status})
                    </p>
                </div>
            )}

            {/* Panchanga Elements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Tithi Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🌙</span>
                        <div>
                            <h4 className="font-semibold text-gray-900">Tithi (Lunar Day)</h4>
                            <p className="text-xs text-gray-500">Moon phase indicator</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <p className="text-2xl font-bold text-gray-900 leading-none">
                                {data.tithi.name}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                {data.tithi.paksha} Paksha
                            </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full">
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500"
                                    style={{ width: `${data.tithi.completion}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1 text-right">
                                {data.tithi.completion.toFixed(1)}% complete
                            </p>
                        </div>

                        <div className="pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-700 italic">
                                "{getTithiMeaning(data.tithi.name)}"
                            </p>
                        </div>
                    </div>
                </div>

                {/* Nakshatra Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">⭐</span>
                        <div>
                            <h4 className="font-semibold text-gray-900">Nakshatra</h4>
                            <p className="text-xs text-gray-500">Lunar mansion</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <p className="text-2xl font-bold text-gray-900 leading-none">
                                {data.nakshatra.name}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                Pada {data.nakshatra.pada} • Lord: {data.nakshatra.lord}
                            </p>
                        </div>

                        <div className="w-full">
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500"
                                    style={{ width: `${data.nakshatra.completion}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1 text-right">
                                {data.nakshatra.completion.toFixed(1)}% complete
                            </p>
                        </div>

                        <div className="pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-700 italic">
                                "{getNakshatraMeaning(data.nakshatra.name)}"
                            </p>
                        </div>
                    </div>
                </div>

                {/* Yoga Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">✨</span>
                        <div>
                            <h4 className="font-semibold text-gray-900">Yoga</h4>
                            <p className="text-xs text-gray-500">Sun-Moon combination</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-2xl font-bold text-gray-900">
                            {data.yoga.name}
                        </p>

                        <div className="pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-700 italic">
                                "{getYogaMeaning(data.yoga.name)}"
                            </p>
                        </div>
                    </div>
                </div>

                {/* Karana Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🔄</span>
                        <div>
                            <h4 className="font-semibold text-gray-900">Karana</h4>
                            <p className="text-xs text-gray-500">Half of Tithi</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-2xl font-bold text-gray-900">
                            {data.karana.name}
                        </p>

                        <div className="pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-700 italic">
                                "Action: {getKaranaMeaning(data.karana.name)}"
                            </p>
                        </div>
                    </div>
                </div>

                {/* Vara Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">📅</span>
                        <div>
                            <h4 className="font-semibold text-gray-900">Vara</h4>
                            <p className="text-xs text-gray-500">Day of the week</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-2xl font-bold text-gray-900">
                            {data.vara}
                        </p>

                        <div className="pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-700 italic">
                                "{getVaraMeaning(data.vara)}"
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
