import React from 'react';
import type { PlanetPosition, House } from '../api/client';

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
        return planets.filter(p => p.house === houseNum).map(p => p.name.substring(0, 2));
    };

    const getSignForHouse = (houseNum: number) => {
        return houses.find(h => h.number === houseNum)?.sign.substring(0, 3).toUpperCase() || '';
    };

    return (
        <div className="w-full h-full flex flex-col items-center bg-transparent">
            <div className="w-full h-full relative aspect-square">
                <svg width="100%" height="100%" viewBox="0 0 400 400" className="w-full h-full">
                    {/* Background */}
                    <rect x="0" y="0" width="400" height="400" className="fill-card" />

                    {/* Diamond Grid Borders */}
                    {/* Outer Box */}
                    <rect x="0" y="0" width="400" height="400" fill="none" className="stroke-neutral-400 dark:stroke-white/20" strokeWidth="2" />
                    {/* Cross Diagonals */}
                    <line x1="0" y1="0" x2="400" y2="400" className="stroke-neutral-400 dark:stroke-white/20" strokeWidth="2" />
                    <line x1="400" y1="0" x2="0" y2="400" className="stroke-neutral-400 dark:stroke-white/20" strokeWidth="2" />
                    {/* Inner Diamond */}
                    <polygon points="200,0 0,200 200,400 400,200" fill="none" className="stroke-neutral-400 dark:stroke-white/20" strokeWidth="2" />

                    {/* House Content */}
                    {houseCenters.map((pos, i) => {
                        const houseNum = i + 1;
                        const planetsList = getPlanetsInHouse(houseNum);
                        const sign = getSignForHouse(houseNum);

                        return (
                            <g key={houseNum}>
                                {/* Ascendant Marker (House 1) - Red Circle */}
                                {houseNum === 1 && (
                                    <circle cx={pos.x} cy={pos.y} r="45" fill="none" stroke="#EF4444" strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />
                                )}

                                {/* Content */}
                                <HouseInfo
                                    x={pos.x}
                                    y={pos.y}
                                    planets={planetsList}
                                    sign={sign}
                                    isAscendant={houseNum === 1}
                                />
                            </g>
                        );
                    })}

                    {/* House Numbers (Small Circles) */}
                    {houseNumPos.map((pos, i) => (
                        <g key={`num-${i}`}>
                            <circle cx={pos.x} cy={pos.y} r="10" className="fill-card stroke-neutral-400 dark:stroke-white/20" strokeWidth="1" />
                            <text x={pos.x} y={pos.y} dy="4" textAnchor="middle" fontSize="11" className="fill-muted-foreground" fontWeight="bold">
                                {i + 1}
                            </text>
                        </g>
                    ))}

                </svg>
            </div>
        </div>
    );
};

const HouseInfo: React.FC<{ x: number, y: number, planets: string[], sign: string, isAscendant: boolean }> = ({ x, y, planets, sign, isAscendant }) => (
    <text x={x} y={y} textAnchor="middle" className="fill-foreground">
        {/* Sign Name */}
        <tspan x={x} dy="-14" fontSize="10" className="fill-muted-foreground" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{sign}</tspan>

        {/* ASC Label if House 1 */}
        {isAscendant && (
            <tspan x={x} dy="14" fill="#EF4444" fontWeight="bold" fontSize="12">ASC</tspan>
        )}

        {/* Planets */}
        {planets.length > 0 && (
            <tspan x={x} dy={isAscendant ? "14" : "16"} fontWeight="700" fontSize="13">
                {planets.map((p, i) => (
                    <tspan key={i} className="fill-foreground">{p} </tspan>
                ))}
            </tspan>
        )}
    </text>
);
