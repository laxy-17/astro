import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GLOSSARY } from '../data/glossary';
import { HelpCircle } from 'lucide-react';

interface PanchangaCardProps {
    title: string;
    icon: string;
    value: string;
    subValue?: string;
    completion?: number;
    endTime?: string;
}

export const PanchangaCard: React.FC<PanchangaCardProps> = ({
    title,
    icon,
    value,
    subValue,
    completion,
    endTime
}) => {
    const glossaryEntry = GLOSSARY[title];

    return (
        <div className="panchanga-card relative flex flex-col justify-between h-full p-5 bg-white border border-skyblue-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{icon}</span>
                        <TooltipProvider delayDuration={200}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1.5 cursor-help">
                                        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{title}</h4>
                                        {glossaryEntry && <HelpCircle className="w-3 h-3 text-violet-400 opacity-60 hover:opacity-100 transition-opacity" />}
                                    </div>
                                </TooltipTrigger>
                                {glossaryEntry && (
                                    <TooltipContent className="max-w-xs bg-violet-900 text-white border-violet-700">
                                        <p className="text-xs leading-relaxed">{glossaryEntry.definition}</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="text-lg font-bold text-neutral-700 leading-tight pr-2">{value}</div>
                    {subValue && <div className="text-[11px] font-medium text-violet-500/80">{subValue}</div>}
                </div>

                {completion !== undefined && (
                    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                        <svg className="w-12 h-12 -rotate-90">
                            <circle
                                className="text-skyblue-100"
                                strokeWidth="4"
                                stroke="currentColor"
                                fill="transparent"
                                r="20"
                                cx="24"
                                cy="24"
                            />
                            <circle
                                className="text-violet-500 transition-all duration-1000 ease-out"
                                strokeWidth="4"
                                strokeDasharray={2 * Math.PI * 20}
                                strokeDashoffset={2 * Math.PI * 20 * (1 - completion / 100)}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="20"
                                cx="24"
                                cy="24"
                            />
                        </svg>
                        <span className="absolute text-[10px] font-bold text-violet-600">
                            {Math.round(completion)}%
                        </span>
                    </div>
                )}
            </div>

            {endTime && (
                <div className="mt-auto pt-3 border-t border-skyblue-50">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-skyblue-400" />
                        Ends at <span className="text-neutral-600 font-bold">{endTime}</span>
                    </div>
                </div>
            )}
        </div>
    );
};
