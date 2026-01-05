import React from 'react';
import { Sun, Moon, CloudMoon, Sunrise, Snowflake } from 'lucide-react';

interface PanchangHeaderProps {
    date: string;
    location: string;
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    ayanam: string;
    drikRitu: string;
    onDateChange?: (date: string) => void;
    onLocationChange?: (location: string) => void;
}

export const PanchangHeader: React.FC<PanchangHeaderProps> = ({
    date,
    location,
    sunrise,
    sunset,
    moonrise,
    moonset,
    ayanam,
    drikRitu,
    onDateChange,
    onLocationChange
}) => {
    return (
        <div className="w-full shadow-lg rounded-2xl overflow-hidden mb-6 border border-slate-200">
            {/* Primary Header Bar - Violet Theme */}
            <div className="bg-gradient-to-r from-violet-700 via-violet-600 to-indigo-700 p-4 text-white relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Sun className="w-24 h-24" />
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="text-3xl bg-white/20 p-2 rounded-xl backdrop-blur-md shadow-inner border border-white/30">🕉️</div>

                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold text-white tracking-tight">Panchang {date}</h1>
                            {onDateChange && (
                                <button className="text-violet-200 hover:text-white hover:bg-white/20 p-1 rounded-full transition-all">
                                    ▼
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-violet-100 font-medium opacity-90">
                            <span className="text-base">{location}</span>
                            {onLocationChange && (
                                <button className="text-lg hover:text-white transition-colors">▼</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary Info Bar - Skyblue/Slate Theme */}
            <div className="bg-white p-4 border-t border-slate-100">
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {/* Sunrise */}
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <div className="p-2 bg-amber-100/50 rounded-lg">
                            <Sunrise className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Sunrise</div>
                            <div className="text-sm font-black text-slate-800 truncate">{sunrise}</div>
                        </div>
                    </div>

                    {/* Sunset */}
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <div className="p-2 bg-orange-100/50 rounded-lg">
                            <Sun className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Sunset</div>
                            <div className="text-sm font-black text-slate-800 truncate">{sunset}</div>
                        </div>
                    </div>

                    {/* Moonrise */}
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <div className="p-2 bg-indigo-100/50 rounded-lg">
                            <CloudMoon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Moonrise</div>
                            <div className="text-sm font-black text-slate-800">{moonrise}</div>
                        </div>
                    </div>

                    {/* Moonset */}
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <div className="p-2 bg-slate-100/50 rounded-lg">
                            <Moon className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Moonset</div>
                            <div className="text-sm font-black text-slate-800">{moonset}</div>
                        </div>
                    </div>

                    {/* Ayanam */}
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <div className="p-2 bg-sky-100/50 rounded-lg">
                            <Sun className="h-5 w-5 text-sky-600" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Ayanam</div>
                            <div className="text-sm font-black text-slate-800 whitespace-normal leading-tight">{ayanam}</div>
                        </div>
                    </div>

                    {/* Drik Ritu */}
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <div className="p-2 bg-teal-100/50 rounded-lg">
                            <Snowflake className="h-5 w-5 text-teal-600" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Ritu</div>
                            <div className="text-sm font-black text-slate-800 whitespace-normal leading-tight">{drikRitu}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
