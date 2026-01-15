import React, { useState, useEffect } from 'react';
import { Share2, Instagram, X, CheckCircle, AlertTriangle, Menu } from 'lucide-react';
import { useStore } from './services/store';
import { PageId, Event, Drag, MerchItem } from './types';
import QRCodeGenerator from './components/QRCodeGenerator';
import Scanner from './components/Scanner';
import { ImageModal } from './components/ImageModal';

// Pages
import { Home } from './pages/Home';
import { EventsPage } from './pages/EventsPage';
import { GalleryPage } from './pages/GalleryPage';
import { DragsPage } from './pages/DragsPage';
import { MerchPage } from './pages/MerchPage';
import { AdminPage } from './pages/AdminPage';

export const App: React.FC = () => {
  const {
    state, isLoaded,
    addTicket,
    addMerchSale, updateMerchSaleStatus,
    confirmTicketUsage
  } = useStore();

  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- Admin State ---
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminTapCount, setAdminTapCount] = useState(0);

  // --- UI Modals State ---
  const [activeModal, setActiveModal] = useState<'ticket' | 'merch' | 'scanner' | 'adminEvent' | 'adminDrag' | 'lightbox' | 'scanResult' | 'adminAccess' | null>(null);

  // --- Selection State ---
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedMerch, setSelectedMerch] = useState<{ item: MerchItem, drag: Drag | null } | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // For Lightbox

  // --- Forms ---
  const [ticketForm, setTicketForm] = useState({ name: '', surname: '', email: '', quantity: 1 });
  const [merchForm, setMerchForm] = useState({ name: '', surname: '', email: '', quantity: 1 });
  const [generatedTicketId, setGeneratedTicketId] = useState<string | null>(null);

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
      setActiveModal('adminAccess'); // Show access granted modal
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
  const handleAdminLogin = (e: React.FormEvent, email: string, pass: string) => {
    e.preventDefault();
    const adminUser = (import.meta as any).env.VITE_ADMIN_USER || 'admin';
    const adminPass = (import.meta as any).env.VITE_ADMIN_PASS || 'rodetes';
    if (email === adminUser && pass === adminPass) {
      setIsAdminLoggedIn(true);
    } else {
      alert('Credenciales incorrectas (Usuario: admin / Pass: rodetes)');
    }
  };

  if (!isLoaded) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-pixel">LOADING...</div>;

  const nextEvent = state.events.filter(e => !e.isArchived && new Date(e.date) > new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

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

          {/* Hamburger */}
          <button onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); handleSecretTap(); }} className="p-2 text-white hover:text-party-500 transition-colors">
            {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </header>

      {/* Secondary Navigation Bar (Visible on ALL screens, HIDDEN in Admin) */}
      {currentPage !== 'admin' && (
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
      )}

      {/* Mobile Menu Overlay */}
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

        {currentPage === 'home' && (
          <Home
            onSelectEvent={(e) => {
              setSelectedEvent(e);
              setActiveModal('ticket');
              setGeneratedTicketId(null);
              setTicketForm({ name: '', surname: '', email: '', quantity: 1 });
            }}
            onNavigate={navigate}
          />
        )}

        {currentPage === 'events' && (
          <EventsPage
            onSelectEvent={(e) => {
              setSelectedEvent(e);
              setActiveModal('ticket');
              setGeneratedTicketId(null);
              setTicketForm({ name: '', surname: '', email: '', quantity: 1 });
            }}
          />
        )}

        {currentPage === 'gallery' && (
          <GalleryPage
            onSelectImage={(img) => {
              setSelectedImage(img);
              setActiveModal('lightbox');
            }}
          />
        )}

        {currentPage === 'drags' && (
          <DragsPage
            onSelectMerch={(item, drag) => {
              setSelectedMerch({ item, drag });
              setActiveModal('merch');
              setGeneratedTicketId(null);
              setMerchForm({ name: '', surname: '', email: '', quantity: 1 });
            }}
          />
        )}

        {currentPage === 'merch' && (
          <MerchPage
            onSelectMerch={(item, drag) => {
              setSelectedMerch({ item, drag });
              setActiveModal('merch');
              setGeneratedTicketId(null);
              setMerchForm({ name: '', surname: '', email: '', quantity: 1 });
            }}
          />
        )}

        {currentPage === 'admin' && (
          <AdminPage
            isAdminLoggedIn={isAdminLoggedIn}
            onLogin={handleAdminLogin}
            onLogout={() => setIsAdminLoggedIn(false)}
            onOpenScanner={() => setActiveModal('scanner')}
          />
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
                <div className="bg-gray-900 p-4 rounded text-left text-sm font-mono border border-gray-800">
                  <p className="text-gray-400">ID Venta: <span className="text-white">{generatedTicketId}</span></p>
                  <p className="text-gray-400">Producto: <span className="text-white">{selectedMerch.item.name}</span></p>
                  <p className="text-gray-400">Total: <span className="text-white">{(selectedMerch.item.price * merchForm.quantity).toFixed(2)} €</span></p>
                </div>
                <button onClick={() => window.print()} className="text-party-400 underline font-pixel text-lg">Guardar Comprobante</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADMIN ACCESS MODAL */}
      {activeModal === 'adminAccess' && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gray-900 border-2 border-neon-cyan max-w-md w-full p-8 text-center relative shadow-[0_0_50px_rgba(0,255,255,0.3)]">
            <h3 className="font-pixel text-4xl text-neon-cyan mb-4 animate-pulse">ACCESO CONCEDIDO</h3>
            <p className="font-pixel text-white text-lg mb-8">BIENVENIDO AL PANEL DE CONTROL</p>
            <button
              onClick={() => { setActiveModal(null); navigate('admin'); }}
              className="w-full bg-neon-cyan text-black font-pixel text-2xl py-3 hover:bg-white transition-colors"
            >
              ENTRAR
            </button>
          </div>
        </div>
      )}

      {/* COMPONENT MODALS (Scanner, Lightbox, etc.) */}
      {activeModal === 'scanner' && <Scanner onScan={handleScan} onClose={() => setActiveModal(null)} />}

      {activeModal === 'lightbox' && selectedImage && (
        <ImageModal imageUrl={selectedImage} onClose={() => setActiveModal(null)} />
      )}

      {/* SCAN RESULT MODAL */}
      {activeModal === 'scanResult' && scanResult && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in">
          <div className={`bg-gray-900 border-4 max-w-sm w-full p-6 text-center shadow-2xl ${scanResult.status === 'success' ? 'border-green-500' :
            scanResult.status === 'warning' ? 'border-yellow-500' : 'border-red-500'
            }`}>
            {scanResult.status === 'success' && <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />}
            {scanResult.status === 'warning' && <AlertTriangle className="w-20 h-20 text-yellow-500 mx-auto mb-4" />}
            {scanResult.status === 'error' && <X className="w-20 h-20 text-red-500 mx-auto mb-4" />}

            <h3 className={`font-pixel text-3xl mb-2 ${scanResult.status === 'success' ? 'text-green-500' :
              scanResult.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
              }`}>{scanResult.message}</h3>

            <p className="text-white font-mono text-lg mb-6 break-words">{scanResult.detail}</p>

            <button onClick={() => setActiveModal('scanner')} className="w-full neon-btn font-pixel text-xl py-3 mb-2">ESCANEAR OTRO</button>
            <button onClick={() => setActiveModal(null)} className="w-full border border-gray-600 text-gray-400 font-pixel text-lg py-2 hover:text-white">CERRAR</button>
          </div>
        </div>
      )}

    </div>
  );
};
