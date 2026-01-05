export interface PlanetSymbol {
    symbol: string;
    color: string;
    name: string;
}

export const planetSymbols: Record<string, PlanetSymbol> = {
    Sun: {
        symbol: '☉',
        color: '#E74C3C', // Red
        name: 'Sun'
    },
    Moon: {
        symbol: '☽',
        color: '#F39C12', // Orange
        name: 'Moon'
    },
    Mercury: {
        symbol: '☿',
        color: '#27AE60', // Green
        name: 'Mercury'
    },
    Venus: {
        symbol: '♀',
        color: '#E91E63', // Pink/Magenta
        name: 'Venus'
    },
    Mars: {
        symbol: '♂',
        color: '#C0392B', // Dark Red
        name: 'Mars'
    },
    Jupiter: {
        symbol: '♃',
        color: '#16A085', // Teal
        name: 'Jupiter'
    },
    Saturn: {
        symbol: '♄',
        color: '#8E44AD', // Purple
        name: 'Saturn'
    },
    Rahu: {
        symbol: '☊',
        color: '#3498DB', // Blue
        name: 'Rahu'
    },
    Ketu: {
        symbol: '☋',
        color: '#2980B9', // Dark Blue
        name: 'Ketu'
    },
    Ascendant: {
        symbol: '⚹',
        color: '#7F8C8D', // Gray
        name: 'Ascendant'
    }
};

export const getPlanetSymbol = (planetName: string): PlanetSymbol => {
    return planetSymbols[planetName] || {
        symbol: '●',
        color: '#95A5A6',
        name: planetName
    };
};
