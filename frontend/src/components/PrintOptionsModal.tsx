import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileText, Printer } from "lucide-react";

interface PrintOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPrint: (sections: string[]) => void;
}

const SECTIONS = [
    { id: 'charts', label: 'Birth Charts (South & North Indian)' },
    { id: 'planetary', label: 'Planetary Details Table' },
    { id: 'panchanga', label: 'Panchanga & Special Timings' },
    { id: 'mentor', label: 'Daily Mentor Guidance' },
    { id: 'dashas', label: 'Dasha Periods & Strengths' },
    { id: 'transits', label: 'Current Transits' }
];

export const PrintOptionsModal: React.FC<PrintOptionsModalProps> = ({ isOpen, onClose, onPrint }) => {
    const [selected, setSelected] = useState<string[]>(['charts', 'planetary', 'panchanga', 'mentor', 'dashas']);

    const toggleSection = (id: string) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handlePrint = () => {
        onPrint(selected);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-white border-violet-100 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold text-violet-700">
                        <Printer className="w-6 h-6" /> Export to PDF
                    </DialogTitle>
                    <DialogDescription>
                        Select the sections you want to include in your report.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 gap-3">
                        {SECTIONS.map((section) => (
                            <div key={section.id} className="flex items-center space-x-3 p-3 rounded-lg border border-neutral-100 hover:bg-violet-50/50 transition-colors">
                                <Checkbox
                                    id={section.id}
                                    checked={selected.includes(section.id)}
                                    onCheckedChange={() => toggleSection(section.id)}
                                    className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                                />
                                <Label htmlFor={section.id} className="flex-1 cursor-pointer font-medium text-neutral-600">
                                    {section.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter className="sm:justify-between gap-4">
                    <div className="text-xs text-neutral-400 self-center">
                        * Export as PDF via Print Dialog
                    </div>
                    <Button type="submit" onClick={handlePrint} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
                        <FileText className="w-4 h-4" /> Generate Report
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
