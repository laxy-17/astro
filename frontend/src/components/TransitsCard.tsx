import React, { useEffect, useState } from 'react';
import { getTransits, type TransitPlanet } from '../api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight } from 'lucide-react';

export const TransitsCard: React.FC = () => {
    const [transits, setTransits] = useState<TransitPlanet[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransits = async () => {
            try {
                const data = await getTransits();
                setTransits(data);
            } catch (err) {
                console.error("Failed to fetch transits", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTransits();
        const interval = setInterval(fetchTransits, 300000); // 5 min
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <Card className="w-full bg-card/50 backdrop-blur-sm border-white/10">
                <CardContent className="p-6 text-center text-muted-foreground">
                    <div className="animate-spin text-2xl mb-2">✦</div>
                    Loading Sky Map...
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full border-border bg-card shadow-2xl overflow-hidden glass-panel">
            <CardHeader className="pb-4 border-b border-border">
                <CardTitle className="flex items-center gap-2 text-primary text-lg font-medium">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    Sky Now (Live Transits)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {transits.map((p) => (
                        <div
                            key={p.name}
                            className="group relative flex flex-col items-center bg-muted hover:bg-muted/80 border border-border rounded-xl p-3 transition-all duration-300 hover:scale-105"
                        >
                            <div className="text-sm font-semibold text-primary mb-1 flex items-center gap-1">
                                {p.name}
                                {p.retrograde && (
                                    <Badge variant="destructive" className="text-[0.6rem] h-4 px-1 py-0 uppercase">R</Badge>
                                )}
                            </div>
                            <div className="text-lg font-light text-foreground mb-1">
                                {p.sign}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{p.degree.toFixed(2)}°</span>
                                <span className="w-1 h-1 rounded-full bg-border" />
                                <span>{p.nakshatra}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
