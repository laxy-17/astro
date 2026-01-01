
import React from 'react';

interface Props {
    strengths: Record<string, number>;
}

export const StrengthBar: React.FC<Props> = ({ strengths }) => {
    const maxScore = 20;

    const getColor = (score: number) => {
        if (score >= 15) return '#4caf50'; // Green - Excellent
        if (score >= 10) return '#8bc34a'; // Light Green - Good
        if (score >= 5) return '#ff9800'; // Orange - Average
        return '#f44336'; // Red - Weak
    };

    const sortedPlanets = Object.entries(strengths).sort((a, b) => b[1] - a[1]);

    return (
        <div className="panel">
            <div className="panel-header">Vimsopaka Strength</div>
            <div className="panel-content">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sortedPlanets.map(([planet, score]) => (
                        <div key={planet} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '60px', fontWeight: 'bold', fontSize: '0.9rem' }}>{planet}</div>
                            <div style={{ flex: 1, background: '#eee', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${(score / maxScore) * 100}%`,
                                    background: getColor(score),
                                    height: '100%',
                                    transition: 'width 0.5s ease-in-out'
                                }} />
                            </div>
                            <div style={{ width: '40px', textAlign: 'right', fontSize: '0.85rem', color: '#555' }}>
                                {score.toFixed(1)}
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#666', fontStyle: 'italic' }}>
                    * Based on Shadvarga (6 charts) analysis. 20 is max.
                </div>
            </div>
        </div>
    );
};
