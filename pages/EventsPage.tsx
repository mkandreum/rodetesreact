import React from 'react';
import { useStore } from '../services/store';
import { Event } from '../types';

interface EventsPageProps {
    onSelectEvent: (event: Event) => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({ onSelectEvent }) => {
    const { state } = useStore();

    return (
        <div className="space-y-8">
            <h2 className="text-5xl font-pixel text-white text-center mb-12 text-glow-white">AGENDA</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {state.events.filter(e => !e.isArchived).map(event => (
                    <div key={event.id} className="bg-gray-900 border border-white flex flex-col">
                        <div className="aspect-video bg-black relative overflow-hidden">
                            <img src={event.posterImageUrl} alt={event.name} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                            {new Date(event.date) < new Date() && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                    <span className="text-red-500 font-pixel text-4xl border-4 border-red-500 px-6 py-2 transform -rotate-12">FINALIZADO</span>
                                </div>
                            )}
                        </div>
                        <div className="p-6 flex-grow flex flex-col">
                            <h3 className="text-3xl font-pixel text-white mb-2">{event.name}</h3>
                            <p className="text-gray-400 mb-4 whitespace-pre-wrap font-sans text-sm flex-grow">{event.description}</p>
                            <div className="flex justify-between items-center mb-6 pt-4 border-t border-gray-800">
                                <span className="font-pixel text-2xl text-party-400">{event.price} €</span>
                                <span className="font-pixel text-gray-500">{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            {new Date(event.date) > new Date() ? (
                                <button
                                    onClick={() => onSelectEvent(event)}
                                    className="w-full neon-btn font-pixel text-xl py-3"
                                    disabled={event.ticketsSold >= event.ticketCapacity && event.ticketCapacity > 0}
                                >
                                    {event.ticketsSold >= event.ticketCapacity && event.ticketCapacity > 0 ? 'SOLD OUT' : 'COMPRAR ENTRADA'}
                                </button>
                            ) : (
                                <button disabled className="w-full border border-gray-700 text-gray-700 font-pixel text-xl py-3 cursor-not-allowed">EVENTO PASADO</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
