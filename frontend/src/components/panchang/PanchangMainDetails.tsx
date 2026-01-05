import React from 'react';
import type { CompletePanchangResponse } from '../../api/panchangApi';

interface PanchangMainDetailsProps {
    data: CompletePanchangResponse;
}

const DetailRow = ({ label, value, subvalue }: { label: string, value: React.ReactNode, subvalue?: string }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors px-3 rounded-lg">
        <span className="font-bold text-slate-500 w-32 shrink-0 uppercase text-[10px] tracking-widest">{label}</span>
        <div className="text-right flex-1">
            <div className="text-base font-bold text-slate-800">{value}</div>
            {subvalue && <div className="text-[10px] font-semibold text-slate-500 bg-slate-100/50 inline-block px-1.5 rounded italic">{subvalue}</div>}
        </div>
    </div>
);

const SectionTitle = ({ title }: { title: string }) => (
    <h3 className="text-xl font-black text-violet-900 mt-10 mb-6 flex items-center gap-3 pb-3 border-b-2 border-violet-100">
        <div className="w-2 h-6 bg-violet-600 rounded-full"></div>
        {title}
    </h3>
);

export const PanchangMainDetails: React.FC<PanchangMainDetailsProps> = ({ data }) => {
    return (
        <div className="flex flex-col gap-8">


            <div className="flex flex-col xl:flex-row gap-8 items-start">

                {/* Left Column (Primary Info) */}
                <div className="w-full xl:min-w-[400px] xl:w-[35%] bg-white p-5 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200">
                    <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-5 rounded-2xl mb-6 text-white shadow-lg shadow-violet-200">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Tamil Calendar</span>
                            <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">{data.tamil_year}</span>
                        </div>
                        <div className="text-4xl font-black mb-2 tracking-tight">
                            {data.tamil_month} {data.tamil_date}
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm font-bold opacity-90">
                            <span className="bg-white/10 px-3 py-1 rounded-lg">{data.naal}</span>
                            <span className="bg-white/10 px-3 py-1 rounded-lg">{data.pirai}</span>
                        </div>
                    </div>

                    <SectionTitle title="Core Panchang" />

                    <div className="space-y-1">
                        {data.tithi.map((t, idx) => (
                            <DetailRow
                                key={idx}
                                label={idx === 0 ? "Tithi" : ""}
                                value={<span className="text-violet-700">{t.name}</span>}
                                subvalue={`${t.paksha} • Ending at ${t.end_time}`}
                            />
                        ))}
                        {data.nakshatra.map((n, idx) => (
                            <DetailRow
                                key={idx}
                                label={idx === 0 ? "Nakshatra" : ""}
                                value={<span className="text-indigo-600 font-bold">{n.name}</span>}
                                subvalue={`Until ${n.end_time}`}
                            />
                        ))}
                        {data.yoga.map((y, idx) => (
                            <DetailRow
                                key={idx}
                                label={idx === 0 ? "Yoga" : ""}
                                value={y.name}
                                subvalue={`Until ${y.end_time}`}
                            />
                        ))}
                        {data.karana.map((k, idx) => (
                            <DetailRow
                                key={idx}
                                label={idx === 0 ? "Karana" : ""}
                                value={k.name}
                                subvalue={`Until ${k.end_time}`}
                            />
                        ))}
                        <div className="mt-2">
                            <DetailRow label="Vaaram" value={data.vaaram} />
                        </div>
                    </div>
                </div>

                {/* Right Column (Timings & Details) */}
                <div className="w-full xl:flex-1 space-y-8">

                    {/* Visual Grid for Timings */}
                    <div className="flex flex-col gap-6">

                        {/* Auspicious Card */}
                        <div className="bg-green-50/40 p-8 rounded-3xl shadow-xl shadow-green-100/30 border border-green-100 relative overflow-hidden h-full transition-all hover:bg-green-50/60">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/50 -mr-16 -mt-16 rounded-full opacity-50"></div>
                            <h3 className="text-green-700 font-black mb-6 uppercase text-xs tracking-[0.2em] flex items-center gap-2 border-b border-green-100/50 pb-4 relative z-10">
                                <span className="p-2 bg-green-100 rounded-lg text-xs">🍀</span> Auspicious Periods
                            </h3>
                            <div className="space-y-1 relative z-10">
                                <div className="flex justify-between items-center py-3 border-b border-green-100/30">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-28 shrink-0">Abhijit Muhurta</span>
                                    <span className="font-black text-green-700 text-sm text-right flex-1 leading-tight">{data.abhijit_muhurtham.start} – {data.abhijit_muhurtham.end}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-green-100/30">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-28 shrink-0">Amrita Kaalam</span>
                                    <span className="font-black text-green-700 text-sm text-right flex-1 leading-tight">{data.amrita_kaalam.start} – {data.amrita_kaalam.end}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-green-100/30">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-28 shrink-0">Brahma Muhurta</span>
                                    <span className="font-black text-green-700 text-sm text-right flex-1 leading-tight">{data.brahma_muhurtham.start} – {data.brahma_muhurtham.end}</span>
                                </div>
                            </div>
                        </div>

                        {/* Inauspicious Card */}
                        <div className="bg-red-50/40 p-8 rounded-3xl shadow-xl shadow-red-100/30 border border-red-100 relative overflow-hidden h-full transition-all hover:bg-red-50/60">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/50 -mr-16 -mt-16 rounded-full opacity-50"></div>
                            <h3 className="text-red-700 font-black mb-6 uppercase text-xs tracking-[0.2em] flex items-center gap-2 border-b border-red-100/50 pb-4 relative z-10">
                                <span className="p-2 bg-red-100 rounded-lg text-xs">🛑</span> Inauspicious Periods
                            </h3>
                            <div className="space-y-1 relative z-10">
                                <div className="flex justify-between items-center py-3 border-b border-red-100/30">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-28 shrink-0">Rahu Kaalam</span>
                                    <span className="font-black text-red-700 text-sm text-right flex-1 leading-tight">{data.rahu_kaalam.start} – {data.rahu_kaalam.end}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-red-100/30">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-28 shrink-0">Yamagandam</span>
                                    <span className="font-black text-red-700 text-sm text-right flex-1 leading-tight">{data.yamagandam.start} – {data.yamagandam.end}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-red-100/30">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-28 shrink-0">Gulikai</span>
                                    <span className="font-black text-red-700 text-sm text-right flex-1 leading-tight">{data.gulikai.start} – {data.gulikai.end}</span>
                                </div>
                                {data.dur_muhurtham.map((dm, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-3 border-b border-red-100/30 last:border-0 text-red-600/60">
                                        <span className="text-[10px] font-black uppercase tracking-widest w-28 shrink-0">Dur Muhurtham</span>
                                        <span className="font-bold text-red-700 text-sm text-right flex-1 leading-tight">{dm.start} – {dm.end}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Chandrashtamam Section (Redesigned) */}
                    {data.chandrashtamam.length > 0 && (
                        <div className="bg-red-50/60 border border-red-100/50 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm mt-4">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">⚠️</span>
                                <div>
                                    <h4 className="text-sm font-black text-red-800 uppercase tracking-wide leading-tight">Chandrashtamam Active</h4>
                                    <div className="text-[10px] text-red-600/80 font-medium leading-tight mt-0.5">
                                        Strictly avoid new ventures & travel
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-end">
                                {data.chandrashtamam.map((star, i) => (
                                    <span key={i} className="bg-white/80 text-red-700 border border-red-100 px-3 py-1 rounded-lg text-xs font-bold shadow-sm whitespace-normal text-center">
                                        {star}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Auspicious Yogas Carousels or List */}
                    {data.auspicious_yogas.length > 0 && (
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {data.auspicious_yogas.map((yoga, idx) => (
                                <div key={idx} className="min-w-[300px] flex-1 bg-white p-6 rounded-2xl border-2 border-green-100 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-green-400"></div>
                                    <div className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        ✨ {yoga.name}
                                    </div>
                                    <div className="text-xl font-black text-green-950 mb-2">{yoga.timing}</div>
                                    <p className="text-xs font-medium text-slate-500 leading-tight italic">{yoga.description}</p>
                                </div>
                            ))}
                        </div>
                    )}





                </div>

            </div>

            {/* Lunar & Year Chronicle (Full Width Moved) */}
            <div className="mt-6 bg-slate-50 p-6 rounded-3xl border border-slate-200/50 w-full">
                <h4 className="font-black text-[11px] text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-slate-300 rounded-full"></span> Lunar & Year Chronicles
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-sm">
                    <div className="space-y-1">
                        <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest block">Amanta Month</span>
                        <span className="font-bold text-slate-900 text-base leading-none whitespace-nowrap">{data.lunar_month_year.amanta}</span>
                    </div>
                    <div className="space-y-1">
                        <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest block">Purnimanta</span>
                        <span className="font-bold text-slate-900 text-base leading-none whitespace-nowrap">{data.lunar_month_year.purnimanta}</span>
                    </div>
                    <div className="space-y-1">
                        <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest block">Vikram Samvat</span>
                        <span className="font-bold text-slate-900 text-base leading-none whitespace-nowrap">{data.lunar_month_year.vikram_year}</span>
                    </div>
                    <div className="space-y-1">
                        <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest block">Shaka Samvat</span>
                        <span className="font-bold text-slate-900 text-base leading-none whitespace-nowrap">{data.lunar_month_year.shaka_year}</span>
                    </div>
                    <div className="space-y-1 col-span-2">
                        <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest block">National Indian Calendar</span>
                        <span className="font-bold text-slate-900 text-base leading-none whitespace-nowrap">{data.lunar_month_year.saka_national}</span>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center group flex flex-col items-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase mb-1 group-hover:text-violet-500 transition-colors">Agnivasa</div>
                        <div className="text-sm font-black text-slate-800">{data.agnivasa}</div>
                    </div>
                    <div className="text-center group border-l-0 md:border-l border-slate-200 flex flex-col items-center pt-4 md:pt-0 border-t md:border-t-0">
                        <div className="text-[10px] font-black text-slate-400 uppercase mb-1 group-hover:text-violet-500 transition-colors">Chandra Vasa</div>
                        <div className="text-sm font-black text-slate-800">{data.chandra_vasa}</div>
                    </div>
                    <div className="text-center group border-l-0 md:border-l border-slate-200 flex flex-col items-center pt-4 md:pt-0 border-t md:border-t-0">
                        <div className="text-[10px] font-black text-slate-400 uppercase mb-1 group-hover:text-violet-500 transition-colors">Rahukala Vasa</div>
                        <div className="text-sm font-black text-slate-800">{data.rahukala_vasa}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
