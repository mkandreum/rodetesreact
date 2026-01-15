import { useState } from 'react';
import { useStore } from '../services/store';
import { Event } from '../types';

export const useTicketPurchase = () => {
    const { state, addTicket } = useStore();
    const [ticketForm, setTicketForm] = useState({ name: '', surname: '', email: '', quantity: 1 });
    const [generatedTicketId, setGeneratedTicketId] = useState<string | null>(null);

    const purchaseTicket = (event: Event) => {
        const existing = state.tickets.find(t => t.eventId === event.id && t.email === ticketForm.email);
        if (existing) {
            alert(`Este email ya tiene entradas. ID: ${existing.ticketId}`);
            return false;
        }

        const newTicket = {
            ticketId: crypto.randomUUID().slice(0, 8).toUpperCase(),
            eventId: event.id,
            nombre: ticketForm.name,
            apellidos: ticketForm.surname,
            email: ticketForm.email,
            quantity: ticketForm.quantity
        };

        addTicket(newTicket);
        setGeneratedTicketId(newTicket.ticketId);
        return true;
    };

    const resetForm = () => {
        setTicketForm({ name: '', surname: '', email: '', quantity: 1 });
        setGeneratedTicketId(null);
    };

    return {
        ticketForm,
        setTicketForm,
        generatedTicketId,
        purchaseTicket,
        resetForm
    };
};
