import React, { useEffect, useState } from 'react';
import { listCharts, deleteChart, type SavedChart, type BirthDetails } from '../api/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area" // Assuming ScrollArea is installed? If not, standard div overflow is fine.
import { Trash2, FolderOpen, Search, X } from "lucide-react"

interface Props {
    onLoad: (details: BirthDetails) => void;
    onClose: () => void;
}

export const ChartLibrary: React.FC<Props> = ({ onLoad, onClose }) => {
    const [charts, setCharts] = useState<SavedChart[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortMode, setSortMode] = useState<'date' | 'name'>('date');

    const loadCharts = async () => {
        try {
            const data = await listCharts();
            setCharts(data);
        } catch (e: any) {
            setError("Failed to load charts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCharts();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this chart?")) return;
        try {
            await deleteChart(id);
            setCharts(charts.filter(c => c.id !== id));
        } catch (e) {
            alert("Failed to delete chart");
        }
    };

    const handleLoad = (chart: SavedChart) => {
        const details: BirthDetails = {
            date: chart.date,
            time: chart.time,
            latitude: chart.latitude,
            longitude: chart.longitude,
            ayanamsa_mode: chart.ayanamsa_mode
        };
        onLoad(details);
        onClose();
    };

    const filteredCharts = charts
        .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (sortMode === 'name') {
                return a.name.localeCompare(b.name);
            } else {
                return b.id - a.id; // Newer first
            }
        });

    return (
        <Card className="w-full h-full border-0 bg-background shadow-2xl flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
                <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
                    <span className="text-2xl">📚</span> Chart Library
                    <span className="text-sm font-normal text-muted-foreground ml-2">({charts.length})</span>
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-white">
                    <X className="w-5 h-5" />
                </Button>
            </CardHeader>

            <div className="p-4 border-b border-border space-y-4 bg-muted/50">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-muted border border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-cosmic-nebula"
                        />
                    </div>
                    <select
                        value={sortMode}
                        onChange={(e) => setSortMode(e.target.value as 'date' | 'name')}
                        className="bg-muted border border-border text-foreground text-sm rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-cosmic-nebula"
                    >
                        <option value="date">Newest</option>
                        <option value="name">A-Z</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {loading && (
                    <div className="text-center py-10 text-muted-foreground animate-pulse">
                        Listing stars...
                    </div>
                )}

                {error && (
                    <div className="text-center py-10 text-red-400">
                        {error}
                    </div>
                )}

                {!loading && filteredCharts.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        <div className="text-4xl mb-2 opacity-30">📂</div>
                        No charts found.
                    </div>
                )}

                {filteredCharts.map(chart => (
                    <div
                        key={chart.id}
                        className="group flex items-center justify-between p-3 rounded-lg bg-muted border border-border hover:bg-muted/80 hover:border-sidebar-accent transition-all duration-200"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold border border-border">
                                {chart.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                                    {chart.name}
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <span>{chart.date}</span>
                                    <span className="w-1 h-1 rounded-full bg-border" />
                                    <span>{chart.time}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                size="sm"
                                className="h-8 bg-cosmic-nebula hover:bg-purple-600 text-white border-0"
                                onClick={() => handleLoad(chart)}
                            >
                                <FolderOpen className="w-3 h-3 mr-2" /> Load
                            </Button>
                            <Button
                                size="icon"
                                variant="destructive"
                                className="h-8 w-8 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
                                onClick={() => handleDelete(chart.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};
