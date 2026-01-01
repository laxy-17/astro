import React from 'react';
import type { BirthDetails } from '../api/client';

interface Props {
    details: BirthDetails;
}

export const BirthParticulars: React.FC<Props> = ({ details }) => {
    return (
        <div className="panel" style={{ marginTop: '0' }}>
            <h3 className="section-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                Birth Particulars
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>

                <div>
                    <span className="label">Date</span>
                    <div className="value">{details.date}</div>
                </div>

                <div>
                    <span className="label">Time</span>
                    <div className="value">{details.time}</div>
                </div>

                <div>
                    <span className="label">Place Coordinates</span>
                    <div className="value">{details.latitude.toFixed(4)}, {details.longitude.toFixed(4)}</div>
                </div>

                <div>
                    <span className="label">Ayanamsa</span>
                    <div className="value">{details.ayanamsa_mode || 'LAHIRI'}</div>
                </div>

            </div>
        </div>
    );
};
