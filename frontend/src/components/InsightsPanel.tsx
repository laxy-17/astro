
import type { CoreInsights } from '../api/client';

interface Props {
    prediction: string | null;
    dosha: any | null;
    coreInsights: CoreInsights | null;
    loading: boolean;
}

export const InsightsPanel: React.FC<Props> = ({ prediction, dosha, coreInsights, loading }) => {
    if (loading) {
        return (
            <div className="panel" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                <div className="spinner" style={{ marginBottom: '10px' }}>🔮</div>
                Connecting to Cosmic Consciousness...
            </div>
        );
    }

    if (!prediction && !dosha && !coreInsights) {
        return null; // Don't show empty panel
    }

    return (
        <div className="panel">
            <div className="panel-header" style={{ background: 'linear-gradient(90deg, #6a1b9a, #8e24aa)', color: 'white' }}>
                AI Vedic Mentor
            </div>
            <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>

                {/* Core Insights (Priority) */}
                {coreInsights && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <InsightCard title="👤 Personal Profile" content={coreInsights.personal} color="#e1bee7" />
                        <InsightCard title="💼 Career Guidance" content={coreInsights.career} color="#c5cae9" />
                        <InsightCard title="❤️ Relationships" content={coreInsights.relationships} color="#f8bbd0" />
                        <InsightCard title="✅ Do's & Don'ts" content={coreInsights.dos_donts} color="#b2dfdb" />
                    </div>
                )}

                {/* Daily Prediction */}
                {prediction && (
                    <div>
                        <h3 style={{ fontSize: '1rem', marginBottom: '8px', color: '#4a148c' }}>Daily Forecast</h3>
                        <div style={{
                            background: '#f3e5f5',
                            padding: '12px',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            lineHeight: '1.5',
                            borderLeft: '4px solid #8e24aa'
                        }}>
                            {prediction}
                        </div>
                    </div>
                )}

                {/* Dosha Report */}
                {dosha && dosha.mangal_dosh && (
                    <div>
                        <h3 style={{ fontSize: '1rem', marginBottom: '8px', color: '#b71c1c' }}>Dosha Analysis</h3>
                        <div style={{
                            background: '#ffebee',
                            padding: '12px',
                            borderRadius: '8px',
                            fontSize: '0.9rem'
                        }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Mangal Dosh (Mars Defect)</div>
                            <div>
                                {dosha.mangal_dosh.is_dosha_present_mars_from_lagna || dosha.mangal_dosh.is_dosha_present_mars_from_moon ? (
                                    <span style={{ color: '#c62828', fontWeight: 'bold' }}>Present</span>
                                ) : (
                                    <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>Not Present</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const InsightCard: React.FC<{ title: string, content: string, color: string }> = ({ title, content, color }) => (
    <div style={{
        background: 'white',
        border: `1px solid ${color}`,
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
        <div style={{
            background: color,
            padding: '8px 12px',
            fontWeight: 'bold',
            color: '#333',
            fontSize: '0.95rem'
        }}>
            {title}
        </div>
        <div style={{
            padding: '12px',
            fontSize: '0.9rem',
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap'
        }}>
            {content}
        </div>
    </div>
);
