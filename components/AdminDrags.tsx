import React, { useState } from 'react';
import { useStore } from '../services/store';
import { Edit, Trash, Plus, X } from 'lucide-react';
import { Drag } from '../types';

export const AdminDrags: React.FC = () => {
    const { state, updateState } = useStore();
    const [editingDrag, setEditingDrag] = useState<Partial<Drag> | null>(null);
    const [showModal, setShowModal] = useState(false);

    const handleDelete = async (id: number) => {
        if (!confirm('¿Borrar Drag?')) return;
        const newDrags = state.drags.filter(d => d.id !== id);
        updateState({ drags: newDrags });
    };

    const handleSave = () => {
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
        setShowModal(false);
        setEditingDrag(null);
    };

    return (
        <div className="bg-gray-900 border border-white p-6 shadow-[0_0_15px_rgba(255,255,255,0.1)] rounded-lg">
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
                    <li key={d.id} className="flex justify-between items-center bg-black p-3 border border-gray-800 rounded hover:border-gray-600 transition-colors">
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
                    <div className="bg-gray-900 border border-white w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-pixel text-2xl text-white">EDITOR DE DRAG</h3>
                            <button onClick={() => setShowModal(false)} className="text-white hover:text-red-500"><X /></button>
                        </div>

                        <div className="space-y-4">
                            <div><label className="text-sm text-gray-400">Nombre</label><input className="w-full bg-black border border-gray-700 p-2 text-white rounded" value={editingDrag.name || ''} onChange={e => setEditingDrag({ ...editingDrag, name: e.target.value })} /></div>
                            <div><label className="text-sm text-gray-400">Instagram</label><input className="w-full bg-black border border-gray-700 p-2 text-white rounded" value={editingDrag.instagramHandle || ''} onChange={e => setEditingDrag({ ...editingDrag, instagramHandle: e.target.value })} /></div>
                            <div><label className="text-sm text-gray-400">Color Card (Hex)</label><input className="w-full bg-black border border-gray-700 p-2 text-white rounded h-10" type="color" value={editingDrag.cardColor || '#ffffff'} onChange={e => setEditingDrag({ ...editingDrag, cardColor: e.target.value })} /></div>
                            <div><label className="text-sm text-gray-400">Imagen URL</label><input className="w-full bg-black border border-gray-700 p-2 text-white rounded" value={editingDrag.coverImageUrl || ''} onChange={e => setEditingDrag({ ...editingDrag, coverImageUrl: e.target.value })} /></div>
                            <div><label className="text-sm text-gray-400">Descripción</label><textarea className="w-full bg-black border border-gray-700 p-2 text-white h-24 rounded" value={editingDrag.description || ''} onChange={e => setEditingDrag({ ...editingDrag, description: e.target.value })} /></div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 font-pixel text-lg rounded">GUARDAR</button>
                            <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 font-pixel text-lg rounded">CANCELAR</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
