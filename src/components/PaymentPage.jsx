import React, { useState, useEffect } from 'react';
import { CreditCard, MessageSquare, Check, Calculator } from 'lucide-react';
import { getCustomers, addPayment } from '../services/storage';
import { buildPaymentMessage, createWhatsappLink } from '../services/whatsapp';
import CustomerPicker from './CustomerPicker';

export default function PaymentPage({ selectedCustomer = null, onNavigateHome }) {
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [sendWhatsapp, setSendWhatsapp] = useState(true);

  useEffect(() => {
    const allCustomers = getCustomers();
    setCustomers(allCustomers);
    if (selectedCustomer) {
      setCustomerId(selectedCustomer.id);
      setAmount(selectedCustomer.total_balance > 0 ? selectedCustomer.total_balance : '');
    } else if (allCustomers.length > 0) {
      setCustomerId(allCustomers[0].id);
      setAmount(allCustomers[0].total_balance > 0 ? allCustomers[0].total_balance : '');
    }
  }, [selectedCustomer]);

  const currentCustomer = customers.find(c => c.id === customerId);

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
        if (focusables[index + 1].select) {
          focusables[index + 1].select();
        }
      }
    }
  };

  const handleSelectCustomer = (cust) => {
    setCustomerId(cust.id);
    if (Number(cust.total_balance) > 0) {
      setAmount(cust.total_balance);
    } else {
      setAmount('');
    }
  };

  const handleSetFullAmount = () => {
    if (currentCustomer) {
      setAmount(currentCustomer.total_balance);
    }
  };

  const currentBalance = currentCustomer ? Number(currentCustomer.total_balance || 0) : 0;
  const payAmount = Number(amount) || 0;
  const newEstimatedBalance = Math.max(0, currentBalance - payAmount);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!customerId) {
      alert('Lütfen bir müşteri seçiniz.');
      return;
    }

    if (!payAmount || payAmount <= 0) {
      alert('Lütfen geçerli bir ödeme tutarı giriniz.');
      return;
    }

    const { payment, newTotalBalance } = addPayment({
      customerId,
      amount: payAmount,
      paymentMethod,
      notes
    });

    if (sendWhatsapp && currentCustomer) {
      const msg = buildPaymentMessage(currentCustomer, payAmount, newTotalBalance);
      const url = createWhatsappLink(currentCustomer.phone, msg);
      window.open(url, '_blank');
    }

    onNavigateHome();
  };

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-text)' }}>
          <CreditCard size={30} /> 🟢 Masaüstü Ödeme (Tahsilat) Alma
        </h2>
      </div>

      {/* 2-Column Desktop Widescreen Layout */}
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Column */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          
          {/* Akıllı Müşteri Seçici (CustomerPicker) */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontSize: '0.9375rem' }}>Müşteri Ara & Seç (İsim veya Telefon)</label>
            <CustomerPicker
              customers={customers}
              selectedCustomerId={customerId}
              onSelectCustomer={handleSelectCustomer}
              autoFocus={true}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Hızlı Tutar Seçenekleri</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[100, 250, 500, 1000, 2000].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontWeight: '700' }}
                >
                  +₺{preset}
                </button>
              ))}

              {currentBalance > 0 && (
                <button 
                  type="button" 
                  onClick={handleSetFullAmount} 
                  className="btn btn-success btn-sm"
                >
                  <Check size={14} /> Borcun Tamamını Kapat (₺{currentBalance.toLocaleString('tr-TR')})
                </button>
              )}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontSize: '0.9375rem' }}>Ödenen Tutar (₺) *</label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              required
              placeholder="Örn: 500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onFocus={(e) => e.target.select()}
              className="form-input"
              style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--emerald-text)', padding: '0.85rem 1rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Ödeme Yöntemi</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`btn ${paymentMethod === 'cash' ? 'btn-success' : 'btn-secondary'}`}
                style={{ padding: '0.85rem', fontSize: '0.9375rem' }}
              >
                💵 Nakit
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`btn ${paymentMethod === 'card' ? 'btn-success' : 'btn-secondary'}`}
                style={{ padding: '0.85rem', fontSize: '0.9375rem' }}
              >
                💳 Kredi Kartı
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`btn ${paymentMethod === 'transfer' ? 'btn-success' : 'btn-secondary'}`}
                style={{ padding: '0.85rem', fontSize: '0.9375rem' }}
              >
                🏦 Havale/EFT
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Açıklama / Not (İsteğe Bağlı)</label>
            <input
              type="text"
              placeholder="Örn: Elden teslim alındı"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onFocus={(e) => e.target.select()}
              className="form-input"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(37, 211, 102, 0.12)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(37, 211, 102, 0.3)' }}>
            <input
              type="checkbox"
              id="pay-whatsapp"
              checked={sendWhatsapp}
              onChange={(e) => setSendWhatsapp(e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#25D366' }}
            />
            <label htmlFor="pay-whatsapp" style={{ fontSize: '0.9375rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-text)' }}>
              <MessageSquare size={18} /> Ödeme sonrası WhatsApp teşekkür & dijital fiş mesajını aç
            </label>
          </div>

        </div>

        {/* Right Column */}
        <div className="glass-card" style={{ padding: '1.75rem', position: 'sticky', top: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <Calculator size={20} color="var(--emerald-text)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '800' }}>Canlı Tahsilat Fişi</h3>
          </div>

          {currentCustomer && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Mevcut Borç:</span>
                <span style={{ fontWeight: '700' }}>₺{currentBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem' }}>
                <span style={{ color: 'var(--emerald-text)' }}>- Ödenen Tutar:</span>
                <span style={{ fontWeight: '800', color: 'var(--emerald-text)' }}>-₺{payAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>

              <div style={{ height: '1px', background: 'var(--border-color)' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '800', fontSize: '1rem' }}>KALAN BORÇ:</span>
                <span style={{ fontSize: '1.625rem', fontWeight: '800', color: newEstimatedBalance === 0 ? 'var(--emerald-text)' : 'var(--rose-text)' }}>
                  ₺{newEstimatedBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-success" 
            style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', fontWeight: '800', display: 'flex', justifyContent: 'center' }}
          >
            🟢 Ödemeyi Kaydet (Enter)
          </button>

          <button 
            type="button" 
            onClick={onNavigateHome} 
            className="btn btn-secondary" 
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.65rem' }}
          >
            İptal
          </button>

        </div>

      </form>

    </div>
  );
}
