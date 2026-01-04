import React from 'react';
import type { BirthDetails } from '../api/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, MapPin, Compass } from "lucide-react"

interface Props {
    details: BirthDetails;
}

export const BirthParticulars: React.FC<Props> = ({ details }) => {
    return (
        <Card className="glass-panel border-border bg-card/40">
            <CardHeader className="pb-2 text-primary border-b border-border">
                <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-xl">📜</span> Birth Particulars
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="p-2 bg-violet-500/10 rounded-md">
                            <Calendar className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Date</div>
                            <div className="text-foreground font-medium">{details.date}</div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="p-2 bg-blue-500/10 rounded-md">
                            <Clock className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Time</div>
                            <div className="text-foreground font-medium">{details.time}</div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="p-2 bg-emerald-500/10 rounded-md">
                            <MapPin className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Location</div>
                            <div className="text-foreground font-medium truncate max-w-[120px]" title={`${details.latitude.toFixed(4)}, ${details.longitude.toFixed(4)}`}>
                                {details.latitude.toFixed(2)}°, {details.longitude.toFixed(2)}°
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="p-2 bg-orange-500/10 rounded-md">
                            <Compass className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Ayanamsa</div>
                            <div className="text-foreground font-medium">{details.ayanamsa_mode || 'LAHIRI'}</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
