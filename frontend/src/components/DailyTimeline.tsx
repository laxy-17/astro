import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Sun, Moon, Clock } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface Hora {
    index: number;
    start_time: string;
    end_time: string;
    ruler: string;
    quality: string;
    color: string | null;
}

interface TimelineData {
    date: string;
    location: string;
    sunrise: string;
    sunset: string;
    horas: Hora[];
}

export function DailyTimeline() {
    const [data, setData] = useState<TimelineData | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Hardcoded location "New York" for MVP demo if not provided
    // ideally comes from Context or passed props
    const TEST_LAT = 40.7128;
    const TEST_LON = -74.0060;
    const TEST_TZ = "America/New_York";

    useEffect(() => {
        const fetchHoras = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const res = await fetch(
                    `http://localhost:8000/daily/horas?lat=${TEST_LAT}&lon=${TEST_LON}&date_str=${today}&timezone_str=${TEST_TZ}`
                );
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error("Failed to fetch daily logic", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHoras();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading Daily Insights...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Failed to load data.</div>;

    return (
        <div className="h-screen w-full bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b p-4 flex items-center gap-4 sticky top-0 z-10">
                <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Today's Energy</h1>
                    <p className="text-xs text-slate-500">{data.date} • {TEST_TZ.split('/')[1]}</p>
                </div>
            </header>

            {/* Main Content */}
            <ScrollArea className="flex-1 p-4">
                <div className="max-w-md mx-auto space-y-6 pb-20">

                    {/* Sunrise/Sunset Card */}
                    <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-100">
                        <CardContent className="p-4 flex justify-between items-center">
                            <div className="flex flex-col items-center">
                                <Sun className="h-6 w-6 text-orange-500 mb-1" />
                                <span className="text-xs font-medium text-orange-700">Sunrise</span>
                                <span className="text-sm font-bold">{data.sunrise.split(' ')[0]} {data.sunrise.split(' ')[1]}</span>
                            </div>
                            <div className="h-8 w-px bg-orange-200"></div>
                            <div className="flex flex-col items-center">
                                <Moon className="h-6 w-6 text-indigo-500 mb-1" />
                                <span className="text-xs font-medium text-indigo-700">Sunset</span>
                                <span className="text-sm font-bold">{data.sunset.split(' ')[0]} {data.sunset.split(' ')[1]}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <div className="space-y-3">
                        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Hourly Flow</h2>

                        {data.horas.map((hora) => (
                            <Card key={hora.index} className="overflow-hidden hover:shadow-md transition-shadow">
                                <div className="flex">
                                    {/* Time Column */}
                                    <div className="w-20 bg-slate-100 flex flex-col justify-center items-center p-2 border-r">
                                        <span className="text-xs font-mono text-slate-600">{hora.start_time.split(' ')[0]}</span>
                                        <span className="text-[10px] text-slate-400">{hora.start_time.split(' ')[1]}</span>
                                    </div>

                                    {/* Content Column */}
                                    <div className="flex-1 p-3 flex justify-between items-center">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-800">{hora.ruler} Hora</span>
                                                {/* Quality Badge Placeholder */}
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${hora.quality === 'Good' ? 'bg-green-100 text-green-700' :
                                                    hora.quality === 'Bad' ? 'bg-red-100 text-red-700' :
                                                        'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {hora.quality || 'Neutral'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {hora.start_time.split(' ')[0]} - {hora.end_time.split(' ')[0]} {hora.end_time.split(' ')[1]}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Color Strip */}
                                    <div className="w-1.5" style={{ backgroundColor: hora.color || '#ccc' }}></div>
                                </div>
                            </Card>
                        ))}
                    </div>

                </div>
            </ScrollArea>
        </div>
    );
}
