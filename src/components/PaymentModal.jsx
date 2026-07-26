import React, { useState, useEffect } from 'react';
import { X, CreditCard, MessageSquare, Check } from 'lucide-react';
import { getCustomers, addPayment } from '../services/storage';
import { buildPaymentMessage, createWhatsappLink } from '../services/whatsapp';

export default function PaymentModal({ isOpen, onClose, selectedCustomer = null }) {
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [sendWhatsapp, setSendWhatsapp] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const allCustomers = getCustomers();
      setCustomers(allCustomers);
      if (selectedCustomer) {
        setCustomerId(selectedCustomer.id);
        setAmount(selectedCustomer.total_balance > 0 ? selectedCustomer.total_balance : '');
      } else if (allCustomers.length > 0) {
        setCustomerId(allCustomers[0].id);
        setAmount(allCustomers[0].total_balance > 0 ? allCustomers[0].total_balance : '');
      }
      setPaymentMethod('cash');
      setNotes('');
    }
  }, [isOpen, selectedCustomer]);

  if (!isOpen) return null;

  const currentCustomer = customers.find(c => c.id === customerId);

  const handleCustomerSelect = (e) => {
    const id = e.target.value;
    setCustomerId(id);
    const cust = customers.find(c => c.id === id);
    if (cust && Number(cust.total_balance) > 0) {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!customerId) {
      alert('Lütfen bir müşteri seçiniz.');
      return;
    }

    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) {
      alert('Lütfen geçerli bir ödeme tutarı giriniz.');
      return;
    }

    // Ödeme Kaydını Oluştur ve Bakiyeden Düş
    const { payment, newTotalBalance } = addPayment({
      customerId,
      amount: payAmount,
      paymentMethod,
      notes
    });

    // WhatsApp Bilgilendirme Mesajı
    if (sendWhatsapp && currentCustomer) {
      const msg = buildPaymentMessage(currentCustomer, payAmount, newTotalBalance);
      const url = createWhatsappLink(currentCustomer.phone, msg);
      window.open(url, '_blank');
    }

    onClose();
    window.location.reload();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={20} color="var(--emerald-text)" />
            <h3 className="modal-title">Ödeme (Tahsilat) Al</h3>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon btn-sm">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            
            {/* Müşteri Seçimi */}
            <div className="form-group">
              <label className="form-label">Müşteri Seçiniz *</label>
              <select
                value={customerId}
                onChange={handleCustomerSelect}
                className="form-select"
                required
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name} ({c.phone}) — Güncel Borç: ₺{Number(c.total_balance).toLocaleString('tr-TR')}
                  </option>
                ))}
              </select>
            </div>

            {/* Borç Durum Özeti & Hızlı Kapat Butonu */}
            {currentCustomer && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justify: 'space-between',
                padding: '0.75rem 1rem', 
                background: 'rgba(15, 23, 42, 0.6)', 
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                marginBottom: '1.25rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Müşterinin Mevcut Toplam Borcu:</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--rose-text)' }}>
                    ₺{Number(currentCustomer.total_balance).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {Number(currentCustomer.total_balance) > 0 && (
                  <button 
                    type="button" 
                    onClick={handleSetFullAmount} 
                    className="btn btn-secondary btn-sm"
                  >
                    <Check size={14} color="var(--emerald-text)" />
                    Tamamını Kapat
                  </button>
                )}
              </div>
            )}

            {/* Alınan Tutar */}
            <div className="form-group">
              <label className="form-label">Ödenen Tutar (₺) *</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                required
                placeholder="Örn: 500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="form-input"
                style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--emerald-text)' }}
              />
            </div>

            {/* Ödeme Türü */}
            <div className="form-group">
              <label className="form-label">Ödeme Yöntemi</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`btn btn-sm ${paymentMethod === 'cash' ? 'btn-success' : 'btn-secondary'}`}
                >
                  💵 Nakit
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`btn btn-sm ${paymentMethod === 'card' ? 'btn-success' : 'btn-secondary'}`}
                >
                  💳 Kredi Kartı
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('transfer')}
                  className={`btn btn-sm ${paymentMethod === 'transfer' ? 'btn-success' : 'btn-secondary'}`}
                >
                  🏦 Havale/EFT
                </button>
              </div>
            </div>

            {/* Not */}
            <div className="form-group">
              <label className="form-label">Açıklama / Not (İsteğe Bağlı)</label>
              <input
                type="text"
                placeholder="Örn: Elden teslim alındı"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-input"
              />
            </div>

            {/* WhatsApp Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(37, 211, 102, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(37, 211, 102, 0.25)' }}>
              <input
                type="checkbox"
                id="pay-whatsapp"
                checked={sendWhatsapp}
                onChange={(e) => setSendWhatsapp(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#25D366' }}
              />
              <label htmlFor="pay-whatsapp" style={{ fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399' }}>
                <MessageSquare size={16} /> Ödeme sonrası WhatsApp teşekkür & fiş mesajı gönder
              </label>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              İptal
            </button>
            <button type="submit" className="btn btn-success">
              Ödemeyi Kaydet
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
