import React from 'react';
import { useStore } from '../services/store';
import { MerchItem, Drag } from '../types';

interface MerchPageProps {
    onSelectMerch: (item: MerchItem, drag: Drag | null) => void;
}

export const MerchPage: React.FC<MerchPageProps> = ({ onSelectMerch }) => {
    const { state } = useStore();

    return (
        <div className="space-y-16">
            <h2 className="text-5xl font-pixel text-white text-center text-glow-white">MERCHANDISING</h2>

            {/* Web Merch */}
            <section>
                <h3 className="text-3xl font-pixel text-white mb-6 border-b border-gray-700 pb-2">RODETES OFICIAL</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {state.webMerch.length > 0 ? state.webMerch.map(item => (
                        <div key={item.id} className="bg-gray-900 border border-gray-700 p-4 hover:border-white transition-all hover:-translate-y-1 group">
                            <div className="aspect-square bg-black mb-4 overflow-hidden rounded-sm relative">
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute top-2 right-2 bg-party-600 text-white text-xs px-2 py-1 font-bold rounded">NEW</div>
                            </div>
                            <h4 className="font-pixel text-xl truncate mb-1">{item.name}</h4>
                            <div className="flex justify-between items-center mt-3">
                                <span className="font-bold text-lg text-party-400">{item.price} €</span>
                                <button
                                    onClick={() => onSelectMerch(item, null)}
                                    className="bg-white text-black font-pixel px-4 py-1 hover:bg-gray-200 uppercase text-sm"
                                >
                                    Comprar
                                </button>
                            </div>
                        </div>
                    )) : <p className="text-gray-500 font-pixel">PRÓXIMAMENTE</p>}
                </div>
            </section>

            {/* Drags Merch */}
            <section>
                <h3 className="text-3xl font-pixel text-white mb-6 border-b border-gray-700 pb-2">MERCH DE DRAGS</h3>
                {state.drags.filter(d => d.merchItems.length > 0).map(drag => (
                    <div key={drag.id} className="mb-12">
                        <h4 className="font-pixel text-2xl mb-4 flex items-center gap-3" style={{ color: drag.cardColor }}>
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: drag.cardColor }}></span>
                            {drag.name}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {drag.merchItems.map(item => (
                                <div key={item.id} className="bg-gray-900 border border-gray-700 p-4 hover:border-white transition-all hover:-translate-y-1 group">
                                    <div className="aspect-square bg-black mb-4 overflow-hidden rounded-sm">
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    </div>
                                    <h4 className="font-pixel text-xl truncate mb-1">{item.name}</h4>
                                    <div className="flex justify-between items-center mt-3">
                                        <span className="font-bold text-lg text-gray-300">{item.price} €</span>
                                        <button
                                            onClick={() => onSelectMerch(item, drag)}
                                            className="bg-white text-black font-pixel px-4 py-1 hover:bg-gray-200 uppercase text-sm"
                                        >
                                            Comprar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
};
