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
                <div className="bg-gradient-to-br from-violet-600 via-violet-500 to-indigo-600 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-violet-200 text-xs uppercase tracking-[0.2em] font-black mb-1 opacity-80">Active Dasha Period</h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl font-black tracking-tight">{currentStatus.group.lord}</span>
                                    {currentStatus.sub && (
                                        <>
                                            <span className="text-violet-300/40 text-2xl font-light">/</span>
                                            <span className="text-3xl font-bold text-violet-100 italic">{currentStatus.sub.lord.split('-')[1]}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Vimsopaka</span>
                                <div className="text-xl font-black">
                                    {strengths?.[currentStatus.group.lord]?.toFixed(1) || '0.0'}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-violet-200/60">
                                    <span>Time Progress</span>
                                    <span>
                                        {Math.round(((new Date().getTime() - new Date(currentStatus.sub?.startDate || currentStatus.group.startDate).getTime()) /
                                            (new Date(currentStatus.sub?.endDate || currentStatus.group.endDate).getTime() - new Date(currentStatus.sub?.startDate || currentStatus.group.startDate).getTime())) * 100)}%
                                    </span>
                                </div>
                                <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden border border-white/10 p-0.5">
                                    <div
                                        className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-1000"
                                        style={{
                                            width: `${Math.min(100, Math.max(0, ((new Date().getTime() - new Date(currentStatus.sub?.startDate || currentStatus.group.startDate).getTime()) /
                                                (new Date(currentStatus.sub?.endDate || currentStatus.group.endDate).getTime() - new Date(currentStatus.sub?.startDate || currentStatus.group.startDate).getTime())) * 100))}%`
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-violet-100/80">
                                <span className="bg-white/10 px-2 py-1 rounded-lg">
                                    {currentStatus.sub?.startDate || currentStatus.group.startDate}
                                </span>
                                <span className="text-violet-300 opacity-40">→</span>
                                <span className="bg-white/10 px-2 py-1 rounded-lg italic">
                                    {currentStatus.sub?.endDate || currentStatus.group.endDate}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -bottom-12 -right-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                        <div className="w-64 h-64 rounded-full bg-white blur-3xl" />
                    </div>
                </div>
            )}

            {/* Vimsopaka Strength Card */}
            {strengthList.length > 0 && (
                <div className="glass-panel border-border p-8 bg-card/40 rounded-3xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black text-neutral-600 flex items-center gap-2">
                            Vimsopaka Strength
                        </h3>
                        <div className="flex gap-4 text-[10px] uppercase tracking-widest font-black">
                            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Strong</div>
                            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Med</div>
                            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Weak</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                        {strengthList.map(planet => (
                            <div key={planet.name} className="flex items-center gap-4 group">
                                <div className="w-20 text-xs font-black text-neutral-400 uppercase tracking-widest group-hover:text-violet-500 transition-colors">
                                    {planet.name}
                                </div>
                                <div className="flex-1">
                                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className={`h-full ${getStrengthColor(planet.score)} transition-all duration-700 ease-out shadow-[0_0_8px_rgba(0,0,0,0.1)]`}
                                            style={{ width: `${(planet.score / 20) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="w-8 text-right font-black text-[11px] text-neutral-600">
                                    {planet.score.toFixed(1)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Vimshottari Dasha Table */}
            <div className="glass-panel border-border overflow-hidden bg-card/40">
                <div className="px-6 py-4 border-b border-skyblue-200/30 bg-skyblue-50/30">
                    <h3 className="text-lg font-heading text-neutral-600">
                        Vimshottari Dasha Periods
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-skyblue-50/20 border-skyblue-200/30 hover:bg-skyblue-50/20">
                                <TableHead className="w-[40px]"></TableHead>
                                <TableHead className="text-left py-3 px-2 font-semibold text-neutral-500 uppercase text-xs tracking-wide">
                                    Lord
                                </TableHead>
                                <TableHead className="text-left py-3 px-6 font-semibold text-neutral-500 uppercase text-xs tracking-wide">
                                    Starts
                                </TableHead>
                                <TableHead className="text-left py-3 px-6 font-semibold text-neutral-500 uppercase text-xs tracking-wide">
                                    Ends
                                </TableHead>
                                <TableHead className="text-right py-3 px-6 font-semibold text-neutral-500 uppercase text-xs tracking-wide">
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
                                                cursor-pointer hover:bg-skyblue-50/40 transition-colors border-b border-skyblue-100/50
                                                ${isCurrentGroup ? 'bg-amber-50/60' : ''}
                                            `}
                                            onClick={() => toggleExpand(group.lord)}
                                        >
                                            <TableCell className="py-3 pl-4 pr-0">
                                                {isExpanded ?
                                                    <ChevronDown className="w-4 h-4 text-neutral-400" /> :
                                                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                                                }
                                            </TableCell>
                                            <TableCell className="py-3 px-2 font-bold text-neutral-600">
                                                {group.lord}
                                            </TableCell>
                                            <TableCell className="py-3 px-6 font-mono text-sm text-neutral-500">
                                                {group.startDate}
                                            </TableCell>
                                            <TableCell className="py-3 px-6 font-mono text-sm text-neutral-500">
                                                {group.endDate}
                                            </TableCell>
                                            <TableCell className="py-3 px-6 text-right font-mono text-sm text-neutral-500">
                                                {group.duration.toFixed(1)}
                                            </TableCell>
                                        </TableRow>

                                        {/* Sub-period Rows */}
                                        {isExpanded && group.subPeriods.map((sub, sIdx) => {
                                            const isCurrentSub = currentStatus?.sub?.lord === sub.lord;
                                            return (
                                                <TableRow
                                                    key={sub.lord}
                                                    className={`
                                                        ${isCurrentSub ? 'bg-violet-500/5 animate-in fade-in transition-all duration-500' : 'bg-transparent'}
                                                        border-b border-skyblue-50/50 group/sub
                                                    `}
                                                >
                                                    <TableCell className="relative">
                                                        {/* Visual Hierarchy Line */}
                                                        <div className="absolute left-[20px] top-0 w-[1px] h-full bg-skyblue-200" />
                                                        <div className={`absolute left-[20px] top-1/2 w-4 h-[1px] bg-skyblue-200 ${sIdx === group.subPeriods.length - 1 ? 'last-bar' : ''}`} />
                                                        {sIdx === group.subPeriods.length - 1 && (
                                                            <div className="absolute left-[20px] bottom-1/2 w-[1px] h-1/2 bg-white" />
                                                        )}
                                                    </TableCell>
                                                    <TableCell className={`py-2 px-2 pl-4 font-bold text-xs ${isCurrentSub ? 'text-violet-600' : 'text-neutral-500'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-2 h-2 rounded-full border-2 ${isCurrentSub ? 'bg-violet-500 border-violet-200 shadow-[0_0_5px_rgba(139,92,246,0.5)]' : 'bg-white border-skyblue-200'}`} />
                                                            {sub.lord.split('-')[1]}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className={`py-2 px-6 font-mono text-xs ${isCurrentSub ? 'text-violet-600' : 'text-neutral-400'}`}>
                                                        {sub.startDate}
                                                    </TableCell>
                                                    <TableCell className={`py-2 px-6 font-mono text-xs ${isCurrentSub ? 'text-violet-600' : 'text-neutral-400'}`}>
                                                        {sub.endDate}
                                                    </TableCell>
                                                    <TableCell className="py-2 px-6 text-right">
                                                        <span className="font-mono text-[10px] text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-100">
                                                            {((new Date(sub.endDate).getTime() - new Date(sub.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)).toFixed(1)}m
                                                        </span>
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
