import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, MessageSquare, Plus, ShoppingBag, Calculator } from 'lucide-react';
import { getCustomers, addTransaction } from '../services/storage';
import { buildTransactionMessage, createWhatsappLink } from '../services/whatsapp';
import CustomerPicker from './CustomerPicker';

export default function TransactionPage({ selectedCustomer = null, onNavigateHome }) {
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([
    { product_name: '', quantity: 1, unit_price: '', total_price: 0 }
  ]);
  const [notes, setNotes] = useState('');
  const [sendWhatsapp, setSendWhatsapp] = useState(true);

  const [focusTargetIndex, setFocusTargetIndex] = useState(null);

  useEffect(() => {
    const allCustomers = getCustomers();
    setCustomers(allCustomers);
    if (selectedCustomer) {
      setCustomerId(selectedCustomer.id);
    } else if (allCustomers.length > 0) {
      setCustomerId(allCustomers[0].id);
    }
  }, [selectedCustomer]);

  useEffect(() => {
    if (focusTargetIndex !== null) {
      const targetInput = document.querySelector(`input[data-field="product_name"][data-index="${focusTargetIndex}"]`);
      if (targetInput) {
        targetInput.focus();
        targetInput.select();
      }
      setFocusTargetIndex(null);
    }
  }, [items, focusTargetIndex]);

  const currentCustomer = customers.find(c => c.id === customerId);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    const qty = Number(newItems[index].quantity) || 0;
    const price = Number(newItems[index].unit_price) || 0;
    newItems[index].total_price = qty * price;

    setItems(newItems);
  };

  const addItemRow = () => {
    const newIdx = items.length;
    setItems(prev => [...prev, { product_name: '', quantity: 1, unit_price: '', total_price: 0 }]);
    setFocusTargetIndex(newIdx);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // AKILLI KLAVYE DÖNGÜSÜ (Ürün Adı -> Adet -> Fiyat -> [Doluysa Yeni Satır / Boşsa Not Kutusuna Atla])
  const handleKeyDown = (e) => {
    if (e.key !== 'Enter' || e.target.tagName === 'TEXTAREA') return;

    const field = e.target.getAttribute('data-field');
    const index = parseInt(e.target.getAttribute('data-index'), 10);

    if (field === 'customer') {
      e.preventDefault();
      const firstProductInput = document.querySelector('input[data-field="product_name"][data-index="0"]');
      if (firstProductInput) {
        firstProductInput.focus();
        firstProductInput.select();
      }
      return;
    }

    if (field === 'product_name') {
      e.preventDefault();
      const qtyInput = document.querySelector(`input[data-field="quantity"][data-index="${index}"]`);
      if (qtyInput) {
        qtyInput.focus();
        qtyInput.select();
      }
      return;
    }

    if (field === 'quantity') {
      e.preventDefault();
      const priceInput = document.querySelector(`input[data-field="unit_price"][data-index="${index}"]`);
      if (priceInput) {
        priceInput.focus();
        priceInput.select();
      }
      return;
    }

    if (field === 'unit_price') {
      e.preventDefault();
      const currentItem = items[index];

      if (currentItem && currentItem.product_name.trim() !== '') {
        addItemRow();
      } else {
        const notesInput = document.getElementById('notes-input');
        if (notesInput) {
          notesInput.focus();
          notesInput.select();
        }
      }
      return;
    }

    if (e.target.id === 'notes-input') {
      e.preventDefault();
      const submitBtn = document.getElementById('tx-submit-btn');
      if (submitBtn) submitBtn.focus();
      return;
    }
  };

  const grandTotal = items.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
  const currentBalance = currentCustomer ? Number(currentCustomer.total_balance || 0) : 0;
  const newEstimatedBalance = currentBalance + grandTotal;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!customerId) {
      alert('Lütfen bir müşteri seçiniz.');
      return;
    }

    const validItems = items.filter(item => item.product_name.trim() && Number(item.total_price) > 0);
    if (validItems.length === 0) {
      alert('Lütfen en az 1 ürün adı ve birim fiyatı giriniz.');
      return;
    }

    const { transaction, newTotalBalance } = addTransaction({
      customerId,
      items: validItems,
      notes
    });

    if (sendWhatsapp && currentCustomer) {
      const msg = buildTransactionMessage(currentCustomer, transaction, newTotalBalance);
      const url = createWhatsappLink(currentCustomer.phone, msg);
      window.open(url, '_blank');
    }

    onNavigateHome();
  };

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--rose-text)' }}>
          <PlusCircle size={30} /> 🔴 Masaüstü Veresiye (Borç) Girişi
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
              onSelectCustomer={(c) => setCustomerId(c.id)}
              autoFocus={true}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <label className="form-label" style={{ marginBottom: 0, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShoppingBag size={16} /> Satın Alınan Ürünler * (Ürün ➔ Adet ➔ Fiyat ➔ Enter)
              </label>
              <button type="button" onClick={addItemRow} className="btn btn-secondary btn-sm">
                <Plus size={16} /> + Yeni Ürün Satırı Ekle
              </button>
            </div>

            {items.map((item, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '2.5fr 1fr 1fr 1.2fr auto', 
                  gap: '0.75rem', 
                  alignItems: 'center', 
                  marginBottom: '0.75rem',
                  background: 'var(--bg-card)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.2rem' }}>Ürün Adı</span>
                  <input
                    type="text"
                    data-field="product_name"
                    data-index={idx}
                    placeholder="Örn: Çaykur Çay 1 kg"
                    value={item.product_name}
                    onChange={(e) => handleItemChange(idx, 'product_name', e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="form-input"
                  />
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.2rem' }}>Adet</span>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    data-field="quantity"
                    data-index={idx}
                    placeholder="Adet"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="form-input"
                  />
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.2rem' }}>Birim ₺</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    data-field="unit_price"
                    data-index={idx}
                    placeholder="Fiyat"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="form-input"
                  />
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.2rem' }}>Toplam</span>
                  <div style={{ fontWeight: '800', fontSize: '1.125rem', color: 'var(--rose-text)' }}>
                    ₺{Number(item.total_price || 0).toLocaleString('tr-TR')}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeItemRow(idx)}
                  disabled={items.length === 1}
                  className="btn btn-danger btn-sm btn-icon"
                  style={{ opacity: items.length === 1 ? 0.3 : 1, marginTop: '1.25rem' }}
                  title="Satırı Sil"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Açıklama / Not (İsteğe Bağlı)</label>
            <input
              type="text"
              id="notes-input"
              placeholder="Örn: Hafta sonu teslim edildi"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onFocus={(e) => e.target.select()}
              className="form-input"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(37, 211, 102, 0.12)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(37, 211, 102, 0.3)' }}>
            <input
              type="checkbox"
              id="tx-whatsapp"
              checked={sendWhatsapp}
              onChange={(e) => setSendWhatsapp(e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#25D366' }}
            />
            <label htmlFor="tx-whatsapp" style={{ fontSize: '0.9375rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-text)' }}>
              <MessageSquare size={18} /> Kaydettikten sonra WhatsApp veresiye detay mesajını aç
            </label>
          </div>

        </div>

        {/* Right Column */}
        <div className="glass-card" style={{ padding: '1.75rem', position: 'sticky', top: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <Calculator size={20} color="var(--rose-text)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '800' }}>Canlı Hesap Fişi</h3>
          </div>

          {currentCustomer && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Mevcut Borç:</span>
                <span style={{ fontWeight: '700' }}>₺{currentBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem' }}>
                <span style={{ color: 'var(--rose-text)' }}>+ Yeni Veresiye:</span>
                <span style={{ fontWeight: '800', color: 'var(--rose-text)' }}>+₺{grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>

              <div style={{ height: '1px', background: 'var(--border-color)' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '800', fontSize: '1rem' }}>YENİ TOPLAM BORÇ:</span>
                <span style={{ fontSize: '1.625rem', fontWeight: '800', color: 'var(--rose-text)' }}>
                  ₺{newEstimatedBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            id="tx-submit-btn"
            className="btn btn-danger" 
            style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', fontWeight: '800', display: 'flex', justifyContent: 'center' }}
          >
            🔴 Veresiyeyi Kaydet (Enter)
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
