import React, { useState } from 'react';
import { AdminEvents } from '../components/AdminEvents';
import { AdminDrags } from '../components/AdminDrags';
import { AdminMerch } from '../components/AdminMerch';
import { AdminGallery } from '../components/AdminGallery';
import { AdminGiveaway } from '../components/AdminGiveaway';
import { AdminSettings } from '../components/AdminSettings';
import { ModernLogin } from '../components/ModernLogin';

interface AdminPageProps {
    isAdminLoggedIn: boolean;
    onLogin: (e: React.FormEvent, email: string, pass: string) => void;
    onLogout: () => void;
    onOpenScanner: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ isAdminLoggedIn, onLogin, onLogout, onOpenScanner }) => {
    const [adminSection, setAdminSection] = useState<'settings' | 'events' | 'drags' | 'merch' | 'gallery' | 'giveaway'>('events');

    const handleLoginSubmit = async (username: string, password: string) => {
        // Create a fake FormEvent to match the expected signature
        const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
        await onLogin(fakeEvent, username, password);
    };

    return (
        <div className="max-w-7xl mx-auto py-2">
            {!isAdminLoggedIn ? (
                <ModernLogin onLogin={handleLoginSubmit} />
            ) : (
                <div className="space-y-2 page-fade-in">
                    {/* Header / Session Info */}
                    <div className="bg-gray-800 p-2 border border-gray-600 flex justify-between items-center rounded text-xs">
                        <span className="font-mono text-gray-300">Sesión: <strong className="text-white">admin</strong></span>
                        <div className="flex gap-2">
                            <button onClick={onOpenScanner} className="bg-indigo-600 text-white font-pixel px-2 py-0.5 text-xs hover:bg-indigo-500 rounded">SCAN</button>
                            <button onClick={onLogout} className="bg-red-600 text-white font-pixel px-2 py-0.5 text-xs hover:bg-red-500 rounded">SALIR</button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex flex-wrap gap-1.5 border-b border-gray-800 pb-2">
                        <button
                            onClick={() => setAdminSection('events')}
                            className={`px-3 py-0.5 text-xs rounded-full font-pixel uppercase transition-all ${adminSection === 'events' ? 'bg-neon-pink text-white' : 'bg-gray-900 text-gray-400 hover:text-white'
                                }`}
                        >
                            Eventos
                        </button>
                        <button
                            onClick={() => setAdminSection('drags')}
                            className={`px-3 py-0.5 text-xs rounded-full font-pixel uppercase transition-all ${adminSection === 'drags' ? 'bg-neon-cyan text-black' : 'bg-gray-900 text-gray-400 hover:text-white'
                                }`}
                        >
                            Drags
                        </button>
                        <button
                            onClick={() => setAdminSection('merch')}
                            className={`px-3 py-0.5 text-xs rounded-full font-pixel uppercase transition-all ${adminSection === 'merch' ? 'bg-purple-500 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'
                                }`}
                        >
                            Merch
                        </button>
                        <button
                            onClick={() => setAdminSection('gallery')}
                            className={`px-3 py-0.5 text-xs rounded-full font-pixel uppercase transition-all ${adminSection === 'gallery' ? 'bg-yellow-500 text-black' : 'bg-gray-900 text-gray-400 hover:text-white'
                                }`}
                        >
                            Galería
                        </button>
                        <button
                            onClick={() => setAdminSection('settings')}
                            className={`px-3 py-0.5 text-xs rounded-full font-pixel uppercase transition-all ${adminSection === 'settings' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'
                                }`}
                        >
                            Ajustes
                        </button>
                        <button
                            onClick={() => setAdminSection('giveaway')}
                            className={`px-3 py-0.5 text-xs rounded-full font-pixel uppercase transition-all ${adminSection === 'giveaway' ? 'bg-pink-500 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'
                                }`}
                        >
                            Sorteo
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="animate-in fade-in duration-300">
                        {adminSection === 'events' && <AdminEvents />}
                        {adminSection === 'drags' && <AdminDrags />}
                        {adminSection === 'merch' && <AdminMerch />}
                        {adminSection === 'gallery' && <AdminGallery />}
                        {adminSection === 'giveaway' && <AdminGiveaway />}
                        {adminSection === 'settings' && <AdminSettings />}
                    </div>

                </div>
            )}
        </div>
    );
};
