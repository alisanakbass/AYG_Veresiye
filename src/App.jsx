import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomeHub from './components/HomeHub';
import Dashboard from './components/Dashboard';
import CustomerList from './components/CustomerList';
import TransactionPage from './components/TransactionPage';
import PaymentPage from './components/PaymentPage';
import CustomerFormPage from './components/CustomerFormPage';
import CustomerDetailPage from './components/CustomerDetailPage';
import NotepadPage from './components/NotepadPage';
import PinLoginModal from './components/PinLoginModal';

import { getCustomers, getActiveUser } from './services/storage';

const THEME_KEY = 'ayg_veresiye_theme_v1';

const parseHash = () => {
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) return { tab: 'home', customerId: null };

  const [tabPart, queryPart] = hash.split('?');
  const params = new URLSearchParams(queryPart || '');
  return {
    tab: tabPart || 'home',
    customerId: params.get('id')
  };
};

const buildHash = (tab, customerId = null) => {
  if (tab === 'customer-detail' && customerId) {
    return `#customer-detail?id=${customerId}`;
  }
  return `#${tab}`;
};

export default function App() {
  const [activeTab, setActiveTabState] = useState('home');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [notification, setNotification] = useState(null);

  const [currentUser, setCurrentUser] = useState(() => getActiveUser());
  const [isPinModalOpen, setIsPinModalOpen] = useState(() => !getActiveUser());

  useEffect(() => {
    const user = getActiveUser();
    if (!user) {
      setIsPinModalOpen(true);
    } else {
      setCurrentUser(user);
    }
  }, []);

  const setActiveTab = (tab, customer = null) => {
    const cust = customer || selectedCustomer;
    setActiveTabState(tab);
    if (customer) {
      setSelectedCustomer(customer);
    }
    const newHash = buildHash(tab, cust?.id);
    if (window.location.hash !== newHash) {
      window.history.pushState({ tab, customerId: cust?.id }, '', newHash);
    }
  };

  useEffect(() => {
    const syncFromHash = () => {
      const { tab, customerId } = parseHash();
      setActiveTabState(tab);
      if (customerId) {
        const found = getCustomers().find(c => c.id === customerId);
        if (found) setSelectedCustomer(found);
      }
    };

    syncFromHash();

    const onPopState = () => {
      syncFromHash();
    };

    window.addEventListener('popstate', onPopState);
    window.addEventListener('hashchange', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('hashchange', onPopState);
    };
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Tema Yönetimi
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_KEY) || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Navigasyon Yönlendirme Fonksiyonları
  const handleOpenCustomerDetail = (customer) => {
    if (!customer) return;
    setSelectedCustomer(customer);
    setActiveTab('customer-detail', customer);
  };

  const handleOpenNewTransaction = (customer = null) => {
    if (customer) setSelectedCustomer(customer);
    setActiveTab('add-transaction', customer);
  };

  const handleOpenNewPayment = (customer = null) => {
    if (customer) setSelectedCustomer(customer);
    setActiveTab('add-payment', customer);
  };

  const handleOpenNewCustomer = () => {
    setActiveTab('add-customer');
  };

  const handleOpenNotepad = () => {
    setActiveTab('notepad');
  };

  const handleCustomerCreated = (newCustomer) => {
    setSelectedCustomer(newCustomer);
    setActiveTab('add-transaction', newCustomer);
    showNotification(`✅ "${newCustomer.first_name} ${newCustomer.last_name}" müşterisi başarıyla kaydedildi! Veresiye ekleme ekranındasınız.`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* Toast Bildirimi */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '1.25rem',
          right: '1.25rem',
          zIndex: 9999,
          background: notification.type === 'success' ? '#10b981' : '#f59e0b',
          color: '#ffffff',
          padding: '0.9rem 1.4rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          fontWeight: '700',
          fontSize: '0.9375rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
        }}>
          <span>{notification.message}</span>
          <button 
            onClick={() => setNotification(null)} 
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem', marginLeft: '0.5rem', opacity: 0.8 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Header & Navbar */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentUser={currentUser}
        showNotification={showNotification}
        onLock={() => {
          setCurrentUser(null);
          setIsPinModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="app-container" style={{ flex: 1, paddingBottom: '3rem' }}>
        {activeTab === 'home' && (
          <HomeHub 
            onOpenNewTransaction={handleOpenNewTransaction}
            onOpenNewPayment={handleOpenNewPayment}
            onNavigateCustomers={() => setActiveTab('customers')}
            onNavigateDashboard={() => setActiveTab('dashboard')}
            onOpenNewCustomer={handleOpenNewCustomer}
            onNavigateNotepad={handleOpenNotepad}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard 
            onSelectCustomer={handleOpenCustomerDetail}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerList 
            onSelectCustomer={handleOpenCustomerDetail}
            onOpenNewTransaction={handleOpenNewTransaction}
            onOpenNewPayment={handleOpenNewPayment}
            onOpenNewCustomer={handleOpenNewCustomer}
            showNotification={showNotification}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'add-transaction' && (
          <TransactionPage 
            selectedCustomer={selectedCustomer}
            onNavigateHome={() => setActiveTab('home')}
            onNavigateCustomers={() => setActiveTab('customers')}
            showNotification={showNotification}
          />
        )}

        {activeTab === 'add-payment' && (
          <PaymentPage 
            selectedCustomer={selectedCustomer}
            onNavigateHome={() => setActiveTab('home')}
            showNotification={showNotification}
          />
        )}

        {activeTab === 'add-customer' && (
          <CustomerFormPage 
            onNavigateHome={() => setActiveTab('home')}
            onNavigateCustomers={() => setActiveTab('customers')}
            onCustomerCreated={handleCustomerCreated}
            showNotification={showNotification}
          />
        )}

        {activeTab === 'customer-detail' && (
          <CustomerDetailPage 
            customer={selectedCustomer}
            onNavigateHome={() => setActiveTab('home')}
            onNavigateCustomers={() => setActiveTab('customers')}
            onOpenNewTransaction={handleOpenNewTransaction}
            onOpenNewPayment={handleOpenNewPayment}
            showNotification={showNotification}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'notepad' && (
          <NotepadPage 
            onNavigateHome={() => setActiveTab('home')}
            showNotification={showNotification}
            currentUser={currentUser}
          />
        )}
      </main>

      {/* Pin Giriş Modalı */}
      <PinLoginModal
        isOpen={isPinModalOpen}
        onSuccess={(user) => {
          setCurrentUser(user);
          setIsPinModalOpen(false);
          showNotification(`🔑 Hoş geldiniz, ${user.name}!`);
        }}
      />

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-dim)', fontSize: '0.8125rem', borderTop: '1px solid var(--border-color)' }}>
        AYG Veresiye Defteri © {new Date().getFullYear()} — Dijital Borç ve Tahsilat Takip Sistemi (Local Dev Environment)
      </footer>

    </div>
  );
}
