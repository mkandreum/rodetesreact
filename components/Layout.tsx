import React, { ReactNode } from 'react';
import { Share2, Instagram, X, Menu } from 'lucide-react';
import { PageId } from '../types';

interface LayoutProps {
    children: ReactNode;
    currentPage: PageId;
    promoEnabled: boolean;
    promoNeonColor: string;
    promoCustomText: string;
    nextEvent?: { name: string; date: string } | null;
    isAdminLoggedIn: boolean;
    isMobileMenuOpen: boolean;
    onLogoTap: () => void;
    onToggleMenu: () => void;
    onNavigate: (page: PageId) => void;
    appLogoUrl?: string; // New prop
}

export const Layout: React.FC<LayoutProps> = ({
    children,
    currentPage,
    promoEnabled,
    promoNeonColor,
    promoCustomText,
    nextEvent,
    isAdminLoggedIn,
    isMobileMenuOpen,
    onLogoTap,
    onToggleMenu,
    onNavigate,
    appLogoUrl // Destructure
}) => {
    const navItems: { id: PageId, label: string }[] = [
        { id: 'home', label: 'INICIO' },
        { id: 'events', label: 'EVENTOS' },
        { id: 'gallery', label: 'GALERÍA' },
        { id: 'merch', label: 'MERCH' },
        { id: 'drags', label: 'DRAGS' }
    ];

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-party-500 selection:text-white flex flex-col">
            {/* Sticky Wrapper for Banner + Header + Nav */}
            <div className="sticky top-0 z-50 bg-black w-full shadow-lg border-b border-gray-800">
                {/* Promo Banner */}
                {promoEnabled && nextEvent && (
                    <div id="next-event-promo-container" className="w-full h-10 flex items-center border-b-2 relative" style={{ borderColor: promoNeonColor, boxShadow: `0 0 10px ${promoNeonColor}` }}>
                        <div id="next-event-promo" className="text-glow-yellow" style={{ color: '#FFFF00' }}>
                            PRÓXIMO: {promoCustomText
                                .replace('{eventName}', nextEvent.name)
                                .replace('{eventShortDate}', new Date(nextEvent.date).toLocaleDateString())}
                        </div>
                    </div>
                )}

                {/* Header & Nav Container - Relative inside sticky so Mobile Menu positions correctly */}
                <div className="relative bg-black">
                    {/* Header */}
                    <header className="w-full bg-black border-b-2 border-white">
                        <div className="container mx-auto px-4 h-20 flex justify-between items-center">
                            <button onClick={onLogoTap} className="flex-shrink-0 group select-none">
                                <img src={appLogoUrl || "/logo.png"} alt="RODETES" className="h-16 w-auto object-contain glitch-hover" />
                            </button>

                            <button onClick={onToggleMenu} className="p-2 text-white hover:text-party-500 transition-colors">
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </header>

                    {/* Secondary Navigation Bar */}
                    {currentPage !== 'admin' && (
                        <nav id="secondary-nav-container" className="w-full bg-black border-b border-gray-700">
                            <ul className="container mx-auto flex justify-around gap-4 py-2 px-4 overflow-x-auto no-scrollbar">
                                {navItems.map(item => (
                                    <li key={item.id} className="flex-shrink-0">
                                        <button
                                            onClick={() => onNavigate(item.id)}
                                            className={`font-pixel text-lg md:text-xl relative group ${currentPage === item.id ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.7)]' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            {item.label}
                                            <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-white shadow-[0_0_5px_white] transition-all group-hover:w-full ${currentPage === item.id ? 'w-full' : ''}`}></span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    )}

                    {/* Mobile Menu Overlay - Absolute relative to this container */}
                    {isMobileMenuOpen && (
                        <div id="mobile-menu" className="absolute top-full right-4 z-50 bg-black border-2 border-white w-64 shadow-lg shadow-white/30 rounded-none animate-fade-in">
                            <div className="px-2 pt-2 pb-3 space-y-1">
                                {navItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => onNavigate(item.id)}
                                        className={`block w-full text-left px-3 py-2 font-pixel text-lg rounded-md transition-colors ${currentPage === item.id
                                            ? 'bg-gray-700 text-white'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                                {isAdminLoggedIn && (
                                    <button
                                        onClick={() => onNavigate('admin')}
                                        className="block w-full text-left px-3 py-2 font-pixel text-lg text-gray-300 hover:bg-gray-700 hover:text-white rounded-md border-t border-gray-700 mt-2 pt-2"
                                    >
                                        ADMIN
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content - No top padding needed because header is sticky (takes space), not fixed */}
            <main className="flex-grow container mx-auto px-4 py-8 min-h-screen flex flex-col">
                <div className="flex-grow">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-800 py-12 bg-[#020617] mt-auto">
                <div className="container mx-auto text-center">
                    <h2 className="font-pixel text-4xl text-white mb-6">RODETES PARTY</h2>
                    <div className="flex justify-center gap-6 mb-8">
                        <a href="#" className="text-gray-400 hover:text-party-500 transition-colors"><Instagram /></a>
                        <a href="#" className="text-gray-400 hover:text-party-500 transition-colors"><Share2 /></a>
                    </div>
                    <p className="font-pixel text-gray-600">© 2024 TODOS LOS DERECHOS RESERVADOS</p>
                </div>
            </footer>
        </div>
    );
};
