import React, { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

interface LocationSuggestion {
    place_id: string
    description: string
    main_text: string
    secondary_text: string
}

export interface LocationDetails {
    place_id: string
    name: string
    formatted_address: string
    latitude: number
    longitude: number
    city: string
    state: string
    country: string
    timezone: string
}

interface LocationSearchInputProps {
    value?: string
    onLocationSelect: (location: LocationDetails) => void
    placeholder?: string
}

export const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
    value,
    onLocationSelect,
    placeholder = "Search for a city..."
}) => {
    const [query, setQuery] = useState(value || '')
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    const inputRef = useRef<HTMLInputElement>(null)

    // Sync with external value updates
    useEffect(() => {
        setQuery(value || '')
    }, [value])

    // Debounced search
    useEffect(() => {
        if (query.length < 2) {
            setSuggestions([])
            return
        }

        // If user is just typing what they already selected, don't search
        // (This is a simplified check, could be more robust)

        // Clear previous timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current)
        }

        // Set new timer
        debounceTimer.current = setTimeout(async () => {
            setIsLoading(true)
            try {
                // Determine API URL based on environment (Vite proxy should handle this, but to be safe)
                // Assuming Vite proxy is set up or relative path works
                const response = await fetch(
                    `/api/locations/search?query=${encodeURIComponent(query)}&limit=5`
                )
                const data = await response.json()
                setSuggestions(data.results || [])
                setIsOpen(true)
            } catch (error) {
                console.error('Location search error:', error)
                setSuggestions([])
            } finally {
                setIsLoading(false)
            }
        }, 300)

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current)
            }
        }
    }, [query])

    const handleSelectLocation = async (suggestion: LocationSuggestion) => {
        setQuery(suggestion.main_text) // Show main text (City) in input
        setIsOpen(false)
        setIsLoading(true)

        try {
            const response = await fetch(`/api/locations/details/${suggestion.place_id}`)
            if (!response.ok) throw new Error('Failed to fetch details')

            const details: LocationDetails = await response.json()
            onLocationSelect(details)
        } catch (error) {
            console.error('Error getting location details:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Popover open={isOpen && suggestions.length > 0} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value)
                            setIsOpen(true)
                        }}
                        onFocus={() => {
                            if (suggestions.length > 0) setIsOpen(true)
                        }}
                        placeholder={placeholder}
                        className="pl-10 pr-10 bg-muted border-border focus:ring-cosmic-nebula"
                        autoComplete="off"
                    />
                    {isLoading && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                </div>
            </PopoverTrigger>

            <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover/95 backdrop-blur-sm border-white/10 shadow-xl"
                align="start"
                onOpenAutoFocus={(e: Event) => e.preventDefault()}
            >
                <div className="max-h-[300px] overflow-y-auto">
                    {suggestions.map((suggestion) => (
                        <Button
                            key={suggestion.place_id}
                            variant="ghost"
                            className="w-full justify-start px-4 py-3 h-auto text-left hover:bg-white/10 rounded-none border-b border-white/5 last:border-0"
                            onClick={() => handleSelectLocation(suggestion)}
                        >
                            <MapPin className="h-4 w-4 mr-3 text-cosmic-nebula flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-foreground truncate">
                                    {suggestion.main_text}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                    {suggestion.secondary_text}
                                </div>
                            </div>
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}
