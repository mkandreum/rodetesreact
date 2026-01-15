import React, { useState, useEffect } from 'react';
import { Share2, Instagram, ShoppingBag, Calendar, Image as ImageIcon, Music, Ticket, X, CheckCircle, AlertTriangle, Edit, Trash, Plus, RefreshCw, Trophy, Settings, Menu, MapPin, Shirt } from 'lucide-react';
import { AdminSettings } from './components/AdminSettings';
import { AdminGallery } from './components/AdminGallery';
import { AdminMerch } from './components/AdminMerch';
import { AdminEvents } from './components/AdminEvents';
import { AdminDrags } from './components/AdminDrags';
import { ImageModal } from './components/ImageModal';
import { useStore } from './services/store';
import { PageId, Event, Drag, MerchItem } from './types';
import QRCodeGenerator from './components/QRCodeGenerator';
import Scanner from './components/Scanner';
import Countdown from './components/Countdown';
import RsvpModal from './components/RsvpModal';

export const App: React.FC = () => {
  const {
    state, isLoaded,
    addTicket, removeTicket,
    addMerchSale, updateMerchSaleStatus,
    addEvent, updateEvent, deleteEvent,
    addDrag, updateDrag, deleteDrag,
    confirmTicketUsage
  } = useStore();

  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- Admin State ---
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [adminTapCount, setAdminTapCount] = useState(0);
  const [adminSection, setAdminSection] = useState<'settings' | 'events' | 'drags' | 'merch' | 'gallery'>('events');

  // --- UI Modals State ---
  const [activeModal, setActiveModal] = useState<'ticket' | 'merch' | 'scanner' | 'adminEvent' | 'adminDrag' | 'lightbox' | 'scanResult' | null>(null);

  // --- Selection State ---
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedMerch, setSelectedMerch] = useState<{ item: MerchItem, drag: Drag | null } | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // For Lightbox

  // --- Forms ---
  const [ticketForm, setTicketForm] = useState({ name: '', surname: '', email: '', quantity: 1 });
  const [merchForm, setMerchForm] = useState({ name: '', surname: '', email: '', quantity: 1 });
  const [generatedTicketId, setGeneratedTicketId] = useState<string | null>(null);

  // --- Admin Editing State ---
  const [editingEvent, setEditingEvent] = useState<Partial<Event>>({});
  const [editingDrag, setEditingDrag] = useState<Partial<Drag>>({});

  // --- Scanner Result State ---
  const [scanResult, setScanResult] = useState<{ status: 'success' | 'error' | 'warning', message: string, detail?: string } | null>(null);

  // --- Navigation Helper ---
  const navigate = (page: PageId) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  // --- Secret Tab Logic ---
  const handleSecretTap = () => {
    if (isAdminLoggedIn) {
      navigate('admin');
      return;
    }
    const newCount = adminTapCount + 1;
    setAdminTapCount(newCount);
    if (newCount >= 5) {
      navigate('admin');
      setAdminTapCount(0);
      setIsMobileMenuOpen(false); // Close menu if open
    }
  };

  const handleLogoTap = () => {
    handleSecretTap();
    if (currentPage !== 'home' && adminTapCount < 4) navigate('home');
  };

  // --- Scroll Reveal Logic (Legacy Parity) ---
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // observer.unobserve(entry.target); // Optional: keep watching or unobserve
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
      observer.disconnect();
    };
  }, [currentPage, state.events]); // Re-run on page/data change

  // --- Nav Items ---
  const navItems: { id: PageId, label: string }[] = [
    { id: 'home', label: 'INICIO' },
    { id: 'events', label: 'EVENTOS' },
    { id: 'gallery', label: 'GALERÍA' },
    { id: 'merch', label: 'MERCH' },
    { id: 'drags', label: 'DRAGS' }
  ];

  // --- Ticket Logic ---
  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    const existing = state.tickets.find(t => t.eventId === selectedEvent.id && t.email === ticketForm.email);
    if (existing) {
      alert(`Este email ya tiene entradas. ID: ${existing.ticketId}`);
      return;
    }

    const newTicket = {
      ticketId: crypto.randomUUID().slice(0, 8).toUpperCase(),
      eventId: selectedEvent.id,
      nombre: ticketForm.name,
      apellidos: ticketForm.surname,
      email: ticketForm.email,
      quantity: ticketForm.quantity
    };

    addTicket(newTicket);
    setGeneratedTicketId(newTicket.ticketId);
  };

  // --- Merch Logic ---
  const handleMerchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMerch) return;

    const saleId = crypto.randomUUID().slice(0, 8).toUpperCase();
    addMerchSale({
      saleId,
      dragId: selectedMerch.drag ? selectedMerch.drag.id : null,
      dragName: selectedMerch.drag ? selectedMerch.drag.name : 'Web Merch',
      merchItemId: selectedMerch.item.id,
      itemName: selectedMerch.item.name,
      itemPrice: selectedMerch.item.price,
      quantity: merchForm.quantity,
      nombre: merchForm.name,
      apellidos: merchForm.surname,
      email: merchForm.email,
      saleDate: new Date().toISOString(),
      status: 'Pending'
    });
    setGeneratedTicketId(saleId);
  };

  // --- Scanner Logic ---
  const handleScan = (data: string) => {
    setActiveModal(null); // Close camera immediately

    // Parse data (Format: TICKET_ID:XXXXX or MERCH_SALE_ID:XXXXX)
    let id = data;
    let type = 'unknown';

    if (data.includes('TICKET_ID:')) {
      id = data.split('TICKET_ID:')[1].trim();
      type = 'ticket';
    } else if (data.includes('MERCH_SALE_ID:')) {
      // Extract ID from complex merch string
      const lines = data.split('\n');
      const idLine = lines.find(l => l.startsWith('MERCH_SALE_ID:'));
      if (idLine) id = idLine.split(':')[1].trim();
      type = 'merch';
    }

    if (type === 'ticket') {
      const ticket = state.tickets.find(t => t.ticketId === id);
      if (!ticket) {
        setScanResult({ status: 'error', message: 'TICKET NO VALIDO', detail: `ID: ${id} no encontrado.` });
      } else {
        const usedCount = state.scannedTickets[id] || 0;
        if (usedCount >= ticket.quantity) {
          setScanResult({ status: 'warning', message: 'YA UTILIZADO', detail: `Este ticket ya ha entrado (${usedCount}/${ticket.quantity}).` });
        } else {
          confirmTicketUsage(id, 1);
          setScanResult({ status: 'success', message: 'ACCESO PERMITIDO', detail: `Bienvenido ${ticket.nombre}. (${usedCount + 1}/${ticket.quantity})` });
        }
      }
    } else if (type === 'merch') {
      const sale = state.merchSales.find(s => s.saleId === id);
      if (!sale) {
        setScanResult({ status: 'error', message: 'PEDIDO NO ENCONTRADO', detail: `ID: ${id}` });
      } else {
        if (sale.status === 'Delivered') {
          setScanResult({ status: 'warning', message: 'YA ENTREGADO', detail: `Este pedido ya se entregó.` });
        } else {
          updateMerchSaleStatus(id, 'Delivered');
          setScanResult({ status: 'success', message: 'ENTREGAR PEDIDO', detail: `${sale.itemName} x${sale.quantity} para ${sale.nombre}` });
        }
      }
    } else {
      setScanResult({ status: 'error', message: 'QR DESCONOCIDO', detail: data });
    }

    setActiveModal('scanResult');
  };

  // --- Admin Handlers ---
  const handleSaveEvent = () => {
    if (!editingEvent.name) return;
    const eventToSave = {
      ...editingEvent,
      id: editingEvent.id || Date.now(),
      ticketsSold: editingEvent.ticketsSold || 0,
      galleryImages: editingEvent.galleryImages || [],
      isArchived: editingEvent.isArchived || false
    } as Event;

    if (editingEvent.id) {
      updateEvent(eventToSave);
    } else {
      addEvent(eventToSave);
    }
    setActiveModal(null);
  };

  const handleSaveDrag = () => {
    if (!editingDrag.name) return;
    const dragToSave = {
      ...editingDrag,
      id: editingDrag.id || Date.now(),
      merchItems: editingDrag.merchItems || [],
      galleryImages: editingDrag.galleryImages || []
    } as Drag;

    if (editingDrag.id) {
      updateDrag(dragToSave);
    } else {
      addDrag(dragToSave);
    }
    setActiveModal(null);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminUser = (import.meta as any).env.VITE_ADMIN_USER || 'admin';
    const adminPass = (import.meta as any).env.VITE_ADMIN_PASS || 'rodetes';
    if (adminEmailInput === adminUser && adminPassInput === adminPass) {
      setIsAdminLoggedIn(true);
    } else {
      alert('Credenciales incorrectas (Usuario: admin / Pass: rodetes)');
    }
  };

  if (!isLoaded) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-pixel">LOADING...</div>;

  const upcomingEvents = state.events.filter(e => !e.isArchived && new Date(e.date) > new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextEvent = upcomingEvents[0];
  const pastEvents = state.events.filter(e => !e.isArchived && new Date(e.date) < new Date()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const recentPastEvent = pastEvents[0];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-party-500 selection:text-white">

      {/* Promo Banner */}
      {state.promoEnabled && nextEvent && (
        <div id="next-event-promo-container" className="fixed top-0 left-0 right-0 z-50 h-10 flex items-center border-b-2" style={{ borderColor: state.promoNeonColor, boxShadow: `0 0 10px ${state.promoNeonColor}` }}>
          <div id="next-event-promo" style={{ textShadow: `0 0 10px ${state.promoNeonColor}`, color: state.promoNeonColor }}>
            {state.promoCustomText
              .replace('{eventName}', nextEvent.name)
              .replace('{eventShortDate}', new Date(nextEvent.date).toLocaleDateString())}
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`fixed ${state.promoEnabled && nextEvent ? 'top-10' : 'top-0'} w-full transition-all border-b border-white`}>
        <div className="container mx-auto px-4 h-20 flex justify-between items-center">
          <button onClick={handleLogoTap} className="flex-shrink-0 group select-none">
            <img src="/logo.png" alt="RODETES" className="h-16 w-auto object-contain glitch-hover" />
          </button>

          {/* Hamburger (Visible on ALL screens now, as requested) */}
          <button onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); handleSecretTap(); }} className="p-2 text-white hover:text-party-500 transition-colors">
            {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </header>

      {/* Secondary Navigation Bar (Visible on ALL screens) */}
      <div id="secondary-nav-container" className={`fixed ${state.promoEnabled && nextEvent ? 'top-[120px]' : 'top-20'} w-full transition-all`}>
        <div className="container mx-auto">
          <nav className="flex justify-around items-center gap-4 py-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`font-pixel uppercase text-lg transition-colors ${currentPage === item.id
                  ? 'text-white text-glow-white'
                  : 'text-gray-500 hover:text-white'}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Menu Overlay (Keep for Admin access & redundancy) */}
      {/* Mobile Menu Overlay (Legacy Dropdown Style) */}
      {isMobileMenuOpen && (
        <div id="mobile-menu" className={`absolute ${state.promoEnabled && nextEvent ? 'top-[120px]' : 'top-20'} right-4 z-50 bg-black border-2 border-white w-64 shadow-lg shadow-white/30 rounded-none animate-fade-in`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`block w-full text-left px-3 py-2 font-pixel text-lg rounded-md transition-colors ${currentPage === item.id
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                {item.label}
              </button>
            ))}
            {isAdminLoggedIn && (
              <button
                onClick={() => navigate('admin')}
                className="block w-full text-left px-3 py-2 font-pixel text-lg text-gray-300 hover:bg-gray-700 hover:text-white rounded-md border-t border-gray-700 mt-2 pt-2"
              >
                ADMIN
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`container mx-auto px-4 pb-20 pt-40 ${state.promoEnabled ? 'mt-10' : ''}`}>

        {/* === HOME PAGE === */}
        {currentPage === 'home' && (
          <div className="space-y-12">
            {/* Eventos Próximos/Pasados en Inicio */}
            <section>
              <h2 className="text-4xl font-pixel text-white text-center mb-6 text-glow-white glitch-hover" data-text="EVENTOS">EVENTOS</h2>

              <div id="home-event-list-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map(event => (
                    <div key={event.id} className="relative bg-gray-900 rounded-none border-white overflow-hidden flex flex-col transform transition-all hover:border-gray-300 hover:shadow-white/30 duration-300 reveal-on-scroll visible border">
                      <div className="absolute top-0 left-0 text-white font-pixel text-sm px-2 py-1 rounded-none border-b border-r border-black z-10 shadow-md" style={{ backgroundColor: '#F02D7D' }}>
                        PRÓXIMO EVENTO
                      </div>
                      <div className="w-full bg-black border-b border-white overflow-hidden cursor-pointer" onClick={() => { setSelectedEvent(event); setActiveModal('ticket'); setGeneratedTicketId(null); setTicketForm({ name: '', surname: '', email: '', quantity: 1 }); }}>
                        <img src={event.posterImageUrl} alt={event.name} className="w-full object-cover" />
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-3xl font-pixel text-white text-glow-white mb-2 cursor-pointer glitch-hover" onClick={() => { setSelectedEvent(event); setActiveModal('ticket'); setGeneratedTicketId(null); setTicketForm({ name: '', surname: '', email: '', quantity: 1 }); }}>
                          {event.name}
                        </h3>
                        <p className="text-gray-400 font-semibold font-pixel text-lg mb-3">{new Date(event.date).toLocaleDateString()}, 21:00</p>
                        <p className="text-4xl font-extrabold text-white mb-4">{event.price} €</p>
                        <p className="text-gray-400 mb-6 flex-grow whitespace-pre-wrap font-sans">
                          {event.description}
                        </p>
                        <button
                          onClick={() => { setSelectedEvent(event); setActiveModal('ticket'); setGeneratedTicketId(null); setTicketForm({ name: '', surname: '', email: '', quantity: 1 }); }}
                          className="w-full neon-btn font-pixel text-2xl py-3 px-4 rounded-none"
                          disabled={event.ticketsSold >= event.ticketCapacity && event.ticketCapacity > 0}
                        >
                          {event.ticketsSold >= event.ticketCapacity && event.ticketCapacity > 0 ? 'AGOTADO' : 'CONSEGUIR ENTRADA'}
                        </button>
                      </div>
                    </div>
                  ))
                ) : recentPastEvent ? (
                  <div className="relative bg-gray-900 rounded-none border-white overflow-hidden flex flex-col transform transition-all hover:border-gray-300 hover:shadow-white/30 duration-300 reveal-on-scroll border">
                    <div className="absolute top-0 left-0 bg-red-700 text-white font-pixel text-sm px-2 py-1 rounded-none border-b border-r border-black z-10 shadow-md">FINALIZADO</div>
                    <div className="w-full bg-black border-b border-white overflow-hidden">
                      <img src={recentPastEvent.posterImageUrl} alt={recentPastEvent.name} className="w-full opacity-60" />
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-3xl font-pixel text-gray-500 mb-2 glitch-hover">
                        {recentPastEvent.name}
                      </h3>
                      <p className="text-gray-400 font-semibold font-pixel text-lg mb-3">{new Date(recentPastEvent.date).toLocaleDateString()}</p>
                      <p className="text-4xl font-extrabold text-gray-600 mb-4">{recentPastEvent.price} €</p>
                      <p className="text-gray-400 mb-6 flex-grow whitespace-pre-wrap font-sans">
                        {recentPastEvent.description}
                      </p>
                      <button disabled className="w-full bg-gray-800 text-gray-500 font-pixel text-2xl py-3 px-4 rounded-none border border-gray-700 cursor-not-allowed">EVENTO FINALIZADO</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-center font-pixel text-gray-500 col-span-full text-2xl">NO HAY EVENTOS</p>
                )}
              </div>
            </section>

            {/* Botón Ver Todos los Eventos */}
            <div id="view-all-events-container" className="text-center mb-12">
              <button
                id="view-all-events-btn"
                onClick={() => navigate('events')}
                className="neon-btn font-pixel text-2xl py-3 px-8 rounded-none"
              >
                VER TODOS LOS EVENTOS
              </button>
            </div>

            {/* Banner Principal (Imagen/Video) */}
            <div className="bg-black border border-white overflow-hidden mb-12 reveal-on-scroll">
              <div id="home-banner-container" className="relative w-full bg-black aspect-video">
                {state.bannerVideoUrl ? (
                  state.bannerVideoUrl.endsWith('.mp4') || state.bannerVideoUrl.endsWith('.webm') ?
                    <video src={state.bannerVideoUrl} autoPlay loop muted className="w-full h-full object-cover" /> :
                    <img src={state.bannerVideoUrl} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-party-900 via-black to-purple-900">
                    <h1 className="text-6xl md:text-9xl font-pixel text-white text-glow-white text-center mb-8 tracking-tighter animate-pulse-slow">RODETES<br /><span className="text-party-500">PARTY</span></h1>
                    <div className="transform scale-75 md:scale-100">
                      <Countdown />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* === EVENTS PAGE === */}
        {currentPage === 'events' && (
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
                        onClick={() => { setSelectedEvent(event); setActiveModal('ticket'); setGeneratedTicketId(null); setTicketForm({ name: '', surname: '', email: '', quantity: 1 }); }}
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
        )}

        {/* === GALLERY PAGE === */}
        {currentPage === 'gallery' && (
          <div className="space-y-12">
            <h2 className="text-5xl font-pixel text-white text-center text-glow-white">GALERÍAS</h2>
            {state.events.filter(e => e.galleryImages.length > 0).map(event => (
              <div key={event.id} className="border-t border-gray-800 pt-8 animate-fade-in">
                <h3 className="text-3xl font-pixel text-white mb-6 pl-4 border-l-4 border-party-500 flex items-center gap-3">
                  <ImageIcon className="text-party-500" /> {event.name}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {event.galleryImages.map((img, idx) => (
                    <div key={idx} className="aspect-square bg-gray-900 border border-gray-700 overflow-hidden hover:border-white transition-all cursor-pointer group rounded-sm" onClick={() => { setSelectedImage(img); setActiveModal('lightbox'); }}>
                      <img src={img} alt="Gallery" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {state.events.filter(e => e.galleryImages.length > 0).length === 0 && state.drags.filter(d => d.galleryImages.length > 0).length === 0 && (
              <div className="text-center py-20 border border-dashed border-gray-800 rounded-lg">
                <ImageIcon className="mx-auto h-16 w-16 text-gray-700 mb-4" />
                <p className="font-pixel text-gray-500 text-2xl">NO HAY FOTOS DISPONIBLES AÚN</p>
              </div>
            )}

            {/* Drags Galleries */}
            {state.drags.filter(d => d.galleryImages.length > 0).length > 0 && (
              <div className="pt-12 border-t border-gray-800">
                <h2 className="text-4xl font-pixel text-party-500 text-center mb-12 text-glow-party">BOOK DE REINAS</h2>
                {state.drags.filter(d => d.galleryImages.length > 0).map(drag => (
                  <div key={drag.id} className="mb-16 animate-fade-in">
                    <h3 className="text-3xl font-pixel text-white mb-6 pl-4 border-l-4 flex items-center gap-3" style={{ borderColor: drag.cardColor }}>
                      <Ticket className="w-4 h-4 mr-2" />
                      {drag.name}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {drag.galleryImages.map((img, idx) => (
                        <div key={idx} className="aspect-[3/4] bg-gray-900 border border-gray-700 overflow-hidden hover:border-white transition-all cursor-pointer group rounded-sm" onClick={() => { setSelectedImage(img); setActiveModal('lightbox'); }}>
                          <img src={img} alt={`${drag.name} gallery`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === DRAGS PAGE === */}
        {currentPage === 'drags' && (
          <div className="space-y-12">
            <h2 className="text-5xl font-pixel text-white text-center text-glow-white">NUESTRAS DRAGS</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {state.drags.map(drag => (
                <div key={drag.id} className="bg-gray-900 border-2 hover:shadow-2xl transition-shadow duration-300" style={{ borderColor: drag.cardColor, boxShadow: `0 0 5px ${drag.cardColor}` }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                    <div className="bg-black aspect-[3/4] md:aspect-auto h-full overflow-hidden relative">
                      <img src={drag.coverImageUrl} alt={drag.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-20"></div>
                    </div>
                    <div className="p-8 flex flex-col relative">
                      <h3 className="text-4xl font-pixel text-white mb-2" style={{ textShadow: `0 0 10px ${drag.cardColor}` }}>{drag.name}</h3>
                      <a href={`https://instagram.com/${drag.instagramHandle}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                        <Instagram size={18} /> @{drag.instagramHandle}
                      </a>
                      <p className="text-gray-300 font-sans mb-8 flex-grow leading-relaxed">{drag.description}</p>

                      {/* Drag Merch Preview */}
                      {drag.merchItems.length > 0 && (
                        <div className="mt-auto pt-6 border-t border-gray-800">
                          <h4 className="font-pixel text-xl mb-3 flex items-center gap-2"><Shirt size={16} /> MERCH EXCLUSIVO</h4>
                          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                            {drag.merchItems.map(item => (
                              <div key={item.id} className="flex-shrink-0 w-32 cursor-pointer group"
                                onClick={() => { setSelectedMerch({ item, drag }); setActiveModal('merch'); setGeneratedTicketId(null); setMerchForm({ name: '', surname: '', email: '', quantity: 1 }); }}
                              >
                                <div className="aspect-square bg-black border border-gray-600 mb-2 overflow-hidden group-hover:border-white rounded-md">
                                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <p className="text-xs font-pixel truncate text-gray-300 group-hover:text-white">{item.name}</p>
                                <p className="text-xs font-bold text-party-400">{item.price} €</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === MERCH PAGE === */}
        {currentPage === 'merch' && (
          <div className="space-y-16">
            <h2 className="text-5xl font-pixel text-white text-center text-glow-white">MERCHANDISING</h2>

            {/* Web Merch */}
            <section>
              <h3 className="text-3xl font-pixel text-white mb-6 border-b border-gray-700 pb-2">RODETES OFICIAL</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {state.webMerch.length > 0 ? state.webMerch.map(item => (
                  <div key={item.id} className="bg-gray-900 border border-gray-700 p-4 hover:border-white transition-all hover:-translate-y-1 group">
                    <div className="aspect-square bg-black mb-4 overflow-hidden rounded-sm relative">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute top-2 right-2 bg-party-600 text-white text-xs px-2 py-1 font-bold rounded">NEW</div>
                    </div>
                    <h4 className="font-pixel text-xl truncate mb-1">{item.name}</h4>
                    <div className="flex justify-between items-center mt-3">
                      <span className="font-bold text-lg text-party-400">{item.price} €</span>
                      <button
                        onClick={() => { setSelectedMerch({ item, drag: null }); setActiveModal('merch'); setGeneratedTicketId(null); setMerchForm({ name: '', surname: '', email: '', quantity: 1 }); }}
                        className="bg-white text-black font-pixel px-4 py-1 hover:bg-gray-200 uppercase text-sm"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                )) : <p className="text-gray-500 font-pixel">PRÓXIMAMENTE</p>}
              </div>
            </section>

            {/* Drags Merch */}
            <section>
              <h3 className="text-3xl font-pixel text-white mb-6 border-b border-gray-700 pb-2">MERCH DE DRAGS</h3>
              {state.drags.filter(d => d.merchItems.length > 0).map(drag => (
                <div key={drag.id} className="mb-12">
                  <h4 className="font-pixel text-2xl mb-4 flex items-center gap-3" style={{ color: drag.cardColor }}>
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: drag.cardColor }}></span>
                    {drag.name}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {drag.merchItems.map(item => (
                      <div key={item.id} className="bg-gray-900 border border-gray-700 p-4 hover:border-white transition-all hover:-translate-y-1 group">
                        <div className="aspect-square bg-black mb-4 overflow-hidden rounded-sm">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <h4 className="font-pixel text-xl truncate mb-1">{item.name}</h4>
                        <div className="flex justify-between items-center mt-3">
                          <span className="font-bold text-lg text-gray-300">{item.price} €</span>
                          <button
                            onClick={() => { setSelectedMerch({ item, drag }); setActiveModal('merch'); setGeneratedTicketId(null); setMerchForm({ name: '', surname: '', email: '', quantity: 1 }); }}
                            className="bg-white text-black font-pixel px-4 py-1 hover:bg-gray-200 uppercase text-sm"
                          >
                            Comprar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {/* === ADMIN PAGE === */}
        {currentPage === 'admin' && (
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-pixel text-white text-center mb-10 text-glow-white">PANEL DE ADMINISTRACIÓN</h2>

            {!isAdminLoggedIn ? (
              <form
                onSubmit={handleAdminLogin}
                className="bg-gray-900 p-8 border border-white max-w-md mx-auto shadow-2xl"
              >
                <div className="mb-4">
                  <label className="block font-pixel text-lg mb-1 text-party-300">USUARIO</label>
                  <input type="text" value={adminEmailInput} onChange={e => setAdminEmailInput(e.target.value)} className="w-full bg-black border border-gray-700 p-3 text-white focus:border-party-500 outline-none" placeholder="admin" />
                </div>
                <div className="mb-6">
                  <label className="block font-pixel text-lg mb-1 text-party-300">CONTRASEÑA</label>
                  <input type="password" value={adminPassInput} onChange={e => setAdminPassInput(e.target.value)} className="w-full bg-black border border-gray-700 p-3 text-white focus:border-party-500 outline-none" placeholder="••••••" />
                </div>
                <button type="submit" className="w-full neon-btn font-pixel text-2xl py-3">ENTRAR AL SISTEMA</button>
              </form>
            ) : (
              <div className="space-y-8 animate-fade-in">
                {/* Header / Session Info */}
                <div className="bg-gray-800 p-4 border border-gray-600 flex justify-between items-center rounded-lg shadow-lg">
                  <span className="font-mono text-sm text-gray-300">SESIÓN: <strong className="text-white">{adminEmailInput || 'admin'}</strong></span>
                  <div className="flex gap-3">
                    <button onClick={() => setActiveModal('scanner')} className="bg-indigo-600 text-white font-pixel px-4 py-2 hover:bg-indigo-500 rounded flex items-center gap-2">SCANNER</button>
                    <button onClick={() => setIsAdminLoggedIn(false)} className="bg-red-600 text-white font-pixel px-4 py-2 hover:bg-red-500 rounded">SALIR</button>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex flex-wrap gap-4 justify-center border-b border-gray-800 pb-6">
                  <button
                    onClick={() => setAdminSection('events')}
                    className={`px-6 py-2 rounded-full font-display uppercase tracking-wider transition-all ${adminSection === 'events' ? 'bg-neon-pink text-white shadow-lg shadow-neon-pink/50' : 'bg-gray-900 text-gray-400 hover:text-white'
                      }`}
                  >
                    Eventos
                  </button>
                  <button
                    onClick={() => setAdminSection('drags')}
                    className={`px-6 py-2 rounded-full font-display uppercase tracking-wider transition-all ${adminSection === 'drags' ? 'bg-neon-cyan text-black shadow-lg shadow-neon-cyan/50' : 'bg-gray-900 text-gray-400 hover:text-white'
                      }`}
                  >
                    Drags
                  </button>
                  <button
                    onClick={() => setAdminSection('merch')}
                    className={`px-6 py-2 rounded-full font-display uppercase tracking-wider transition-all ${adminSection === 'merch' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50' : 'bg-gray-900 text-gray-400 hover:text-white'
                      }`}
                  >
                    Merch & Ventas
                  </button>
                  <button
                    onClick={() => setAdminSection('gallery')}
                    className={`px-6 py-2 rounded-full font-display uppercase tracking-wider transition-all ${adminSection === 'gallery' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/50' : 'bg-gray-900 text-gray-400 hover:text-white'
                      }`}
                  >
                    Galería
                  </button>
                  <button
                    onClick={() => setAdminSection('settings')}
                    className={`px-6 py-2 rounded-full font-display uppercase tracking-wider transition-all ${adminSection === 'settings' ? 'bg-gray-700 text-white shadow-lg' : 'bg-gray-900 text-gray-400 hover:text-white'
                      }`}
                  >
                    Ajustes
                  </button>
                </div>

                {/* Tab Content */}
                <div className="animate-in fade-in duration-300">
                  {adminSection === 'events' && <AdminEvents />}
                  {adminSection === 'drags' && <AdminDrags />}
                  {adminSection === 'merch' && <AdminMerch />}
                  {adminSection === 'gallery' && <AdminGallery />}
                  {adminSection === 'settings' && <AdminSettings />}
                </div>

              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 bg-[#020617] mt-auto">
        <div className="container mx-auto text-center">
          <h2 className="font-pixel text-4xl text-white mb-6">RODETES PARTY</h2>
          <div className="flex justify-center gap-6 mb-8">
            <a href="#" className="text-gray-400 hover:text-party-500 transition-colors"><Instagram /></a>
            <a href="#" className="text-gray-400 hover:text-party-500 transition-colors"><Share2 /></a>
          </div>
          <p className="font-pixel text-gray-600">© 2024 TODOS LOS DERECHOS RESERVADOS</p>
        </div>
      </footer>

      {/* --- MODALS --- */}

      {/* TICKET MODAL */}
      {activeModal === 'ticket' && selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-black border-2 border-white max-w-sm w-full p-6 relative shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            <button onClick={() => setActiveModal(null)} className="absolute top-2 right-2 text-white hover:text-red-500"><X /></button>

            {!generatedTicketId ? (
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <h3 className="font-pixel text-3xl text-white text-center mb-6 border-b border-gray-800 pb-4">COMPRAR ENTRADA</h3>
                <div><label className="block font-pixel text-gray-400 text-sm mb-1">NOMBRE</label><input required className="w-full bg-gray-900 border border-gray-700 p-3 text-white focus:border-party-500 outline-none" value={ticketForm.name} onChange={e => setTicketForm({ ...ticketForm, name: e.target.value })} /></div>
                <div><label className="block font-pixel text-gray-400 text-sm mb-1">APELLIDOS</label><input required className="w-full bg-gray-900 border border-gray-700 p-3 text-white focus:border-party-500 outline-none" value={ticketForm.surname} onChange={e => setTicketForm({ ...ticketForm, surname: e.target.value })} /></div>
                <div><label className="block font-pixel text-gray-400 text-sm mb-1">EMAIL</label><input type="email" required className="w-full bg-gray-900 border border-gray-700 p-3 text-white focus:border-party-500 outline-none" value={ticketForm.email} onChange={e => setTicketForm({ ...ticketForm, email: e.target.value })} /></div>
                <div><label className="block font-pixel text-gray-400 text-sm mb-1">CANTIDAD</label><input type="number" min="1" max="5" required className="w-full bg-gray-900 border border-gray-700 p-3 text-white focus:border-party-500 outline-none" value={ticketForm.quantity} onChange={e => setTicketForm({ ...ticketForm, quantity: parseInt(e.target.value) })} /></div>
                <button type="submit" className="w-full neon-btn font-pixel text-2xl py-3 mt-6 hover:bg-white hover:text-black transition-all">CONFIRMAR</button>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h3 className="font-pixel text-3xl text-white mb-2">¡ENTRADA LISTA!</h3>
                <div className="bg-white p-4 inline-block rounded-lg">
                  <QRCodeGenerator text={`TICKET_ID:${generatedTicketId}`} width={180} />
                </div>
                <div className="bg-gray-900 p-4 rounded text-left text-sm font-mono border border-gray-800">
                  <p className="text-gray-400">ID: <span className="text-white">{generatedTicketId}</span></p>
                  <p className="text-gray-400">Evento: <span className="text-white">{selectedEvent.name}</span></p>
                  <p className="text-gray-400">Titular: <span className="text-white">{ticketForm.name} {ticketForm.surname}</span></p>
                </div>
                <button onClick={() => window.print()} className="text-party-400 underline font-pixel text-lg">Descargar / Imprimir</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MERCH MODAL */}
      {activeModal === 'merch' && selectedMerch && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-black border-2 border-white max-w-sm w-full p-6 relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-2 right-2 text-white hover:text-red-500"><X /></button>

            {!generatedTicketId ? (
              <form onSubmit={handleMerchSubmit} className="space-y-4">
                <h3 className="font-pixel text-3xl text-white text-center mb-2">PEDIDO</h3>
                <div className="flex items-center gap-4 bg-gray-900 p-3 rounded mb-4">
                  <img src={selectedMerch.item.imageUrl} className="w-12 h-12 object-cover rounded" />
                  <div>
                    <p className="font-bold text-sm">{selectedMerch.item.name}</p>
                    <p className="text-party-400">{selectedMerch.item.price} €</p>
                  </div>
                </div>

                <div><label className="block font-pixel text-gray-400 text-sm mb-1">NOMBRE</label><input required className="w-full bg-gray-900 border border-gray-700 p-2 text-white" value={merchForm.name} onChange={e => setMerchForm({ ...merchForm, name: e.target.value })} /></div>
                <div><label className="block font-pixel text-gray-400 text-sm mb-1">APELLIDOS</label><input required className="w-full bg-gray-900 border border-gray-700 p-2 text-white" value={merchForm.surname} onChange={e => setMerchForm({ ...merchForm, surname: e.target.value })} /></div>
                <div><label className="block font-pixel text-gray-400 text-sm mb-1">EMAIL</label><input type="email" required className="w-full bg-gray-900 border border-gray-700 p-2 text-white" value={merchForm.email} onChange={e => setMerchForm({ ...merchForm, email: e.target.value })} /></div>
                <div><label className="block font-pixel text-gray-400 text-sm mb-1">CANTIDAD</label><input type="number" min="1" required className="w-full bg-gray-900 border border-gray-700 p-2 text-white" value={merchForm.quantity} onChange={e => setMerchForm({ ...merchForm, quantity: parseInt(e.target.value) })} /></div>
                <button type="submit" className="w-full bg-white text-black font-pixel text-2xl py-2 mt-4 hover:bg-gray-200">CONFIRMAR PEDIDO</button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <h3 className="font-pixel text-3xl text-party-400 mb-2">¡PEDIDO CREADO!</h3>
                <div className="bg-white p-4 inline-block rounded">
                  <QRCodeGenerator text={`MERCH_SALE_ID:${generatedTicketId}\nNOMBRE:${merchForm.name}\nITEM:${selectedMerch.item.name}`} width={180} />
                </div>
                <p className="font-pixel text-white text-lg">PAGA A: {selectedMerch.drag ? selectedMerch.drag.name : 'RODETES'}</p>
                <p className="text-sm text-gray-400 bg-gray-900 p-2 rounded">Enseña este QR en la barra para pagar y recoger tu pedido.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SCANNER MODAL */}
      {activeModal === 'scanner' && (
        <Scanner
          onClose={() => setActiveModal(null)}
          onScan={handleScan}
        />
      )}

      {/* SCAN RESULT MODAL */}
      {activeModal === 'scanResult' && scanResult && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-8 border-4 text-center ${scanResult.status === 'success' ? 'border-green-500 bg-green-900/20' :
            scanResult.status === 'warning' ? 'border-yellow-500 bg-yellow-900/20' :
              'border-red-500 bg-red-900/20'
            }`}>
            {scanResult.status === 'success' && <CheckCircle className="w-24 h-24 mx-auto text-green-500 mb-4" />}
            {scanResult.status === 'warning' && <AlertTriangle className="w-24 h-24 mx-auto text-yellow-500 mb-4" />}
            {scanResult.status === 'error' && <X className="w-24 h-24 mx-auto text-red-500 mb-4" />}

            <h2 className="text-4xl font-pixel text-white mb-2">{scanResult.message}</h2>
            <p className="text-xl text-gray-300 font-mono mb-8">{scanResult.detail}</p>

            <button onClick={() => setActiveModal('scanner')} className="w-full bg-white text-black font-bold py-3 text-xl hover:bg-gray-200 mb-2">ESCANEAR SIGUIENTE</button>
            <button onClick={() => setActiveModal(null)} className="w-full border border-white text-white py-3 text-xl hover:bg-white/10">SALIR</button>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      <ImageModal
        isOpen={activeModal === 'lightbox' && !!selectedImage}
        onClose={() => setActiveModal(null)}
        imageUrl={selectedImage || ''}
      />

      {/* ADMIN EVENT EDIT MODAL */}
      {activeModal === 'adminEvent' && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-pixel text-2xl mb-4 text-white">EDITOR DE EVENTO</h3>
            <div className="space-y-4">
              <div><label className="text-sm text-gray-400">Nombre</label><input className="w-full bg-black border border-gray-700 p-2 text-white" value={editingEvent.name || ''} onChange={e => setEditingEvent({ ...editingEvent, name: e.target.value })} /></div>
              <div><label className="text-sm text-gray-400">Fecha (YYYY-MM-DDTHH:mm)</label><input className="w-full bg-black border border-gray-700 p-2 text-white" type="datetime-local" value={editingEvent.date || ''} onChange={e => setEditingEvent({ ...editingEvent, date: e.target.value })} /></div>
              <div><label className="text-sm text-gray-400">Precio</label><input className="w-full bg-black border border-gray-700 p-2 text-white" type="number" value={editingEvent.price || 0} onChange={e => setEditingEvent({ ...editingEvent, price: parseFloat(e.target.value) })} /></div>
              <div><label className="text-sm text-gray-400">Capacidad</label><input className="w-full bg-black border border-gray-700 p-2 text-white" type="number" value={editingEvent.ticketCapacity || 0} onChange={e => setEditingEvent({ ...editingEvent, ticketCapacity: parseInt(e.target.value) })} /></div>
              <div><label className="text-sm text-gray-400">Imagen URL</label><input className="w-full bg-black border border-gray-700 p-2 text-white" value={editingEvent.posterImageUrl || ''} onChange={e => setEditingEvent({ ...editingEvent, posterImageUrl: e.target.value })} /></div>
              <div><label className="text-sm text-gray-400">Descripción</label><textarea className="w-full bg-black border border-gray-700 p-2 text-white h-24" value={editingEvent.description || ''} onChange={e => setEditingEvent({ ...editingEvent, description: e.target.value })} /></div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={handleSaveEvent} className="flex-1 bg-green-600 text-white py-2 font-pixel text-lg">GUARDAR</button>
              <button onClick={() => setActiveModal(null)} className="flex-1 bg-gray-700 text-white py-2 font-pixel text-lg">CANCELAR</button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN DRAG EDIT MODAL */}
      {activeModal === 'adminDrag' && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-pixel text-2xl mb-4 text-white">EDITOR DE DRAG</h3>
            <div className="space-y-4">
              <div><label className="text-sm text-gray-400">Nombre</label><input className="w-full bg-black border border-gray-700 p-2 text-white" value={editingDrag.name || ''} onChange={e => setEditingDrag({ ...editingDrag, name: e.target.value })} /></div>
              <div><label className="text-sm text-gray-400">Instagram</label><input className="w-full bg-black border border-gray-700 p-2 text-white" value={editingDrag.instagramHandle || ''} onChange={e => setEditingDrag({ ...editingDrag, instagramHandle: e.target.value })} /></div>
              <div><label className="text-sm text-gray-400">Color Card (Hex)</label><input className="w-full bg-black border border-gray-700 p-2 text-white" type="color" value={editingDrag.cardColor || '#ffffff'} onChange={e => setEditingDrag({ ...editingDrag, cardColor: e.target.value })} /></div>
              <div><label className="text-sm text-gray-400">Imagen URL</label><input className="w-full bg-black border border-gray-700 p-2 text-white" value={editingDrag.coverImageUrl || ''} onChange={e => setEditingDrag({ ...editingDrag, coverImageUrl: e.target.value })} /></div>
              <div><label className="text-sm text-gray-400">Descripción</label><textarea className="w-full bg-black border border-gray-700 p-2 text-white h-24" value={editingDrag.description || ''} onChange={e => setEditingDrag({ ...editingDrag, description: e.target.value })} /></div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={handleSaveDrag} className="flex-1 bg-green-600 text-white py-2 font-pixel text-lg">GUARDAR</button>
              <button onClick={() => setActiveModal(null)} className="flex-1 bg-gray-700 text-white py-2 font-pixel text-lg">CANCELAR</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

