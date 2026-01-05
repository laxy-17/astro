import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, Moon } from 'lucide-react';

interface GowriPeriod {
    name: string;
    start_time: string;
    end_time: string;
    is_auspicious: boolean;
}

interface GowriPanchangamProps {
    dayPeriods: GowriPeriod[];
    nightPeriods: GowriPeriod[];
}

export const GowriPanchangam: React.FC<GowriPanchangamProps> = ({
    dayPeriods,
    nightPeriods
}) => {
    const [activeTab, setActiveTab] = useState<'day' | 'night'>('day');

    const periods = activeTab === 'day' ? dayPeriods : nightPeriods;

    return (
        <Card className="mt-8 border-violet-100 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-violet-50 to-white pb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-xl font-bold text-violet-900">Gowri Panchangam</CardTitle>
                        <p className="text-sm text-slate-500 mt-1 max-w-xl">
                            Traditional Tamil Gowri Panchangam showing auspicious (good muhurthams) and inauspicious timings based on the 8-part division of day and night.
                        </p>
                    </div>

                    {/* Toggle */}
                    <div className="bg-slate-100 p-1 rounded-lg inline-flex self-start md:self-center">
                        <button
                            onClick={() => setActiveTab('day')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'day'
                                    ? 'bg-white text-amber-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Sun className="w-4 h-4" /> Day
                        </button>
                        <button
                            onClick={() => setActiveTab('night')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'night'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Moon className="w-4 h-4" /> Night
                        </button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-y border-slate-100 text-left text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th className="px-6 py-3">Timing</th>
                                <th className="px-6 py-3">Gowri Period</th>
                                <th className="px-6 py-3">Quality</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {periods.map((period, idx) => (
                                <tr key={idx} className={`hover:bg-slate-50/50 transition-colors border-l-4 ${period.is_auspicious ? 'border-l-green-500' : 'border-l-red-500'}`}>
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-medium text-slate-700">
                                        {period.start_time} - {period.end_time}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">
                                        {period.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${period.is_auspicious
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                            {period.is_auspicious ? 'Auspicious' : 'Inauspicious'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};
