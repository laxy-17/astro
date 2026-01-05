export interface RasiSymbol {
    symbol: string;
    color: string;
    name: string;
    lord: string;
}

export const rasiSymbols: Record<string, RasiSymbol> = {
    Aries: {
        symbol: '♈',
        color: '#E91E63', // Magenta
        name: 'Mesha',
        lord: 'Mars'
    },
    Taurus: {
        symbol: '♉',
        color: '#00BCD4', // Cyan
        name: 'Vrishabha',
        lord: 'Venus'
    },
    Gemini: {
        symbol: '♊',
        color: '#8BC34A', // Light Green
        name: 'Mithuna',
        lord: 'Mercury'
    },
    Cancer: {
        symbol: '♋',
        color: '#FF9800', // Orange
        name: 'Karka',
        lord: 'Moon'
    },
    Leo: {
        symbol: '♌',
        color: '#F44336', // Red
        name: 'Simha',
        lord: 'Sun'
    },
    Virgo: {
        symbol: '♍',
        color: '#9C27B0', // Purple
        name: 'Kanya',
        lord: 'Mercury'
    },
    Libra: {
        symbol: '♎',
        color: '#3F51B5', // Indigo
        name: 'Tula',
        lord: 'Venus'
    },
    Scorpio: {
        symbol: '♏',
        color: '#E91E63', // Magenta
        name: 'Vrishchika',
        lord: 'Mars'
    },
    Sagittarius: {
        symbol: '♐',
        color: '#00BCD4', // Cyan
        name: 'Dhanu',
        lord: 'Jupiter'
    },
    Capricorn: {
        symbol: '♑',
        color: '#4CAF50', // Green
        name: 'Makara',
        lord: 'Saturn'
    },
    Aquarius: {
        symbol: '♒',
        color: '#2196F3', // Blue
        name: 'Kumbha',
        lord: 'Saturn'
    },
    Pisces: {
        symbol: '♓',
        color: '#9C27B0', // Purple
        name: 'Meena',
        lord: 'Jupiter'
    }
};

export const getRasiSymbol = (signName: string): RasiSymbol => {
    return rasiSymbols[signName] || {
        symbol: '○',
        color: '#95A5A6',
        name: signName,
        lord: 'Unknown'
    };
};

export const getRasiLord = (signName: string): string => {
    const rasi = rasiSymbols[signName];
    return rasi ? rasi.lord : 'Unknown';
};
