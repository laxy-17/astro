import React from 'react';
import { Sparkles, Ban, Sunrise } from 'lucide-react';
import type { AuspiciousTimings as TimingsType } from '../api/client';

interface AuspiciousTimingsProps {
    timings: TimingsType;
}

export const AuspiciousTimings: React.FC<AuspiciousTimingsProps> = ({ timings }) => {
    return (
        <div className="timings-section">
            <h3 className="section-title">
                <Sparkles className="w-5 h-5 text-violet-500" /> Auspicious & Inauspicious Periods
            </h3>

            <div className="timings-grid">
                <div className="timing-item auspicious">
                    <div className="timing-info">
                        <Sunrise className="w-5 h-5 text-green-600" />
                        <span className="timing-label">Abhijit Muhurta</span>
                    </div>
                    <span className="timing-range">{timings.abhijit_muhurta.start} - {timings.abhijit_muhurta.end}</span>
                </div>

                <div className="timing-item auspicious">
                    <div className="timing-info">
                        <Sparkles className="w-5 h-5 text-green-600" />
                        <span className="timing-label">Brahma Muhurta</span>
                    </div>
                    <span className="timing-range">{timings.brahma_muhurta.start} - {timings.brahma_muhurta.end}</span>
                </div>

                <div className="timing-item inauspicious">
                    <div className="timing-info">
                        <Ban className="w-5 h-5 text-red-600" />
                        <span className="timing-label">Rahu Kaal</span>
                    </div>
                    <span className="timing-range">{timings.rahu_kaal.start} - {timings.rahu_kaal.end}</span>
                </div>

                {timings.gulika_kaal && (
                    <div className="timing-item inauspicious">
                        <div className="timing-info">
                            <Ban className="w-5 h-5 text-orange-600" />
                            <span className="timing-label">Gulika Kaal</span>
                        </div>
                        <span className="timing-range">{timings.gulika_kaal.start} - {timings.gulika_kaal.end}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
