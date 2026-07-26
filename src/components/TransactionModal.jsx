import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Trash2, MessageSquare, Plus } from 'lucide-react';
import { getCustomers, addTransaction } from '../services/storage';
import { buildTransactionMessage, createWhatsappLink } from '../services/whatsapp';

export default function TransactionModal({ isOpen, onClose, selectedCustomer = null }) {
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([
    { product_name: '', quantity: 1, unit_price: '', total_price: 0 }
  ]);
  const [notes, setNotes] = useState('');
  const [sendWhatsapp, setSendWhatsapp] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const allCustomers = getCustomers();
      setCustomers(allCustomers);
      if (selectedCustomer) {
        setCustomerId(selectedCustomer.id);
      } else if (allCustomers.length > 0) {
        setCustomerId(allCustomers[0].id);
      }
      setItems([{ product_name: '', quantity: 1, unit_price: '', total_price: 0, is_pending_price: false }]);
      setNotes('');
    }
  }, [isOpen, selectedCustomer]);

  if (!isOpen) return null;

  // Ürün Satırı Değişiklik Takibi & Otomatik Fiyat Hesaplama
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === 'is_pending_price' && value === true) {
      newItems[index].unit_price = 0;
      newItems[index].total_price = 0;
    } else {
      const qty = Number(newItems[index].quantity) || 0;
      const price = Number(newItems[index].unit_price) || 0;
      newItems[index].total_price = newItems[index].is_pending_price ? 0 : qty * price;
    }

    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, { product_name: '', quantity: 1, unit_price: '', total_price: 0, is_pending_price: false }]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const grandTotal = items.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
  const hasPendingItems = items.some(item => item.is_pending_price);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!customerId) {
      alert('Lütfen bir müşteri seçiniz.');
      return;
    }

    const processedItems = items
      .filter(item => item.product_name && item.product_name.trim() !== '')
      .map(item => {
        const hasPrice = item.unit_price !== '' && !isNaN(Number(item.unit_price)) && Number(item.unit_price) > 0;
        const isPending = Boolean(item.is_pending_price) || !hasPrice;
        const qty = Number(item.quantity) || 1;
        const price = isPending ? 0 : Number(item.unit_price) || 0;
        return {
          ...item,
          product_name: item.product_name.trim(),
          quantity: qty,
          unit_price: price,
          total_price: isPending ? 0 : qty * price,
          is_pending_price: isPending
        };
      });

    if (processedItems.length === 0) {
      alert('Lütfen en az 1 ürün adı giriniz.');
      return;
    }

    // Borç Kaydını Oluştur
    const { transaction, newTotalBalance } = addTransaction({
      customerId,
      items: processedItems,
      notes
    });

    const targetCustomer = customers.find(c => c.id === customerId);

    // WhatsApp Bilgilendirme Butonu Açma
    if (sendWhatsapp && targetCustomer) {
      const msg = buildTransactionMessage(targetCustomer, transaction, newTotalBalance);
      const url = createWhatsappLink(targetCustomer.phone, msg);
      if (window.confirm('💬 Müşteriye WhatsApp borç bilgilendirme mesajı gönderilsin mi?')) {
        window.open(url, '_blank');
      }
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={20} color="var(--rose-text)" />
            <h3 className="modal-title">Yeni Veresiye (Borç) Ekle</h3>
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
                onChange={(e) => setCustomerId(e.target.value)}
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

            {/* Ürün Listesi (Dinamik Satırlar) */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Satın Alınan Ürünler *</label>
                <button type="button" onClick={addItemRow} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                  <Plus size={14} /> + Ürün Ekle
                </button>
              </div>

              {items.map((item, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    marginBottom: '0.65rem',
                    background: item.is_pending_price ? 'rgba(245, 158, 11, 0.08)' : 'rgba(15, 23, 42, 0.4)',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: item.is_pending_price ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 1.2fr auto', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      required
                      placeholder="Ürün Adı (Örn: Çimento 50 kg)"
                      value={item.product_name}
                      onChange={(e) => handleItemChange(idx, 'product_name', e.target.value)}
                      className="form-input"
                      style={{ padding: '0.5rem' }}
                    />

                    <input
                      type="number"
                      min="0.1"
                      step="0.5"
                      required
                      placeholder="Adet"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="form-input"
                      style={{ padding: '0.5rem' }}
                    />

                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      disabled={item.is_pending_price}
                      placeholder={item.is_pending_price ? 'Sonradan' : 'Birim ₺'}
                      value={item.is_pending_price ? '' : item.unit_price}
                      onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                      className="form-input"
                      style={{ padding: '0.5rem', opacity: item.is_pending_price ? 0.5 : 1 }}
                    />

                    <div style={{ fontWeight: '700', fontSize: '0.875rem', color: item.is_pending_price ? 'var(--amber-text)' : 'var(--rose-text)', textAlign: 'right', paddingRight: '0.25rem' }}>
                      {item.is_pending_price ? '⏳ Fiyat Belirsiz' : `₺${Number(item.total_price || 0).toLocaleString('tr-TR')}`}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      disabled={items.length === 1}
                      className="btn btn-danger btn-sm btn-icon"
                      style={{ opacity: items.length === 1 ? 0.3 : 1 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Sonradan Fiyatlandırılacak Checkbox Kutusu */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', marginTop: '0.2rem' }}>
                    <input
                      type="checkbox"
                      id={`pending-${idx}`}
                      checked={Boolean(item.is_pending_price)}
                      onChange={(e) => handleItemChange(idx, 'is_pending_price', e.target.checked)}
                      style={{ accentColor: '#f59e0b', cursor: 'pointer' }}
                    />
                    <label htmlFor={`pending-${idx}`} style={{ cursor: 'pointer', color: item.is_pending_price ? '#fbbf24' : 'var(--text-muted)', fontWeight: item.is_pending_price ? '700' : 'normal' }}>
                      ⏳ Fiyatı Sonradan Belirlenecek (Müşteri ödemeye geldiğinde fiyata yansıtılacak)
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {/* Toplam Tutar Özeti */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '0.85rem 1rem', 
              background: 'var(--rose-bg)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid rgba(244, 63, 94, 0.3)',
              marginBottom: '1.25rem' 
            }}>
              <div>
                <span style={{ fontWeight: '600', color: 'var(--rose-text)' }}>TOPLAM VERESİYE TUTARI:</span>
                {hasPendingItems && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--amber-text)', fontWeight: '600' }}>
                    * ⏳ Bazı ürünlerin fiyatı sonradan belirlenecektir.
                  </div>
                )}
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--rose-text)' }}>
                ₺{grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Not */}
            <div className="form-group">
              <label className="form-label">Açıklama / Not (İsteğe Bağlı)</label>
              <input
                type="text"
                placeholder="Örn: Hafta sonu teslim edildi"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-input"
              />
            </div>

            {/* WhatsApp Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(37, 211, 102, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(37, 211, 102, 0.25)' }}>
              <input
                type="checkbox"
                id="tx-whatsapp"
                checked={sendWhatsapp}
                onChange={(e) => setSendWhatsapp(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#25D366' }}
              />
              <label htmlFor="tx-whatsapp" style={{ fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399' }}>
                <MessageSquare size={16} /> Kaydettikten sonra WhatsApp bilgilendirme mesajını aç
              </label>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              İptal
            </button>
            <button type="submit" className="btn btn-danger">
              Veresiyeyi Kaydet
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
