import React, { useState } from 'react';
import { 
  BookOpen, 
  RotateCcw, 
  UserCheck,
  ArrowLeft,
  Sun,
  Moon,
  Lock,
  Users
} from 'lucide-react';
import { logoutUser, resetToDemoData } from '../services/storage';
import ChangePinModal from './ChangePinModal';

export default function Navbar({ activeTab, setActiveTab, theme, onToggleTheme, currentUser, onLock, showNotification }) {
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);

  const handleLockScreen = () => {
    logoutUser();
    if (onLock) onLock();
  };

  return (
    <>
      <header className="glass-card" style={{ borderRadius: '0 0 16px 16px', marginBottom: '1.5rem', borderTop: 'none' }}>
        <div className="app-container" style={{ padding: '0.85rem 1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            
            {/* Left: Prominent Single Back Button (if on sub-page) + Brand Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {activeTab !== 'home' && (
                <button
                  onClick={() => setActiveTab('home')}
                  className="btn btn-primary"
                  style={{ 
                    fontWeight: '700', 
                    padding: '0.6rem 1.2rem',
                    fontSize: '0.9375rem',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' 
                  }}
                >
                  <ArrowLeft size={18} />
                  <span>← Ana Sayfaya Dön</span>
                </button>
              )}

              <div 
                onClick={() => setActiveTab('home')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366f1, #4338ca)',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
                }}>
                  <BookOpen size={22} color="#ffffff" />
                </div>
                <div>
                  <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(to right, var(--text-main), var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    AYG Veresiye Defteri
                  </h1>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Dijital Borç & Tahsilat Takip Sistemi
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Active User Badge, Lock Button, Theme Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              
              {/* Dükkan Sahibi PIN & Personel Yönetimi Butonu */}
              {currentUser && currentUser.role === 'owner' && (
                <button
                  onClick={() => setIsChangePinOpen(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.45rem 0.75rem', fontSize: '0.8125rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  title="Personel İsimleri ve PIN Şifrelerini Yönet"
                >
                  <Users size={15} color="var(--primary)" />
                  <span>Personel & PIN</span>
                </button>
              )}

              {/* Active User Badge & Lock */}
              {currentUser && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.35rem 0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <UserCheck size={16} color="var(--emerald-text)" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-main)' }}>
                    {currentUser.title || currentUser.name}
                  </span>
                  
                  <button
                    onClick={handleLockScreen}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', marginLeft: '0.25rem', color: 'var(--rose-text)' }}
                    title="Ekranı Kilitle / Giriş Yap"
                  >
                    <Lock size={12} />
                    <span>Kilitle</span>
                  </button>
                </div>
              )}

              {/* Theme Toggle Button */}
              <button
                onClick={onToggleTheme}
                className="btn btn-secondary btn-sm btn-icon"
                title={theme === 'light' ? 'Koyu Temaya Geç' : 'Açık Temaya Geç'}
                style={{ padding: '0.5rem 0.75rem', gap: '0.35rem', fontWeight: '600' }}
              >
                {theme === 'light' ? (
                  <>
                    <Moon size={16} color="#6366f1" />
                    <span style={{ fontSize: '0.8125rem' }}>Koyu</span>
                  </>
                ) : (
                  <>
                    <Sun size={16} color="#fbbf24" />
                    <span style={{ fontSize: '0.8125rem' }}>Açık</span>
                  </>
                )}
              </button>

            </div>

          </div>

        </div>
      </header>

      {/* Change PIN Modal */}
      <ChangePinModal
        isOpen={isChangePinOpen}
        onClose={() => setIsChangePinOpen(false)}
        showNotification={showNotification}
      />
    </>
  );
}
