import React from 'react';
import { useStore } from '../services/store';
import { Image as ImageIcon, Ticket } from 'lucide-react';

interface GalleryPageProps {
    onSelectImage: (img: string) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ onSelectImage }) => {
    const { state } = useStore();

    return (
        <div className="space-y-12">
            <h2 className="text-5xl font-pixel text-white text-center text-glow-white">GALERÍAS</h2>
            {state.events.filter(e => e.galleryImages.length > 0).map(event => (
                <div key={event.id} className="border-t border-gray-800 pt-8 animate-fade-in">
                    <h3 className="text-3xl font-pixel text-white mb-6 pl-4 border-l-4 border-party-500 flex items-center gap-3">
                        <ImageIcon className="text-party-500" /> {event.name}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {event.galleryImages.map((img, idx) => (
                            <div key={idx} className="aspect-square bg-gray-900 border border-gray-700 overflow-hidden hover:border-white transition-all cursor-pointer group rounded-sm" onClick={() => onSelectImage(img)}>
                                <img src={img} alt="Gallery" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            {state.events.filter(e => e.galleryImages.length > 0).length === 0 && state.drags.filter(d => d.galleryImages.length > 0).length === 0 && (
                <div className="text-center py-20 border border-dashed border-gray-800 rounded-lg">
                    <ImageIcon className="mx-auto h-16 w-16 text-gray-700 mb-4" />
                    <p className="font-pixel text-gray-500 text-2xl">NO HAY FOTOS DISPONIBLES AÚN</p>
                </div>
            )}

            {/* Drags Galleries */}
            {state.drags.filter(d => d.galleryImages.length > 0).length > 0 && (
                <div className="pt-12 border-t border-gray-800">
                    <h2 className="text-4xl font-pixel text-party-500 text-center mb-12 text-glow-party">BOOK DE REINAS</h2>
                    {state.drags.filter(d => d.galleryImages.length > 0).map(drag => (
                        <div key={drag.id} className="mb-16 animate-fade-in">
                            <h3 className="text-3xl font-pixel text-white mb-6 pl-4 border-l-4 flex items-center gap-3" style={{ borderColor: drag.cardColor }}>
                                <Ticket className="w-4 h-4 mr-2" />
                                {drag.name}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {drag.galleryImages.map((img, idx) => (
                                    <div key={idx} className="aspect-[3/4] bg-gray-900 border border-gray-700 overflow-hidden hover:border-white transition-all cursor-pointer group rounded-sm" onClick={() => onSelectImage(img)}>
                                        <img src={img} alt={`${drag.name} gallery`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
