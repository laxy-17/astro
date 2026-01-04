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
    isSubPeriod?: boolean;
}

export interface DashaGroup {
    lord: string;
    startDate: string;
    endDate: string;
    duration: number;
    subPeriods: DashaRow[];
}

export const groupDashas = (rows: DashaRow[]): DashaGroup[] => {
    const groups: DashaGroup[] = [];
    let currentGroup: DashaGroup | null = null;

    rows.forEach(row => {
        // Dasha string format from backend is "MD-AD" (e.g. "Sun-Moon")
        const parts = row.lord.split('-');
        const mdName = parts[0];
        // const adName = parts[1]; // Not needed here

        // If we don't have a group, or the current group is for a different MD, start a new one
        if (!currentGroup || currentGroup.lord !== mdName) {
            // Push previous
            if (currentGroup) {
                groups.push(currentGroup);
            }

            // Init new group
            currentGroup = {
                lord: mdName,
                startDate: row.startDate, // Start of first sub-period is start of MD
                endDate: row.endDate,     // Will update as we go
                duration: 0,              // Calc sum
                subPeriods: []
            };
        }

        // Add this row as a sub-period
        currentGroup.subPeriods.push({
            ...row,
            isSubPeriod: true
        });

        // Update Group Totals
        currentGroup.endDate = row.endDate; // Extend end date to current sub-period end
        currentGroup.duration += row.duration;
    });

    // Push last group
    if (currentGroup) {
        groups.push(currentGroup);
    }

    return groups;
};

export const calculateDashaDates = (dashas: Dasha[], birthDateStr: string): DashaRow[] => {
    if (!dashas || dashas.length === 0) return [];

    // If backend provides dates, use them directly
    if (dashas[0].start_date && dashas[0].end_date) {
        return dashas.map(d => ({
            lord: d.lord,
            startDate: d.start_date!.split('T')[0],
            endDate: d.end_date!.split('T')[0],
            duration: d.duration || 0
        }));
    }

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
