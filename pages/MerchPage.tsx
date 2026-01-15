import React from 'react';
import { useStore } from '../services/store';
import { MerchItem, Drag } from '../types';

interface MerchPageProps {
    onSelectMerch: (item: MerchItem, drag: Drag | null) => void;
}

export const MerchPage: React.FC<MerchPageProps> = ({ onSelectMerch }) => {
    const { state } = useStore();

    const renderMerchCard = (item: MerchItem, drag: Drag | null) => (
        <div key={item.id} className="bg-gray-900 border border-gray-800 hover:border-gray-600 transition-all flex flex-col">
            <div className="aspect-square bg-black relative overflow-hidden">
                {item.imageUrl && (
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                )}
                {drag && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white font-pixel text-xs px-2 py-1 rounded">
                        NEW
                    </div>
                )}
            </div>
            <div className="p-3 flex flex-col flex-grow">
                <h3 className="text-lg font-pixel text-white mb-2 line-clamp-2">{item.name}</h3>
                {drag && (
                    <p className="text-xs font-pixel text-party-400 mb-2">{drag.name}</p>
                )}
                <div className="mt-auto">
                    <span className="text-2xl font-extrabold text-white block mb-2">{item.price.toFixed(2)} €</span>
                    <button
                        onClick={() => onSelectMerch(item, drag)}
                        className="w-full neon-btn font-pixel text-sm py-1.5"
                    >
                        COMPRAR
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-pixel text-white text-center mb-4 text-glow-white">MERCHANDISING</h2>

            {/* RODETES OFICIAL */}
            <section>
                <h3 className="text-xl font-pixel text-party-400 mb-3">RODETES OFICIAL</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {state.webMerch.map(item => renderMerchCard(item, null))}
                </div>
            </section>

            {/* Drag-specific merch */}
            {state.drags.map(drag => {
                const dragItems = state.dragMerch.filter(m => m.dragId === drag.id);
                if (dragItems.length === 0) return null;

                return (
                    <section key={drag.id}>
                        <h3 className="text-xl font-pixel mb-3" style={{ color: drag.cardColor || '#F02D7D' }}>
                            {drag.name.toUpperCase()}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {dragItems.map(item => renderMerchCard(item, drag))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
};
