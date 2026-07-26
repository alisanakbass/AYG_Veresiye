import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { addCustomer } from '../services/storage';

export default function CustomerFormPage({ onNavigateHome, onCustomerCreated }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      const form = e.currentTarget;
      const focusables = Array.from(
        form.querySelectorAll('input:not([disabled]), select:not([disabled]), button[type="submit"]:not([disabled])')
      );
      const index = focusables.indexOf(e.target);

      if (index > -1 && index < focusables.length - 1) {
        e.preventDefault();
        focusables[index + 1].focus();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      alert('Lütfen Ad ve Soyad alanlarını doldurunuz.');
      return;
    }

    try {
      const newCustomer = addCustomer({
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        address: address,
        notes: notes
      });

      // Yeni müşteri kaydedildikten sonra otomatik olarak Veresiye Ekle sayfasına yönlendir
      if (onCustomerCreated) {
        onCustomerCreated(newCustomer);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
          <UserPlus size={30} /> 👤 Yeni Müşteri Kaydet
        </h2>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="glass-card" style={{ padding: '2rem' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Müşteri Adı *</label>
            <input
              type="text"
              required
              autoFocus
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

        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Telefon Numarası (İsteğe Bağlı)</label>
          <input
            type="tel"
            placeholder="Örn: 0532 123 45 67 (İsteğe bağlı)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="form-input"
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
            Kaydedildikten sonra otomatik olarak bu müşteriye Veresiye Ekleme sayfası açılacaktır.
          </span>
        </div>

        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Adres (İsteğe Bağlı)</label>
          <textarea
            placeholder="Örn: Merkez Mah. Atatük Cad. No: 12"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="form-textarea"
            rows={3}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.75rem' }}>
          <label className="form-label">Özel Not (İsteğe Bağlı)</label>
          <input
            type="text"
            placeholder="Örn: Ay sonu ödeme yapacak, usta vb."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="form-input"
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onNavigateHome} className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
            İptal
          </button>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
            👤 Kaydet ve Veresiye Ekle →
          </button>
        </div>

      </form>

    </div>
  );
}
