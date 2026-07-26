import React, { useState, useEffect } from 'react';
import { X, Users, Check, ShieldCheck, Eye, EyeOff, User } from 'lucide-react';
import { getUsers, updateUserProfile } from '../services/storage';

export default function ChangePinModal({ isOpen, onClose, showNotification }) {
  const [usersList, setUsersList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      const currentUsers = getUsers();
      setUsersList(currentUsers);
      if (currentUsers.length > 0) {
        const first = currentUsers[0];
        setSelectedUserId(first.id);
        setNameInput(first.name);
      }
      setNewPin('');
      setConfirmPin('');
      setErrorMsg('');
      setShowPin(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedUser = usersList.find(u => u.id === selectedUserId) || usersList[0];

  const handleSelectUser = (user) => {
    setSelectedUserId(user.id);
    setNameInput(user.name);
    setNewPin('');
    setConfirmPin('');
    setErrorMsg('');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();

    if (!nameInput.trim()) {
      setErrorMsg('Lütfen geçerli bir personel ismi giriniz.');
      return;
    }

    // Eğer PIN değiştirilmek isteniyorsa kontrol et
    if (newPin || confirmPin) {
      if (!/^\d{4}$/.test(newPin)) {
        setErrorMsg('PIN şifresi tam 4 haneli rakam olmalıdır (Örn: 5678).');
        return;
      }

      if (newPin !== confirmPin) {
        setErrorMsg('Girdiğiniz PIN şifreleri eşleşmiyor!');
        return;
      }
    }

    const updatedUsers = updateUserProfile(selectedUserId, {
      name: nameInput,
      pin: newPin ? newPin : undefined
    });

    setUsersList(updatedUsers);

    if (showNotification) {
      showNotification(`✅ "${nameInput.trim()}" bilgileri ve PIN şifresi başarıyla güncellendi!`);
    } else {
      alert(`✅ "${nameInput.trim()}" bilgileri ve PIN şifresi başarıyla güncellendi!`);
    }

    setNewPin('');
    setConfirmPin('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ backdropFilter: 'blur(16px)', background: 'rgba(15, 23, 42, 0.88)', zIndex: 999999 }}>
      <div 
        className="modal-content glass-card" 
        style={{ 
          maxWidth: '520px', 
          width: '92%',
          margin: 'auto',
          padding: '1.75rem', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.45rem', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
              <Users size={22} />
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: '800' }}>
                Personel & PIN Yönetimi
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Personel isimlerini ve 4 haneli PIN şifrelerini düzenleyin
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon btn-sm">
            <X size={18} />
          </button>
        </div>

        {/* User Selection Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {usersList.map(u => {
            const isSelected = selectedUserId === u.id;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => handleSelectUser(u)}
                style={{
                  padding: '0.75rem 0.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{u.role === 'owner' ? '👑' : '👤'}</span>
                <span style={{ 
                  fontSize: '0.8125rem', 
                  fontWeight: '800', 
                  color: isSelected ? 'var(--primary)' : 'var(--text-main)', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  maxWidth: '100%' 
                }}>
                  {u.name}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  {u.role === 'owner' ? 'Dükkan Sahibi' : 'Personel'}
                </span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSaveProfile}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
            
            {/* Personel İsim Düzenleme */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={14} color="var(--primary)" />
                Personel / Kullanıcı Adı *
              </label>
              <input
                type="text"
                required
                placeholder="Örn: Ahmet veya Hakan Usta"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  setErrorMsg('');
                }}
                className="form-input"
                style={{ fontWeight: '700' }}
              />
            </div>

            {/* Yeni PIN Şifresi */}
            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="form-label">Yeni 4 Haneli PIN Şifresi (Değiştirmek İstemiyorsanız Boş Bırakın)</label>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
                >
                  {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showPin ? 'Gizle' : 'Göster'}</span>
                </button>
              </div>
              
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={4}
                placeholder="**** (Değiştirmek için 4 rakam girin)"
                value={newPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setNewPin(val);
                  setErrorMsg('');
                }}
                className="form-input"
                style={{ fontSize: '1.1rem', letterSpacing: '0.25rem', textAlign: 'center' }}
              />
            </div>

            {/* PIN Tekrar */}
            {newPin.length > 0 && (
              <div className="form-group">
                <label className="form-label">Yeni PIN Şifresi (Tekrar) *</label>
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={4}
                  required
                  placeholder="****"
                  value={confirmPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setConfirmPin(val);
                    setErrorMsg('');
                  }}
                  className="form-input"
                  style={{ fontSize: '1.1rem', letterSpacing: '0.25rem', textAlign: 'center' }}
                />
              </div>
            )}

            {errorMsg && (
              <div style={{ 
                color: 'var(--rose-text)', 
                fontSize: '0.8125rem', 
                fontWeight: '600', 
                textAlign: 'center',
                background: 'rgba(239, 68, 68, 0.1)',
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)'
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(99, 102, 241, 0.08)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              🔒 <b>Güvenlik Uyarısı:</b> Yapılan isim ve PIN değişiklikleri tüm cihazlarda ve giriş kilit ekranında anında geçerli olur.
            </div>

          </div>

          <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ padding: '0.65rem 1.25rem' }}>
              İptal
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ 
                padding: '0.65rem 1.75rem', 
                fontWeight: '800', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem',
                background: 'linear-gradient(135deg, var(--primary), #4f46e5)'
              }}
            >
              <Check size={18} />
              <span>Değişiklikleri Kaydet</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
