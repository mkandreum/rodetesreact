import { useState, useEffect, useCallback } from 'react';
import { AppState, Event, Drag, Ticket, MerchSale, MerchItem } from '../types';
import { api } from './api';

const INITIAL_STATE: AppState = {
  events: [],
  drags: [],
  webMerch: [],
  dragMerch: [],
  tickets: [],
  merchSales: [],
  allowedDomains: [],
  scannedTickets: {},
  appLogoUrl: '',
  ticketLogoUrl: '',
  bannerVideoUrl: '',
  promoEnabled: true,
  promoCustomText: '',
  promoNeonColor: '#F02D7D',
  settings: {},
  nextEventId: 1,
  nextDragId: 1
};

export const useStore = () => {
  // Cache-First Initialization
  const [state, setState] = useState<AppState>(() => {
    try {
      const cached = localStorage.getItem('rodetes_state');
      return cached ? { ...INITIAL_STATE, ...JSON.parse(cached) } : INITIAL_STATE;
    } catch {
      return INITIAL_STATE;
    }
  });

  const [isLoaded, setIsLoaded] = useState(() => {
    // If we have cached state, we are technically "loaded" enough to show UI
    // The API fetch will simply update it shortly after.
    return !!localStorage.getItem('rodetes_state');
  });
  const [error, setError] = useState<string | null>(null);

  // Load initial data from API and update cache
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await api.loadState();
        // Merge with initial state to ensure all fields exist
        setState(prev => {
          const next = { ...prev, ...data };
          // Persist to local storage for instant load next time
          localStorage.setItem('rodetes_state', JSON.stringify(next));
          return next;
        });
        setIsLoaded(true);
      } catch (err) {
        console.error("Failed to load state from API:", err);
        setError("Error de conexión con el servidor");
        setIsLoaded(true); // Don't block app even if error
      }
    };
    loadData();
  }, []);

  // --- Actions (Now wrapping API calls) ---

  const refreshState = useCallback(async () => {
    try {
      const data = await api.loadState();
      setState(prev => ({ ...prev, ...data }));
    } catch (e) { console.error(e); }
  }, []);

  // Events CRUD (Mocked for now locally + reload, OR implementing full CRUD later in API)
  // For Phase 1 migration, simple state update + maybe future API sync
  // Real implementation would be: await api.addEvent(event) -> then refresh or optimistic
  // Helper for persistence
  const saveToServer = async (newState: AppState) => {
    try {
      await api.saveState(newState);
    } catch (e) {
      console.error("Failed to save state:", e);
    }
  };

  // Events CRUD
  const addEvent = async (event: Event) => {
    const newState = { ...state, events: [...state.events, event] };
    setState(newState);
    await saveToServer(newState);
  };

  const updateEvent = async (updatedEvent: Event) => {
    const newState = {
      ...state,
      events: state.events.map(e => e.id === updatedEvent.id ? updatedEvent : e)
    };
    setState(newState);
    await saveToServer(newState);
  };

  const deleteEvent = async (id: number) => {
    const newState = {
      ...state,
      events: state.events.filter(e => e.id !== id)
    };
    setState(newState);
    await saveToServer(newState);
  };

  // Drags CRUD
  const addDrag = async (drag: Drag) => {
    const newState = { ...state, drags: [...state.drags, drag] };
    setState(newState);
    await saveToServer(newState);
  };

  const updateDrag = async (updatedDrag: Drag) => {
    const newState = {
      ...state,
      drags: state.drags.map(d => d.id === updatedDrag.id ? updatedDrag : d)
    };
    setState(newState);
    await saveToServer(newState);
  };

  const deleteDrag = async (id: number) => {
    const newState = {
      ...state,
      drags: state.drags.filter(d => d.id !== id)
    };
    setState(newState);
    await saveToServer(newState);
  };

  // Tickets
  const addTicket = async (ticket: Ticket) => {
    setState(prev => {
      const newTickets = [...prev.tickets || [], ticket];
      return { ...prev, tickets: newTickets };
    });
    // Tickets are saved via api.buyTicket in real flow, but for manual add:
    await refreshState();
  };

  const removeTicket = async (ticketId: string) => {
    await refreshState();
  };

  // Merch
  const addMerchSale = async (sale: MerchSale) => {
    setState(prev => ({ ...prev, merchSales: [...(prev.merchSales || []), sale] }));
    await refreshState();
  };

  const updateMerchSaleStatus = async (saleId: string, status: 'Pending' | 'Delivered') => {
    setState(prev => ({
      ...prev,
      merchSales: (prev.merchSales || []).map(s => s.saleId === saleId ? { ...s, status } : s)
    }));
    try {
      // Find the ID. Our API uses ID. 
      // Ideally we should use database ID, but here we assume saleId is sufficient or trigger full reload.
      // If saleId is string and DB expects int, this might fail unless backend handles string lookup.
      // The robust way:
      const sale = state.merchSales.find(s => s.saleId === saleId);
      if (sale && sale.id) {
        await api.updateSaleStatus(String(sale.id), status);
      } else {
        // If we don't have ID, refresh
        await refreshState();
      }
    } catch (e) {
      console.error(e);
      await refreshState();
    }
  };

  const confirmTicketUsage = (ticketId: string, quantityUsed: number = 1) => {
    setState(prev => ({
      ...prev,
      scannedTickets: {
        ...prev.scannedTickets,
        [ticketId]: (prev.scannedTickets[ticketId] || 0) + quantityUsed
      }
    }));
    api.scanTicket(ticketId).catch(console.error);
  };

  const updateState = async (updates: Partial<AppState>) => {
    const newState = { ...state, ...updates };
    setState(newState);
    // If settings are updated, save them
    if (Object.keys(updates).some(k => ['settings', 'appLogoUrl', 'bannerVideoUrl', 'promoEnabled'].includes(k))) {
      await saveToServer(newState);
    }
  };

  return {
    state,
    isLoaded,
    error,
    refreshState,
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