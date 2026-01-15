import React from 'react';
import { useStore } from '../services/store';
import { Event } from '../types';

interface EventsPageProps {
    onSelectEvent: (event: Event) => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({ onSelectEvent }) => {
    const { state } = useStore();

    return (
        <div className="space-y-4">
            <h2 className="text-5xl font-pixel text-white text-left mb-8 text-glow-white">EVENTOS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.events.filter(e => !e.isArchived).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(event => (
                    <div key={event.id} className="relative bg-gray-900 rounded-none overflow-hidden flex flex-col transform transition-all duration-300">
                        {new Date(event.date) > new Date() && (
                            <div className="absolute top-0 left-0 text-white font-pixel text-sm px-2 py-1 rounded-none border-b border-r border-black z-10 shadow-md" style={{ backgroundColor: '#F02D7D' }}>
                                PRÓXIMO EVENTO
                            </div>
                        )}
                        {new Date(event.date) < new Date() && (
                            <div className="absolute top-0 left-0 bg-red-700 text-white font-pixel text-sm px-2 py-1 rounded-none border-b border-r border-black z-10 shadow-md">FINALIZADO</div>
                        )}
                        <div className="w-full bg-black border-b border-gray-800 overflow-hidden cursor-pointer" onClick={() => onSelectEvent(event)}>
                            <img src={event.posterImageUrl} alt={event.name} className={`w-full object-cover ${new Date(event.date) < new Date() ? 'opacity-60' : ''}`} />
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                            <h3 className={`text-2xl font-pixel ${new Date(event.date) < new Date() ? 'text-gray-500' : 'text-white text-glow-white'} mb-2 cursor-pointer glitch-hover`} onClick={() => onSelectEvent(event)}>
                                {event.name}
                            </h3>
                            <p className="text-gray-400 font-semibold font-pixel text-lg mb-3">{new Date(event.date).toLocaleDateString()}, 21:00</p>
                            <p className={`text-3xl font-extrabold ${new Date(event.date) < new Date() ? 'text-gray-600' : 'text-white'} mb-3`}>{event.price} €</p>
                            <p className="text-gray-400 mb-4 flex-grow whitespace-pre-wrap font-sans text-sm">
                                {event.description}
                            </p>
                            {new Date(event.date) > new Date() ? (
                                <button
                                    onClick={() => onSelectEvent(event)}
                                    className="w-full neon-btn font-pixel text-lg py-2 px-4 rounded-none"
                                    disabled={event.ticketsSold >= event.ticketCapacity && event.ticketCapacity > 0}
                                >
                                    {event.ticketsSold >= event.ticketCapacity && event.ticketCapacity > 0 ? 'AGOTADO' : 'CONSEGUIR ENTRADA'}
                                </button>
                            ) : (
                                <button disabled className="w-full bg-gray-800 text-gray-500 font-pixel text-lg py-2 px-4 rounded-none border border-gray-700 cursor-not-allowed">EVENTO FINALIZADO</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
