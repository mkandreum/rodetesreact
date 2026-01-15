import React, { useState, useEffect } from 'react';
import { useStore } from '../services/store';
import { api } from '../services/api';
import { Ticket } from '../types';

export const AdminGiveaway: React.FC = () => {
    const { state } = useStore();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(false);
    const [winner, setWinner] = useState<{ ticket: Ticket, eventName: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Load tickets on mount to ensure we have the full pool for the raffle
    useEffect(() => {
        const loadTickets = async () => {
            setLoading(true);
            try {
                const data = await api.getTickets();
                setTickets(data);
            } catch (err) {
                console.error("Error loading tickets for giveaway:", err);
                setError("No se pudieron cargar las entradas. Intenta recargar la página.");
            } finally {
                setLoading(false);
            }
        };
        loadTickets();
    }, []);

    const handleGiveaway = (eventId: number) => {
        const event = state.events.find(e => e.id === eventId);
        if (!event) return;

        const eventTickets = tickets.filter(t => t.eventId === eventId);
        if (eventTickets.length === 0) {
            alert('Este evento no tiene entradas vendidas.');
            return;
        }

        setLoading(true);
        // Simulate delay for effect
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * eventTickets.length);
            const winningTicket = eventTickets[randomIndex];
            setWinner({ ticket: winningTicket, eventName: event.name });
            setLoading(false);
        }, 500); // 500ms delay for suspense
    };

    // Filter events that have at least one ticket sold
    const eventsWithTickets = state.events
        .filter(event => tickets.some(t => t.eventId === event.id))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="bg-gray-900 border border-white p-6 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
                <h3 className="font-pixel text-2xl text-white">SORTEO / GIVEAWAY</h3>
            </div>

            {loading && tickets.length === 0 && <p className="text-white font-pixel">Cargando entradas...</p>}
            {error && <p className="text-red-400 font-pixel">{error}</p>}

            {!winner ? (
                <div className="space-y-6">
                    <div id="giveaway-winner-result" className="text-center min-h-[150px] flex flex-col justify-center items-center border border-gray-700 bg-black p-6">
                        <p className="text-gray-500 font-pixel">SELECCIONA UN EVENTO Y PULSA "INDICAR GANADOR"</p>
                    </div>

                    <ul className="space-y-3">
                        {eventsWithTickets.length === 0 && !loading ? (
                            <li className="text-gray-400 text-center font-pixel">NINGÚN EVENTO TIENE ENTRADAS VENDIDAS PARA SORTEAR.</li>
                        ) : (
                            eventsWithTickets.map(event => {
                                const count = tickets.filter(t => t.eventId === event.id).length;
                                const dateStr = new Date(event.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
                                return (
                                    <li key={event.id} className="flex flex-wrap justify-between items-center bg-gray-800 p-4 border border-gray-500 gap-4 hover:border-white transition-colors">
                                        <div className="min-w-0 mr-4">
                                            <span className="font-pixel text-xl text-white block truncate">
                                                {event.name} <span className="text-sm text-gray-400">({dateStr})</span>
                                            </span>
                                            <span className="text-sm text-gray-400 block sm:inline">
                                                ({count} {count === 1 ? 'compra' : 'compras'})
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleGiveaway(event.id)}
                                            className="flex-shrink-0 bg-white text-black font-pixel text-lg px-4 py-2 rounded-none border border-gray-400 hover:bg-gray-300 transition-colors"
                                        >
                                            INDICAR GANADOR
                                        </button>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>
            ) : (
                <div className="text-center border border-white bg-black p-8 animate-in fade-in zoom-in duration-500">
                    <p className="text-gray-300 font-pixel text-xl sm:text-2xl mb-2">EL GANADOR PARA</p>
                    <h4 className="text-3xl sm:text-4xl font-pixel text-white text-glow-white mb-4 break-words">{winner.eventName}</h4>
                    <p className="text-gray-300 font-pixel text-xl sm:text-2xl mb-2">ES:</p>
                    <p className="text-4xl sm:text-5xl font-pixel text-green-400 text-glow-green mb-2 break-all">
                        {winner.ticket.nombre} {winner.ticket.apellidos}
                    </p>
                    <p className="text-lg text-gray-400 font-pixel mb-4 break-all">({winner.ticket.email})</p>
                    <p className="text-gray-400 font-pixel text-base sm:text-lg">
                        (Ticket ID: {winner.ticket.ticketId.substring(0, 13)}... | Cantidad: {winner.ticket.quantity})
                    </p>

                    <button
                        onClick={() => setWinner(null)}
                        className="mt-6 bg-yellow-500 text-black font-pixel text-xl px-6 py-3 hover:bg-yellow-400 rounded-none"
                    >
                        VOLVER AL SORTEO
                    </button>
                </div>
            )}
        </div>
    );
};
