import React, { useMemo } from 'react';
import type { PlanetPosition } from '../../api/client';
import { getPlanetSymbol } from '../../lib/planetSymbols';
import { getRasiSymbol, getRasiLord } from '../../lib/rasiSymbols';

interface Props {
    planets: PlanetPosition[];
    ascendant: {
        sign: string;
        degree: number;
    };
}

export const PlanetPositionsTable: React.FC<Props> = ({ planets, ascendant }) => {
    // Format position as degrees°minutes'
    const formatDMS = (degrees: number): string => {
        const d = Math.floor(Math.abs(degrees));
        const minFloat = (Math.abs(degrees) - d) * 60;
        const m = Math.floor(minFloat);
        return `${d}° ${m}'`;
    };

    // Calculate position within sign (0-30°)
    const getSignPosition = (longitude: number): string => {
        return formatDMS(longitude % 30);
    };

    // Prepare table data
    const tableData = useMemo(() => {
        return [
            {
                name: 'Ascendant',
                symbol: getPlanetSymbol('Ascendant'),
                longitude: ascendant.degree,
                sign: ascendant.sign,
                nakshatra: '-',
                nakshatraLord: '-',
                retrograde: false
            },
            ...planets.map(p => ({
                name: p.name,
                symbol: getPlanetSymbol(p.name),
                longitude: p.longitude,
                sign: p.sign,
                nakshatra: p.nakshatra,
                nakshatraLord: p.nakshatra_lord || '-',
                retrograde: p.retrograde
            }))
        ];
    }, [planets, ascendant]);

    // Calculate chart lords
    const rasiLord = getRasiLord(ascendant.sign);
    const moonData = planets.find(p => p.name === 'Moon');
    const nakshatraLord = moonData?.nakshatra_lord || 'Unknown';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <span className="text-violet-600">📊</span> Planetary Positions
                </h2>
                <p className="text-sm text-gray-500 font-medium">
                    Detailed celestial coordinates and dignities.
                </p>
            </div>

            {/* Desktop Table - Sticky & Brand Styled */}
            <div className="hidden md:block bg-white border border-skyblue-100 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                        <thead className="bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10 border-b border-skyblue-100">
                            <tr>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-50/50">
                                    Planet
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-50/50">
                                    Full Position
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-50/50">
                                    In Sign
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-50/50 text-center">
                                    Rasi
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-50/50">
                                    Rasi Lord
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-50/50">
                                    Nakshatra
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-50/50">
                                    N-Lord
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {tableData.map((row, idx) => {
                                const rasiInfo = getRasiSymbol(row.sign);
                                const rasiLordName = getRasiLord(row.sign);

                                return (
                                    <tr
                                        key={row.name}
                                        className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-skyblue-50/50 transition-colors`}
                                    >
                                        {/* Planets Column */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-lg" style={{ color: row.symbol.color }}>
                                                    {row.symbol.symbol}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {row.name}
                                                    </span>
                                                    {row.retrograde && (
                                                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter">
                                                            Retrograde
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Positions Column */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600 font-mono font-medium">
                                                {formatDMS(row.longitude)}
                                            </span>
                                        </td>

                                        {/* Degrees Column */}
                                        <td className="px-4 py-4 whitespace-nowrap text-violet-600 font-bold">
                                            <span className="text-sm font-mono">
                                                {getSignPosition(row.longitude)}
                                            </span>
                                        </td>

                                        {/* Rasi Column */}
                                        <td className="px-4 py-4 whitespace-nowrap text-center">
                                            <div className="flex flex-col items-center">
                                                <span
                                                    className="text-lg font-bold"
                                                    style={{ color: rasiInfo.color }}
                                                >
                                                    {rasiInfo.symbol}
                                                </span>
                                                <span className="text-[10px] uppercase font-bold text-gray-400">{rasiInfo.name}</span>
                                            </div>
                                        </td>

                                        {/* Rasi Lord Column */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-gray-700">
                                                {rasiLordName}
                                            </span>
                                        </td>

                                        {/* Nakshatra Column */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900">{row.nakshatra}</span>
                                        </td>

                                        {/* Nakshatra Lord Column */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-500">
                                                {row.nakshatraLord}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Summary Section - Integrated Styling */}
                <div className="bg-violet-50/50 px-6 py-4 border-t border-skyblue-100">
                    <div className="flex flex-wrap gap-x-10 gap-y-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-violet-400 tracking-widest">Rasi Lord</span>
                            <span className="text-sm font-bold text-violet-900">{rasiLord}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-violet-400 tracking-widest">Lagna Lord</span>
                            <span className="text-sm font-bold text-violet-900">{rasiLord}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-violet-400 tracking-widest">Nakshatra Lord (Moon)</span>
                            <span className="text-sm font-bold text-violet-900">{nakshatraLord}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile View - Enhanced Cards */}
            <div className="md:hidden space-y-4">
                {tableData.map((row) => {
                    const rasiInfo = getRasiSymbol(row.sign);
                    const rasiLordName = getRasiLord(row.sign);

                    return (
                        <div
                            key={row.name}
                            className="bg-white border border-skyblue-50 rounded-2xl p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-xl shadow-inner" style={{ color: row.symbol.color }}>
                                        {row.symbol.symbol}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-base font-bold text-gray-900">{row.name}</span>
                                        {row.retrograde && (
                                            <span className="text-[10px] font-bold text-amber-600 uppercase">Retrograde</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold" style={{ color: rasiInfo.color }}>{rasiInfo.symbol}</div>
                                    <div className="text-[10px] uppercase font-bold text-gray-400">{rasiInfo.name}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">In Sign</span>
                                    <div className="text-sm font-bold text-violet-600 font-mono">{getSignPosition(row.longitude)}</div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Rasi Lord</span>
                                    <div className="text-sm font-bold text-gray-800">{rasiLordName}</div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Nakshatra</span>
                                    <div className="text-sm font-medium text-gray-800">{row.nakshatra}</div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">N-Lord</span>
                                    <div className="text-sm font-medium text-gray-500">{row.nakshatraLord}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
