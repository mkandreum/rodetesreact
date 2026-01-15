import React, { useState } from 'react';
import { useStore } from '../services/store';
import { Edit, Trash, Plus, X } from 'lucide-react';
import { Event } from '../types';
import { api } from '../services/api';

export const AdminEvents: React.FC = () => {
    const { state, updateState } = useStore(); // We'll need refresh or update actions
    const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);
    const [showModal, setShowModal] = useState(false);

    const handleDelete = async (id: number) => {
        if (!confirm('¿Borrar evento?')) return;
        const newEvents = state.events.filter(e => e.id !== id);
        updateState({ events: newEvents });
        try {
            await api.saveState({ ...state, events: newEvents });
        } catch (error) {
            console.error('Failed to save state:', error);
            alert('Error al guardar cambios en el servidor.');
        }
    };

    const handleSave = async () => {
        if (!editingEvent) return;

        // Validate
        if (!editingEvent.name || !editingEvent.date) return;

        // Logic to update or add
        let newEvents = [...state.events];
        if (editingEvent.id) {
            // Update
            newEvents = newEvents.map(e => e.id === editingEvent.id ? { ...e, ...editingEvent } as Event : e);
        } else {
            // Add
            const newId = (Math.max(...state.events.map(e => e.id), 0) || 0) + 1;
            const newEvent = {
                ...editingEvent,
                id: newId,
                ticketsSold: 0,
                galleryImages: [],
                isArchived: false
            } as Event;
            newEvents.push(newEvent);
        }

        updateState({ events: newEvents });
        try {
            await api.saveState({ ...state, events: newEvents });
            setShowModal(false);
            setEditingEvent(null);
        } catch (error) {
            console.error('Failed to save state:', error);
            alert('Error al guardar cambios en el servidor.');
        }
    };

    return (
        <div className="bg-gray-900 border border-white p-6 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
                <h3 className="font-pixel text-2xl text-white">EVENTOS</h3>
                <button
                    onClick={() => { setEditingEvent({}); setShowModal(true); }}
                    className="text-green-400 hover:text-green-300 border border-green-400 p-1 hover:bg-green-900 transition-colors"
                >
                    <Plus size={24} />
                </button>
            </div>

            <ul className="space-y-3">
                {state.events.map(e => (
                    <li key={e.id} className="flex justify-between items-center bg-black p-3 border border-gray-800 hover:border-white transition-colors">
                        <div className="flex-1 min-w-0 pr-4">
                            <p className="font-pixel truncate text-lg text-white">{e.name}</p>
                            <p className="text-xs text-gray-500">
                                Sold: {e.ticketsSold}/{e.ticketCapacity} | {new Date(e.date).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setEditingEvent(e); setShowModal(true); }}
                                className="text-blue-400 hover:text-blue-300 p-1 border border-transparent hover:border-blue-400"
                            >
                                <Edit size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(e.id)}
                                className="text-red-400 hover:text-red-300 p-1 border border-transparent hover:border-red-400"
                            >
                                <Trash size={18} />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Editor Modal */}
            {showModal && editingEvent && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border-2 border-white w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                            <h3 className="font-pixel text-3xl text-white">EDITOR DE EVENTO</h3>
                            <button onClick={() => setShowModal(false)} className="text-white hover:text-red-500"><X size={28} /></button>
                        </div>

                        <div className="space-y-4">
                            <div><label className="text-sm font-pixel text-gray-400">NOMBRE</label><input className="w-full bg-black border border-gray-600 p-2 text-white focus:border-party-500 outline-none" value={editingEvent.name || ''} onChange={e => setEditingEvent({ ...editingEvent, name: e.target.value })} /></div>
                            <div><label className="text-sm font-pixel text-gray-400">FECHA</label><input className="w-full bg-black border border-gray-600 p-2 text-white focus:border-party-500 outline-none" type="datetime-local" value={editingEvent.date || ''} onChange={e => setEditingEvent({ ...editingEvent, date: e.target.value })} /></div>
                            <div className="flex gap-4">
                                <div className="flex-1"><label className="text-sm font-pixel text-gray-400">PRECIO (€)</label><input className="w-full bg-black border border-gray-600 p-2 text-white focus:border-party-500 outline-none" type="number" value={editingEvent.price || 0} onChange={e => setEditingEvent({ ...editingEvent, price: parseFloat(e.target.value) })} /></div>
                                <div className="flex-1"><label className="text-sm font-pixel text-gray-400">CAPACIDAD</label><input className="w-full bg-black border border-gray-600 p-2 text-white focus:border-party-500 outline-none" type="number" value={editingEvent.ticketCapacity || 0} onChange={e => setEditingEvent({ ...editingEvent, ticketCapacity: parseInt(e.target.value) })} /></div>
                            </div>
                            <div><label className="text-sm font-pixel text-gray-400">IMAGEN URL</label><input className="w-full bg-black border border-gray-600 p-2 text-white focus:border-party-500 outline-none" value={editingEvent.posterImageUrl || ''} onChange={e => setEditingEvent({ ...editingEvent, posterImageUrl: e.target.value })} /></div>
                            <div><label className="text-sm font-pixel text-gray-400">DESCRIPCIÓN</label><textarea className="w-full bg-black border border-gray-600 p-2 text-white h-24 focus:border-party-500 outline-none" value={editingEvent.description || ''} onChange={e => setEditingEvent({ ...editingEvent, description: e.target.value })} /></div>
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
