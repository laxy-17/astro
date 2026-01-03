import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getPlanetShortName(name: string): string {
    if (name === 'Maandi') return 'Mn';
    if (name === 'Gulika') return 'GK';
    if (name === 'Ascendant' || name === 'ASC') return 'ASC';

    // Default: First 2 letters
    return name.substring(0, 2);
}
