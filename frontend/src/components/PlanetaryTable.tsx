import React from 'react';
import type { PlanetPosition } from '../api/client';
import { calculatePada, formatDMS } from '../utils/astroUtils';

interface Props {
    planets: PlanetPosition[];
    ascendant: {
        sign: string;
        degree: number;
        house: number; // usually 1
    };
}

export const PlanetaryTable: React.FC<Props> = ({ planets, ascendant }) => {
    return (
        <div className="panel" style={{ height: '100%' }}>
            <div className="panel-header">
                <span>Planetary Bodies</span>
            </div>
            <div className="panel-content">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Body</th>
                            <th>Sign</th>
                            <th>Longitude</th>
                            <th>Nakshatra</th>
                            <th>Pada</th>
                            <th>Speed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Ascendant Row */}
                        <tr>
                            <td className="font-bold">Ascendant</td>
                            <td>{ascendant.sign}</td>
                            <td>{formatDMS(ascendant.degree)}</td>
                            <td>-</td>
                            <td>{calculatePada(ascendant.degree)}</td>
                            <td>-</td>
                        </tr>

                        {/* Planets Rows */}
                        {planets.map((planet) => (
                            <tr key={planet.name}>
                                <td className="font-bold">{planet.name}</td>
                                <td>{planet.sign}</td>
                                <td>{formatDMS(planet.longitude)}</td>
                                <td>{planet.nakshatra}</td>
                                <td>{calculatePada(planet.longitude)}</td>
                                <td className={planet.speed < 0 ? 'text-red' : ''}>
                                    {planet.speed.toFixed(4)}
                                    {planet.retrograde && ' (R)'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
