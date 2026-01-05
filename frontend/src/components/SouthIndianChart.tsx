
import React from 'react';
import type { PlanetPosition } from '../api/client';
import { getPlanetShortName } from '../lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getTerm } from '../data/glossary';

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
        const inSign = planets.filter(p => p.sign === sign).map(p => ({
            name: p.name,
            short: getPlanetShortName(p.name),
            isRetro: p.retrograde
        }));
        return inSign;
    };


    return (
        <div className="w-full h-full flex flex-col items-center bg-transparent">
            <div className="w-full h-full relative aspect-square">
                <div className="grid w-full h-full grid-cols-4 grid-rows-4 gap-[1px] bg-skyblue-200/50 border border-skyblue-200/50 rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(91,163,208,0.08)]">
                    {/* Pisces (0,0) */}
                    <ChartBox sign="Pisces" planets={getPlanetsInSign("Pisces")} isLagna={ascendantSign === "Pisces"} />
                    {/* Aries (0,1) */}
                    <ChartBox sign="Aries" planets={getPlanetsInSign("Aries")} isLagna={ascendantSign === "Aries"} />
                    {/* Taurus (0,2) */}
                    <ChartBox sign="Taurus" planets={getPlanetsInSign("Taurus")} isLagna={ascendantSign === "Taurus"} />
                    {/* Gemini (0,3) */}
                    <ChartBox sign="Gemini" planets={getPlanetsInSign("Gemini")} isLagna={ascendantSign === "Gemini"} />

                    {/* Aquarius (1,0) */}
                    <ChartBox sign="Aquarius" planets={getPlanetsInSign("Aquarius")} isLagna={ascendantSign === "Aquarius"} />
                    {/* Center Space (1,1 span 2x2) */}
                    <div className="bg-white" style={{ gridColumn: '2 / 4', gridRow: '2 / 4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="text-center p-4">
                            <div className="text-lg font-black text-violet-600 tracking-tighter uppercase">Rashi</div>
                            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Main Chart</div>
                        </div>
                    </div>
                    {/* Cancer (1,3) */}
                    <ChartBox sign="Cancer" planets={getPlanetsInSign("Cancer")} isLagna={ascendantSign === "Cancer"} />

                    {/* Capricorn (2,0) */}
                    <ChartBox sign="Capricorn" planets={getPlanetsInSign("Capricorn")} isLagna={ascendantSign === "Capricorn"} />
                    {/* Leo (2,3) */}
                    <ChartBox sign="Leo" planets={getPlanetsInSign("Leo")} isLagna={ascendantSign === "Leo"} />

                    {/* Sagittarius (3,0) */}
                    <ChartBox sign="Sagittarius" planets={getPlanetsInSign("Sagittarius")} isLagna={ascendantSign === "Sagittarius"} />
                    {/* Scorpio (3,1) */}
                    <ChartBox sign="Scorpio" planets={getPlanetsInSign("Scorpio")} isLagna={ascendantSign === "Scorpio"} />
                    {/* Libra (3,2) */}
                    <ChartBox sign="Libra" planets={getPlanetsInSign("Libra")} isLagna={ascendantSign === "Libra"} />
                    {/* Virgo (3,3) */}
                    <ChartBox sign="Virgo" planets={getPlanetsInSign("Virgo")} isLagna={ascendantSign === "Virgo"} />
                </div>
            </div>
        </div>
    );
};

interface BoxProps {
    sign: string;
    planets: { name: string, short: string, isRetro: boolean }[];
    isLagna: boolean;
}

const ChartBox: React.FC<BoxProps> = ({ sign, planets, isLagna }) => {
    return (
        <div className={`p-1.5 relative flex flex-wrap gap-1 content-start overflow-hidden transition-colors ${isLagna ? 'bg-violet-50/50' : 'bg-white'}`}>
            {isLagna && (
                <div className="absolute inset-0 border-2 border-dashed border-violet-200/50" />
            )}

            <div className="absolute bottom-0.5 right-1.5 text-[0.55rem] font-bold text-neutral-300 uppercase tracking-widest">
                {sign.substring(0, 3)}
            </div>

            {isLagna && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="text-[10px] font-black text-violet-500 bg-violet-100/50 px-1 rounded mr-0.5 shadow-sm cursor-help">
                                ASC
                            </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-violet-900 border-violet-700 text-white max-w-xs z-50">
                            {getTerm('Lagna')?.definition}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}

            {planets.map(p => (
                <TooltipProvider key={p.name}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span
                                className={`text-xs font-bold cursor-help flex items-center gap-0.5 ${p.name === 'Rahu' || p.name === 'Ketu' ? 'text-neutral-400' : 'text-neutral-600'}`}
                            >
                                {p.short}
                                {p.isRetro && <span className="text-[9px] text-violet-400 font-black">®</span>}
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
    );
};
