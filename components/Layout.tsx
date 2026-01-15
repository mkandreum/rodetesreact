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
    appLogoUrl: string;
    onLogoTap: () => void;
    onToggleMenu: () => void;
    onNavigate: (page: PageId) => void;
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
    appLogoUrl,
    onLogoTap,
    onToggleMenu,
    onNavigate
}) => {
    const navItems: { id: PageId, label: string }[] = [
        { id: 'home', label: 'INICIO' },
        { id: 'events', label: 'EVENTOS' },
        { id: 'gallery', label: 'GALERÍA' },
        { id: 'merch', label: 'MERCH' },
        { id: 'drags', label: 'DRAGS' }
    ];

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-party-500 selection:text-white">
            {/* Promo Banner */}
            {promoEnabled && nextEvent && (
                <div id="next-event-promo-container" className="fixed top-0 left-0 right-0 z-50 h-10 flex items-center border-b-2" style={{ borderColor: promoNeonColor, boxShadow: `0 0 10px ${promoNeonColor}` }}>
                    <div id="next-event-promo" style={{ textShadow: `0 0 10px ${promoNeonColor}`, color: promoNeonColor }}>
                        {promoCustomText
                            .replace('{eventName}', nextEvent.name)
                            .replace('{eventShortDate}', new Date(nextEvent.date).toLocaleDateString())}
                    </div>
                </div>
            )}

            {/* Header */}
            <header className={`fixed ${promoEnabled && nextEvent ? 'top-10' : 'top-0'} w-full transition-all bg-black border-b-2 border-white z-40`}>
                <div className="container mx-auto px-4 h-20 flex justify-between items-center">
                    <button onClick={onLogoTap} className="flex-shrink-0 group select-none">
                        <img
                            src={appLogoUrl || '/logo.png'}
                            alt="RODETES"
                            className="h-16 w-auto object-contain glitch-hover"
                            key={appLogoUrl}
                        />
                    </button>

                    <button onClick={onToggleMenu} className="p-2 text-white hover:text-party-500 transition-colors">
                        {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
                    </button>
                </div>
            </header>

            {/* Secondary Navigation Bar */}
            {currentPage !== 'admin' && (
                <div id="secondary-nav-container" className={`fixed ${promoEnabled && nextEvent ? 'top-[120px]' : 'top-20'} left-0 right-0 w-full transition-all z-30 bg-black/95 backdrop-blur-sm border-b border-gray-700`}>
                    <div className="container mx-auto px-4">
                        <nav className="flex justify-around gap-4 py-2">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onNavigate(item.id)}
                                    className={`font-pixel uppercase text-base transition-colors ${currentPage === item.id
                                        ? 'text-white text-glow-white'
                                        : 'text-gray-500 hover:text-white'}`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div id="mobile-menu" className={`absolute ${promoEnabled && nextEvent ? 'top-[120px]' : 'top-20'} right-4 z-50 bg-black border-2 border-white w-64 shadow-lg shadow-white/30 rounded-none animate-fade-in`}>
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

            {/* Main Content */}
            <main className={`container mx-auto px-4 sm:px-6 lg:px-8 pb-20 ${promoEnabled && nextEvent ? 'pt-48' : 'pt-40'}`}>
                {children}
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
