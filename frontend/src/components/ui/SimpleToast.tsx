import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface SimpleToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

export const SimpleToast: React.FC<SimpleToastProps> = ({
    message,
    isVisible,
    onClose,
    duration = 3000
}) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="bg-white border border-green-200 shadow-lg rounded-xl p-4 flex items-center gap-3 pr-10 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />
                <div className="p-1 bg-green-100 rounded-full">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                    <h4 className="font-bold text-sm text-neutral-800">Success</h4>
                    <p className="text-xs text-neutral-500 font-medium">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-600 p-1 rounded-full hover:bg-neutral-100 transition-colors"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};
