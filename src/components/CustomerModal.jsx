import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { addCustomer } from '../services/storage';

export default function CustomerModal({ isOpen, onClose, onCreated }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      alert('Lütfen Ad ve Soyad alanlarını doldurunuz.');
      return;
    }

    const newCustomer = addCustomer({
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      address: address,
      notes: notes
    });

    if (onCreated) onCreated(newCustomer);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={20} color="var(--primary)" />
            <h3 className="modal-title">Yeni Müşteri Ekle</h3>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon btn-sm">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Müşteri Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ahmet"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Soyadı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Yılmaz"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Telefon Numarası (İsteğe Bağlı)</label>
              <input
                type="tel"
                placeholder="Örn: 0532 123 45 67 (İsteğe bağlı)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                WhatsApp mesajları gönderilmeyecekse boş bırakabilirsiniz.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Adres (İsteğe Bağlı)</label>
              <textarea
                placeholder="Örn: Merkez Mah. Atatük Cad. No: 12"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="form-textarea"
                rows={2}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Özel Not (İsteğe Bağlı)</label>
              <input
                type="text"
                placeholder="Örn: Ay sonu ödeme yapacak, usta vb."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-input"
              />
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              İptal
            </button>
            <button type="submit" className="btn btn-primary">
              Müşteriyi Kaydet
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
