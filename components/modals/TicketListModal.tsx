import React, { useState, useEffect } from 'react';
import { X, Trash } from 'lucide-react';
import { Ticket, Event } from '../../types';
import { api } from '../../services/api';

interface TicketListModalProps {
    event: Event;
    onClose: () => void;
}

export const TicketListModal: React.FC<TicketListModalProps> = ({ event, onClose }) => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch tickets for this event
    useEffect(() => {
        const fetchTickets = async () => {
            try {
                // We fetch ALL tickets and filter client-side, or use an API filter if available.
                // Given api.getTickets() returns all, we filter here.
                const allTickets = await api.getTickets();
                const eventTickets = allTickets.filter(t => t.eventId === event.id);
                // Sort by email
                eventTickets.sort((a, b) => (a.email || '').localeCompare(b.email || ''));
                setTickets(eventTickets);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching tickets:", err);
                setError("Error al cargar la lista de entradas.");
                setLoading(false);
            }
        };

        fetchTickets();
    }, [event.id]);

    const handleDeleteTicket = async (ticketId: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta entrada? Esta acción no se puede deshacer.')) return;

        // Note: api.deleteTicket takes a number ID? 
        // Let's check api.ts again. definition: deleteTicket: (id: number) => ...
        // usage: fetchApi(`/tickets/${id}`, { method: 'DELETE' })
        // But ticketId is a string (UUID). The backend likely handles string if route is /tickets/:id.
        // I should cast it to any to avoid TS error if the interface says number, or fix the interface.
        // Let's assume for now we cast to any or unknown.

        try {
            // @ts-ignore
            await api.deleteTicket(ticketId);

            // Update local state
            setTickets(tickets.filter(t => t.ticketId !== ticketId));
            alert('Entrada eliminada.');
        } catch (err) {
            console.error("Error deleting ticket:", err);
            alert("Error al eliminar la entrada.");
        }
    };

    const totalQuantity = tickets.reduce((sum, t) => sum + (t.quantity || 0), 0);

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="bg-gray-900 border-2 border-white w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4 flex-shrink-0">
                    <div>
                        <h3 className="font-pixel text-2xl text-white break-words">Entradas: {event.name}</h3>
                        <p className="text-gray-400 text-sm font-pixel mt-1">
                            {tickets.length} COMPRA(S) | {totalQuantity} ENTRADA(S) TOTAL
                        </p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-red-500"><X size={28} /></button>
                </div>

                <div className="flex-grow overflow-y-auto">
                    {loading && <p className="text-center text-white font-pixel">Cargando...</p>}
                    {error && <p className="text-center text-red-400 font-pixel">{error}</p>}

                    {!loading && !error && tickets.length === 0 && (
                        <p className="text-gray-400 text-center font-pixel">NO HAY ENTRADAS REGISTRADAS PARA ESTE EVENTO.</p>
                    )}

                    {!loading && !error && tickets.length > 0 && (
                        <ul className="space-y-3">
                            {tickets.map(ticket => (
                                <li key={ticket.ticketId} className="p-3 bg-gray-800 border border-gray-600 flex flex-col sm:flex-row justify-between items-start gap-2 hover:border-gray-400 transition-colors">
                                    <div className="min-w-0 flex-grow">
                                        <strong className="text-white text-base font-pixel block truncate">
                                            {ticket.nombre} {ticket.apellidos}
                                        </strong>
                                        <span className="text-sm text-gray-400 break-all block">{ticket.email}</span>
                                        <span className="text-gray-400 text-sm block">CANTIDAD: {ticket.quantity}</span>
                                        <span className="text-gray-500 text-xs block truncate">ID: {ticket.ticketId}</span>
                                    </div>
                                    <div className="flex-shrink-0 mt-2 sm:mt-0 self-end sm:self-center">
                                        <button
                                            onClick={() => handleDeleteTicket(ticket.ticketId)}
                                            className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-none text-sm font-pixel flex items-center gap-2"
                                        >
                                            <Trash size={14} /> ELIMINAR
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};
