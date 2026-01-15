import React, { useState } from 'react';
import { useStore } from '../services/store';
import { FileUpload } from './FileUpload';
import { Plus, Trash2, CheckCircle, Clock } from 'lucide-react';
import { MerchItem } from '../types';
import { api } from '../services/api';

export const AdminMerch: React.FC = () => {
    const { state, addMerchSale, updateMerchSaleStatus } = useStore(); // TODO: Add addMerchItem/deleteMerchItem to store or use API directly here and reload
    const [activeTab, setActiveTab] = useState<'sales' | 'items'>('sales');
    const [newItem, setNewItem] = useState<Partial<MerchItem>>({ name: '', price: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sales Stats
    const totalSales = state.merchSales?.length || 0;
    const pendingSales = state.merchSales?.filter(s => s.status === 'Pending').length || 0;
    const revenue = state.merchSales?.reduce((acc, s) => acc + (Number(s.itemPrice) * s.quantity), 0) || 0;

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.name || !newItem.price || !newItem.imageUrl) return;

        setIsSubmitting(true);
        try {
            // API call to create item
            await api.addMerchItem({
                ...newItem,
                drag_id: newItem.dragId || null // API expects drag_id snake_case or we handled it? 
                // api.addMerchItem body is JSON.stringify(data). 
                // My backend `merch.js` expects `drag_id`.
                // Typescript interface has `dragId`.
                // I should map it manually here or update `api.ts` to snakeCase request body?
                // Let's map manually to be safe.
            });
            // Refresh state
            window.location.reload(); // Simple refresh for now or add to state
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteItem = async (id: number) => {
        if (!confirm('¿Seguro que quieres eliminar este producto?')) return;
        try {
            await api.deleteMerchItem(id);
            window.location.reload();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6 text-white max-w-6xl mx-auto p-6 bg-gray-900 border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold font-display text-neon-pink">Gestión de Merch</h2>

                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('sales')}
                        className={`px-4 py-2 transition-colors border ${activeTab === 'sales' ? 'bg-neon-pink text-white border-neon-pink' : 'bg-gray-800 text-gray-400 border-gray-600 hover:text-white hover:border-white'}`}
                    >
                        Ventas
                    </button>
                    <button
                        onClick={() => setActiveTab('items')}
                        className={`px-4 py-2 transition-colors border ${activeTab === 'items' ? 'bg-neon-pink text-white border-neon-pink' : 'bg-gray-800 text-gray-400 border-gray-600 hover:text-white hover:border-white'}`}
                    >
                        Productos
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-800 p-4 border border-white">
                    <p className="text-gray-400 text-sm font-pixel">VENTAS TOTALES</p>
                    <p className="text-3xl font-bold text-white font-pixel">{totalSales}</p>
                </div>
                <div className="bg-gray-800 p-4 border border-white">
                    <p className="text-gray-400 text-sm font-pixel">PENDIENTES DE ENTREGA</p>
                    <p className="text-3xl font-bold text-yellow-400 font-pixel">{pendingSales}</p>
                </div>
                <div className="bg-gray-800 p-4 border border-white">
                    <p className="text-gray-400 text-sm font-pixel">INGRESOS TOTALES</p>
                    <p className="text-3xl font-bold text-green-400 font-pixel">{revenue.toFixed(2)}€</p>
                </div>
            </div>

            {activeTab === 'sales' && (
                <div className="bg-black/20 overflow-hidden border border-gray-800">
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4 p-4">
                        {state.merchSales?.slice().reverse().map(sale => (
                            <div key={sale.saleId} className="bg-gray-800 p-4 border border-gray-600 rounded-none shadow-sm space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-white font-bold text-lg font-pixel">{sale.nombre}</p>
                                        <p className="text-xs text-gray-400">{sale.email}</p>
                                    </div>
                                    <span className="text-neon-pink font-bold text-xl font-pixel">
                                        {(sale.itemPrice * sale.quantity).toFixed(2)}€
                                    </span>
                                </div>
                                <div className="text-sm text-gray-300 space-y-1 font-mono">
                                    <p><span className="text-gray-500 font-bold">ITEM:</span> <span className="text-white uppercase">{sale.itemName}</span> (x{sale.quantity})</p>
                                    <p><span className="text-gray-500 font-bold">FECHA:</span> {new Date(sale.saleDate).toLocaleDateString()}</p>
                                    <p><span className="text-gray-500 font-bold">ORIGEN:</span> {sale.dragName || 'Web Merch'}</p>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                                    {sale.status === 'Delivered' ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/50 border border-green-500 text-green-400 text-xs font-pixel">
                                            <CheckCircle className="w-3 h-3" /> ENTREGADO
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-900/50 border border-yellow-500 text-yellow-400 text-xs font-pixel">
                                            <Clock className="w-3 h-3" /> PENDIENTE
                                        </span>
                                    )}
                                    {sale.status !== 'Delivered' && (
                                        <button
                                            onClick={() => updateMerchSaleStatus(sale.saleId, 'Delivered')}
                                            className="px-4 py-2 bg-gray-700 hover:bg-green-600 text-white text-xs border border-gray-500 hover:border-green-400 uppercase font-pixel transition-colors"
                                        >
                                            ENTREGAR
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {(!state.merchSales || state.merchSales.length === 0) && (
                            <p className="text-center text-gray-500 font-pixel py-8">No hay ventas registradas</p>
                        )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-sm font-mono">
                            <thead className="bg-gray-800 text-gray-300 font-pixel text-lg">
                                <tr>
                                    <th className="p-4 border-b border-gray-600">Fecha</th>
                                    <th className="p-4 border-b border-gray-600">Comprador</th>
                                    <th className="p-4 border-b border-gray-600">Producto</th>
                                    <th className="p-4 border-b border-gray-600">Drag/Web</th>
                                    <th className="p-4 border-b border-gray-600">Cant</th>
                                    <th className="p-4 border-b border-gray-600">Total</th>
                                    <th className="p-4 border-b border-gray-600">Estado</th>
                                    <th className="p-4 border-b border-gray-600">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {state.merchSales?.slice().reverse().map(sale => (
                                    <tr key={sale.saleId} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4 text-gray-400">{new Date(sale.saleDate).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-white">{sale.nombre} {sale.apellidos}</div>
                                            <div className="text-xs text-gray-500">{sale.email}</div>
                                        </td>
                                        <td className="p-4 text-white uppercase">{sale.itemName}</td>
                                        <td className="p-4 text-gray-400">{sale.dragName || 'Web Merch'}</td>
                                        <td className="p-4 text-white">{sale.quantity}</td>
                                        <td className="p-4 text-neon-pink font-bold">{(sale.itemPrice * sale.quantity).toFixed(2)}€</td>
                                        <td className="p-4">
                                            {sale.status === 'Delivered' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900 border border-green-500 text-green-400 text-xs">
                                                    <CheckCircle className="w-3 h-3" /> ENTREGADO
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-900 border border-yellow-500 text-yellow-400 text-xs">
                                                    <Clock className="w-3 h-3" /> PENDIENTE
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {sale.status !== 'Delivered' && (
                                                <button
                                                    onClick={() => updateMerchSaleStatus(sale.saleId, 'Delivered')}
                                                    className="px-3 py-1 bg-gray-800 hover:bg-green-700 text-white border border-gray-600 hover:border-green-500 text-xs transition-colors uppercase"
                                                >
                                                    Marcar Entregado
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {(!state.merchSales || state.merchSales.length === 0) && (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-gray-500 font-pixel">No hay ventas registradas</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'items' && (
                <div className="space-y-8">
                    {/* Add Form */}
                    <form onSubmit={handleAddItem} className="bg-gray-800 p-6 border border-white">
                        <h3 className="text-xl font-semibold mb-4 text-white font-pixel">AÑADIR NUEVO PRODUCTO</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs uppercase text-gray-400 mb-1 font-pixel">Nombre</label>
                                <input
                                    type="text"
                                    value={newItem.name}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    className="w-full bg-black border border-gray-600 p-2 text-white outline-none focus:border-neon-pink"
                                    placeholder="Ej: Camiseta Oficial"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-gray-400 mb-1 font-pixel">Precio (€)</label>
                                <input
                                    type="number"
                                    value={newItem.price === 0 ? '' : newItem.price}
                                    onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })}
                                    className="w-full bg-black border border-gray-600 p-2 text-white outline-none focus:border-neon-pink"
                                    placeholder="0.00"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-gray-400 mb-1 font-pixel">Asociado a Drag (Opcional)</label>
                                <select
                                    value={newItem.dragId || ''}
                                    onChange={e => setNewItem({ ...newItem, dragId: e.target.value ? Number(e.target.value) : undefined })}
                                    className="w-full bg-black border border-gray-600 p-2 text-white outline-none focus:border-neon-pink"
                                >
                                    <option value="">Merch General de la Web</option>
                                    {state.drags.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-xs uppercase text-gray-400 mb-1 font-pixel">Imagen del Producto</label>
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-black border border-gray-600 flex-shrink-0">
                                    {newItem.imageUrl ? <img src={newItem.imageUrl} className="w-full h-full object-cover" /> : null}
                                </div>
                                <div className="flex-1">
                                    <FileUpload
                                        onUpload={(url) => setNewItem({ ...newItem, imageUrl: url as string })}
                                        label="Subir Imagen"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="neon-btn px-6 py-2 font-pixel text-lg disabled:opacity-50"
                                >
                                    {isSubmitting ? 'GUARDANDO...' : 'CREAR PRODUCTO'}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Items Grid */}
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-white font-pixel">CATÁLOGO ACTUAL</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[...(state.webMerch || []), ...(state.dragMerch || [])].map(item => (
                                <div key={item.id} className="group bg-gray-900 border border-gray-600 relative hover:border-white transition-colors">
                                    <div className="aspect-square relative">
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                        <div className="absolute top-2 right-2 flex gap-2">
                                            <span className="bg-black text-white text-xs px-2 py-1 border border-white font-pixel">
                                                {item.price}€
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-bold text-white truncate font-pixel text-lg">{item.name}</h4>
                                        <p className="text-xs text-gray-400 font-pixel uppercase">
                                            {item.dragId ? `Drag: ID ${item.dragId}` : 'Web Merch'}
                                        </p>

                                        <button
                                            onClick={() => handleDeleteItem(item.id)}
                                            className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-red-900/30 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/50 hover:border-white transition-colors text-sm font-pixel uppercase"
                                        >
                                            <Trash2 className="w-4 h-4" /> Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
