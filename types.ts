export type PageId = 'home' | 'events' | 'gallery' | 'drags' | 'merch' | 'admin';

export interface Event {
  id: number;
  name: string;
  date: string;
  price: number;
  ticketCapacity: number;
  ticketsSold: number;
  description: string;
  posterImageUrl: string;
  galleryImages: string[];
  isArchived: boolean;
}

export interface Drag {
  id: number;
  name: string;
  description: string;
  instagramHandle: string;
  cardColor: string;
  coverImageUrl: string;
  galleryImages: string[];
  merchItems?: MerchItem[]; // Optional as it might be populated via filtering dragMerch
}

export interface MerchItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  dragId?: number | null; // Added to distinguish web vs drag merch
}

export interface Ticket {
  id?: number; // Database ID
  ticketId: string;
  eventId: number;
  nombre: string;
  apellidos: string;
  email: string;
  quantity: number;
  scannedCount?: number;
}

export interface MerchSale {
  id?: number;
  saleId: string;
  merchItemId: number;
  dragId?: number | null;
  dragName?: string;
  itemName: string;
  itemPrice: number;
  quantity: number;
  nombre: string;
  apellidos: string;
  email: string;
  saleDate: string;
  status: 'Pending' | 'Delivered';
}

export interface AppSettings {
  appLogoUrl?: string;
  ticketLogoUrl?: string;
  bannerVideoUrl?: string;
  promoEnabled: boolean;
  promoCustomText: string;
  promoNeonColor: string;
  allowedDomains: string[];
}

export interface AppState {
  events: Event[];
  drags: Drag[];
  webMerch: MerchItem[];
  dragMerch: MerchItem[];
  tickets: Ticket[]; // This might be empty for non-admins?
  merchSales: MerchSale[];

  // Settings flattened for easier state access or kept in settings object? 
  // Store.ts assumes flattened in older version, but let's try to group them given the backend returns `settings`.
  // However, `store.ts` destructures them. 
  // Let's keep them here for compatibility but mapped from settings
  allowedDomains: string[];
  scannedTickets: Record<string, number>;

  appLogoUrl: string;
  ticketLogoUrl: string;
  bannerVideoUrl: string;
  promoEnabled: boolean;
  promoCustomText: string;
  promoNeonColor: string;

  // New backend structure wrapper
  settings: Partial<AppSettings>;

  nextEventId: number;
  nextDragId: number;
}

export interface Guest {
  name: string;
  email: string;
  guestsCount: number;
  dietaryRestrictions: string;
}