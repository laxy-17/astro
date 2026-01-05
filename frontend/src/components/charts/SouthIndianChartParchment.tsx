import React from 'react';
import type { PlanetPosition } from '../../api/client';
import { getPlanetShortName } from '../../lib/utils';
import '../../styles/parchment-skyblue.css';

interface Props {
    planets: PlanetPosition[];
    ascendantSign: string;
    birthDetails?: {
        name?: string;
        date: string;
        time: string;
        location: string;
    };
}

export const SouthIndianChartParchment: React.FC<Props> = ({
    planets,
    ascendantSign,
    birthDetails
}) => {
    // Group planets by sign
    const planetsBySign: Record<string, PlanetPosition[]> = {};
    planets.forEach(planet => {
        if (!planetsBySign[planet.sign]) {
            planetsBySign[planet.sign] = [];
        }
        planetsBySign[planet.sign].push(planet);
    });

    // Sign positions in 4x4 grid (clockwise)
    const signPositions: Record<string, { x: number, y: number, name: string }> = {
        'Pisces': { x: 0, y: 0, name: 'Pi' },
        'Aries': { x: 1, y: 0, name: 'Ar' },
        'Taurus': { x: 2, y: 0, name: 'Ta' },
        'Gemini': { x: 3, y: 0, name: 'Ge' },
        'Cancer': { x: 3, y: 1, name: 'Ca' },
        'Leo': { x: 3, y: 2, name: 'Le' },
        'Virgo': { x: 3, y: 3, name: 'Vi' },
        'Libra': { x: 2, y: 3, name: 'Li' },
        'Scorpio': { x: 1, y: 3, name: 'Sc' },
        'Sagittarius': { x: 0, y: 3, name: 'Sg' },
        'Capricorn': { x: 0, y: 2, name: 'Cp' },
        'Aquarius': { x: 0, y: 1, name: 'Aq' }
    };

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
                        {/* 4x4 Outer Grid - Violet */}
                        <rect x="2" y="2" width="396" height="396" fill="none" stroke="#6366F1" strokeWidth="4" />

                        {/* Internal Lines - Sky Blue */}
                        <line x1="105" y1="2" x2="105" y2="398" stroke="#38BDF8" strokeWidth="2.5" />

                        {/* Middle Vertical - Broken in center */}
                        <line x1="200" y1="2" x2="200" y2="105" stroke="#38BDF8" strokeWidth="2.5" />
                        <line x1="200" y1="295" x2="200" y2="398" stroke="#38BDF8" strokeWidth="2.5" />

                        <line x1="295" y1="2" x2="295" y2="398" stroke="#38BDF8" strokeWidth="2.5" />

                        <line x1="2" y1="105" x2="398" y2="105" stroke="#38BDF8" strokeWidth="2.5" />

                        {/* Middle Horizontal - Broken in center */}
                        <line x1="2" y1="200" x2="105" y2="200" stroke="#38BDF8" strokeWidth="2.5" />
                        <line x1="295" y1="200" x2="398" y2="200" stroke="#38BDF8" strokeWidth="2.5" />

                        <line x1="2" y1="295" x2="398" y2="295" stroke="#38BDF8" strokeWidth="2.5" />

                        {/* Render each sign's planets */}
                        {Object.entries(signPositions).map(([signName, pos]) => {
                            const planetsInSign = planetsBySign[signName] || [];
                            const startX = 10 + pos.x * 95;
                            const startY = 10 + pos.y * 95;

                            // Chunk planets for wrapping
                            const planetNames = planetsInSign.map(p => getPlanetShortName(p.name));
                            const uniquePlanets = Array.from(new Set(planetNames));
                            const chunkSize = 3;
                            const chunks = [];
                            for (let i = 0; i < uniquePlanets.length; i += chunkSize) {
                                chunks.push(uniquePlanets.slice(i, i + chunkSize));
                            }

                            const lineHeight = 16;
                            const totalHeight = chunks.length * lineHeight;
                            // Centered vertically relative to the cell (approx center is +45)
                            const textStartY = startY + 45 - (totalHeight / 2) + (lineHeight / 2);

                            return (
                                <g key={signName}>
                                    {/* Planets - Dark Gray/Blue */}
                                    <text
                                        x={startX + 47}
                                        y={textStartY}
                                        fontSize="14"
                                        fontWeight="600"
                                        fill="#1e3a8a"
                                        textAnchor="middle"
                                    >
                                        {chunks.map((chunk, i) => (
                                            <tspan key={i} x={startX + 47} dy={i === 0 ? 0 : lineHeight}>
                                                {chunk.join(' ')}
                                            </tspan>
                                        ))}
                                    </text>

                                    {/* Sign Name - Sky Blue */}
                                    <text
                                        x={startX + 10}
                                        y={startY + 20}
                                        fontSize="14"
                                        fontWeight="bold"
                                        fill="#38BDF8"
                                        opacity="0.8"
                                    >
                                        {pos.name}
                                    </text>

                                    {/* House Indicator - Small Circle in corner if it's Ascendant */}
                                    {signName === ascendantSign && (
                                        <g>
                                            <circle cx={startX + 80} cy={startY + 20} r="10" fill="#f5f3ff" stroke="#6366F1" strokeWidth="1.5" />
                                            <text x={startX + 80} y={startY + 24} fontSize="10" fontWeight="bold" fill="#6366F1" textAnchor="middle">As</text>
                                        </g>
                                    )}
                                </g>
                            );
                        })}

                        {/* CENTER PANEL */}
                        <g>
                            {/* Watermark Om */}
                            <text
                                x="200"
                                y="145"
                                fontSize="70"
                                fontWeight="bold"
                                fill="#0ea5e9"
                                opacity="0.12"
                                textAnchor="middle"
                                fontFamily="serif"
                            >
                                ॐ
                            </text>

                            {/* Birth Details Hierarchy */}
                            {birthDetails && (
                                <>
                                    <text x="200" y="180" fontSize="16" fill="#6366F1" fontWeight="700" textAnchor="middle">
                                        Rasi Chart
                                    </text>
                                    <text x="200" y="200" fontSize="11" fill="#1e40af" fontWeight="600" textAnchor="middle">
                                        {birthDetails.name || 'User'}
                                    </text>
                                    <text x="200" y="215" fontSize="10" fill="#64748b" textAnchor="middle">
                                        {birthDetails.date} • {birthDetails.time}
                                    </text>
                                    <text x="200" y="227" fontSize="9" fill="#94a3b8" textAnchor="middle" width="90">
                                        {birthDetails.location}
                                    </text>
                                </>
                            )}
                        </g>

                        {/* Branding Watermark */}
                        <text x="380" y="380" fontSize="8" fill="#cbd5e1" textAnchor="end" fontStyle="italic">
                            Generated by 8Stro.com
                        </text>
                    </svg>
                </div>
            </div>
        </div>
    );
};
