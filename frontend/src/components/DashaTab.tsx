import React, { useMemo } from 'react';
import type { Dasha } from '../api/client';
import { calculateDashaDates } from '../utils/astroUtils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Props {
    dashas: Dasha[];
    strengths: Record<string, number> | undefined;
    birthDate: string;
}

export const DashaTab: React.FC<Props> = ({ dashas, strengths, birthDate }) => {
    const dashaRows = useMemo(() =>
        calculateDashaDates(dashas, birthDate),
        [dashas, birthDate]
    );

    const strengthList = useMemo(() => {
        if (!strengths) return [];
        return Object.entries(strengths)
            .map(([name, score]) => ({ name, score }))
            .sort((a, b) => b.score - a.score);
    }, [strengths]);

    // Find current active dasha
    const currentDasha = useMemo(() => {
        const now = new Date();
        return dashaRows.find(d => {
            const start = new Date(d.startDate);
            const end = new Date(d.endDate);
            return now >= start && now <= end;
        });
    }, [dashaRows]);

    const getStrengthColor = (score: number) => {
        if (score >= 15) return 'bg-green-500';
        if (score >= 10) return 'bg-yellow-500';
        if (score >= 5) return 'bg-orange-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-6">
            {/* Current Dasha Highlight */}
            {currentDasha && (
                <div className="bg-white border-l-4 border-cosmic-gold rounded-r-lg shadow-sm p-6">
                    <h3 className="text-xl font-heading text-gray-900 mb-2">
                        Current Period
                    </h3>
                    <div className="flex items-center gap-3">
                        <p className="text-2xl font-bold text-cosmic-gold">
                            {currentDasha.lord} Mahadasha
                        </p>
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                            Active Now
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 font-mono">
                        {currentDasha.startDate} — {currentDasha.endDate}
                    </p>
                </div>
            )}

            {/* Vimsopaka Strength Card */}
            {strengthList.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-border p-6">
                    <h3 className="text-lg font-heading text-gray-900 mb-4 flex items-center gap-2">
                        <span>💪</span> Vimsopaka Strength
                    </h3>
                    <div className="space-y-4">
                        {strengthList.map(planet => (
                            <div key={planet.name} className="flex items-center gap-4">
                                <div className="w-24 font-medium text-gray-900">
                                    {planet.name}
                                </div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getStrengthColor(planet.score)} transition-all duration-500`}
                                            style={{ width: `${(planet.score / 20) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="w-12 text-right font-mono text-sm text-gray-700 font-bold">
                                    {planet.score.toFixed(1)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-4 italic">
                        * Based on Shadvarga (6 charts) analysis. 20 is max score.
                    </p>
                </div>
            )}

            {/* Vimshottari Dasha Table */}
            <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-gray-50/50">
                    <h3 className="text-lg font-heading text-gray-900">
                        Vimshottari Dasha Periods
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 border-gray-200">
                                <TableHead className="text-left py-3 px-6 font-semibold text-gray-900 uppercase text-xs tracking-wide">
                                    Lord
                                </TableHead>
                                <TableHead className="text-left py-3 px-6 font-semibold text-gray-900 uppercase text-xs tracking-wide">
                                    Starts
                                </TableHead>
                                <TableHead className="text-left py-3 px-6 font-semibold text-gray-900 uppercase text-xs tracking-wide">
                                    Ends
                                </TableHead>
                                <TableHead className="text-right py-3 px-6 font-semibold text-gray-900 uppercase text-xs tracking-wide">
                                    Years
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dashaRows.map((dasha, index) => {
                                const isActive = currentDasha?.lord === dasha.lord;
                                return (
                                    <TableRow
                                        key={`${dasha.lord}-${index}`}
                                        className={`
                      border-b border-gray-100
                      ${isActive ? 'bg-amber-50 hover:bg-amber-100' : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50')}
                      hover:bg-gray-100 transition-colors
                    `}
                                    >
                                        <TableCell className="py-3 px-6 font-semibold text-gray-900">
                                            <div className="flex items-center gap-2">
                                                {isActive && (
                                                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                )}
                                                {dasha.lord}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 px-6 font-mono text-sm text-gray-700">
                                            {dasha.startDate}
                                        </TableCell>
                                        <TableCell className="py-3 px-6 font-mono text-sm text-gray-700">
                                            {dasha.endDate}
                                        </TableCell>
                                        <TableCell className="py-3 px-6 text-right font-mono text-sm text-gray-700">
                                            {typeof dasha.duration === 'number' ? dasha.duration.toFixed(1) : dasha.duration}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};
