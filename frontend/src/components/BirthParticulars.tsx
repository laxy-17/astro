import React from 'react';
import type { BirthDetails } from '../api/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, MapPin, Compass } from "lucide-react"

interface Props {
    details: BirthDetails;
}

export const BirthParticulars: React.FC<Props> = ({ details }) => {
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            const dateFormat = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            return `${dayName}, ${dateFormat}`;
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <Card className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="pb-4 bg-gray-50/50 border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-xl">📋</span> Birth Information
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                    {/* Date */}
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Date of Birth
                        </label>
                        <p className="text-[17px] font-medium text-gray-900">
                            {formatDate(details.date)}
                        </p>
                    </div>

                    {/* Time */}
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Time of Birth
                        </label>
                        <p className="text-[17px] font-medium text-gray-900">
                            {details.time}
                            {details.location_timezone && (
                                <span className="text-sm text-gray-400 ml-2 font-normal">
                                    ({details.location_timezone})
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Location */}
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Place of Birth
                        </label>
                        <p className="text-[17px] font-medium text-gray-900">
                            {details.location_city || 'Unknown Location'}
                        </p>
                        <p className="text-xs text-gray-400 font-medium">
                            {details.latitude.toFixed(4)}°N, {details.longitude.toFixed(4)}°E
                        </p>
                    </div>

                    {/* Ayanamsa */}
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Ayanamsa (System)
                        </label>
                        <p className="text-[17px] font-medium text-gray-900">
                            {details.ayanamsa_mode || 'LAHIRI'}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
