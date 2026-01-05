import React, { useState, useEffect } from 'react';
import {
    fetchCompletePanchang,
    type CompletePanchangResponse
} from '../api/panchangApi';
import { getUserLocation, saveUserLocation, detectLocationFromIP } from '../utils/locationDetection';
import { LocationSelector } from './LocationSelector';
import { PanchangHeader } from './panchang/PanchangHeader';
import { PanchangMainDetails } from './panchang/PanchangMainDetails';
import { GowriPanchangam } from './panchang/GowriPanchangam';
import { Loader2 } from 'lucide-react';
import type { LocationData, BirthDetails } from '../api/client';

interface Props {
    birthDetails: BirthDetails | null; // Kept for interface compatibility, though new tab is generic logic mostly
}

export const UnifiedPanchanga: React.FC<Props> = ({ birthDetails }) => {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [data, setData] = useState<CompletePanchangResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    // Initialize location
    useEffect(() => {
        async function init() {
            if (birthDetails && birthDetails.latitude && birthDetails.longitude) {
                setLocation({
                    city: birthDetails.location_city || 'Custom Location',
                    region: birthDetails.location_state || '',
                    country: birthDetails.location_country || '',
                    latitude: birthDetails.latitude,
                    longitude: birthDetails.longitude,
                    timezone: birthDetails.location_timezone || 'UTC'
                });
            } else {
                const stored = getUserLocation();
                if (stored) {
                    setLocation(stored);
                } else {
                    const detected = await detectLocationFromIP();
                    setLocation(detected);
                    saveUserLocation(detected);
                }
            }
        }
        init();
    }, [birthDetails]);

    // Fetch Complete Panchang Data
    useEffect(() => {
        if (!location) return;

        async function loadData() {
            setLoading(true);
            setError(null);
            try {
                const response = await fetchCompletePanchang(
                    selectedDate,
                    location!.latitude,
                    location!.longitude,
                    location!.city,
                    location!.timezone
                );
                setData(response);
            } catch (err: any) {
                console.error('Failed to fetch Panchanga:', err);
                setError('Failed to load Panchanga data.');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [location, selectedDate]);

    const handleLocationChange = (newLoc: LocationData) => {
        setLocation(newLoc);
        saveUserLocation(newLoc);
    };

    if (!location && loading) return <LoadingState />;
    if (error) return <ErrorState message={error} />;

    return (
        <div className="daily-panchanga-dashboard p-4 md:p-8 min-h-screen bg-slate-50/50 animate-in fade-in duration-700">
            {/* Header & Controls */}
            {data && (
                <PanchangHeader
                    date={data.date}
                    location={data.location}
                    sunrise={data.sunrise}
                    sunset={data.sunset}
                    moonrise={data.moonrise}
                    moonset={data.moonset}
                    ayanam={data.ayanam}
                    drikRitu={data.drik_ritu}
                    onDateChange={(d) => console.log('Date change not impl', d)} // TODO: Add date picker
                    onLocationChange={(l) => console.log('Loc change', l)}
                />
            )}

            {/* Location Selector Overlay or integrated? 
                For now keeping existing LocationSelector logic visible if needed, 
                but Header handles display. 
                Let's put the selector discreetly above or verify if Header allows changing.
            */}
            <div className="mb-6 flex justify-end">
                {location && (
                    <LocationSelector
                        currentLocation={location}
                        onLocationChange={handleLocationChange}
                    />
                )}
            </div>

            {loading ? (
                <LoadingState />
            ) : data ? (
                <>
                    <PanchangMainDetails data={data} />

                    <GowriPanchangam
                        dayPeriods={data.gowri_panchangam.day_periods}
                        nightPeriods={data.gowri_panchangam.night_periods}
                    />
                </>
            ) : null}
        </div>
    );
};

const LoadingState = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-4" />
        <p className="text-muted-foreground animate-pulse">Calculating planetary positions...</p>
    </div>
);

const ErrorState = ({ message }: { message: string }) => (
    <div className="p-8 text-center bg-red-50 rounded-xl border border-red-100 m-6">
        <p className="text-red-600 font-medium mb-4">{message}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Retry</button>
    </div>
);
