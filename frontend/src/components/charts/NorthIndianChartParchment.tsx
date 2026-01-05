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

                        {/* Diagonal lines forming diamond - Sky Blue */}
                        <line x1="2" y1="2" x2="398" y2="398" stroke="#38BDF8" strokeWidth="2.5" />
                        <line x1="398" y1="2" x2="2" y2="398" stroke="#38BDF8" strokeWidth="2.5" />

                        {/* Horizontal and vertical center lines - Sky Blue */}
                        <line x1="100" y1="100" x2="300" y2="300" stroke="#38BDF8" strokeWidth="2.5" />
                        <line x1="100" y1="300" x2="300" y2="100" stroke="#38BDF8" strokeWidth="2.5" />

                        {/* Adjusted Diamond structure for North style */}
                        <line x1="200" y1="2" x2="2" y2="200" stroke="#38BDF8" strokeWidth="2.5" />
                        <line x1="2" y1="200" x2="200" y2="398" stroke="#38BDF8" strokeWidth="2.5" />
                        <line x1="200" y1="398" x2="398" y2="200" stroke="#38BDF8" strokeWidth="2.5" />
                        <line x1="398" y1="200" x2="200" y2="2" stroke="#38BDF8" strokeWidth="2.5" />

                        {/* Houses Content */}
                        {houses.map(house => {
                            const planetsInHouse = planetsByHouse[house.number] || [];
                            const positions = [
                                { x: 200, y: 100 }, // 1
                                { x: 130, y: 60 },  // 2
                                { x: 60, y: 130 },  // 3
                                { x: 100, y: 200 }, // 4
                                { x: 60, y: 270 },  // 5
                                { x: 130, y: 340 }, // 6
                                { x: 200, y: 300 }, // 7
                                { x: 270, y: 340 }, // 8
                                { x: 340, y: 270 }, // 9
                                { x: 300, y: 200 }, // 10
                                { x: 340, y: 130 }, // 11
                                { x: 270, y: 60 }   // 12
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
                            const startY = center.y + 5 - (totalHeight / 2) + (lineHeight / 2);

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
                                        <circle cx={center.x} cy={center.y - 45} r="10" fill="white" fillOpacity="0.8" />
                                        <text
                                            x={center.x}
                                            y={center.y - 41}
                                            fontSize="10"
                                            fontWeight="800"
                                            fill="#4f46e5"
                                            textAnchor="middle"
                                        >
                                            {house.number}
                                        </text>
                                    </g>

                                    <text
                                        x={center.x + 20}
                                        y={center.y + 40}
                                        fontSize="12"
                                        fontWeight="bold"
                                        fill="#0ea5e9"
                                        opacity="0.6"
                                    >
                                        {house.sign.slice(0, 2)}
                                    </text>
                                </g>
                            );
                        })}

                        <g pointerEvents="none">
                            <text
                                x="200"
                                y="180"
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
                                    <text x="200" y="215" fontSize="15" fill="#6366F1" fontWeight="700" textAnchor="middle">
                                        Rasi Chart
                                    </text>
                                    <text x="200" y="235" fontSize="10" fill="#1e40af" fontWeight="600" textAnchor="middle">
                                        {birthDetails.name || 'User'}
                                    </text>
                                    <text x="200" y="250" fontSize="9" fill="#64748b" textAnchor="middle">
                                        {birthDetails.date} • {birthDetails.time}
                                    </text>
                                    <text x="200" y="262" fontSize="8" fill="#94a3b8" textAnchor="middle">
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
