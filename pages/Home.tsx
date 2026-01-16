import React from 'react';
import { useStore } from '../services/store';
import { Event } from '../types';
import Countdown from '../components/Countdown';

interface HomeProps {
    onSelectEvent: (event: Event) => void;
    onNavigate: (page: any) => void;
}

export const Home: React.FC<HomeProps> = ({ onSelectEvent, onNavigate }) => {
    const { state } = useStore();
    const upcomingEvents = state.events.filter(e => !e.isArchived && new Date(e.date) > new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const nextEvent = upcomingEvents[0];
    const pastEvents = state.events.filter(e => !e.isArchived && new Date(e.date) < new Date()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const recentPastEvent = pastEvents[0];

    // Logic for Random Gallery
    const pastEventsWithGallery = pastEvents.filter(e => e.galleryImages && e.galleryImages.length > 0);
    const randomGalleryEvent = pastEventsWithGallery.length > 0
        ? pastEventsWithGallery[Math.floor(Math.random() * pastEventsWithGallery.length)]
        : null;

    return (
        <div className="space-y-6 page-fade-in">
            {/* Eventos Próximos/Pasados en Inicio */}
            <section>
                {/* Title Removed as requested */}

                <div id="home-event-list-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {/* Active Events */}
                    {upcomingEvents.map(event => (
                        <div key={event.id} className="relative bg-gray-900 rounded-none overflow-hidden flex flex-col transform transition-all duration-300 reveal-on-scroll visible"> {/* Border removed */}
                            <div className="absolute top-0 left-0 text-white font-pixel text-sm px-2 py-1 rounded-none border-b border-r border-black z-10 shadow-md" style={{ backgroundColor: '#F02D7D' }}>
                                PRÓXIMO EVENTO
                            </div>
                            <div className="w-full bg-black border-none overflow-hidden cursor-pointer" onClick={() => onSelectEvent(event)}>
                                <img src={event.posterImageUrl} alt={event.name} className="w-full object-cover" />
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-3xl font-pixel text-white text-glow-white mb-2 cursor-pointer glitch-hover" onClick={() => onSelectEvent(event)}>
                                    {event.name}
                                </h3>
                                <p className="text-gray-400 font-semibold font-pixel text-lg mb-3">{new Date(event.date).toLocaleDateString()}, 21:00</p>
                                <p className="text-4xl font-extrabold text-white mb-4">{event.price} €</p>
                                <p className="text-gray-400 mb-6 flex-grow whitespace-pre-wrap font-sans text-sm">
                                    {event.description}
                                </p>
                                <button
                                    onClick={() => onSelectEvent(event)}
                                    className="w-full neon-btn font-pixel text-2xl py-3 px-4 rounded-none"
                                    disabled={event.ticketsSold >= event.ticketCapacity && event.ticketCapacity > 0}
                                >
                                    {event.ticketsSold >= event.ticketCapacity && event.ticketCapacity > 0 ? 'AGOTADO' : 'CONSEGUIR ENTRADA'}
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Recent Past Event (Shown below/alongside if exists) */}
                    {recentPastEvent && (
                        <div className="relative bg-gray-900 rounded-none overflow-hidden flex flex-col transform transition-all duration-300 reveal-on-scroll visible"> {/* Border removed */}
                            <div className="absolute top-0 left-0 bg-red-700 text-white font-pixel text-sm px-2 py-1 rounded-none border-b border-r border-black z-10 shadow-md">FINALIZADO</div>
                            <div className="w-full bg-black border-none overflow-hidden">
                                <img src={recentPastEvent.posterImageUrl} alt={recentPastEvent.name} className="w-full opacity-60" />
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-3xl font-pixel text-gray-500 mb-2 glitch-hover">
                                    {recentPastEvent.name}
                                </h3>
                                <p className="text-gray-400 font-semibold font-pixel text-lg mb-3">{new Date(recentPastEvent.date).toLocaleDateString()}</p>
                                <p className="text-4xl font-extrabold text-gray-600 mb-4">{recentPastEvent.price} €</p>
                                <p className="text-gray-400 mb-6 flex-grow whitespace-pre-wrap font-sans text-sm">
                                    {recentPastEvent.description}
                                </p>
                                <button disabled className="w-full bg-gray-800 text-gray-500 font-pixel text-2xl py-3 px-4 rounded-none border border-gray-700 cursor-not-allowed">EVENTO FINALIZADO</button>
                            </div>
                        </div>
                    )}

                    {upcomingEvents.length === 0 && !recentPastEvent && (
                        <p className="text-center font-pixel text-gray-500 col-span-full text-2xl">NO HAY EVENTOS</p>
                    )}
                </div>
            </section>

            {/* Random Gallery Section */}
            {randomGalleryEvent && (
                <section className="mb-12 text-center" onClick={() => onNavigate('gallery')}>
                    <h2 className="text-4xl font-pixel text-white text-glow-white mb-6">GALERÍAS DE EVENTOS PASADOS</h2>
                    <div className="border border-white p-2 inline-block cursor-pointer hover:scale-105 transition-transform duration-300">
                        <img
                            src={randomGalleryEvent.galleryImages[0]}
                            alt={`Galería ${randomGalleryEvent.name}`}
                            className="max-h-[400px] object-cover"
                        />
                        <div className="bg-gray-900 p-4 mt-2">
                            <h3 className="text-2xl font-pixel text-white text-glow-white mb-1">{randomGalleryEvent.name.toUpperCase()}</h3>
                            <p className="text-gray-400 font-pixel uppercase">{new Date(randomGalleryEvent.date).toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</p>
                            <p className="text-gray-500 font-pixel mt-2">{randomGalleryEvent.galleryImages.length} FOTOS</p>
                        </div>
                    </div>
                </section>
            )}

            {/* Botón Ver Todos los Eventos */}
            <div id="view-all-events-container" className="text-center mb-12">
                <button
                    id="view-all-events-btn"
                    onClick={() => onNavigate('events')}
                    className="neon-btn font-pixel text-2xl py-3 px-8 rounded-none"
                >
                    VER TODOS LOS EVENTOS
                </button>
            </div>

            {/* Banner Principal (Imagen/Video) */}
            <div className="bg-black border border-white overflow-hidden mb-12 reveal-on-scroll">
                <div id="home-banner-container" className="relative w-full bg-black aspect-video">
                    {state.bannerVideoUrl ? (
                        state.bannerVideoUrl.endsWith('.mp4') || state.bannerVideoUrl.endsWith('.webm') || state.bannerVideoUrl.startsWith('data:video') || state.bannerVideoUrl.startsWith('blob:') ?
                            <video src={state.bannerVideoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" /> :
                            <img src={state.bannerVideoUrl} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-party-900 via-black to-purple-900">
                            <h1 className="text-6xl md:text-9xl font-pixel text-white text-glow-white text-center mb-8 tracking-tighter animate-pulse-slow">RODETES<br /><span className="text-party-500">PARTY</span></h1>
                            <div className="transform scale-75 md:scale-100">
                                <Countdown />
                            </div>
                        </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
                </div>
            </div>
        </div>
    );
};
