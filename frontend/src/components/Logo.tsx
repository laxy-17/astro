import React from 'react';
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
    // We only keep the '8' character as the rotation will handle the infinity effect
    const symbol = '8';

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
            <div className="logo-8stro flex items-center">
                <span className={animated ? 'logo-symbol-animated' : 'logo-symbol'}>
                    {symbol}
                </span>
                <span className="logo-text font-extrabold tracking-tighter -ml-1">stro</span>
            </div>

            {withTagline && (
                <div className={`logo-tagline tagline-${tagline}`}>
                    {taglineText[tagline]}
                </div>
            )}
        </div>
    );
};
