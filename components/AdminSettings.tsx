import React, { useState } from 'react';
import { useStore } from '../services/store';
import { FileUpload } from './FileUpload';
import { Save, Download, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export const AdminSettings: React.FC = () => {
    const { state, updateState } = useStore();
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            await api.saveState(state);
            setMessage({ type: 'success', text: 'Configuración guardada correctamente' });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Error al guardar la configuración' });
        } finally {
            setIsSaving(false);
        }
    };

    const updateSetting = (key: string, value: any) => {
        const newSettings = { ...state.settings, [key]: value };
        // Also update root flattened props for compatibility
        updateState({
            settings: newSettings,
            [key]: value
        } as any);
    };

    const handleDomainsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const domains = e.target.value.split('\n').map(d => d.trim()).filter(Boolean);
        updateSetting('allowedDomains', domains);
    };

    return (
        <div className="space-y-6 text-white max-w-4xl mx-auto p-6 bg-gray-900 border border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <h2 className="text-2xl font-bold font-pixel text-neon-pink mb-6">CONFIGURACIÓN GENERAL</h2>

            {/* Logos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="block text-sm font-pixel text-gray-300">LOGO APP (NAV/HEADER)</label>
                    <div className="w-full h-32 bg-gray-800 flex items-center justify-center border border-gray-600 overflow-hidden mb-2">
                        {state.appLogoUrl ? (
                            <img src={state.appLogoUrl} alt="App Logo" className="h-full object-contain" />
                        ) : (
                            <span className="text-gray-500 font-pixel">SIN LOGO</span>
                        )}
                    </div>
                    <FileUpload onUpload={(url) => updateSetting('appLogoUrl', url)} label="SUBIR IMAGEN" className="w-full" />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-pixel text-gray-300">LOGO TICKETS (PDF/EMAIL)</label>
                    <div className="w-full h-32 bg-gray-800 flex items-center justify-center border border-gray-600 overflow-hidden mb-2">
                        {state.ticketLogoUrl ? (
                            <img src={state.ticketLogoUrl} alt="Ticket Logo" className="h-full object-contain" />
                        ) : (
                            <span className="text-gray-500 font-pixel">SIN LOGO</span>
                        )}
                    </div>
                    <FileUpload onUpload={(url) => updateSetting('ticketLogoUrl', url)} label="SUBIR IMAGEN" className="w-full" />
                </div>
            </div>

            {/* Banner Video */}
            <div className="space-y-2 pt-4 border-t border-gray-800">
                <label className="block text-sm font-pixel text-gray-300">BANNER PRINCIPAL (VIDEO/IMAGEN)</label>
                {state.bannerVideoUrl ? (
                    <div className="w-full h-40 bg-black mb-2 overflow-hidden relative border border-gray-600">
                        {state.bannerVideoUrl.endsWith('.mp4') || state.bannerVideoUrl.endsWith('.webm') ? (
                            <video src={state.bannerVideoUrl} className="w-full h-full object-cover" muted autoPlay loop />
                        ) : (
                            <img src={state.bannerVideoUrl} alt="Banner" className="w-full h-full object-cover" />
                        )}
                    </div>
                ) : (
                    <div className="w-full h-20 bg-gray-800 border border-gray-600 flex items-center justify-center mb-2">
                        <span className="text-gray-500 font-pixel">SIN BANNER</span>
                    </div>
                )}
                <FileUpload onUpload={(url) => updateSetting('bannerVideoUrl', url)} label="SUBIR VIDEO/IMAGEN" accept="image/*,video/mp4,video/webm" className="w-full" />
            </div>

            {/* Promo Banner */}
            <div className="space-y-4 pt-4 border-t border-gray-800">
                <h3 className="text-lg font-pixel text-white">BANNER PROMOCIONAL</h3>

                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={state.promoEnabled}
                            onChange={(e) => updateSetting('promoEnabled', e.target.checked)}
                            className="form-checkbox h-5 w-5 text-neon-pink border-gray-500 bg-gray-800 rounded-none focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="font-pixel text-gray-300">ACTIVAR BANNER NEON</span>
                    </label>

                    <div className="flex items-center gap-2 ml-auto">
                        <label className="text-sm font-pixel text-gray-300">COLOR NEON:</label>
                        <input
                            type="color"
                            value={state.promoNeonColor}
                            onChange={(e) => updateSetting('promoNeonColor', e.target.value)}
                            className="h-8 w-14 bg-transparent border border-gray-600 cursor-pointer"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-pixel text-gray-300">TEXTO DEL BANNER</label>
                    <input
                        type="text"
                        value={state.promoCustomText}
                        onChange={(e) => updateSetting('promoCustomText', e.target.value)}
                        className="w-full bg-black border border-gray-600 p-3 text-white focus:outline-none focus:border-neon-pink transition-colors font-mono"
                        placeholder="Ej: PRÓXIMO: {eventName} - {eventShortDate}"
                    />
                    <p className="text-xs text-gray-500 font-pixel">VARIABLES DISPONIBLES: {`{eventName}`}, {`{eventShortDate}`}, {`{eventDate}`}, {`{eventTime}`}</p>
                </div>
            </div>

            {/* Allowed Domains */}
            <div className="space-y-2 pt-4 border-t border-gray-800">
                <label className="block text-sm font-pixel text-gray-300">DOMINIOS DE EMAIL PERMITIDOS (UNO POR LÍNEA)</label>
                <textarea
                    value={state.allowedDomains.join('\n')}
                    onChange={handleDomainsChange}
                    rows={4}
                    className="w-full bg-black border border-gray-600 p-3 text-white focus:outline-none focus:border-neon-pink transition-colors font-mono text-sm"
                    placeholder="gmail.com&#10;outlook.com"
                />
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-800 mt-6">
                <button
                    onClick={() => api.downloadBackup()}
                    className="flex items-center gap-2 text-gray-400 hover:text-neon-cyan transition-colors font-pixel"
                >
                    <Download className="w-5 h-5" />
                    DESCARGAR BACKUP
                </button>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="neon-btn flex items-center gap-2 px-6 py-3 font-pixel text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {isSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                </button>
            </div>

            {message && (
                <div className={`p-4 border ${message.type === 'success' ? 'bg-green-900/20 text-green-400 border-green-500' : 'bg-red-900/20 text-red-400 border-red-500'} font-pixel mt-4`}>
                    {message.text}
                </div>
            )}
        </div>
    );
};
