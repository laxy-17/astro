import { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface TransitBody {
    name: string;
    type: 'planet' | 'special_point' | 'karaka';
    sign: string;
    degree: string;
    nakshatra: string;
    pada: number;
    speed: number;
    retrograde: boolean;
}

export const TransitsTab = () => {
    const [transits, setTransits] = useState<TransitBody[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [loading, setLoading] = useState(false);

    const fetchTransits = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/transits/current/extended');
            const data = await response.json();
            setTransits(data.bodies);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to fetch transits:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransits();
        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchTransits, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Group transits by type
    const mainPlanets = transits.filter(t =>
        t.type === 'planet' &&
        !['Uranus', 'Neptune', 'Pluto'].includes(t.name)
    );
    const outerPlanets = transits.filter(t =>
        t.type === 'planet' &&
        ['Uranus', 'Neptune', 'Pluto'].includes(t.name)
    );
    const specialPoints = transits.filter(t => t.type === 'special_point');
    const karakas = transits.filter(t => t.type === 'karaka');

    const renderSection = (title: string, bodies: TransitBody[]) => (
        <>
            <TableRow className="bg-violet-50/50 hover:bg-violet-50/50 border-t border-violet-100">
                <TableCell colSpan={7} className="py-3 px-6">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-violet-600 font-black">
                        {title}
                    </span>
                </TableCell>
            </TableRow>
            {bodies.map((body, index) => (
                <TableRow
                    key={body.name}
                    className={`
                        border-b border-skyblue-50 
                        hover:bg-skyblue-50/30 
                        transition-colors
                        ${index % 2 === 0 ? 'bg-white' : 'bg-skyblue-50/10'}
                    `}
                >
                    <TableCell className="font-bold text-neutral-700 py-4 px-6">
                        {body.name}
                    </TableCell>
                    <TableCell className="text-neutral-500 font-medium py-4">
                        {body.sign}
                    </TableCell>
                    <TableCell className="text-neutral-600 text-right font-mono text-xs py-4 tabular-nums">
                        {body.degree}
                    </TableCell>
                    <TableCell className="text-neutral-500 py-4 italic">
                        {body.nakshatra}
                    </TableCell>
                    <TableCell className="text-neutral-500 text-center py-4 font-black">
                        {body.pada}
                    </TableCell>
                    <TableCell className="text-neutral-400 text-right font-mono text-[10px] py-4">
                        {body.speed.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-center py-4 px-6">
                        {body.retrograde && (
                            <span className="text-violet-500 font-black text-xs bg-violet-100 px-2 py-0.5 rounded-full shadow-sm border border-violet-200">R</span>
                        )}
                    </TableCell>
                </TableRow>
            ))}
        </>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/40 p-3 rounded-2xl border border-white/50 backdrop-blur-sm">
                <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2 pl-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)] animate-pulse" />
                    Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
                <Button
                    onClick={fetchTransits}
                    disabled={loading}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-[11px] font-black uppercase tracking-widest text-violet-600 hover:text-violet-700 hover:bg-violet-50 transition-all active:scale-95"
                >
                    <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <div className="w-full overflow-hidden rounded-3xl border border-skyblue-100 shadow-xl bg-white relative">
                <div className="overflow-x-auto max-h-[700px] scrollbar-thin scrollbar-thumb-skyblue-100">
                    <Table className="relative">
                        <TableHeader className="sticky top-0 z-30 bg-white/90 backdrop-blur-md shadow-sm border-b border-skyblue-100">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="text-[10px] uppercase font-black text-neutral-400 tracking-widest h-12 px-6">Planet</TableHead>
                                <TableHead className="text-[10px] uppercase font-black text-neutral-400 tracking-widest h-12">Sign</TableHead>
                                <TableHead className="text-[10px] uppercase font-black text-neutral-400 tracking-widest h-12 text-right">Degree</TableHead>
                                <TableHead className="text-[10px] uppercase font-black text-neutral-400 tracking-widest h-12">Nakshatra</TableHead>
                                <TableHead className="text-[10px] uppercase font-black text-neutral-400 tracking-widest h-12 text-center">Pada</TableHead>
                                <TableHead className="text-[10px] uppercase font-black text-neutral-400 tracking-widest h-12 text-right">Speed</TableHead>
                                <TableHead className="text-[10px] uppercase font-black text-neutral-400 tracking-widest h-12 text-center px-6">(R)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mainPlanets.length > 0 ? (
                                <>
                                    {renderSection('Main Planets', mainPlanets)}
                                    {outerPlanets.length > 0 && renderSection('Outer Planets', outerPlanets)}
                                    {specialPoints.length > 0 && renderSection('Special Points', specialPoints)}
                                    {karakas.length > 0 && renderSection('Jaimini Karakas', karakas)}
                                </>
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-48 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="w-10 h-10 border-4 border-violet-100 border-t-violet-500 rounded-full animate-spin" />
                                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                                                {loading ? 'Fetching Celestial Transits...' : 'No celestial data available'}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-violet-50/50 border border-violet-100/50">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-violet-600 mb-3 flex items-center gap-2">
                        Points of Interest
                    </h4>
                    <ul className="grid grid-cols-1 gap-2">
                        <li className="text-[11px] text-neutral-500 leading-relaxed">
                            <strong className="text-violet-700">Maandi:</strong> Son of Saturn, indicator of karmic baggage and obstacles.
                        </li>
                        <li className="text-[11px] text-neutral-500 leading-relaxed">
                            <strong className="text-violet-700">Gulika:</strong> Sub-lord of Saturn, used for precision timing of results.
                        </li>
                    </ul>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-3 flex items-center gap-2">
                        Jaimini Karakas
                    </h4>
                    <ul className="grid grid-cols-1 gap-2">
                        <li className="text-[11px] text-neutral-500 leading-relaxed">
                            <strong className="text-indigo-700">Atmakaraka:</strong> Highest degree planet; the soul's primary desire/purpose.
                        </li>
                        <li className="text-[11px] text-neutral-500 leading-relaxed">
                            <strong className="text-indigo-700">Amatyakaraka:</strong> Second highest; indicator of career and status.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
