import { useState, useEffect } from 'react';
import { AppState, Event, Drag, Ticket, MerchSale, MerchItem } from '../types';

const STORAGE_KEY = 'rodetes_app_state_v1';

const INITIAL_STATE: AppState = {
  events: [
    {
      id: 1,
      name: 'GRAN FIESTA INAUGURAL',
      date: '2024-12-31T23:00',
      price: 15.00,
      ticketCapacity: 200,
      ticketsSold: 0,
      description: 'La primera gran fiesta de Rodetes. ¡No te lo pierdas!',
      posterImageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop',
      galleryImages: [
        'https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=500&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=500&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1514525253440-b393452e3720?q=80&w=500&auto=format&fit=crop'
      ],
      isArchived: false
    }
  ],
  drags: [
    {
      id: 1,
      name: 'PAKA LA PIRAÑA',
      description: 'La reina de los mares y de la pista de baile.',
      instagramHandle: 'pakalapiranya',
      cardColor: '#F02D7D',
      coverImageUrl: 'https://images.unsplash.com/photo-1595152452543-e5fc28ebc2b8?q=80&w=600&auto=format&fit=crop',
      galleryImages: [],
      merchItems: [
        { id: 101, name: 'Camiseta Oficial', price: 25.00, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400&auto=format&fit=crop' }
      ]
    },
    {
      id: 2,
      name: 'VENEZIA',
      description: 'Elegancia, drama y mucho lip sync.',
      instagramHandle: 'venezia_drag',
      cardColor: '#00f3ff',
      coverImageUrl: 'https://images.unsplash.com/photo-1605289967096-72b1563600dd?q=80&w=600&auto=format&fit=crop',
      galleryImages: [],
      merchItems: []
    }
  ],
  webMerch: [
    { id: 201, name: 'Tote Bag Rodetes', price: 12.00, imageUrl: 'https://images.unsplash.com/photo-1597484661643-2f6f33267575?q=80&w=400&auto=format&fit=crop' },
    { id: 202, name: 'Abanico Loco', price: 10.00, imageUrl: 'https://images.unsplash.com/photo-1622646399039-335ee91807d9?q=80&w=400&auto=format&fit=crop' }
  ],
  tickets: [],
  merchSales: [],
  allowedDomains: [],
  scannedTickets: {},
  appLogoUrl: '',
  ticketLogoUrl: '',
  bannerVideoUrl: '',
  promoEnabled: true,
  promoCustomText: 'PRÓXIMO EVENTO: {eventName} - {eventShortDate} ⚡ ENTRADAS YA A LA VENTA',
  promoNeonColor: '#F02D7D'
};

export const useStore = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setState({ ...INITIAL_STATE, ...parsed });
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoaded]);

  // --- Actions ---

  // Events CRUD
  const addEvent = (event: Event) => {
    setState(prev => ({ ...prev, events: [...prev.events, event] }));
  };

  const updateEvent = (updatedEvent: Event) => {
    setState(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === updatedEvent.id ? updatedEvent : e)
    }));
  };

  const deleteEvent = (id: number) => {
    setState(prev => ({
      ...prev,
      events: prev.events.filter(e => e.id !== id)
    }));
  };

  // Drags CRUD
  const addDrag = (drag: Drag) => {
    setState(prev => ({ ...prev, drags: [...prev.drags, drag] }));
  };

  const updateDrag = (updatedDrag: Drag) => {
    setState(prev => ({
      ...prev,
      drags: prev.drags.map(d => d.id === updatedDrag.id ? updatedDrag : d)
    }));
  };

  const deleteDrag = (id: number) => {
    setState(prev => ({
      ...prev,
      drags: prev.drags.filter(d => d.id !== id)
    }));
  };

  // Tickets
  const addTicket = (ticket: Ticket) => {
    setState(prev => {
      const newTickets = [...prev.tickets, ticket];
      const newEvents = prev.events.map(e => 
        e.id === ticket.eventId 
          ? { ...e, ticketsSold: e.ticketsSold + ticket.quantity }
          : e
      );
      return { ...prev, tickets: newTickets, events: newEvents };
    });
  };

  const removeTicket = (ticketId: string) => {
    setState(prev => {
      const ticket = prev.tickets.find(t => t.ticketId === ticketId);
      if (!ticket) return prev;
      
      const newTickets = prev.tickets.filter(t => t.ticketId !== ticketId);
      const newEvents = prev.events.map(e =>
        e.id === ticket.eventId
          ? { ...e, ticketsSold: Math.max(0, e.ticketsSold - ticket.quantity) }
          : e
      );
      return { ...prev, tickets: newTickets, events: newEvents };
    });
  };

  // Merch
  const addMerchSale = (sale: MerchSale) => {
    setState(prev => ({ ...prev, merchSales: [...prev.merchSales, sale] }));
  };

  const updateMerchSaleStatus = (saleId: string, status: 'Pending' | 'Delivered') => {
    setState(prev => ({
      ...prev,
      merchSales: prev.merchSales.map(s => s.saleId === saleId ? { ...s, status } : s)
    }));
  };

  const confirmTicketUsage = (ticketId: string, quantityUsed: number = 1) => {
    setState(prev => ({
      ...prev,
      scannedTickets: {
        ...prev.scannedTickets,
        [ticketId]: (prev.scannedTickets[ticketId] || 0) + quantityUsed
      }
    }));
  };

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return {
    state,
    isLoaded,
    addEvent,
    updateEvent,
    deleteEvent,
    addDrag,
    updateDrag,
    deleteDrag,
    addTicket,
    removeTicket,
    addMerchSale,
    updateMerchSaleStatus,
    confirmTicketUsage,
    updateState
  };
};