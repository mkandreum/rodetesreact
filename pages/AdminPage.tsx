import React, { useState } from 'react';
import { AdminEvents } from '../components/AdminEvents';
import { AdminDrags } from '../components/AdminDrags';
import { AdminMerch } from '../components/AdminMerch';
import { AdminGallery } from '../components/AdminGallery';
import { AdminSettings } from '../components/AdminSettings';

interface AdminPageProps {
    isAdminLoggedIn: boolean;
    onLogin: (e: React.FormEvent, email: string, pass: string) => void;
    onLogout: () => void;
    onOpenScanner: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ isAdminLoggedIn, onLogin, onLogout, onOpenScanner }) => {
    const [adminSection, setAdminSection] = useState<'settings' | 'events' | 'drags' | 'merch' | 'gallery'>('events');
    const [adminEmailInput, setAdminEmailInput] = useState('');
    const [adminPassInput, setAdminPassInput] = useState('');

    const handleLoginSubmit = (e: React.FormEvent) => {
        onLogin(e, adminEmailInput, adminPassInput);
    };

    return (
        <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-pixel text-white text-center mb-10 text-glow-white">PANEL DE ADMINISTRACIÓN</h2>

            {!isAdminLoggedIn ? (
                <form
                    onSubmit={handleLoginSubmit}
                    className="bg-gray-900 p-8 border border-white max-w-md mx-auto shadow-2xl"
                >
                    <div className="mb-4">
                        <label className="block font-pixel text-lg mb-1 text-party-300">USUARIO</label>
                        <input type="text" value={adminEmailInput} onChange={e => setAdminEmailInput(e.target.value)} className="w-full bg-black border border-gray-700 p-3 text-white focus:border-party-500 outline-none" placeholder="admin" />
                    </div>
                    <div className="mb-6">
                        <label className="block font-pixel text-lg mb-1 text-party-300">CONTRASEÑA</label>
                        <input type="password" value={adminPassInput} onChange={e => setAdminPassInput(e.target.value)} className="w-full bg-black border border-gray-700 p-3 text-white focus:border-party-500 outline-none" placeholder="••••••" />
                    </div>
                    <button type="submit" className="w-full neon-btn font-pixel text-2xl py-3">ENTRAR AL SISTEMA</button>
                </form>
            ) : (
                <div className="space-y-8 animate-fade-in">
                    {/* Header / Session Info */}
                    <div className="bg-gray-800 p-4 border border-gray-600 flex justify-between items-center rounded-lg shadow-lg">
                        <span className="font-mono text-sm text-gray-300">SESIÓN: <strong className="text-white">{adminEmailInput || 'admin'}</strong></span>
                        <div className="flex gap-3">
                            <button onClick={onOpenScanner} className="bg-indigo-600 text-white font-pixel px-4 py-2 hover:bg-indigo-500 rounded flex items-center gap-2">SCANNER</button>
                            <button onClick={onLogout} className="bg-red-600 text-white font-pixel px-4 py-2 hover:bg-red-500 rounded">SALIR</button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex flex-wrap gap-4 justify-center border-b border-gray-800 pb-6">
                        <button
                            onClick={() => setAdminSection('events')}
                            className={`px-6 py-2 rounded-full font-display uppercase tracking-wider transition-all ${adminSection === 'events' ? 'bg-neon-pink text-white shadow-lg shadow-neon-pink/50' : 'bg-gray-900 text-gray-400 hover:text-white'
                                }`}
                        >
                            Eventos
                        </button>
                        <button
                            onClick={() => setAdminSection('drags')}
                            className={`px-6 py-2 rounded-full font-display uppercase tracking-wider transition-all ${adminSection === 'drags' ? 'bg-neon-cyan text-black shadow-lg shadow-neon-cyan/50' : 'bg-gray-900 text-gray-400 hover:text-white'
                                }`}
                        >
                            Drags
                        </button>
                        <button
                            onClick={() => setAdminSection('merch')}
                            className={`px-6 py-2 rounded-full font-display uppercase tracking-wider transition-all ${adminSection === 'merch' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50' : 'bg-gray-900 text-gray-400 hover:text-white'
                                }`}
                        >
                            Merch & Ventas
                        </button>
                        <button
                            onClick={() => setAdminSection('gallery')}
                            className={`px-6 py-2 rounded-full font-display uppercase tracking-wider transition-all ${adminSection === 'gallery' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/50' : 'bg-gray-900 text-gray-400 hover:text-white'
                                }`}
                        >
                            Galería
                        </button>
                        <button
                            onClick={() => setAdminSection('settings')}
                            className={`px-6 py-2 rounded-full font-display uppercase tracking-wider transition-all ${adminSection === 'settings' ? 'bg-gray-700 text-white shadow-lg' : 'bg-gray-900 text-gray-400 hover:text-white'
                                }`}
                        >
                            Ajustes
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="animate-in fade-in duration-300">
                        {adminSection === 'events' && <AdminEvents />}
                        {adminSection === 'drags' && <AdminDrags />}
                        {adminSection === 'merch' && <AdminMerch />}
                        {adminSection === 'gallery' && <AdminGallery />}
                        {adminSection === 'settings' && <AdminSettings />}
                    </div>

                </div>
            )}
        </div>
    );
};
