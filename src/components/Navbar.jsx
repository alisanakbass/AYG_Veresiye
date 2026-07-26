import React from 'react';
import { 
  BookOpen, 
  RotateCcw, 
  UserCheck,
  ArrowLeft,
  Sun,
  Moon
} from 'lucide-react';
import { USERS, getActiveUser, setActiveUser, resetToDemoData } from '../services/storage';

export default function Navbar({ activeTab, setActiveTab, theme, onToggleTheme }) {
  const currentUser = getActiveUser();

  const handleUserChange = (e) => {
    const selected = USERS.find(u => u.id === e.target.value);
    if (selected) {
      setActiveUser(selected);
      window.location.reload();
    }
  };

  return (
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

          {/* Right: Theme Switcher, Active User & Demo Reset */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            
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

            {/* User Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.35rem 0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <UserCheck size={16} color="var(--emerald-text)" />
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Kullanıcı:</span>
              <select 
                value={currentUser.id} 
                onChange={handleUserChange}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-main)',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {USERS.map(u => (
                  <option key={u.id} value={u.id} style={{ background: 'var(--modal-bg)', color: 'var(--text-main)' }}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <button 
              onClick={resetToDemoData} 
              className="btn btn-secondary btn-sm"
              title="Demo verilerini sıfırla"
            >
              <RotateCcw size={14} />
              <span style={{ display: 'none', '@media (min-width: 640px)': { display: 'inline' } }}>Sıfırla</span>
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
