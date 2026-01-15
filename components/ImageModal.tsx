import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    onNext?: () => void;
    onPrev?: () => void;
    hasNext?: boolean;
    hasPrev?: boolean;
}

export const ImageModal: React.FC<ImageModalProps> = ({
    isOpen,
    onClose,
    imageUrl,
    onNext,
    onPrev,
    hasNext,
    hasPrev
}) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight' && onNext) onNext();
            if (e.key === 'ArrowLeft' && onPrev) onPrev();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, onNext, onPrev]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50"
            >
                <X className="w-8 h-8" />
            </button>

            <div className="relative w-full max-w-6xl h-full flex items-center justify-center">
                {hasPrev && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onPrev?.(); }}
                        className="absolute left-0 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all nav-btn"
                    >
                        <ChevronLeft className="w-10 h-10" />
                    </button>
                )}

                <img
                    src={imageUrl}
                    alt="Full screen"
                    className="max-h-[90vh] max-w-full object-contain rounded-lg shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                />

                {hasNext && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onNext?.(); }}
                        className="absolute right-0 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all nav-btn"
                    >
                        <ChevronRight className="w-10 h-10" />
                    </button>
                )}
            </div>
        </div>
    );
};
