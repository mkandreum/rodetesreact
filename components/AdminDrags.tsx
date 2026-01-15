import React, { useState } from 'react';
import { useStore } from '../services/store';
import { Edit, Trash, Plus, X } from 'lucide-react';
import { Drag } from '../types';
import { api } from '../services/api';
import { FileUpload } from './FileUpload';

export const AdminDrags: React.FC = () => {
    const { state, updateState } = useStore();
    const [editingDrag, setEditingDrag] = useState<Partial<Drag> | null>(null);
    const [showModal, setShowModal] = useState(false);

    const handleDelete = async (id: number) => {
        if (!confirm('¿Borrar Drag?')) return;
        const newDrags = state.drags.filter(d => d.id !== id);
        updateState({ drags: newDrags });
        try {
            await api.saveState({ ...state, drags: newDrags });
        } catch (error) {
            console.error('Failed to save state:', error);
            alert('Error al guardar cambios.');
        }
    };

    const handleSave = async () => {
        if (!editingDrag) return;

        // Validate
        if (!editingDrag.name) return;

        let newDrags = [...state.drags];
        if (editingDrag.id) {
            // Update
            newDrags = newDrags.map(d => d.id === editingDrag.id ? { ...d, ...editingDrag } as Drag : d);
        } else {
            // Add
            const newId = (Math.max(...state.drags.map(d => d.id), 0) || 0) + 1;
            const newDrag = {
                ...editingDrag,
                id: newId,
                merchItems: [],
                galleryImages: []
            } as Drag;
            newDrags.push(newDrag);
        }

        updateState({ drags: newDrags });
        try {
            await api.saveState({ ...state, drags: newDrags });
            setShowModal(false);
            setEditingDrag(null);
        } catch (error) {
            console.error('Failed to save state:', error);
            alert('Error al guardar cambios.');
        }
    };

    return (
        <div className="bg-gray-900 border border-white p-6 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
                <h3 className="font-pixel text-2xl text-white">DRAGS</h3>
                <button
                    onClick={() => { setEditingDrag({}); setShowModal(true); }}
                    className="text-green-400 hover:text-green-300"
                >
                    <Plus size={24} />
                </button>
            </div>

            <ul className="space-y-3">
                {state.drags.map(d => (
                    <li key={d.id} className="flex justify-between items-center bg-black p-3 border border-gray-800 hover:border-gray-600 transition-colors">
                        <div className="flex-1 min-w-0 pr-4">
                            <p className="font-pixel truncate text-lg" style={{ color: d.cardColor || 'white' }}>{d.name}</p>
                            <p className="text-xs text-gray-500">Merch Items: {d.merchItems?.length || 0}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setEditingDrag(d); setShowModal(true); }}
                                className="text-blue-400 hover:text-blue-300 p-1"
                            >
                                <Edit size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(d.id)}
                                className="text-red-400 hover:text-red-300 p-1"
                            >
                                <Trash size={18} />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Editor Modal */}
            {showModal && editingDrag && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-white w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-pixel text-2xl text-white">EDITOR DE DRAG</h3>
                            <button onClick={() => setShowModal(false)} className="text-white hover:text-red-500"><X /></button>
                        </div>

                        <div className="space-y-4">
                            <div><label className="text-sm font-pixel text-gray-400">NOMBRE</label><input className="w-full bg-black border border-gray-700 p-2 text-white focus:border-party-500 outline-none" value={editingDrag.name || ''} onChange={e => setEditingDrag({ ...editingDrag, name: e.target.value })} /></div>
                            <div><label className="text-sm font-pixel text-gray-400">INSTAGRAM</label><input className="w-full bg-black border border-gray-700 p-2 text-white focus:border-party-500 outline-none" value={editingDrag.instagramHandle || ''} onChange={e => setEditingDrag({ ...editingDrag, instagramHandle: e.target.value })} /></div>
                            <div><label className="text-sm font-pixel text-gray-400">COLOR CARD (HEX)</label><input className="w-full bg-black border border-gray-700 p-2 text-white h-12 cursor-pointer focus:border-party-500 outline-none" type="color" value={editingDrag.cardColor || '#ffffff'} onChange={e => setEditingDrag({ ...editingDrag, cardColor: e.target.value })} /></div>
                            <div>
                                <label className="text-sm font-pixel text-gray-400">IMAGEN URL (O SUBIR)</label>
                                <div className="space-y-2">
                                    <input className="w-full bg-black border border-gray-700 p-2 text-white focus:border-party-500 outline-none" value={editingDrag.coverImageUrl || ''} onChange={e => setEditingDrag({ ...editingDrag, coverImageUrl: e.target.value })} placeholder="https://..." />
                                    <FileUpload onUpload={(url) => setEditingDrag({ ...editingDrag, coverImageUrl: url })} label="SUBIR IMAGEN" />
                                </div>
                            </div>
                            <div><label className="text-sm font-pixel text-gray-400">DESCRIPCIÓN</label><textarea className="w-full bg-black border border-gray-700 p-2 text-white h-24 focus:border-party-500 outline-none" value={editingDrag.description || ''} onChange={e => setEditingDrag({ ...editingDrag, description: e.target.value })} /></div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button onClick={handleSave} className="flex-1 neon-btn py-3 font-pixel text-xl hover:bg-white hover:text-black">GUARDAR</button>
                            <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-600 text-gray-400 hover:text-white hover:border-white py-3 font-pixel text-xl">CANCELAR</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
