import React from 'react';
import type { PlanetPosition, House } from '../api/client';
import { getPlanetShortName } from '../lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getTerm } from '../data/glossary';

interface Props {
    planets: PlanetPosition[];
    houses: House[];
}

export const NorthIndianChart: React.FC<Props> = ({ planets, houses }) => {
    // Standard North Indian Chart House Centers (for text placement)
    // 400x400 Grid
    const houseCenters = [
        { x: 200, y: 80 },  // H1 (Top Diamond)
        { x: 100, y: 40 },  // H2 (Top Left)
        { x: 40, y: 100 },  // H3 (Left Top)
        { x: 100, y: 200 }, // H4 (Left Diamond)
        { x: 40, y: 300 },  // H5 (Left Bottom)
        { x: 100, y: 360 }, // H6 (Bottom Left)
        { x: 200, y: 320 }, // H7 (Bottom Diamond)
        { x: 300, y: 360 }, // H8 (Bottom Right)
        { x: 360, y: 300 }, // H9 (Right Bottom)
        { x: 300, y: 200 }, // H10 (Right Diamond)
        { x: 360, y: 100 }, // H11 (Right Top)
        { x: 300, y: 40 },  // H12 (Top Right)
    ];

    // House Number Indicator Positions (Approximate corners/edges)
    const houseNumPos = [
        { x: 200, y: 140 }, // H1
        { x: 140, y: 20 },  // H2
        { x: 20, y: 140 },  // H3
        { x: 140, y: 200 }, // H4
        { x: 20, y: 260 },  // H5
        { x: 140, y: 380 }, // H6
        { x: 200, y: 260 }, // H7
        { x: 260, y: 380 }, // H8
        { x: 380, y: 260 }, // H9
        { x: 260, y: 200 }, // H10
        { x: 380, y: 140 }, // H11
        { x: 260, y: 20 },  // H12
    ];

    const getPlanetsInHouse = (houseNum: number) => {
        return planets.filter(p => p.house === houseNum).map(p => ({
            name: p.name,
            short: getPlanetShortName(p.name),
            isRetro: p.retrograde
        }));
    };

    const getSignForHouse = (houseNum: number) => {
        return houses.find(h => h.number === houseNum)?.sign.substring(0, 3).toUpperCase() || '';
    };

    return (
        <div className="w-full h-full flex flex-col items-center bg-transparent">
            <div className="w-full h-full relative aspect-square">
                <svg width="100%" height="100%" viewBox="0 0 400 400" className="w-full h-full bg-white rounded-xl shadow-[0_2px_8px_rgba(91,163,208,0.08)]">
                    {/* Background */}
                    <rect x="0" y="0" width="400" height="400" fill="white" />

                    {/* Diamond Grid Borders */}
                    {/* Outer Box */}
                    <rect x="0" y="0" width="400" height="400" fill="none" className="stroke-skyblue-200/50" strokeWidth="1" />
                    {/* Cross Diagonals */}
                    <line x1="0" y1="0" x2="400" y2="400" className="stroke-skyblue-200/50" strokeWidth="1" />
                    <line x1="400" y1="0" x2="0" y2="400" className="stroke-skyblue-200/50" strokeWidth="1" />
                    {/* Inner Diamond */}
                    <polygon points="200,0 0,200 200,400 400,200" fill="none" className="stroke-skyblue-200/50" strokeWidth="1" />

                    {/* House Content */}
                    {houseCenters.map((pos, i) => {
                        const houseNum = i + 1;
                        const planetsList = getPlanetsInHouse(houseNum);
                        // const isAscendantInSign = ascendantSign === ascendantSign; // Logic check below
                        return (
                            <g key={houseNum}>
                                {/* Ascendant Marker (House 1) - Red Circle */}
                                {houseNum === 1 && (
                                    <circle cx={pos.x} cy={pos.y} r="45" fill="none" stroke="#D97777" strokeWidth="1" strokeDasharray="4 2" opacity="0.3" />
                                )}

                                {/* Content */}
                                <HouseInfo
                                    x={pos.x}
                                    y={pos.y}
                                    planets={planetsList}
                                    sign={getSignForHouse(houseNum)}
                                    isAscendant={houseNum === 1}
                                />
                            </g>
                        );
                    })}

                    {/* House Numbers (Small Circles) */}
                    {houseNumPos.map((pos, i) => (
                        <g key={`num-${i}`}>
                            <circle cx={pos.x} cy={pos.y} r="10" className="fill-skyblue-50 stroke-skyblue-200/50" strokeWidth="1" />
                            <text x={pos.x} y={pos.y} dy="4" textAnchor="middle" fontSize="11" className="fill-neutral-400" fontWeight="bold">
                                {i + 1}
                            </text>
                        </g>
                    ))}

                </svg>
            </div>
        </div>
    );
};

const HouseInfo: React.FC<{ x: number, y: number, planets: { name: string, short: string, isRetro: boolean }[], sign: string, isAscendant: boolean }> = ({ x, y, planets, sign, isAscendant }) => (
    <foreignObject x={x - 45} y={y - 45} width="90" height="90" className="overflow-visible pointer-events-none">
        <div className="flex flex-col items-center justify-center h-full w-full pointer-events-auto">
            {/* Sign Name */}
            <span className="text-[10px] uppercase tracking-[1.5px] font-bold text-neutral-300 mb-0.5 leading-none">
                {sign}
            </span>

            {/* ASC Label if House 1 */}
            {isAscendant && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="text-[10px] font-black text-violet-500 cursor-help mb-0.5 leading-none hover:bg-violet-50 rounded px-0.5">
                                ASC
                            </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-violet-900 border-violet-700 text-white max-w-xs z-50">
                            {getTerm('Lagna')?.definition}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}

            {/* Planets */}
            <div className="flex flex-wrapjustify-center gap-0.5 items-center leading-none mt-0.5">
                {planets.map((p, i) => (
                    <TooltipProvider key={i}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className={`text-[11px] font-bold cursor-help inline-flex items-center ${p.name === 'Rahu' || p.name === 'Ketu' ? 'text-neutral-400' : 'text-neutral-600'}`}>
                                    {p.short}
                                    {p.isRetro && <span className="text-[8px] text-violet-400 ml-[1px]">®</span>}
                                    {i < planets.length - 1 && <span className="mx-0.5 opacity-30"> </span>}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent className="bg-violet-900 border-violet-700 text-white z-50">
                                <p className="font-bold mb-1">{p.name} {p.isRetro ? '(Retrograde)' : ''}</p>
                                {getTerm(p.name) && <p className="text-xs opacity-80">{getTerm(p.name)?.definition}</p>}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>
        </div>
    </foreignObject>
);
