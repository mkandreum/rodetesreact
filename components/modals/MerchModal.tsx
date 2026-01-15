import React from 'react';
import { X } from 'lucide-react';
import QRCodeGenerator from '../QRCodeGenerator';
import { MerchItem, Drag } from '../../types';

interface MerchModalProps {
    item: MerchItem;
    drag: Drag | null;
    onClose: () => void;
    onSubmit: (form: { name: string; surname: string; email: string; quantity: number }) => void;
    generatedSaleId: string | null;
    form: { name: string; surname: string; email: string; quantity: number };
    setForm: (form: { name: string; surname: string; email: string; quantity: number }) => void;
}

export const MerchModal: React.FC<MerchModalProps> = ({ item, drag, onClose, onSubmit, generatedSaleId, form, setForm }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-black border-2 border-white max-w-sm w-full p-6 relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-white hover:text-red-500"><X /></button>

                {!generatedSaleId ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="font-pixel text-3xl text-white text-center mb-2">PEDIDO</h3>
                        <div className="flex items-center gap-4 bg-gray-900 p-3 rounded mb-4">
                            <img src={item.imageUrl} className="w-12 h-12 object-cover rounded" alt={item.name} />
                            <div>
                                <p className="font-bold text-sm">{item.name}</p>
                                <p className="text-party-400">{item.price} €</p>
                            </div>
                        </div>

                        <div><label className="block font-pixel text-gray-400 text-sm mb-1">NOMBRE</label><input required className="w-full bg-gray-900 border border-gray-700 p-2 text-white" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                        <div><label className="block font-pixel text-gray-400 text-sm mb-1">APELLIDOS</label><input required className="w-full bg-gray-900 border border-gray-700 p-2 text-white" value={form.surname} onChange={e => setForm({ ...form, surname: e.target.value })} /></div>
                        <div><label className="block font-pixel text-gray-400 text-sm mb-1">EMAIL</label><input type="email" required className="w-full bg-gray-900 border border-gray-700 p-2 text-white" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                        <div><label className="block font-pixel text-gray-400 text-sm mb-1">CANTIDAD</label><input type="number" min="1" required className="w-full bg-gray-900 border border-gray-700 p-2 text-white" value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) })} /></div>
                        <button type="submit" className="w-full neon-btn font-pixel text-2xl py-2 mt-4">CONFIRMAR PEDIDO</button>
                    </form>
                ) : (
                    <div className="text-center space-y-4">
                        <h3 className="font-pixel text-3xl text-party-400 mb-2">¡PEDIDO CREADO!</h3>
                        <div className="bg-white p-4 inline-block rounded">
                            <QRCodeGenerator text={`MERCH_SALE_ID:${generatedSaleId}\nNOMBRE:${form.name}\nITEM:${item.name}`} width={180} />
                        </div>
                        <div className="bg-gray-900 p-4 rounded text-left text-sm font-mono border border-gray-800">
                            <p className="text-gray-400">ID Venta: <span className="text-white">{generatedSaleId}</span></p>
                            <p className="text-gray-400">Producto: <span className="text-white">{item.name}</span></p>
                            <p className="text-gray-400">Total: <span className="text-white">{(item.price * form.quantity).toFixed(2)} €</span></p>
                        </div>
                        <button onClick={() => window.print()} className="text-party-400 underline font-pixel text-lg">Guardar Comprobante</button>
                    </div>
                )}
            </div>
        </div>
    );
};
