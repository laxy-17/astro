import React from 'react';
import type { PlanetPosition, House } from '../../api/client';
import { getPlanetShortName } from '../../lib/utils';
import '../../styles/parchment-skyblue.css';

interface Props {
    planets: PlanetPosition[];
    houses: House[];
    birthDetails?: {
        name?: string;
        date: string;
        time: string;
        location: string;
    };
}

export const NorthIndianChartParchment: React.FC<Props> = ({
    planets,
    houses,
    birthDetails
}) => {
    // Group planets by house
    const planetsByHouse: Record<number, PlanetPosition[]> = {};
    planets.forEach(planet => {
        if (!planetsByHouse[planet.house]) {
            planetsByHouse[planet.house] = [];
        }
        planetsByHouse[planet.house].push(planet);
    });

    return (
        <div className="relative group flex flex-col items-center w-full h-full">
            <div className="relative overflow-hidden w-full h-full">
                {/* SVG Chart */}
                <div className="relative aspect-square w-full">
                    <svg
                        viewBox="0 0 400 400"
                        className="w-full h-full drop-shadow-sm"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Outer border - Violet */}
                        <rect x="2" y="2" width="396" height="396" fill="none" stroke="#6366F1" strokeWidth="4" />

                        {/* Diagonal lines forming diamond - Sky Blue - Broken in Center */}
                        <line x1="2" y1="2" x2="150" y2="150" stroke="#38BDF8" strokeWidth="2.5" />
                        <line x1="250" y1="250" x2="398" y2="398" stroke="#38BDF8" strokeWidth="2.5" />

                        <line x1="398" y1="2" x2="250" y2="150" stroke="#38BDF8" strokeWidth="2.5" />
                        <line x1="150" y1="250" x2="2" y2="398" stroke="#38BDF8" strokeWidth="2.5" />

                        {/* Horizontal and vertical center lines - Sky Blue */}
                        {/* Horizontal and vertical center lines - Removed to clear center text space */}
                        {/* <line x1="100" y1="100" x2="300" y2="300" stroke="#38BDF8" strokeWidth="2.5" /> */}
                        {/* <line x1="100" y1="300" x2="300" y2="100" stroke="#38BDF8" strokeWidth="2.5" /> */}

                        {/* Adjusted Diamond structure for North style */}
                        <line x1="200" y1="2" x2="2" y2="200" stroke="#38BDF8" strokeWidth="2.5" />
                        <line x1="2" y1="200" x2="200" y2="398" stroke="#38BDF8" strokeWidth="2.5" />
                        <line x1="200" y1="398" x2="398" y2="200" stroke="#38BDF8" strokeWidth="2.5" />
                        <line x1="398" y1="200" x2="200" y2="2" stroke="#38BDF8" strokeWidth="2.5" />

                        {/* Houses Content */}
                        {houses.map(house => {
                            const planetsInHouse = planetsByHouse[house.number] || [];
                            const positions = [
                                { x: 200, y: 100 }, // 1 (Rhombus Center)
                                { x: 100, y: 35 },  // 2 (Triangle Top-Left)
                                { x: 35, y: 100 },  // 3 (Triangle Left-Top)
                                { x: 100, y: 200 }, // 4 (Rhombus Center)
                                { x: 35, y: 300 },  // 5 (Triangle Left-Bottom)
                                { x: 100, y: 365 }, // 6 (Triangle Bottom-Left)
                                { x: 200, y: 300 }, // 7 (Rhombus Center)
                                { x: 300, y: 365 }, // 8 (Triangle Bottom-Right)
                                { x: 365, y: 300 }, // 9 (Triangle Right-Bottom)
                                { x: 300, y: 200 }, // 10 (Rhombus Center)
                                { x: 365, y: 100 }, // 11 (Triangle Right-Top)
                                { x: 300, y: 35 }   // 12 (Triangle Top-Right)
                            ];
                            const center = positions[house.number - 1];

                            // Chunk planets for wrapping (3 per line)
                            const planetNames = planetsInHouse.map(p => getPlanetShortName(p.name));
                            const uniquePlanets = Array.from(new Set(planetNames)); // Dedupe if needed
                            const chunkSize = 3;
                            const chunks = [];
                            for (let i = 0; i < uniquePlanets.length; i += chunkSize) {
                                chunks.push(uniquePlanets.slice(i, i + chunkSize));
                            }

                            // Calculate starting Y to center the block vertically
                            // Base Y is center.y. 
                            // If 1 line, y=center.y+5. 
                            // If 2 lines, start higher.
                            const lineHeight = 16;
                            const totalHeight = chunks.length * lineHeight;

                            // Move text slightly lower (center.y + 15) to sit below the number
                            const startY = center.y + 15 - (totalHeight / 2) + (lineHeight / 2);

                            // Calculate sign position dynamically below the last line of planets
                            // If no planets, place it slightly below the visual center
                            const signY = chunks.length > 0
                                ? startY + ((chunks.length - 1) * lineHeight) + 14
                                : center.y + 10;

                            return (
                                <g key={house.number}>
                                    <text
                                        x={center.x}
                                        y={startY}
                                        fontSize="14"
                                        fontWeight="600"
                                        fill="#1e3a8a"
                                        textAnchor="middle"
                                    >
                                        {chunks.map((chunk, i) => (
                                            <tspan key={i} x={center.x} dy={i === 0 ? 0 : lineHeight}>
                                                {chunk.join(' ')}
                                            </tspan>
                                        ))}
                                    </text>

                                    <g>
                                        {/* Number circle closer to center (y - 20) */}
                                        <circle cx={center.x} cy={center.y - 20} r="10" fill="white" fillOpacity="0.8" />
                                        <text
                                            x={center.x}
                                            y={center.y - 16}
                                            fontSize="10"
                                            fontWeight="800"
                                            fill="#4f46e5"
                                            textAnchor="middle"
                                        >
                                            {house.number}
                                        </text>
                                    </g>

                                    <text
                                        x={center.x}
                                        y={signY}
                                        fontSize="12"
                                        fontWeight="bold"
                                        fill="#0ea5e9"
                                        opacity="0.6"
                                        textAnchor="middle"
                                    >
                                        {house.sign.slice(0, 2)}
                                    </text>
                                </g>
                            );
                        })}

                        <g pointerEvents="none">
                            <text
                                x="200"
                                y="145"
                                fontSize="70"
                                fontWeight="bold"
                                fill="#0ea5e9"
                                opacity="0.1"
                                textAnchor="middle"
                                fontFamily="serif"
                            >
                                ॐ
                            </text>

                            {birthDetails && (
                                <>
                                    <text x="200" y="180" fontSize="15" fill="#6366F1" fontWeight="700" textAnchor="middle">
                                        Rasi Chart
                                    </text>
                                    <text x="200" y="200" fontSize="10" fill="#1e40af" fontWeight="600" textAnchor="middle">
                                        {birthDetails.name || 'User'}
                                    </text>
                                    <text x="200" y="215" fontSize="9" fill="#64748b" textAnchor="middle">
                                        {birthDetails.date} • {birthDetails.time}
                                    </text>
                                    <text x="200" y="227" fontSize="8" fill="#94a3b8" textAnchor="middle">
                                        {birthDetails.location}
                                    </text>
                                </>
                            )}
                        </g>

                        <text x="380" y="380" fontSize="8" fill="#cbd5e1" textAnchor="end" fontStyle="italic">
                            Generated by 8Stro.com
                        </text>
                    </svg>
                </div>
            </div>
        </div>
    );
};
