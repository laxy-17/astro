export interface GlossaryTerm {
    term: string;
    definition: string;
    category: 'panchanga' | 'charts' | 'dashas' | 'general' | 'astronomical';
}

export const GLOSSARY: Record<string, GlossaryTerm> = {
    // Panchanga
    'Tithi': {
        term: 'Tithi',
        definition: 'A lunar day, representing the distance between the Sun and Moon. There are 30 tithis in a lunar month.',
        category: 'panchanga'
    },
    'Nakshatra': {
        term: 'Nakshatra',
        definition: 'Lunar mansion or constellation. The ecliptic is divided into 27 nakshatras, each representing the Moon\'s position.',
        category: 'panchanga'
    },
    'Yoga': {
        term: 'Yoga',
        definition: 'A mathematical combination of the Sun and Moon\'s longitudes. There are 27 yogas, each with a specific quality.',
        category: 'panchanga'
    },
    'Karana': {
        term: 'Karana',
        definition: 'Half of a Tithi. There are 11 types of Karanas, influencing the day\'s energy.',
        category: 'panchanga'
    },
    'Paksha': {
        term: 'Paksha',
        definition: 'A fortnight or half of a lunar month. Shukla Paksha is the waxing phase, and Krishna Paksha is the waning phase.',
        category: 'panchanga'
    },

    // Charts
    'Lagna': {
        term: 'Lagna',
        definition: 'The Ascendant or the zodiac sign rising on the eastern horizon at the time of birth. It defines the first house.',
        category: 'charts'
    },
    'Rashi': {
        term: 'Rashi',
        definition: 'A zodiac sign. The 360-degree zodiac is divided into 12 rashis of 30 degrees each.',
        category: 'charts'
    },
    'Bhava': {
        term: 'Bhava',
        definition: 'A house in the birth chart. Each of the 12 bhavas represents a different sphere of life (career, family, etc.).',
        category: 'charts'
    },
    'Pada': {
        term: 'Pada',
        definition: 'A quarter of a Nakshatra. Each nakshatra is divided into 4 padas, revealing deeper layers of a planet\'s influence.',
        category: 'astronomical'
    },
    'Retrograde': {
        term: 'Retrograde (Vakri)',
        definition: 'The apparent backward motion of a planet. It intensifies the planet\'s effects and turns the energy inward.',
        category: 'astronomical'
    },

    // Dashas
    'Dasha': {
        term: 'Dasha',
        definition: 'Planetary periods used for timing events. The Vimshottari Dasha system is the most widely used in Vedic astrology.',
        category: 'dashas'
    },
    'Vimsopaka': {
        term: 'Vimsopaka Strength',
        definition: 'A measure of planetary strength based on its position in divisional charts. A score of 20 is perfect.',
        category: 'dashas'
    },

    // Special Points
    'Atmakaraka': {
        term: 'Atmakaraka',
        definition: 'The planet with the highest longitude in your chart, representing the desires and path of the Soul.',
        category: 'general'
    },
    'Amatyakaraka': {
        term: 'Amatyakaraka',
        definition: 'The planet with the second-highest longitude, indicating career, status, and worldly achievements.',
        category: 'general'
    },
    'Maandi': {
        term: 'Maandi',
        definition: 'A mathematical point (son of Saturn) indicating karmic burdens or sudden obstacles.',
        category: 'general'
    },
    'Gulika': {
        term: 'Gulika',
        definition: 'A sensitive point associated with Saturn, used for precision in timing and identifying potential challenges.',
        category: 'general'
    },

    // Muhurta
    'Abhijit Muhurta': {
        term: 'Abhijit Muhurta',
        definition: 'An auspicious mid-day period (around local noon) that can overcome many negative planetary influences.',
        category: 'panchanga'
    },
    'Rahu Kaal': {
        term: 'Rahu Kaal',
        definition: 'An inauspicious period each day ruled by Rahu. It is generally avoided for starting new ventures.',
        category: 'panchanga'
    },
    'Yamaganda': {
        term: 'Yamaganda',
        definition: 'An inauspicious period ruled by Jupiter\'s son (Yamaganda). Not recommended for important beginnings.',
        category: 'panchanga'
    }
};

// Helper function to get glossary term case-insensitively
export const getTerm = (key: string): GlossaryTerm | undefined => {
    return GLOSSARY[key] || Object.values(GLOSSARY).find(g => g.term.toLowerCase().includes(key.toLowerCase()));
};
