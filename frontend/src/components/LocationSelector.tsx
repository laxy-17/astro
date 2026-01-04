import React, { useState, useEffect, useRef } from 'react';
import type { LocationData } from '../api/client';

interface SearchResult {
    display_name: string;
    lat: string;
    lon: string;
    address: {
        city?: string;
        town?: string;
        village?: string;
        state?: string;
        country?: string;
    };
}

interface LocationSelectorProps {
    currentLocation: LocationData;
    onLocationChange: (location: LocationData) => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
    currentLocation,
    onLocationChange
}) => {
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Debounced search
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 3) {
            setSearchResults([]);
            return;
        }

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set new timeout for search
        searchTimeoutRef.current = setTimeout(() => {
            performSearch(searchQuery);
        }, 500); // Wait 500ms after user stops typing

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    const performSearch = async (query: string) => {
        setLoading(true);

        try {
            // OpenStreetMap Nominatim API (free, no key required)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `q=${encodeURIComponent(query)}&` +
                `format=json&` +
                `addressdetails=1&` +
                `limit=5&` +
                `featuretype=city`,
                {
                    headers: {
                        'User-Agent': '8stro-app' // Required by Nominatim
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data: SearchResult[] = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Location search failed:', error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectLocation = async (result: SearchResult) => {
        const latitude = parseFloat(result.lat);
        const longitude = parseFloat(result.lon);

        // Extract city name
        const city = result.address.city ||
            result.address.town ||
            result.address.village ||
            'Unknown';

        const region = result.address.state || '';
        const country = result.address.country || '';

        // Get timezone using fallback for now, as requested to be simple
        const timezone = await getTimezoneForCoordinates(latitude, longitude);

        const newLocation: LocationData = {
            city,
            region,
            country,
            latitude,
            longitude,
            timezone
        };

        console.log('Selected location:', newLocation);

        // Save to localStorage
        localStorage.setItem('userLocation', JSON.stringify(newLocation));

        // Notify parent component
        onLocationChange(newLocation);

        // Close search
        setIsSearching(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const getTimezoneForCoordinates = async (lat: number, lng: number): Promise<string> => {
        try {
            // Simple timezone estimation based on longitude
            // More accurate: use a timezone API or library
            const offset = Math.round(lng / 15);
            const timezones: { [key: number]: string } = {
                '-8': 'America/Los_Angeles',
                '-7': 'America/Denver',
                '-6': 'America/Chicago',
                '-5': 'America/New_York',
                '0': 'Europe/London',
                '1': 'Europe/Paris',
                '5': 'Asia/Karachi',
                '5.5': 'Asia/Kolkata',
                '8': 'Asia/Shanghai',
                '9': 'Asia/Tokyo',
            };

            return timezones[offset] || `Etc/GMT${offset >= 0 ? '-' : '+'}${Math.abs(offset)}`;
        } catch (error) {
            console.error('Failed to get timezone:', error);
            return 'UTC';
        }
    };

    const handleSearchClick = () => {
        setIsSearching(true);
    };

    const handleCancel = () => {
        setIsSearching(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    if (isSearching) {
        return (
            <div className="location-search-container" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '16px',
                background: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        className="location-search-input"
                        placeholder="Type city name (e.g., Charlotte)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            border: '2px solid #5BA3D0',
                            borderRadius: '8px',
                            fontSize: '16px',
                            outline: 'none'
                        }}
                    />
                    <button
                        onClick={handleCancel}
                        style={{
                            padding: '12px 24px',
                            background: '#E8F4F8',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            color: '#2D3436'
                        }}
                    >
                        Cancel
                    </button>
                </div>

                {loading && (
                    <div style={{ padding: '12px', textAlign: 'center', color: '#636E72' }}>
                        Searching...
                    </div>
                )}

                {searchResults.length > 0 && (
                    <div className="search-results" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        maxHeight: '300px',
                        overflowY: 'auto'
                    }}>
                        {searchResults.map((result, index) => (
                            <button
                                key={index}
                                onClick={() => handleSelectLocation(result)}
                                style={{
                                    padding: '12px',
                                    background: '#F8FCFE',
                                    border: '1px solid #D4E8F0',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontSize: '14px',
                                    color: '#2D3436',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#E8F4F8'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#F8FCFE'}
                            >
                                <div style={{ fontWeight: '600' }}>
                                    {result.address.city || result.address.town || result.address.village}
                                </div>
                                <div style={{ fontSize: '12px', color: '#636E72', marginTop: '4px' }}>
                                    {result.address.state && `${result.address.state}, `}
                                    {result.address.country}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {searchQuery.length >= 3 && !loading && searchResults.length === 0 && (
                    <div style={{ padding: '12px', textAlign: 'center', color: '#636E72' }}>
                        No results found. Try a different city name.
                    </div>
                )}

                {searchQuery.length > 0 && searchQuery.length < 3 && (
                    <div style={{ padding: '12px', textAlign: 'center', color: '#636E72', fontSize: '14px' }}>
                        Type at least 3 characters to search
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="location-display" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
            <span style={{ fontSize: '20px' }}>📍</span>
            <span style={{ flex: 1, fontSize: '16px', color: '#2D3436' }}>
                {currentLocation.city}
                {currentLocation.region && `, ${currentLocation.region}`}
                {currentLocation.country && `, ${currentLocation.country}`}
            </span>
            <button
                onClick={handleSearchClick}
                style={{
                    padding: '8px 16px',
                    background: '#5BA3D0',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                }}
            >
                Change
            </button>
        </div>
    );
};
