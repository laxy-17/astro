import React, { useState } from 'react';
import type { ChartResponse, PlanetPosition, House } from '../api/client';
import { SouthIndianChartParchment } from './charts/SouthIndianChartParchment';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
    chartData: ChartResponse;
    chartStyle: 'north' | 'south';
    birthDetails: {
        name: string;
        date: string;
        time: string;
        location: string;
    };
    rightPanelContent?: React.ReactNode;
}

export const DivisionalChartsTab: React.FC<Props> = ({ chartData, birthDetails, rightPanelContent }) => {
    const [selectedVarga, setSelectedVarga] = useState<string>('D1');

    const vargas = chartData.divisional_charts ? Object.keys(chartData.divisional_charts).sort((a, b) => {
        const numA = parseInt(a.replace('D', ''));
        const numB = parseInt(b.replace('D', ''));
        return numA - numB;
    }) : ['D1'];

    const getVargaData = () => {
        if (selectedVarga === 'D1') {
            return {
                planets: chartData.planets,
                ascendantSign: chartData.ascendant_sign,
                houses: chartData.houses,
                title: 'Rashi (D1)'
            };
        }

        const varga = chartData.divisional_charts?.[selectedVarga];
        if (!varga) return null;

        const mappedPlanets: PlanetPosition[] = varga.planets.map(vp => ({
            name: vp.planet,
            sign: vp.sign,
            house: vp.house,
            longitude: 0, latitude: 0, speed: 0, retrograde: false,
            nakshatra: '', nakshatra_lord: ''
        }));

        // Generate houses for Varga chart based on ascendant sign
        const signs = [
            'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
            'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
        ];
        const startIndex = signs.indexOf(varga.ascendant_sign);
        const derivedHouses: House[] = Array.from({ length: 12 }, (_, i) => ({
            number: i + 1,
            sign: signs[(startIndex + i) % 12]
        }));

        return {
            planets: mappedPlanets,
            ascendantSign: varga.ascendant_sign,
            houses: derivedHouses,
            title: `${varga.name} Chart`
        };
    };

    const currentVarga = getVargaData();

    const descriptions: Record<string, string> = {
        'D1': "Main Birth Chart (Rashi). Shows physical body and general destiny.",
        'D9': "Navamsha. Shows strength of planets, marriage, and spiritual path.",
        'D10': "Dasamsha. Shows career, profession, and status in society.",
        'D2': "Hora. Wealth and resources.",
        'D3': "Drekkana. Siblings, courage, and motivation.",
        'D7': "Saptamsha. Children and creative output.",
        'D12': "Dwadashamsha. Parents and ancestry.",
        'D30': "Trimshamsha. Misfortunes and health issues.",
        'D60': "Shashtyamsha. Past life karma and fine details."
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">Varga Selection</span>
                <div className="flex flex-wrap gap-2">
                    {vargas.map(v => (
                        <button
                            key={v}
                            onClick={() => setSelectedVarga(v)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all border shadow-sm ${selectedVarga === v
                                ? 'bg-skyblue-500 text-white border-skyblue-600'
                                : 'bg-white text-gray-400 border-gray-100 hover:border-skyblue-200 hover:text-skyblue-500'
                                }`}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 2xl:grid-cols-[1.5fr_1fr] gap-8">
                <div className="w-full max-w-lg mx-auto aspect-square">
                    {currentVarga ? (
                        <SouthIndianChartParchment
                            planets={currentVarga.planets}
                            ascendantSign={currentVarga.ascendantSign}
                            birthDetails={{ ...birthDetails, name: currentVarga.title }}
                        />
                    ) : (
                        <div className="flex items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl text-gray-300 font-medium h-full aspect-square">
                            Select a divisional chart to view
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {rightPanelContent}
                    <Card className="border-skyblue-100 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="bg-gray-50/50 py-4 px-6 border-b border-skyblue-50">
                            <CardTitle className="text-sm font-bold text-violet-600 flex items-center gap-2">
                                <span>📜</span> Chart Analysis: {selectedVarga}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">{currentVarga?.title}</h3>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                {descriptions[selectedVarga] || "Special divisional chart used for deep analysis of specific life areas."}
                            </p>

                            <div className="mt-8 pt-6 border-t border-gray-50">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Insights</div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-violet-400"></div>
                                        <span className="text-sm font-medium text-gray-700">Analyses planetary strength (Bala)</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-skyblue-400"></div>
                                        <span className="text-sm font-medium text-gray-700">Reveals hidden potential in D1</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
