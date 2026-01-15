import React from 'react';

interface AdminAccessModalProps {
    onEnter: () => void;
}

export const AdminAccessModal: React.FC<AdminAccessModalProps> = ({ onEnter }) => {
    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-gray-900 border-2 border-neon-cyan max-w-md w-full p-8 text-center relative shadow-[0_0_50px_rgba(0,255,255,0.3)]">
                <h3 className="font-pixel text-4xl text-neon-cyan mb-4 animate-pulse">ACCESO CONCEDIDO</h3>
                <p className="font-pixel text-white text-lg mb-8">BIENVENIDO AL PANEL DE CONTROL</p>
                <button
                    onClick={onEnter}
                    className="w-full bg-neon-cyan text-black font-pixel text-2xl py-3 hover:bg-white transition-colors"
                >
                    ENTRAR
                </button>
            </div>
        </div>
    );
};
