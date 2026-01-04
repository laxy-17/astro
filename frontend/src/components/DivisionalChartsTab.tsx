
import React, { useState } from 'react';
import { SouthIndianChart } from './SouthIndianChart';
import type { ChartResponse, PlanetPosition } from '../api/client';

interface Props {
    chartData: ChartResponse;
}

export const DivisionalChartsTab: React.FC<Props> = ({ chartData }) => {
    const [selectedVarga, setSelectedVarga] = useState<string>('D1');

    const vargas = chartData.divisional_charts ? Object.keys(chartData.divisional_charts).sort((a, b) => {
        // Sort D1, D2, D3... numerically
        const numA = parseInt(a.replace('D', ''));
        const numB = parseInt(b.replace('D', ''));
        return numA - numB;
    }) : ['D1'];

    const getVargaData = () => {
        if (selectedVarga === 'D1') {
            return {
                planets: chartData.planets,
                ascendantSign: chartData.ascendant_sign,
                title: 'Rashi (D1)'
            };
        }

        const varga = chartData.divisional_charts?.[selectedVarga];
        if (!varga) return null;

        // Map VargaPosition to PlanetPosition (partial)
        const mappedPlanets: PlanetPosition[] = varga.planets.map(vp => ({
            name: vp.planet,
            sign: vp.sign,
            house: vp.house,
            // Mock other fields not needed for display
            longitude: 0, latitude: 0, speed: 0, retrograde: false,
            nakshatra: '', nakshatra_lord: ''
        }));

        return {
            planets: mappedPlanets,
            ascendantSign: varga.ascendant_sign,
            title: `${varga.name} Chart`
        };
    };

    const currentVarga = getVargaData();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Varga Selector */}
            <div className="flex flex-wrap gap-2 pb-2">
                {vargas.map(v => (
                    <button
                        key={v}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${selectedVarga === v
                                ? 'bg-violet-600 text-white shadow-sm'
                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                            }`}
                        onClick={() => setSelectedVarga(v)}
                    >
                        {v}
                    </button>
                ))}
            </div>

            {/* Chart Display */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    {currentVarga ? (
                        <SouthIndianChart
                            planets={currentVarga.planets}
                            ascendantSign={currentVarga.ascendantSign}
                        />
                    ) : (
                        <div>Select a chart</div>
                    )}
                </div>

                {/* Legend or Info could go here */}
                <div style={{ width: '250px', fontSize: '0.85rem', color: '#555' }}>
                    <div className="panel">
                        <div className="panel-header">Chart Info</div>
                        <div className="panel-content">
                            <strong>{currentVarga?.title}</strong>
                            <p>
                                {selectedVarga === 'D1' && "Main Birth Chart (Rashi). Shows physical body and general destiny."}
                                {selectedVarga === 'D9' && "Navamsha. Shows strength of planets, marriage, and spiritual path."}
                                {selectedVarga === 'D10' && "Dasamsha. Shows career, profession, and status in society."}
                                {selectedVarga === 'D2' && "Hora. Wealth and resources."}
                                {selectedVarga === 'D3' && "Drekkana. Siblings, courage, and motivation."}
                                {selectedVarga === 'D7' && "Saptamsha. Children and creative output."}
                                {selectedVarga === 'D12' && "Dwadashamsha. Parents and ancestry."}
                                {selectedVarga === 'D30' && "Trimshamsha. Misfortunes and health issues."}
                                {selectedVarga === 'D60' && "Shashtyamsha. Past life karma and fine details."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
