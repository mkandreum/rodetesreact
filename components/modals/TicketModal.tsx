import React from 'react';
import { X, CheckCircle } from 'lucide-react';
import QRCodeGenerator from '../QRCodeGenerator';
import { Event } from '../../types';

interface TicketModalProps {
    event: Event;
    onClose: () => void;
    onSubmit: (form: { name: string; surname: string; email: string; quantity: number }) => void;
    generatedTicketId: string | null;
    form: { name: string; surname: string; email: string; quantity: number };
    setForm: (form: { name: string; surname: string; email: string; quantity: number }) => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ event, onClose, onSubmit, generatedTicketId, form, setForm }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-black border-2 border-white max-w-sm w-full p-6 relative shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                <button onClick={onClose} className="absolute top-2 right-2 text-white hover:text-red-500"><X /></button>

                {!generatedTicketId ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="font-pixel text-3xl text-white text-center mb-6 border-b border-gray-800 pb-4">COMPRAR ENTRADA</h3>
                        <div><label className="block font-pixel text-gray-400 text-sm mb-1">NOMBRE</label><input required className="w-full bg-gray-900 border border-gray-700 p-3 text-white focus:border-party-500 outline-none" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                        <div><label className="block font-pixel text-gray-400 text-sm mb-1">APELLIDOS</label><input required className="w-full bg-gray-900 border border-gray-700 p-3 text-white focus:border-party-500 outline-none" value={form.surname} onChange={e => setForm({ ...form, surname: e.target.value })} /></div>
                        <div><label className="block font-pixel text-gray-400 text-sm mb-1">EMAIL</label><input type="email" required className="w-full bg-gray-900 border border-gray-700 p-3 text-white focus:border-party-500 outline-none" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                        <div><label className="block font-pixel text-gray-400 text-sm mb-1">CANTIDAD</label><input type="number" min="1" max="5" required className="w-full bg-gray-900 border border-gray-700 p-3 text-white focus:border-party-500 outline-none" value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) })} /></div>
                        <button type="submit" className="w-full neon-btn font-pixel text-2xl py-3 mt-6 hover:bg-white hover:text-black transition-all">CONFIRMAR</button>
                    </form>
                ) : (
                    <div className="text-center space-y-6">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                        <h3 className="font-pixel text-3xl text-white mb-2">¡ENTRADA LISTA!</h3>
                        <div className="bg-white p-4 inline-block rounded-lg">
                            <QRCodeGenerator text={`TICKET_ID:${generatedTicketId}`} width={180} />
                        </div>
                        <div className="bg-gray-900 p-4 rounded text-left text-sm font-mono border border-gray-800">
                            <p className="text-gray-400">ID: <span className="text-white">{generatedTicketId}</span></p>
                            <p className="text-gray-400">Evento: <span className="text-white">{event.name}</span></p>
                            <p className="text-gray-400">Titular: <span className="text-white">{form.name} {form.surname}</span></p>
                        </div>
                        <button onClick={() => window.print()} className="text-party-400 underline font-pixel text-lg">Descargar / Imprimir</button>
                    </div>
                )}
            </div>
        </div>
    );
};
