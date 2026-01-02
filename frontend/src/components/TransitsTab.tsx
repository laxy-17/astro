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
            <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableCell colSpan={7} className="py-2 px-4">
                    <span className="text-xs uppercase tracking-wide text-cosmic-gold font-semibold">
                        {title}
                    </span>
                </TableCell>
            </TableRow>
            {bodies.map((body, index) => (
                <TableRow
                    key={body.name}
                    className={`
            border-b border-border/20 
            hover:bg-muted/10 
            transition-colors
            ${index % 2 === 0 ? 'bg-transparent' : 'bg-muted/5'}
          `}
                >
                    <TableCell className="font-medium text-foreground">
                        {body.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                        {body.sign}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right font-mono text-sm">
                        {body.degree}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                        {body.nakshatra}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-center">
                        {body.pada}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right font-mono text-sm">
                        {body.speed.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-center">
                        {body.retrograde && (
                            <span className="text-astral-red font-semibold">R</span>
                        )}
                    </TableCell>
                </TableRow>
            ))}
        </>
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                {/* Visual refresh indicator or status */}
                <div className="text-sm text-muted-foreground">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
                <Button
                    onClick={fetchTransits}
                    disabled={loading}
                    size="sm"
                    variant="outline"
                    className="border-border text-foreground hover:bg-muted"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <div className="w-full overflow-x-auto rounded-md border border-border">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-border/50 hover:bg-transparent">
                            <TableHead className="text-xs uppercase font-semibold text-muted-foreground h-10">Planet</TableHead>
                            <TableHead className="text-xs uppercase font-semibold text-muted-foreground h-10">Sign</TableHead>
                            <TableHead className="text-xs uppercase font-semibold text-muted-foreground h-10 text-right">Degree</TableHead>
                            <TableHead className="text-xs uppercase font-semibold text-muted-foreground h-10">Nakshatra</TableHead>
                            <TableHead className="text-xs uppercase font-semibold text-muted-foreground h-10 text-center">Pada</TableHead>
                            <TableHead className="text-xs uppercase font-semibold text-muted-foreground h-10 text-right">Speed</TableHead>
                            <TableHead className="text-xs uppercase font-semibold text-muted-foreground h-10 text-center">(R)</TableHead>
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
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    {loading ? 'Loading celestial data...' : 'No data available'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="text-xs text-muted-foreground space-y-1 p-2 border border-border/30 rounded bg-muted/10">
                <p>• <strong>Maandi:</strong> Son of Saturn, indicator of heavy karma or obstacles.</p>
                <p>• <strong>Gulika:</strong> Sub-lord of Saturn, indicates timing of obstacles.</p>
                <p>• <strong>Atmakaraka:</strong> Planet with highest degree, signifies the Soul's purpose.</p>
                <p>• <strong>Amatyakaraka:</strong> Second highest degree, signifies Career & Status.</p>
            </div>
        </div>
    );
};
