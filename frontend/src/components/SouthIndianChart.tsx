
import React from 'react';
import type { PlanetPosition } from '../api/client';

interface Props {
    planets: PlanetPosition[];
    ascendantSign: string;
}

export const SouthIndianChart: React.FC<Props> = ({ planets, ascendantSign }) => {
    // 12 Boxes fixed positions for South Indian Chart
    // Top Row: Pisces, Aries, Taurus, Gemini
    // Right Col: Gemini, Cancer, Leo, Virgo
    // Bottom Row: Virgo, Libra, Scorpio, Sagittarius
    // Left Col: Sagittarius, Capricorn, Aquarius, Pisces

    // Actually, standard South Indian is clockwise from top-left (Pisces) but usually:
    // Row 1: Pisces, Aries, Taurus, Gemini
    // Col 4 (down): Cancer, Leo
    // Row 4 (left): Virgo, Libra, Scorpio, Sagittarius
    // ... wait, let's stick to the grid layout.

    // Grid 4x4
    // 0,0: Pisces  0,1: Aries    0,2: Taurus   0,3: Gemini
    // 1,0: Aquarius                            1,3: Cancer
    // 2,0: Capricorn                           2,3: Leo
    // 3,0: Sagittarius 3,1: Scorpio 3,2: Libra 3,3: Virgo

    // Define grid positions for each sign (css grid area-like)
    // We'll use a CSS grid container with specific placement

    const getPlanetsInSign = (sign: string) => {
        const inSign = planets.filter(p => p.sign === sign).map(p => p.name.substring(0, 2));
        if (ascendantSign === sign) {
            inSign.unshift('ASC');
        }
        return inSign;
    };

    return (
        <div className="w-full h-full flex flex-col items-center bg-transparent">
            <div className="w-full h-full relative aspect-square">
                <div className="grid w-full h-full grid-cols-4 grid-rows-4 gap-[2px] bg-neutral-300 dark:bg-white/10 border-2 border-neutral-300 dark:border-white/10">
                    {/* Pisces (0,0) */}
                    <ChartBox sign="Pisces" planets={getPlanetsInSign("Pisces")} />
                    {/* Aries (0,1) */}
                    <ChartBox sign="Aries" planets={getPlanetsInSign("Aries")} />
                    {/* Taurus (0,2) */}
                    <ChartBox sign="Taurus" planets={getPlanetsInSign("Taurus")} />
                    {/* Gemini (0,3) */}
                    <ChartBox sign="Gemini" planets={getPlanetsInSign("Gemini")} />

                    {/* Aquarius (1,0) */}
                    <ChartBox sign="Aquarius" planets={getPlanetsInSign("Aquarius")} />
                    {/* Center Space (1,1 span 2x2) */}
                    <div style={{ gridColumn: '2 / 4', gridRow: '2 / 4', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div className="text-lg font-bold text-primary">South Indian</div>
                            <div className="text-sm text-muted-foreground">Rashi Chakra</div>
                        </div>
                    </div>
                    {/* Cancer (1,3) */}
                    <ChartBox sign="Cancer" planets={getPlanetsInSign("Cancer")} />

                    {/* Capricorn (2,0) */}
                    <ChartBox sign="Capricorn" planets={getPlanetsInSign("Capricorn")} />
                    {/* Center covered above */}
                    {/* Leo (2,3) */}
                    <ChartBox sign="Leo" planets={getPlanetsInSign("Leo")} />

                    {/* Sagittarius (3,0) */}
                    <ChartBox sign="Sagittarius" planets={getPlanetsInSign("Sagittarius")} />
                    {/* Scorpio (3,1) */}
                    <ChartBox sign="Scorpio" planets={getPlanetsInSign("Scorpio")} />
                    {/* Libra (3,2) */}
                    <ChartBox sign="Libra" planets={getPlanetsInSign("Libra")} />
                    {/* Virgo (3,3) */}
                    <ChartBox sign="Virgo" planets={getPlanetsInSign("Virgo")} />

                </div>
            </div>
        </div>
    );
};

const ChartBox: React.FC<{ sign: string, planets: string[] }> = ({ sign, planets }) => {
    const isAscendant = planets.includes('ASC');

    return (
        <div className={`p-1 relative flex flex-wrap gap-1 content-start overflow-hidden ${isAscendant ? 'bg-red-500/10' : 'bg-card'}`}>
            {/* Ascendant Marker Border */}
            {isAscendant && (
                <div className="absolute inset-0 border-2 border-dashed border-red-500/50 pointer-events-none" />
            )}

            {/* Sign Label */}
            <div className="absolute bottom-0.5 right-1 text-[0.6rem] text-muted-foreground uppercase tracking-wider">
                {sign}
            </div>

            {/* Planets */}
            {planets.map(p => (
                <span key={p} className={`text-xs font-bold ${p === 'ASC' ? 'text-red-500' : 'text-foreground'}`}>
                    {p}
                </span>
            ))}
        </div>
    );
};
