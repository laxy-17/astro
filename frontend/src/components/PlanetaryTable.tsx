import React from 'react';
import type { PlanetPosition } from '../api/client';
import { calculatePada, formatDMS } from '../utils/astroUtils';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
    planets: PlanetPosition[];
    ascendant: {
        sign: string;
        degree: number;
        house: number; // usually 1
    };
}

export const PlanetaryTable: React.FC<Props> = ({ planets, ascendant }) => {

    const getPlanetColor = (name: string) => {
        const benefics = ['Jupiter', 'Venus', 'Moon', 'Mercury'];
        const malefics = ['Saturn', 'Mars', 'Rahu', 'Ketu'];

        if (name === 'Sun') return 'text-status-warning';
        if (benefics.includes(name)) return 'text-skyblue-500';
        if (malefics.includes(name)) return 'text-status-error';
        return 'text-neutral-500';
    };

    // Helper to format planet data for display
    const formattedPlanets = [
        {
            name: 'Ascendant',
            sign: ascendant.sign,
            longitude: formatDMS(ascendant.degree % 30),
            nakshatra: '-',
            pada: calculatePada(ascendant.degree),
            speed: 0,
            retrograde: false,
            isAscendant: true
        },
        ...planets.map(p => ({
            name: p.name,
            sign: p.sign,
            longitude: formatDMS(p.longitude % 30),
            nakshatra: p.nakshatra,
            pada: calculatePada(p.longitude),
            speed: p.speed,
            retrograde: p.retrograde,
            isAscendant: false
        }))
    ];

    return (
        <div className="panel h-full flex flex-col bg-white border-skyblue-200/50 rounded-xl shadow-[0_2px_8px_rgba(91,163,208,0.08)] overflow-hidden">
            <div className="bg-skyblue-100/50 py-3 px-4 flex justify-between items-center border-b border-skyblue-200/50">
                <span className="font-bold text-neutral-500">Planetary Bodies</span>
            </div>

            <div className="panel-content p-0 overflow-auto flex-grow">
                {/* Desktop/Tablet Table View */}
                <div className="hidden md:block w-full">
                    <Table className="planetary-bodies-table w-full">
                        <TableHeader className="bg-skyblue-100 border-b border-skyblue-200/30">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="h-10 text-xs font-bold uppercase tracking-wider text-neutral-500 pl-4">Body</TableHead>
                                <TableHead className="h-10 text-xs font-bold uppercase tracking-wider text-neutral-500">Sign</TableHead>
                                <TableHead className="h-10 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">Longitude</TableHead>
                                <TableHead className="h-10 text-xs font-bold uppercase tracking-wider text-neutral-500">Nakshatra</TableHead>
                                <TableHead className="h-10 text-xs font-bold uppercase tracking-wider text-neutral-500 text-center">Pada</TableHead>
                                <TableHead className="h-10 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">Speed</TableHead>
                                <TableHead className="h-10 text-xs font-bold uppercase tracking-wider text-neutral-500 text-center">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger className="cursor-help">(R)</TooltipTrigger>
                                            <TooltipContent>Retrograde Motion</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {formattedPlanets.map((planet, index) => (
                                <TableRow
                                    key={planet.name}
                                    className={`
                                        border-b border-skyblue-100 hover:bg-skyblue-100/50 transition-colors
                                        ${index % 2 === 0 ? 'bg-white' : 'bg-skyblue-50/20'}
                                    `}
                                >
                                    <TableCell className={`py-2.5 pl-4 font-medium text-sm ${planet.isAscendant ? 'text-status-error font-bold' : getPlanetColor(planet.name)}`}>
                                        {planet.name}
                                    </TableCell>
                                    <TableCell className="py-2.5 text-neutral-400 text-sm">{planet.sign}</TableCell>
                                    <TableCell className="py-2.5 text-neutral-400 text-right font-mono text-sm tabular-nums whitespace-nowrap">{planet.longitude}</TableCell>
                                    <TableCell className="py-2.5 text-neutral-400 text-sm">{planet.nakshatra}</TableCell>
                                    <TableCell className="py-2.5 text-neutral-400 text-center text-sm">{planet.pada}</TableCell>
                                    <TableCell className="py-2.5 text-neutral-400 text-right font-mono text-xs tabular-nums">
                                        {planet.isAscendant ? '-' : planet.speed.toFixed(4)}
                                    </TableCell>
                                    <TableCell className="py-2.5 text-center">
                                        {planet.retrograde && (
                                            <span className="text-status-error font-bold text-xs">R</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3 p-4">
                    {formattedPlanets.map((planet) => (
                        <div key={planet.name} className="bg-white border border-skyblue-200/50 rounded-lg p-3 shadow-[0_2px_8px_rgba(91,163,208,0.05)] space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className={`font-medium ${planet.isAscendant ? 'text-status-error font-bold' : getPlanetColor(planet.name)}`}>
                                    {planet.name}
                                    {planet.retrograde && <span className="ml-2 text-status-error text-xs font-bold">(R)</span>}
                                </h3>
                                <span className="text-sm text-neutral-400">{planet.sign}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm border-t border-skyblue-100 pt-2">
                                <div>
                                    <span className="text-neutral-300 text-xs block">Longitude</span>
                                    <span className="font-mono text-neutral-500 whitespace-nowrap">{planet.longitude}</span>
                                </div>
                                <div>
                                    <span className="text-neutral-300 text-xs block">Nakshatra</span>
                                    <span className="text-neutral-500">{planet.nakshatra}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
