import React from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

interface ScanResultModalProps {
    result: {
        status: 'success' | 'error' | 'warning';
        message: string;
        detail?: string;
    };
    onClose: () => void;
    onScanAnother: () => void;
}

export const ScanResultModal: React.FC<ScanResultModalProps> = ({ result, onClose, onScanAnother }) => {
    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in">
            <div className={`bg-gray-900 border-4 max-w-sm w-full p-6 text-center shadow-2xl ${result.status === 'success' ? 'border-green-500' :
                    result.status === 'warning' ? 'border-yellow-500' : 'border-red-500'
                }`}>
                {result.status === 'success' && <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />}
                {result.status === 'warning' && <AlertTriangle className="w-20 h-20 text-yellow-500 mx-auto mb-4" />}
                {result.status === 'error' && <X className="w-20 h-20 text-red-500 mx-auto mb-4" />}

                <h3 className={`font-pixel text-3xl mb-2 ${result.status === 'success' ? 'text-green-500' :
                        result.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                    }`}>{result.message}</h3>

                <p className="text-white font-mono text-lg mb-6 break-words">{result.detail}</p>

                <button onClick={onScanAnother} className="w-full neon-btn font-pixel text-xl py-3 mb-2">ESCANEAR OTRO</button>
                <button onClick={onClose} className="w-full border border-gray-600 text-gray-400 font-pixel text-lg py-2 hover:text-white">CERRAR</button>
            </div>
        </div>
    );
};
