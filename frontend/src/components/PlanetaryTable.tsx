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

        if (name === 'Sun') return 'text-cosmic-gold';
        if (benefics.includes(name)) return 'text-astral-blue';
        if (malefics.includes(name)) return 'text-astral-red';
        return 'text-text-primary';
    };

    // Helper to format planet data for display
    const formattedPlanets = [
        {
            name: 'Ascendant',
            sign: ascendant.sign,
            longitude: formatDMS(ascendant.degree),
            nakshatra: '-',
            pada: calculatePada(ascendant.degree),
            speed: 0,
            retrograde: false,
            isAscendant: true
        },
        ...planets.map(p => ({
            name: p.name,
            sign: p.sign,
            longitude: formatDMS(p.longitude),
            nakshatra: p.nakshatra,
            pada: calculatePada(p.longitude),
            speed: p.speed,
            retrograde: p.retrograde,
            isAscendant: false
        }))
    ];

    return (
        <div className="panel h-full flex flex-col">
            <div className="panel-header py-3 px-4 flex justify-between items-center border-b border-border">
                <span className="font-semibold text-lg">Planetary Bodies</span>
            </div>

            <div className="panel-content p-0 overflow-auto flex-grow">
                {/* Desktop/Tablet Table View */}
                <div className="hidden md:block w-full">
                    <Table className="planetary-bodies-table w-full">
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b border-border/50">
                                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-text-secondary pl-4">Body</TableHead>
                                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-text-secondary">Sign</TableHead>
                                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-text-secondary text-right">Longitude</TableHead>
                                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-text-secondary">Nakshatra</TableHead>
                                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-text-secondary text-center">Pada</TableHead>
                                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-text-secondary text-right">Speed</TableHead>
                                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-text-secondary text-center">
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
                                        border-b border-border/30 hover:bg-muted/30 transition-colors
                                        ${index % 2 === 0 ? 'bg-muted/5' : 'bg-transparent'}
                                    `}
                                >
                                    <TableCell className={`py-2.5 pl-4 font-medium text-sm ${planet.isAscendant ? 'text-primary font-bold' : getPlanetColor(planet.name)}`}>
                                        {planet.name}
                                    </TableCell>
                                    <TableCell className="py-2.5 text-text-secondary text-sm">{planet.sign}</TableCell>
                                    <TableCell className="py-2.5 text-text-secondary text-right font-mono text-sm tabular-nums">{planet.longitude}</TableCell>
                                    <TableCell className="py-2.5 text-text-secondary text-sm">{planet.nakshatra}</TableCell>
                                    <TableCell className="py-2.5 text-text-secondary text-center text-sm">{planet.pada}</TableCell>
                                    <TableCell className="py-2.5 text-text-secondary text-right font-mono text-xs tabular-nums">
                                        {planet.isAscendant ? '-' : planet.speed.toFixed(4)}
                                    </TableCell>
                                    <TableCell className="py-2.5 text-center">
                                        {planet.retrograde && (
                                            <span className="text-astral-red font-bold text-xs">R</span>
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
                        <div key={planet.name} className="bg-card/50 border border-border rounded-lg p-3 shadow-sm space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className={`font-medium ${planet.isAscendant ? 'text-primary font-bold' : getPlanetColor(planet.name)}`}>
                                    {planet.name}
                                    {planet.retrograde && <span className="ml-2 text-astral-red text-xs font-bold">(R)</span>}
                                </h3>
                                <span className="text-sm text-text-secondary">{planet.sign}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm border-t border-border/40 pt-2">
                                <div>
                                    <span className="text-muted-foreground text-xs block">Longitude</span>
                                    <span className="font-mono text-foreground">{planet.longitude}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-xs block">Nakshatra</span>
                                    <span className="text-foreground">{planet.nakshatra}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
