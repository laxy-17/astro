import React from 'react';

interface Props {
    score: number;
    label: string;
    color: 'Green' | 'Amber' | 'Red';
    theme: string;
}

export const EnergyRatingCircle: React.FC<Props> = ({ score, label, color, theme }) => {
    // Determine colors based on rating
    const colorMap = {
        Green: {
            stroke: '#6BA87C', // Success Green
            glow: 'shadow-[0_2px_12px_rgba(107,168,124,0.2)]',
            bg: 'bg-status-success/5',
            text: 'text-status-success'
        },
        Amber: {
            stroke: '#E8A87C', // Warning Orange
            glow: 'shadow-[0_2px_12px_rgba(232,168,124,0.2)]',
            bg: 'bg-status-warning/5',
            text: 'text-status-warning'
        },
        Red: {
            stroke: '#D97777', // Error Red
            glow: 'shadow-[0_2px_12px_rgba(217,119,119,0.2)]',
            bg: 'bg-status-error/5',
            text: 'text-status-error'
        }
    };

    const activeColor = colorMap[color];
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-700">
            {/* Circle Container */}
            <div className={`relative mb-6 rounded-full ${activeColor.glow}`}>
                <svg className="transform -rotate-90 w-48 h-48">
                    {/* Background Circle */}
                    <circle
                        cx="96"
                        cy="96"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-muted/20"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx="96"
                        cy="96"
                        r={radius}
                        stroke={activeColor.stroke}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>

                {/* Center Text */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <span className={`text-5xl font-bold ${activeColor.text}`}>
                        {score}
                    </span>
                    <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                        Energy
                    </span>
                </div>
            </div>

            {/* Label & Theme */}
            <h2 className={`text-2xl font-bold mb-2 ${activeColor.text}`}>
                {label}
            </h2>
            <p className="text-muted-foreground max-w-sm font-serif italic text-lg leading-relaxed">
                "{theme}"
            </p>
        </div>
    );
};
