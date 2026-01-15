import React, { useState } from 'react';
import { useStore } from '../services/store';
import { FileUpload } from './FileUpload';
import { Trash2, Save, Plus } from 'lucide-react';
import { ImageModal } from './ImageModal';

export const AdminGallery: React.FC = () => {
    const { state, updateEvent } = useStore();
    const [selectedEventId, setSelectedEventId] = useState<number | ''>('');
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    const selectedEvent = state.events.find(e => e.id === Number(selectedEventId));

    const handleAddImage = (url: string) => {
        if (!selectedEvent) return;
        const updated = {
            ...selectedEvent,
            galleryImages: [...(selectedEvent.galleryImages || []), url]
        };
        updateEvent(updated);
        // TODO: Trigger API save for this event immediately
    };

    const handleDeleteImage = (index: number) => {
        if (!selectedEvent) return;
        const updated = {
            ...selectedEvent,
            galleryImages: selectedEvent.galleryImages.filter((_, i) => i !== index)
        };
        updateEvent(updated);
    };

    return (
        <div className="space-y-6 text-white max-w-6xl mx-auto p-6 bg-gray-900 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-display text-neon-cyan">Gestión de Galería</h2>
            </div>

            {/* Select Event */}
            <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-300 mb-2">Seleccionar Evento</label>
                <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-neon-cyan"
                >
                    <option value="">-- Elige un evento --</option>
                    {state.events.map(event => (
                        <option key={event.id} value={event.id}>
                            {event.name} ({new Date(event.date).toLocaleDateString()})
                        </option>
                    ))}
                </select>
            </div>

            {selectedEvent ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">

                    {/* Uploader */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 border-dashed flex flex-col items-center justify-center text-center">
                            <h3 className="text-lg font-semibold mb-2">Añadir Fotos</h3>
                            <p className="text-gray-400 text-sm mb-4">Sube nuevas fotos a la galería de este evento.</p>
                            <FileUpload
                                onUpload={handleAddImage}
                                label="Subir Foto"
                                className="w-full max-w-xs"
                            />
                        </div>

                        {/* Stats */}
                        <div className="md:col-span-2 bg-gray-800/30 p-6 rounded-lg border border-gray-700 flex flex-col justify-center">
                            <h3 className="text-xl font-bold text-white mb-2">{selectedEvent.name}</h3>
                            <p className="text-gray-400">{selectedEvent.description}</p>
                            <div className="mt-4 flex gap-4 text-sm font-mono">
                                <span className="px-3 py-1 bg-gray-700 rounded-full text-neon-pink">
                                    {selectedEvent.galleryImages?.length || 0} fotos
                                </span>
                                <span className="px-3 py-1 bg-gray-700 rounded-full text-neon-cyan">
                                    {selectedEvent.isArchived ? 'Archivado' : 'Activo'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Grid (Legacy Style) */}
                    <div className="admin-gallery-grid mt-6">
                        {selectedEvent.galleryImages?.map((img, idx) => (
                            <div key={idx} className="admin-gallery-item group">
                                <img
                                    src={img}
                                    alt={`Gallery ${idx}`}
                                    onClick={() => setLightboxImage(img)}
                                    // Image styling is handled by .admin-gallery-item img in index.css, mostly
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                />

                                <button
                                    onClick={() => handleDeleteImage(idx)}
                                    className="delete-img-btn"
                                    title="Eliminar imagen"
                                >
                                    X
                                </button>
                            </div>
                        ))}

                        {(!selectedEvent.galleryImages || selectedEvent.galleryImages.length === 0) && (
                            <div className="col-span-full py-12 text-center text-gray-500 italic">
                                No hay imágenes en esta galería.
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 border-2 border-dashed border-gray-800 rounded-xl">
                    <p className="text-lg">Selecciona un evento para gestionar su galería</p>
                </div>
            )}

            {/* Lightbox */}
            <ImageModal
                isOpen={!!lightboxImage}
                onClose={() => setLightboxImage(null)}
                imageUrl={lightboxImage || ''}
            />
        </div>
    );
};
