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

const THEME_KEY = 'ayg_veresiye_theme_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

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
    setSelectedCustomer(customer);
    setActiveTab('customer-detail');
  };

  const handleOpenNewTransaction = (customer = null) => {
    setSelectedCustomer(customer);
    setActiveTab('add-transaction');
  };

  const handleOpenNewPayment = (customer = null) => {
    setSelectedCustomer(customer);
    setActiveTab('add-payment');
  };

  const handleOpenNewCustomer = () => {
    setActiveTab('add-customer');
  };

  const handleOpenNotepad = () => {
    setActiveTab('notepad');
  };

  const handleCustomerCreated = (newCustomer) => {
    setSelectedCustomer(newCustomer);
    setActiveTab('add-transaction');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header & Navbar */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        onToggleTheme={toggleTheme}
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
          />
        )}

        {activeTab === 'add-transaction' && (
          <TransactionPage 
            selectedCustomer={selectedCustomer}
            onNavigateHome={() => setActiveTab('home')}
            onNavigateCustomers={() => setActiveTab('customers')}
          />
        )}

        {activeTab === 'add-payment' && (
          <PaymentPage 
            selectedCustomer={selectedCustomer}
            onNavigateHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'add-customer' && (
          <CustomerFormPage 
            onNavigateHome={() => setActiveTab('home')}
            onNavigateCustomers={() => setActiveTab('customers')}
            onCustomerCreated={handleCustomerCreated}
          />
        )}

        {activeTab === 'customer-detail' && (
          <CustomerDetailPage 
            customer={selectedCustomer}
            onNavigateHome={() => setActiveTab('home')}
            onNavigateCustomers={() => setActiveTab('customers')}
            onOpenNewTransaction={handleOpenNewTransaction}
            onOpenNewPayment={handleOpenNewPayment}
          />
        )}

        {activeTab === 'notepad' && (
          <NotepadPage 
            onNavigateHome={() => setActiveTab('home')}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-dim)', fontSize: '0.8125rem', borderTop: '1px solid var(--border-color)' }}>
        AYG Veresiye Defteri © {new Date().getFullYear()} — Dijital Borç ve Tahsilat Takip Sistemi (Local Dev Environment)
      </footer>

    </div>
  );
}
