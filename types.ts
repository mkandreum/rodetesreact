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
  merchItems: MerchItem[];
}

export interface MerchItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
}

export interface Ticket {
  ticketId: string;
  eventId: number;
  nombre: string;
  apellidos: string;
  email: string;
  quantity: number;
}

export interface MerchSale {
  saleId: string;
  dragId: number | 'web';
  dragName: string;
  itemId: number;
  itemName: string;
  itemPrice: number;
  quantity: number;
  nombre: string;
  apellidos: string;
  email: string;
  saleDate: string;
  status: 'Pending' | 'Delivered';
}

export interface Guest {
  name: string;
  email: string;
  guestsCount: number;
  dietaryRestrictions: string;
}

export interface AppState {
  events: Event[];
  drags: Drag[];
  webMerch: MerchItem[];
  tickets: Ticket[];
  merchSales: MerchSale[];
  allowedDomains: string[];
  scannedTickets: Record<string, number>;
  appLogoUrl: string;
  ticketLogoUrl: string;
  bannerVideoUrl: string;
  promoEnabled: boolean;
  promoCustomText: string;
  promoNeonColor: string;
}