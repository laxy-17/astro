import React from 'react';

interface PanchangaCardProps {
    title: string;
    icon: string;
    value: string;
    subValue?: string;
    completion?: number;
    endTime?: string;
}

export const PanchangaCard: React.FC<PanchangaCardProps> = ({
    title,
    icon,
    value,
    subValue,
    completion,
    endTime
}) => {
    return (
        <div className="panchanga-card">
            <div className="card-header">
                <div className="card-icon">{icon}</div>
                <div className="card-title">{title}</div>
            </div>

            <div className="card-value">{value}</div>
            {subValue && <div className="card-sub">{subValue}</div>}

            {completion !== undefined && (
                <div className="progress-container">
                    <div className="progress-bar-bg">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${completion}%` }}
                        ></div>
                    </div>
                    <div className="progress-label">
                        <span>Progress</span>
                        <span>{Math.round(completion)}%</span>
                    </div>
                </div>
            )}

            {endTime && (
                <div className="end-time-tag">
                    Ends at {endTime}
                </div>
            )}
        </div>
    );
};
