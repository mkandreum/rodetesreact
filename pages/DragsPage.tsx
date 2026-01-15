import React from 'react';
import { useStore } from '../services/store';
import { Instagram, Shirt } from 'lucide-react';
import { Drag, MerchItem } from '../types';

interface DragsPageProps {
    onSelectMerch: (item: MerchItem, drag: Drag) => void;
}

export const DragsPage: React.FC<DragsPageProps> = ({ onSelectMerch }) => {
    const { state } = useStore();

    return (
        <div className="space-y-12 page-fade-in">
            <h2 className="text-5xl font-pixel text-white text-left text-glow-white">NUESTRAS DRAGS</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {state.drags.map(drag => (
                    <div key={drag.id} className="bg-gray-900 border-2 hover:shadow-2xl transition-shadow duration-300" style={{ borderColor: drag.cardColor, boxShadow: `0 0 5px ${drag.cardColor}` }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                            <div className="bg-black aspect-[3/4] md:aspect-auto h-full overflow-hidden relative">
                                <img src={drag.coverImageUrl} alt={drag.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-20"></div>
                            </div>
                            <div className="p-8 flex flex-col relative">
                                <h3 className="text-4xl font-pixel text-white mb-2" style={{ textShadow: `0 0 10px ${drag.cardColor}` }}>{drag.name}</h3>
                                <a href={`https://instagram.com/${drag.instagramHandle}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                                    <Instagram size={18} /> @{drag.instagramHandle}
                                </a>
                                <p className="text-gray-300 font-sans mb-8 flex-grow leading-relaxed">{drag.description}</p>

                                {/* Drag Merch Preview */}
                                {drag.merchItems.length > 0 && (
                                    <div className="mt-auto pt-6 border-t border-gray-800">
                                        <h4 className="font-pixel text-xl mb-3 flex items-center gap-2"><Shirt size={16} /> MERCH EXCLUSIVO</h4>
                                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                                            {drag.merchItems.map(item => (
                                                <div key={item.id} className="flex-shrink-0 w-32 cursor-pointer group"
                                                    onClick={() => onSelectMerch(item, drag)}
                                                >
                                                    <div className="aspect-square bg-black border border-gray-600 mb-2 overflow-hidden group-hover:border-white rounded-md">
                                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <p className="text-xs font-pixel truncate text-gray-300 group-hover:text-white">{item.name}</p>
                                                    <p className="text-xs font-bold text-party-400">{Number(item.price || 0).toFixed(2)} €</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
