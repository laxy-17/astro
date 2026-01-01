import React from 'react';
import type { Panchanga } from '../api/client';

interface Props {
    data: Panchanga;
}

export const TithiNakshatra: React.FC<Props> = ({ data }) => {
    return (
        <div className="panel" style={{ marginTop: '16px' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--primary-purple)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                Panchanga Elements
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                {/* Tithi */}
                <div style={{ background: 'var(--bg-light)', padding: '12px', borderRadius: '8px' }}>
                    <h4>Tithi (Lunar Day)</h4>
                    <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{data.tithi.name}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>{data.tithi.paksha} Paksha</div>
                    <div style={{ fontSize: '0.9em', marginTop: '4px' }}>
                        {data.tithi.completion}% traversed
                    </div>
                </div>

                {/* Nakshatra */}
                <div style={{ background: 'var(--bg-light)', padding: '12px', borderRadius: '8px' }}>
                    <h4>Nakshatra</h4>
                    <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{data.nakshatra.name}</div>
                    <div>Pada {data.nakshatra.pada}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Lord: {data.nakshatra.lord}</div>
                    <div style={{ fontSize: '0.9em', marginTop: '4px' }}>
                        {data.nakshatra.completion}% traversed
                    </div>
                </div>

                {/* Yoga */}
                <div style={{ background: 'var(--bg-light)', padding: '12px', borderRadius: '8px' }}>
                    <h4>Yoga</h4>
                    <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{data.yoga.name}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>#{data.yoga.number}</div>
                </div>

                {/* Karana */}
                <div style={{ background: 'var(--bg-light)', padding: '12px', borderRadius: '8px' }}>
                    <h4>Karana</h4>
                    <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{data.karana.name}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>#{data.karana.number}</div>
                </div>

                {/* Vara */}
                <div style={{ background: 'var(--bg-light)', padding: '12px', borderRadius: '8px', gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4>Vara (Day)</h4>
                        <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{data.vara}</div>
                    </div>
                </div>

            </div>
        </div>
    );
};
