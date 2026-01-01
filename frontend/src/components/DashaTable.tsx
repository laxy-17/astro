import React, { useMemo } from 'react';
import type { Dasha } from '../api/client';
import { calculateDashaDates } from '../utils/astroUtils';

interface Props {
    dashas: Dasha[];
    birthDate: string;
}

export const DashaTable: React.FC<Props> = ({ dashas, birthDate }) => {
    const dashaRows = useMemo(() =>
        calculateDashaDates(dashas, birthDate),
        [dashas, birthDate]
    );

    return (
        <div className="panel" style={{ height: 'auto', minHeight: 'auto' }}>
            <div className="panel-header">
                <span>Vimshottari Dasha</span>
            </div>
            <div className="panel-content" style={{ overflow: 'visible', height: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Lord</th>
                            <th>Starts</th>
                            <th>Ends</th>
                            <th>Years</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dashaRows.map((row, idx) => (
                            <tr key={`${row.lord}-${idx}`}>
                                <td className="font-bold">{row.lord}</td>
                                <td>{row.startDate}</td>
                                <td>{row.endDate}</td>
                                <td>{typeof row.duration === 'number' ? row.duration.toFixed(1) : row.duration}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
