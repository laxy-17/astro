import React, { useMemo, useState } from 'react';
import type { Dasha } from '../api/client';
import { calculateDashaDates, groupDashas } from '../utils/astroUtils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronRight, ChevronDown } from "lucide-react";

interface Props {
    dashas: Dasha[];
    strengths: Record<string, number> | undefined;
    birthDate: string;
}

export const DashaTab: React.FC<Props> = ({ dashas, strengths, birthDate }) => {
    // 1. Calculate flattened rows first
    const flatRows = useMemo(() =>
        calculateDashaDates(dashas, birthDate),
        [dashas, birthDate]
    );

    // 2. Group into Mahadasha -> SubPeriods
    const dashaGroups = useMemo(() =>
        groupDashas(flatRows),
        [flatRows]
    );

    const strengthList = useMemo(() => {
        if (!strengths) return [];
        return Object.entries(strengths)
            .map(([name, score]) => ({ name, score }))
            .sort((a, b) => b.score - a.score);
    }, [strengths]);

    // Find current active group & sub-period
    const currentStatus = useMemo(() => {
        const now = new Date();
        const activeGroup = dashaGroups.find(g => {
            const start = new Date(g.startDate);
            const end = new Date(g.endDate);
            return now >= start && now <= end;
        });

        if (!activeGroup) return null;

        const activeSub = activeGroup.subPeriods.find(s => {
            const start = new Date(s.startDate);
            const end = new Date(s.endDate);
            return now >= start && now <= end;
        });

        return { group: activeGroup, sub: activeSub };
    }, [dashaGroups]);

    // State for expanded rows. Initialize with current active dasha open.
    const [expanded, setExpanded] = useState<Set<string>>(() => {
        const initial = new Set<string>();
        if (currentStatus?.group) {
            initial.add(currentStatus.group.lord);
        }
        return initial;
    });

    const toggleExpand = (lord: string) => {
        const newSet = new Set(expanded);
        if (newSet.has(lord)) {
            newSet.delete(lord);
        } else {
            newSet.add(lord);
        }
        setExpanded(newSet);
    };

    const getStrengthColor = (score: number) => {
        if (score >= 15) return 'bg-green-500';
        if (score >= 10) return 'bg-yellow-500';
        if (score >= 5) return 'bg-orange-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-6">
            {/* Current Dasha Highlight */}
            {currentStatus && (
                <div className="bg-white border-l-4 border-cosmic-gold rounded-r-lg shadow-sm p-6">
                    <h3 className="text-xl font-heading text-gray-900 mb-2">
                        Current Period
                    </h3>
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-cosmic-gold">
                                {currentStatus.group.lord}
                            </span>
                            {currentStatus.sub && (
                                <>
                                    <span className="text-gray-400">/</span>
                                    <span className="text-xl font-semibold text-cosmic-nebula">
                                        {currentStatus.sub.lord.split('-')[1]}
                                    </span>
                                </>
                            )}
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide self-start md:self-auto">
                            Active Now
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 font-mono">
                        {currentStatus.sub ?
                            `${currentStatus.sub.startDate} — ${currentStatus.sub.endDate}` :
                            `${currentStatus.group.startDate} — ${currentStatus.group.endDate}`
                        }
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
                                <TableHead className="w-[40px]"></TableHead>
                                <TableHead className="text-left py-3 px-2 font-semibold text-gray-900 uppercase text-xs tracking-wide">
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
                            {dashaGroups.map((group) => {
                                const isExpanded = expanded.has(group.lord);
                                const isCurrentGroup = currentStatus?.group?.lord === group.lord;

                                return (
                                    <React.Fragment key={group.lord}>
                                        {/* Group Header Row */}
                                        <TableRow
                                            className={`
                                                cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100
                                                ${isCurrentGroup ? 'bg-amber-50/50' : ''}
                                            `}
                                            onClick={() => toggleExpand(group.lord)}
                                        >
                                            <TableCell className="py-3 pl-4 pr-0">
                                                {isExpanded ?
                                                    <ChevronDown className="w-4 h-4 text-gray-400" /> :
                                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                                }
                                            </TableCell>
                                            <TableCell className="py-3 px-2 font-bold text-gray-900">
                                                {group.lord}
                                            </TableCell>
                                            <TableCell className="py-3 px-6 font-mono text-sm text-gray-600">
                                                {group.startDate}
                                            </TableCell>
                                            <TableCell className="py-3 px-6 font-mono text-sm text-gray-600">
                                                {group.endDate}
                                            </TableCell>
                                            <TableCell className="py-3 px-6 text-right font-mono text-sm text-gray-600">
                                                {group.duration.toFixed(1)}
                                            </TableCell>
                                        </TableRow>

                                        {/* Sub-period Rows */}
                                        {isExpanded && group.subPeriods.map((sub) => {
                                            const isCurrentSub = currentStatus?.sub?.lord === sub.lord;
                                            return (
                                                <TableRow
                                                    key={sub.lord}
                                                    className={`
                                                        ${isCurrentSub ? 'bg-green-50/50 animate-in fade-in' : 'bg-gray-50/30'}
                                                        border-b border-gray-100
                                                    `}
                                                >
                                                    <TableCell></TableCell>
                                                    <TableCell className="py-2 px-2 pl-6 font-medium text-sm text-gray-600">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                                            {sub.lord.split('-')[1]}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-2 px-6 font-mono text-xs text-gray-500">
                                                        {sub.startDate}
                                                    </TableCell>
                                                    <TableCell className="py-2 px-6 font-mono text-xs text-gray-500">
                                                        {sub.endDate}
                                                    </TableCell>
                                                    <TableCell className="py-2 px-6 text-right font-mono text-xs text-gray-500">
                                                        {((new Date(sub.endDate).getTime() - new Date(sub.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)).toFixed(1)} m
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </React.Fragment>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};
