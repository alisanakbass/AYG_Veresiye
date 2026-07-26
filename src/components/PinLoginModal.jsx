import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, User, Delete, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { getUsers, verifyUserPin, setActiveUser } from '../services/storage';

export default function PinLoginModal({ isOpen, onSuccess, onClose }) {
  const [usersList, setUsersList] = useState(() => getUsers());
  const [selectedUser, setSelectedUser] = useState(() => getUsers()[0]);
  const [pin, setPin] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      const currentUsers = getUsers();
      setUsersList(currentUsers);
      if (!selectedUser || !currentUsers.find(u => u.id === selectedUser.id)) {
        setSelectedUser(currentUsers[0]);
      }
      setPin('');
      setErrorMsg('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePhysicalKeyDown = (e) => {
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handlePhysicalKeyDown);
    return () => {
      window.removeEventListener('keydown', handlePhysicalKeyDown);
    };
  }, [isOpen, pin, selectedUser, rememberMe]);

  if (!isOpen) return null;

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg('');

      // 4 Hane dolduğunda otomatik doğrula
      if (nextPin.length === 4) {
        checkPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  const checkPin = (pinToTest) => {
    const isValid = verifyUserPin(selectedUser.id, pinToTest);
    if (isValid) {
      setActiveUser(selectedUser, rememberMe);
      if (onSuccess) onSuccess(selectedUser);
    } else {
      setErrorMsg('Hatalı PIN Şifresi! Lütfen tekrar deneyiniz.');
      setPin('');
    }
  };

  return (
    <div 
      className="modal-overlay" 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(16px)', 
        background: 'rgba(15, 23, 42, 0.88)',
        zIndex: 999999
      }}
    >
      <div 
        className="modal-content glass-card" 
        style={{ 
          maxWidth: '440px', 
          width: '92%', 
          margin: 'auto',
          padding: '2rem 1.75rem', 
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}
      >
        {/* Lock Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--primary), #4f46e5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(79, 70, 229, 0.4)'
          }}>
            <Lock size={28} color="#ffffff" />
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            Dükkan Giriş Paneli
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
            Lütfen profilinizi seçip 4 haneli PIN şifrenizi giriniz
          </p>
        </div>

        {/* User Selection Tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {usersList.map(u => {
            const isSelected = selectedUser && selectedUser.id === u.id;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  setSelectedUser(u);
                  setPin('');
                  setErrorMsg('');
                }}
                style={{
                  padding: '0.65rem 0.35rem',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{u.role === 'owner' ? '👑' : '👤'}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: isSelected ? 'var(--primary)' : 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                  {u.name.split(' ')[0]}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  {u.role === 'owner' ? 'Dükkan Sahibi' : 'Personel'}
                </span>
              </button>
            );
          })}
        </div>

        {/* PIN Display Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {[0, 1, 2, 3].map(index => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: isFilled ? '2px solid var(--primary)' : '2px solid var(--border-color)',
                  background: isFilled ? 'var(--primary)' : 'transparent',
                  boxShadow: isFilled ? '0 0 10px rgba(99, 102, 241, 0.6)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              />
            );
          })}
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '0.35rem', 
            color: 'var(--rose-text)', 
            fontSize: '0.8125rem', 
            fontWeight: '600',
            marginBottom: '1rem' 
          }}>
            <AlertCircle size={15} />
            {errorMsg}
          </div>
        )}

        {/* Numpad Keypad Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '0.65rem', 
          maxWidth: '280px', 
          margin: '0 auto 1.25rem' 
        }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              style={{
                padding: '0.85rem',
                fontSize: '1.25rem',
                fontWeight: '700',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                transition: 'all 0.1s active'
              }}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            style={{
              padding: '0.85rem',
              fontSize: '0.8125rem',
              fontWeight: '700',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--rose-text)',
              cursor: 'pointer'
            }}
          >
            Temizle
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            style={{
              padding: '0.85rem',
              fontSize: '1.25rem',
              fontWeight: '700',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            style={{
              padding: '0.85rem',
              fontSize: '1rem',
              fontWeight: '700',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Delete size={20} />
          </button>
        </div>

        {/* Remember Me Checkbox */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.5rem', 
          marginBottom: '1rem',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '0.6rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          <input
            type="checkbox"
            id="remember-me-checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
          />
          <label htmlFor="remember-me-checkbox" style={{ fontSize: '0.8125rem', fontWeight: '600', cursor: 'pointer', color: 'var(--text-main)' }}>
            ☑ Bu cihazda oturumu açık tut
          </label>
        </div>



      </div>
    </div>
  );
}
