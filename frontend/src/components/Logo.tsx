import React, { useState, useEffect } from 'react';
import './Logo.css';

interface LogoProps {
    size?: 'small' | 'medium' | 'large' | 'xl';
    animated?: boolean;
    withTagline?: boolean;
    tagline?: 'destiny' | 'precision';
    variant?: 'full' | 'icon' | 'text';
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({
    size = 'medium',
    animated = true,
    withTagline = false,
    tagline = 'destiny',
    variant = 'full',
    className = ''
}) => {
    const [symbol, setSymbol] = useState('8');

    useEffect(() => {
        if (!animated) return;

        const interval = setInterval(() => {
            setSymbol(prev => prev === '8' ? '∞' : '8');
        }, 3000);

        return () => clearInterval(interval);
    }, [animated]);

    const sizeClasses = {
        small: 'logo-small',
        medium: 'logo-medium',
        large: 'logo-large',
        xl: 'logo-xl'
    };

    const taglineText = {
        destiny: 'Timing is Destiny',
        precision: 'Precision Vedic Timing'
    };

    if (variant === 'icon') {
        return (
            <div className={`logo-icon ${sizeClasses[size]} ${className}`}>
                <span className={animated ? 'logo-symbol-animated' : 'logo-symbol'}>
                    {symbol}
                </span>
            </div>
        );
    }

    return (
        <div className={`logo-container ${sizeClasses[size]} ${className}`}>
            <div className="logo-8stro">
                <span className={animated ? 'logo-symbol-animated' : 'logo-symbol'}>
                    {symbol}
                </span>
                <span className="logo-text font-extrabold tracking-tighter">stro</span>
            </div>

            {withTagline && (
                <div className={`logo-tagline tagline-${tagline}`}>
                    {taglineText[tagline]}
                </div>
            )}
        </div>
    );
};
