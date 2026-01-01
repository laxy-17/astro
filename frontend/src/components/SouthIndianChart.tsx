
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
        <div className="panel" style={{ minHeight: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#F9F7FF', padding: '16px' }}>
            <div className="panel-header" style={{ width: '100%', marginBottom: '16px', background: '#7C3AED' }}>Rashi (D-1)</div>
            <div style={{ padding: '0', width: '100%', maxWidth: '400px', aspectRatio: '1/1', display: 'flex', justifyContent: 'center' }}>
                <div style={{
                    display: 'grid',
                    width: '100%',
                    height: '100%',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr',
                    gridTemplateRows: '1fr 1fr 1fr 1fr',
                    gap: '2px',
                    background: '#7C3AED', // Grid lines color
                    border: '2px solid #7C3AED'
                }}>
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
                    <div style={{ gridColumn: '2 / 4', gridRow: '2 / 4', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#7C3AED' }}>South Indian</div>
                            <div style={{ fontSize: '0.8rem', color: '#999' }}>Rashi Chakra</div>
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
        <div style={{
            background: isAscendant ? '#FEF2F2' : 'white', // Highlight ASC box
            padding: '4px',
            fontSize: '0.8rem',
            position: 'relative',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            alignContent: 'start',
            overflow: 'hidden'
        }}>
            {/* Ascendant Marker Border */}
            {isAscendant && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    border: '2px dashed #EF4444',
                    opacity: 0.5,
                    pointerEvents: 'none'
                }} />
            )}

            {/* Sign Label */}
            <div style={{
                position: 'absolute',
                bottom: '2px',
                right: '4px',
                fontSize: '0.65rem',
                color: '#999',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            }}>
                {sign}
            </div>

            {/* Planets */}
            {planets.map(p => (
                <span key={p} style={{
                    fontWeight: '600',
                    color: p === 'ASC' ? '#EF4444' : '#1F2937',
                    fontSize: '0.85rem'
                }}>
                    {p}
                </span>
            ))}
        </div>
    );
};
