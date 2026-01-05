import React from 'react';
import { Layout, Sparkles, MapPin, Calendar, Clock, BookOpen } from 'lucide-react';

export const ChartsEmptyState: React.FC = () => {
    return (
        <div className="relative w-full min-h-[500px] flex flex-col items-center justify-center bg-white/30 backdrop-blur-sm rounded-3xl border-2 border-dashed border-skyblue-200 overflow-hidden group">
            {/* Watermark/Background Decoration */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                <div className="grid grid-cols-4 gap-12 rotate-12 scale-150">
                    {[...Array(16)].map((_, i) => (
                        <Layout key={i} className="w-24 h-24" />
                    ))}
                </div>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center max-w-md px-6">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-skyblue-100 rounded-full flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <Sparkles className="w-10 h-10 text-violet-500 animate-pulse" />
                </div>

                <h3 className="text-2xl font-bold text-neutral-800 mb-3 tracking-tight">Your Cosmic Blueprint Awaits</h3>
                <p className="text-neutral-500 text-sm leading-relaxed mb-8">
                    Enter your birth details to generate a precise Vedic birth chart and unlock deep celestial insights.
                </p>

                <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="bg-white/60 p-4 rounded-2xl border border-skyblue-100 flex flex-col items-center gap-2">
                        <Calendar className="w-5 h-5 text-violet-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Date</span>
                    </div>
                    <div className="bg-white/60 p-4 rounded-2xl border border-skyblue-100 flex flex-col items-center gap-2">
                        <Clock className="w-5 h-5 text-skyblue-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Time</span>
                    </div>
                    <div className="bg-white/60 p-4 rounded-2xl border border-skyblue-100 flex flex-col items-center gap-2">
                        <MapPin className="w-5 h-5 text-violet-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Place</span>
                    </div>
                    <div className="bg-white/60 p-4 rounded-2xl border border-skyblue-100 flex flex-col items-center gap-2">
                        <BookOpen className="w-5 h-5 text-skyblue-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Insights</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
