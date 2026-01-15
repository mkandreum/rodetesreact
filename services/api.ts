import { AppState, Event, Drag, Ticket, MerchSale, MerchItem } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const headers = {
    'Content-Type': 'application/json',
};

// Helper to convert snake_case to camelCase
function toCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(v => toCamelCase(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce((result, key) => {
            const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
            result[camelKey] = toCamelCase(obj[key]);
            return result;
        }, {} as any);
    }
    return obj;
}

// Helper for API calls
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_URL}/api${endpoint}`, {
        ...options,
        headers: {
            ...headers,
            ...options.headers,
        },
    });

    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error || `API Error: ${res.statusText}`);
    }

    const data = await res.json();
    return toCamelCase(data);
}

export const api = {
    // State - transforms backend structure to match AppState flattening if needed
    loadState: async () => {
        const data = await fetchApi<any>('/state');
        // Backend returns: { events, drags, webMerch, dragMerch, settings, scannedTickets } (camelCased now)
        // We need to flatten settings into the root for AppState compatibility
        return {
            ...data,
            appLogoUrl: data.settings?.appLogoUrl || '',
            ticketLogoUrl: data.settings?.ticketLogoUrl || '',
            bannerVideoUrl: data.settings?.bannerVideoUrl || '',
            promoEnabled: data.settings?.promoEnabled ?? false,
            promoCustomText: data.settings?.promoCustomText || '',
            promoNeonColor: data.settings?.promoNeonColor || '#F02D7D',
            allowedDomains: data.settings?.allowedDomains || []
        };
    },

    saveState: (state: any) => {
        // We only send writable parts
        const payload = {
            events: state.events,
            drags: state.drags,
            settings: {
                appLogoUrl: state.appLogoUrl,
                ticketLogoUrl: state.ticketLogoUrl,
                bannerVideoUrl: state.bannerVideoUrl,
                promoEnabled: state.promoEnabled,
                promoCustomText: state.promoCustomText,
                promoNeonColor: state.promoNeonColor,
                allowedDomains: state.allowedDomains
            }
        };
        return fetchApi('/state', { method: 'POST', body: JSON.stringify(payload) });
    },

    // Auth
    login: (credentials: any) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    checkAuth: () => fetchApi('/auth/status'),
    logout: () => fetchApi('/auth/logout', { method: 'POST' }),

    // Tickets
    buyTicket: (data: any) => fetchApi('/tickets', { method: 'POST', body: JSON.stringify(data) }),
    scanTicket: (ticketId: string) => fetchApi('/tickets/scan', { method: 'POST', body: JSON.stringify({ ticket_id: ticketId }) }),
    getTickets: () => fetchApi<Ticket[]>('/tickets'), // Admin only
    deleteTicket: (id: number) => fetchApi(`/tickets/${id}`, { method: 'DELETE' }),

    // Merch
    buyMerch: (data: any) => fetchApi('/merch/buy', { method: 'POST', body: JSON.stringify(data) }),
    getSales: () => fetchApi<MerchSale[]>('/merch/sales'), // Admin only
    updateSaleStatus: (id: string, status: string) => fetchApi(`/merch/sales/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

    // Items CRUD
    addMerchItem: (data: any) => fetchApi('/merch/items', { method: 'POST', body: JSON.stringify(data) }),
    deleteMerchItem: (id: number) => fetchApi(`/merch/items/${id}`, { method: 'DELETE' }),

    // Upload
    uploadFile: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            body: formData, // No Content-Type header (browser sets it with boundary)
        });

        if (!res.ok) throw new Error('Upload failed');
        return res.json();
    },

    // Backup
    downloadBackup: () => {
        window.location.href = `${API_URL}/api/backup`;
    }
};
