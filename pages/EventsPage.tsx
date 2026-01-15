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
            <h2 className="text-3xl font-pixel text-white text-center mb-4 text-glow-white">AGENDA</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.events.filter(e => !e.isArchived).map(event => (
                    <div key={event.id} className="relative bg-gray-900 rounded-none border-gray-800 overflow-hidden flex flex-col transform transition-all hover:border-gray-600 duration-300 reveal-on-scroll visible border">
                        {new Date(event.date) < new Date() && (
                            <div className="absolute top-0 left-0 bg-red-700 text-white font-pixel text-sm px-2 py-1 rounded-none border-b border-r border-black z-10 shadow-md">FINALIZADO</div>
                        )}
                        <div className="w-full bg-black border-b border-gray-800 overflow-hidden cursor-pointer" onClick={() => onSelectEvent(event)}>
                            <img src={event.posterImageUrl} alt={event.name} className={`w-full object-cover ${new Date(event.date) < new Date() ? 'opacity-60' : ''}`} />
                        </div>
                        <div className="p-4 flex-grow flex flex-col">
                            <h3 className={`text-2xl font-pixel mb-2 cursor-pointer glitch-hover ${new Date(event.date) < new Date() ? 'text-gray-500' : 'text-white text-glow-white'}`} onClick={() => onSelectEvent(event)}>
                                {event.name}
                            </h3>
                            <p className="text-gray-400 font-semibold font-pixel text-lg mb-3">{new Date(event.date).toLocaleDateString()}, 21:00</p>
                            <p className={`text-3xl font-extrabold mb-3 ${new Date(event.date) < new Date() ? 'text-gray-600' : 'text-white'}`}>{event.price} €</p>
                            <p className="text-gray-400 mb-4 whitespace-pre-wrap font-sans text-sm flex-grow">
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
