import type { Dasha } from '../api/client';

export const ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// Map sign name to index (0-11)
export const getSignIndex = (signName: string): number => {
    return ZODIAC_SIGNS.indexOf(signName);
};

// Calculate Nakshatra Pada (1-4)
export const calculatePada = (longitude: number): number => {
    const nakshatraDuration = 360 / 27; // 13.333...
    const padaDuration = nakshatraDuration / 4; // 3.333...

    const degreeInNakshatra = longitude % nakshatraDuration;
    return Math.floor(degreeInNakshatra / padaDuration) + 1;
};

// Format decimal degrees to Deg M' S"
export const formatDMS = (decimal: number): string => {
    const d = Math.floor(decimal);
    const minFloat = (decimal - d) * 60;
    const m = Math.floor(minFloat);
    const s = Math.round((minFloat - m) * 60);

    return `${d}° ${m}' ${s}"`;
};

// Calculate Dasha end dates
export interface DashaRow {
    lord: string;
    startDate: string;
    endDate: string;
    duration: number; // in years
}

export const calculateDashaDates = (dashas: Dasha[], birthDateStr: string): DashaRow[] => {
    if (!dashas || dashas.length === 0) return [];

    const birthDate = new Date(birthDateStr);
    const rows: DashaRow[] = [];

    let currentDate = new Date(birthDate);

    // First Dasha (Balance)
    const first = dashas[0];
    if (first.balance_years !== undefined) {
        // End date is Birth + Balance
        // Convert float years to milliseconds is roughly: years * 365.25 * 24 * 60 * 60 * 1000
        // But easier to just add days using date object
        const daysToAdd = first.balance_years * 365.25;
        const endDate = new Date(birthDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

        rows.push({
            lord: first.lord,
            startDate: birthDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            duration: first.balance_years
        });

        currentDate = endDate;
    }

    // Subsequent Dashas
    for (let i = 1; i < dashas.length; i++) {
        const dasha = dashas[i];
        const duration = dasha.duration || 0;

        const daysToAdd = duration * 365.25;
        const endDate = new Date(currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

        rows.push({
            lord: dasha.lord,
            startDate: currentDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            duration: duration
        });

        currentDate = endDate;
    }

    return rows;
};
