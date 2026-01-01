import React, { useMemo, useState } from 'react';
import type { Panchanga, Dasha } from '../api/client';
import { calculateDashaDates } from '../utils/astroUtils';

interface Props {
    data: Panchanga;
    dashas: Dasha[];
    birthDate: string;
}

const ProgressBar = ({ value }: { value: number }) => (
    <div style={{ width: '100%', height: '6px', background: '#e0e0e0', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary-purple-light), var(--primary-purple))' }} />
    </div>
);

// Helper for meanings (Placeholder content as requested to follow example structure)
const getTithiMeaning = (name: string) => {
    if (name.includes('Purnima')) return 'Full Moon - Completion, fullness, emotional intensity';
    if (name.includes('Amavasya')) return 'New Moon - New beginnings, introspection, rest';
    if (name.includes('Ashtami')) return 'Conflict, tension, hard work';
    return name.includes('Shukla') ? 'Growth, expansion, accumulation' : 'Reduction, introspection, release';
};

const getNakshatraMeaning = (_name: string) => {
    // A simplified map or generic message
    return 'Influences emotional nature and mental outlook';
};

const getYogaMeaning = (_name: string) => {
    return 'Auspiciousness of the day for activities';
};

const getKaranaMeaning = (_name: string) => {
    return 'Action, capacity for work';
};

const getVaraMeaning = (_name: string) => {
    return 'General energy of the day';
};

export const PanchangaPanel: React.FC<Props> = ({ data, dashas, birthDate }) => {
    const [today] = useState(new Date());

    const dashaInfo = useMemo(() => {
        const dates = calculateDashaDates(dashas, birthDate);
        // Find dasha active TODAY
        const current = dates.find(d => {
            const start = new Date(d.startDate);
            const end = new Date(d.endDate);
            // Compare with today (ignoring time for simplicity, or just simple timestamp compare)
            // Note: d.startDate might be formatted string. 
            // Assuming YYYY-MM-DD or similar parsable by Date()
            return today >= start && today <= end;
        });

        // If born in future or very past, might default to first or last
        if (!current && dates.length > 0) {
            // If today is before birth, show first
            if (today < new Date(dates[0].startDate)) return { ...dates[0], status: 'Future' };
            // If today is after last, show last
            return { ...dates[dates.length - 1], status: 'Completed' };
        }
        return current ? { ...current, status: 'Active Now' } : null;
    }, [dashas, birthDate, today]);

    return (
        <div className="panchanga-container">
            {/* DASHA SECTION (NEW - CRITICAL) */}
            {dashaInfo && (
                <div className="panel" style={{ marginBottom: '24px', background: '#f8f9fa', borderLeft: '4px solid var(--primary-purple)' }}>
                    <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h3 style={{ margin: 0, color: 'var(--primary-purple-dark)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Vimshottari Dasha</h3>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '4px 0' }}>{dashaInfo.lord} Mahadasha</div>
                            <div style={{ color: '#666', fontSize: '0.9rem' }}>
                                {dashaInfo.startDate} — {dashaInfo.endDate} ({dashaInfo.status})
                            </div>
                        </div>
                        <div style={{ fontSize: '2rem', opacity: 0.2 }}>🕉️</div>
                    </div>
                </div>
            )}

            {/* PANCHANGA CARDS */}
            <div className="panchanga-section">
                <h3 style={{ marginBottom: '16px', color: 'var(--primary-purple)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    Panchanga Elements
                </h3>

                <div className="panchanga-grid">
                    {/* Card 1: Tithi */}
                    <div className="panchanga-card lunar">
                        <div className="card-icon">🌙</div>
                        <h3>Tithi (Lunar Day)</h3>
                        <p className="card-value">{data.tithi.name}</p>
                        <p className="card-sub">{data.tithi.paksha} Paksha</p>
                        <ProgressBar value={data.tithi.completion} />
                        <p className="card-meaning">{getTithiMeaning(data.tithi.name)}</p>
                    </div>

                    {/* Card 2: Nakshatra */}
                    <div className="panchanga-card constellation">
                        <div className="card-icon">⭐</div>
                        <h3>Nakshatra</h3>
                        <p className="card-value">{data.nakshatra.name}</p>
                        <p className="card-sub">Pada {data.nakshatra.pada} (Lord: {data.nakshatra.lord})</p>
                        <ProgressBar value={data.nakshatra.completion} />
                        <p className="card-meaning">{getNakshatraMeaning(data.nakshatra.name)}</p>
                    </div>

                    {/* Card 3: Yoga */}
                    <div className="panchanga-card yoga">
                        <div className="card-icon">✨</div>
                        <h3>Yoga</h3>
                        <p className="card-value">{data.yoga.name}</p>
                        <p className="card-sub">#{data.yoga.number}</p>
                        <p className="card-meaning">{getYogaMeaning(data.yoga.name)}</p>
                    </div>

                    {/* Card 4: Karana */}
                    <div className="panchanga-card karana">
                        <div className="card-icon">🔄</div>
                        <h3>Karana</h3>
                        <p className="card-value">{data.karana.name}</p>
                        <p className="card-sub">#{data.karana.number}</p>
                        <p className="card-meaning">{getKaranaMeaning(data.karana.name)}</p>
                    </div>

                    {/* Card 5: Vara */}
                    <div className="panchanga-card weekday">
                        <div className="card-icon">📅</div>
                        <h3>Vara (Day)</h3>
                        <p className="card-value">{data.vara}</p>
                        {/* Vara doesn't have a 'planet' field in the interface currently, but we know it usually corresponds to a planet. 
                Ideally backend provides it, but for now we just show name. */}
                        <p className="card-meaning">{getVaraMeaning(data.vara)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
