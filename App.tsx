import React, { useState, useEffect } from 'react';
import { useStore } from './services/store';
import { api } from './services/api';
import { PageId, Event, Drag, MerchItem } from './types';
import Scanner from './components/Scanner';
import { ImageModal } from './components/ImageModal';
import { Layout } from './components/Layout';

// Modals
import { TicketModal } from './components/modals/TicketModal';
import { MerchModal } from './components/modals/MerchModal';
import { ScanResultModal } from './components/modals/ScanResultModal';
import { AdminAccessModal } from './components/modals/AdminAccessModal';

// Pages
import { Home } from './pages/Home';
import { EventsPage } from './pages/EventsPage';
import { GalleryPage } from './pages/GalleryPage';
import { DragsPage } from './pages/DragsPage';
import { MerchPage } from './pages/MerchPage';
import { AdminPage } from './pages/AdminPage';

// Hooks
import { useTicketPurchase } from './hooks/useTicketPurchase';
import { useMerchPurchase } from './hooks/useMerchPurchase';
import { useScanner } from './hooks/useScanner';

export const App: React.FC = () => {
  const { state, isLoaded } = useStore();

  // State
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminTapCount, setAdminTapCount] = useState(0);
  const [activeModal, setActiveModal] = useState<'ticket' | 'merch' | 'scanner' | 'lightbox' | 'scanResult' | 'adminAccess' | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedMerch, setSelectedMerch] = useState<{ item: MerchItem, drag: Drag | null } | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Custom hooks
  const { ticketForm, setTicketForm, generatedTicketId, purchaseTicket, resetForm: resetTicket } = useTicketPurchase();
  const { merchForm, setMerchForm, generatedSaleId, purchaseMerch, resetForm: resetMerch } = useMerchPurchase();
  const { scanResult, handleScan, clearResult } = useScanner();

  // Navigation
  const navigate = (page: PageId) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  // Secret admin tap
  const handleSecretTap = () => {
    if (isAdminLoggedIn) {
      navigate('admin');
      return;
    }
    const newCount = adminTapCount + 1;
    setAdminTapCount(newCount);
    if (newCount >= 5) {
      setActiveModal('adminAccess');
      setAdminTapCount(0);
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogoTap = () => {
    handleSecretTap();
    if (currentPage !== 'home' && adminTapCount < 4) navigate('home');
  };

  // Calculate next event (needed by useEffect below)
  const nextEvent = state.events.filter(e => !e.isArchived && new Date(e.date) > new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  // Scroll reveal effect
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { root: null, rootMargin: '0px', threshold: 0.1 });

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
      observer.disconnect();
    };
  }, [currentPage, state.events]);

  // Check persistent auth session
  useEffect(() => {
    api.checkAuth()
      .then((res: any) => {
        if (res.authenticated) {
          setIsAdminLoggedIn(true);
        }
      })
      .catch(err => console.error('Auth check failed:', err));
  }, []);

  // Toggle body class for promo banner
  useEffect(() => {
    if (state.promoEnabled && nextEvent) {
      document.body.classList.add('promo-active');
    } else {
      document.body.classList.remove('promo-active');
    }
  }, [state.promoEnabled, nextEvent]);

  // Modal handlers
  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    resetTicket();
    setActiveModal('ticket');
  };

  const handleSelectMerch = (item: MerchItem, drag: Drag | null) => {
    setSelectedMerch({ item, drag });
    resetMerch();
    setActiveModal('merch');
  };

  const handleSelectImage = (img: string) => {
    setSelectedImage(img);
    setActiveModal('lightbox');
  };

  const handleTicketSubmit = (form: typeof ticketForm) => {
    if (selectedEvent) {
      purchaseTicket(selectedEvent);
    }
  };

  const handleMerchSubmit = (form: typeof merchForm) => {
    if (selectedMerch) {
      purchaseMerch(selectedMerch.item, selectedMerch.drag);
    }
  };

  const handleScanComplete = (data: string) => {
    setActiveModal(null);
    handleScan(data);
    setActiveModal('scanResult');
  };

  const handleAdminLogin = async (e: React.FormEvent, email: string, pass: string) => {
    e.preventDefault();

    try {
      // Call backend login to create session
      await api.login({ username: email, password: pass });
      setIsAdminLoggedIn(true);
      console.log('✅ Admin logged in successfully');
    } catch (error) {
      console.error('❌ Login failed:', error);
      alert('Credenciales incorrectas');
      setIsAdminLoggedIn(false);
    }
  };

  if (!isLoaded) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center font-pixel">LOADING...</div>;
  }

  return (
    <Layout
      currentPage={currentPage}
      promoEnabled={state.promoEnabled}
      promoNeonColor={state.promoNeonColor}
      promoCustomText={state.promoCustomText}
      nextEvent={nextEvent}
      isAdminLoggedIn={isAdminLoggedIn}
      isMobileMenuOpen={isMobileMenuOpen}
      onLogoTap={handleLogoTap}
      onToggleMenu={() => { setIsMobileMenuOpen(!isMobileMenuOpen); handleSecretTap(); }}
      onNavigate={navigate}
      appLogoUrl={state.appLogoUrl}
    >
      {/* Page Routing */}
      {currentPage === 'home' && <Home onSelectEvent={handleSelectEvent} onNavigate={navigate} />}
      {currentPage === 'events' && <EventsPage onSelectEvent={handleSelectEvent} />}
      {currentPage === 'gallery' && <GalleryPage onSelectImage={handleSelectImage} />}
      {currentPage === 'drags' && <DragsPage onSelectMerch={handleSelectMerch} />}
      {currentPage === 'merch' && <MerchPage onSelectMerch={handleSelectMerch} />}
      {currentPage === 'admin' && (
        <AdminPage
          isAdminLoggedIn={isAdminLoggedIn}
          onLogin={handleAdminLogin}
          onLogout={() => setIsAdminLoggedIn(false)}
          onOpenScanner={() => setActiveModal('scanner')}
        />
      )}

      {/* Modals */}
      {activeModal === 'ticket' && selectedEvent && (
        <TicketModal
          event={selectedEvent}
          onClose={() => setActiveModal(null)}
          onSubmit={handleTicketSubmit}
          generatedTicketId={generatedTicketId}
          form={ticketForm}
          setForm={setTicketForm}
        />
      )}

      {activeModal === 'merch' && selectedMerch && (
        <MerchModal
          item={selectedMerch.item}
          drag={selectedMerch.drag}
          onClose={() => setActiveModal(null)}
          onSubmit={handleMerchSubmit}
          generatedSaleId={generatedSaleId}
          form={merchForm}
          setForm={setMerchForm}
        />
      )}

      {activeModal === 'adminAccess' && (
        <AdminAccessModal onEnter={() => { setActiveModal(null); navigate('admin'); }} />
      )}

      {activeModal === 'scanner' && <Scanner onScan={handleScanComplete} onClose={() => setActiveModal(null)} />}

      {activeModal === 'lightbox' && selectedImage && (
        <ImageModal isOpen={true} imageUrl={selectedImage} onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'scanResult' && scanResult && (
        <ScanResultModal
          result={scanResult}
          onClose={() => { setActiveModal(null); clearResult(); }}
          onScanAnother={() => { setActiveModal('scanner'); clearResult(); }}
        />
      )}
    </Layout>
  );
};
