import type { LocationData } from '../api/client';

export async function detectLocationFromIP(): Promise<LocationData> {
    try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('IP detection failed');
        const data = await response.json();

        return {
            city: data.city || 'Unknown',
            region: data.region,
            country: data.country_name || 'India',
            latitude: data.latitude || 28.6139,
            longitude: data.longitude || 77.2090,
            timezone: data.timezone || 'Asia/Kolkata'
        };
    } catch (error) {
        console.error('Location detection error:', error);
        // Fallback to New Delhi
        return {
            city: 'New Delhi',
            region: 'Delhi',
            country: 'India',
            latitude: 28.6139,
            longitude: 77.2090,
            timezone: 'Asia/Kolkata'
        };
    }
}

export function saveUserLocation(location: LocationData): void {
    localStorage.setItem('userLocation', JSON.stringify(location));
}

export function getUserLocation(): LocationData | null {
    const stored = localStorage.getItem('userLocation');
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error('Failed to parse stored location', e);
        return null;
    }
}
