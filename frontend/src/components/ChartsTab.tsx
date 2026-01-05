import React, { useState } from 'react';
import type { ChartResponse, BirthDetails } from '../api/client';
import { NorthIndianChartParchment } from './charts/NorthIndianChartParchment';
import { SouthIndianChartParchment } from './charts/SouthIndianChartParchment';
import { PlanetPositionsTable } from './tables/PlanetPositionsTable';
import { DivisionalChartsTab } from './DivisionalChartsTab';
import '../styles/parchment.css';
import '../styles/tokens.css';

interface Props {
    chartData: ChartResponse;
    birthDetails: BirthDetails;
}

export const ChartsTab: React.FC<Props> = ({ chartData, birthDetails }) => {
    const [chartStyle, setChartStyle] = useState<'north' | 'south'>('south');
    const [showDivisional, setShowDivisional] = useState(false);

    const formattedDetails = {
        name: 'Birth Chart', // Standard default as name isn't in BirthDetails usually
        date: birthDetails.date,
        time: birthDetails.time,
        location: birthDetails.location_city || 'Unknown Location'
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ProKerala-style Connected Tab Group */}
            <div className="flex justify-center mb-2">
                <div className="inline-flex p-1 bg-white border border-skyblue-100 rounded-full shadow-sm">
                    <button
                        onClick={() => {
                            setChartStyle('south');
                            setShowDivisional(false);
                        }}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${chartStyle === 'south' && !showDivisional
                            ? 'bg-violet-600 text-white shadow-md'
                            : 'text-neutral-500 hover:text-violet-500'
                            }`}
                    >
                        South Indian
                    </button>
                    <button
                        onClick={() => {
                            setChartStyle('north');
                            setShowDivisional(false);
                        }}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${chartStyle === 'north' && !showDivisional
                            ? 'bg-violet-600 text-white shadow-md'
                            : 'text-neutral-500 hover:text-violet-500'
                            }`}
                    >
                        North Indian
                    </button>
                    <div className="w-px h-6 bg-skyblue-100 self-center mx-1" />
                    <button
                        onClick={() => setShowDivisional(true)}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${showDivisional
                            ? 'bg-skyblue-500 text-white shadow-md'
                            : 'text-neutral-500 hover:text-skyblue-500'
                            }`}
                    >
                        Divisional Charts
                    </button>
                </div>
            </div>

            {/* Main Content Area - Split Layout Logic */}
            {showDivisional ? (
                // Divisional Layout: Handled by DivisionalChartsTab (Side-by-Side)
                <DivisionalChartsTab
                    chartData={chartData}
                    chartStyle={chartStyle}
                    birthDetails={formattedDetails}
                    rightPanelContent={
                        <PlanetPositionsTable
                            planets={chartData.planets}
                            ascendant={{
                                sign: chartData.ascendant_sign,
                                degree: chartData.ascendant
                            }}
                        />
                    }
                />
            ) : (
                // Standard Layout: Centered Chart, Table Below
                <div className="flex flex-col items-center gap-2">
                    {/* Centered Large Chart */}
                    <div className="w-full max-w-lg aspect-square animate-in zoom-in-95 duration-500">
                        {chartStyle === 'north' ? (
                            <NorthIndianChartParchment
                                planets={chartData.planets}
                                houses={chartData.houses}
                                birthDetails={formattedDetails}
                            />
                        ) : (
                            <SouthIndianChartParchment
                                planets={chartData.planets}
                                ascendantSign={chartData.ascendant_sign}
                                birthDetails={formattedDetails}
                            />
                        )}
                    </div>

                    {/* Table Below */}
                    <div className="w-full">
                        <PlanetPositionsTable
                            planets={chartData.planets}
                            ascendant={{
                                sign: chartData.ascendant_sign,
                                degree: chartData.ascendant
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

