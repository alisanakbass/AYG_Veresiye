import React, { useState } from 'react';
import { 
  Phone, 
  MapPin, 
  PlusCircle, 
  CreditCard, 
  MessageSquare, 
  Calendar, 
  User, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Package,
  Printer,
  FileSpreadsheet,
  TrendingUp,
  X
} from 'lucide-react';
import { getTransactions, getPayments, addTransaction } from '../services/storage';
import { buildReminderMessage, createWhatsappLink, buildTransactionMessage } from '../services/whatsapp';
import { exportCustomerLedgerToExcel } from '../services/excelExport';

export default function CustomerDetailPage({ customer, onNavigateCustomers, onOpenNewTransaction, onOpenNewPayment }) {
  const [showPriceUpdateModal, setShowPriceUpdateModal] = useState(false);
  const [updateAmount, setUpdateAmount] = useState('');
  const [updateNotes, setUpdateNotes] = useState('3 Aylık Gecikme Fiyat Güncelleme Farkı');

  if (!customer) return null;

  const transactions = getTransactions(customer.id);
  const payments = getPayments(customer.id);

  const history = [
    ...transactions.map(t => ({ ...t, type: 'transaction', date: new Date(t.transaction_date) })),
    ...payments.map(p => ({ ...p, type: 'payment', date: new Date(p.payment_date) }))
  ].sort((a, b) => b.date - a.date);

  const whatsappMsg = buildReminderMessage(customer);
  const whatsappUrl = createWhatsappLink(customer.phone, whatsappMsg);

  const handlePrint = () => {
    window.print();
  };

  // Fiyat Güncellemesi / Vade Farkı Kaydetme
  const handleSavePriceUpdate = (e) => {
    e.preventDefault();
    const amountNum = Number(updateAmount);
    if (!amountNum || amountNum <= 0) {
      alert('Lütfen geçerli bir fiyat güncelleme tutarı giriniz.');
      return;
    }

    const { transaction, newTotalBalance } = addTransaction({
      customerId: customer.id,
      items: [
        {
          product_name: 'Fiyat Güncellemesi / Vade Farkı',
          quantity: 1,
          unit_price: amountNum,
          total_price: amountNum
        }
      ],
      notes: updateNotes
    });

    setShowPriceUpdateModal(false);
    setUpdateAmount('');

    // İsteğe bağlı WhatsApp bildirimi aç
    const msg = buildTransactionMessage(customer, transaction, newTotalBalance);
    const url = createWhatsappLink(customer.phone, msg);
    window.open(url, '_blank');
    window.location.reload();
  };

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>
          📜 {customer.first_name} {customer.last_name} — Hesap Ekstresi
        </h2>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={onNavigateCustomers} className="btn btn-secondary">
            <span>👥 Müşterilere Dön</span>
          </button>

          <button 
            onClick={() => exportCustomerLedgerToExcel(customer, history)} 
            className="btn btn-success btn-sm"
            title="Hesap ekstresini Excel (.xlsx) olarak indir"
          >
            <FileSpreadsheet size={16} /> 📊 Ekstre Excel İndir
          </button>

          <button onClick={handlePrint} className="btn btn-secondary btn-sm" title="Yazdır / PDF Olarak Kaydet">
            <Printer size={16} /> Yazdır / PDF
          </button>
        </div>
      </div>

      {/* Customer Header Widescreen Card */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>
              {customer.first_name} {customer.last_name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '1rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Phone size={18} /> <a href={`tel:${customer.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>{customer.phone}</a>
              </span>
              {customer.address && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={18} /> {customer.address}
                </span>
              )}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.05em' }}>GÜNCEL HESAP BAKİYESİ</div>
            <div style={{
              fontSize: '2.25rem',
              fontWeight: '800',
              color: Number(customer.total_balance) > 0 ? 'var(--rose-text)' : 'var(--emerald-text)'
            }}>
              ₺{Number(customer.total_balance).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Quick Action Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          <button 
            onClick={() => onOpenNewTransaction(customer)} 
            className="btn btn-danger"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            <PlusCircle size={18} /> + Veresiye Ekle
          </button>

          <button 
            onClick={() => onOpenNewPayment(customer)} 
            className="btn btn-success"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            <CreditCard size={18} /> + Ödeme Al
          </button>

          <button 
            onClick={() => setShowPriceUpdateModal(true)} 
            className="btn btn-amber"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            <TrendingUp size={18} /> + Fiyat Güncellemesi / Vade Farkı
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            <MessageSquare size={18} /> WhatsApp Borç Hatırlatma
          </a>
        </div>
      </div>

      {/* Price Update Modal */}
      {showPriceUpdateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          zIndex: 2000,
          padding: '1rem'
        }}>
          <form onSubmit={handleSavePriceUpdate} className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '2rem', background: 'var(--modal-bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--amber-text)' }}>
                <TrendingUp size={22} /> Fiyat Güncellemesi / Vade Farkı Ekle
              </h3>
              <button type="button" onClick={() => setShowPriceUpdateModal(false)} className="btn btn-secondary btn-sm btn-icon">
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              {customer.first_name} {customer.last_name} müşterisinin geciken borcu için enflasyon / fiyat artış farkı ekleyebilirsiniz.
            </p>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Eklenecek Fiyat Farkı Tutarı (₺) *</label>
              <input
                type="number"
                min="1"
                step="0.5"
                required
                autoFocus
                placeholder="Örn: 250"
                value={updateAmount}
                onChange={(e) => setUpdateAmount(e.target.value)}
                onFocus={(e) => e.target.select()}
                className="form-input"
                style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--amber-text)' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Açıklama / Not</label>
              <input
                type="text"
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                className="form-input"
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowPriceUpdateModal(false)} className="btn btn-secondary">
                İptal
              </button>
              <button type="submit" className="btn btn-amber" style={{ fontWeight: '800' }}>
                + Farkı Borca Ekle & WhatsApp Bildir
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Account Ledger Widescreen Timeline */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem' }}>
          📋 Detaylı Hesap Hareketleri ({history.length} İşlem)
        </h3>

        {history.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0', fontSize: '1rem' }}>
            Henüz bu müşteriye ait borç veya ödeme kaydı bulunmamaktadır.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {history.map((item) => {
              const isTransaction = item.type === 'transaction';

              return (
                <div 
                  key={item.id}
                  style={{
                    padding: '1.25rem 1.5rem',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: `5px solid ${isTransaction ? 'var(--rose)' : 'var(--emerald)'}`,
                    borderTop: '1px solid var(--border-color)',
                    borderRight: '1px solid var(--border-color)',
                    borderBottom: '1px solid var(--border-color)'
                  }}
                >
                  {/* Header Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      {isTransaction ? (
                        <span className="badge badge-rose" style={{ fontSize: '0.9375rem', padding: '0.4rem 0.85rem' }}>
                          <ArrowUpRight size={16} /> Veresiye Borç
                        </span>
                      ) : (
                        <span className="badge badge-emerald" style={{ fontSize: '0.9375rem', padding: '0.4rem 0.85rem' }}>
                          <ArrowDownLeft size={16} /> Tahsilat Ödeme
                        </span>
                      )}
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={15} /> {item.date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: isTransaction ? 'var(--rose-text)' : 'var(--emerald-text)' }}>
                      {isTransaction ? '+' : '-'}₺{Number(isTransaction ? item.total_amount : item.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Items Breakdown */}
                  {isTransaction && item.items && item.items.length > 0 && (
                    <div style={{ margin: '0.85rem 0', background: 'rgba(0, 0, 0, 0.05)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Package size={15} /> SATIN ALINAN ÜRÜNLER:
                      </div>
                      {item.items.map((prod, pIdx) => (
                        <div key={pIdx} style={{ fontSize: '0.9375rem', display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: pIdx < item.items.length - 1 ? '1px dashed var(--border-color)' : 'none' }}>
                          <span>• {prod.product_name} ({prod.quantity} adet x ₺{Number(prod.unit_price).toLocaleString('tr-TR')})</span>
                          <span style={{ fontWeight: '700' }}>₺{Number(prod.total_price).toLocaleString('tr-TR')}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notes & Staff info */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                    <span>{item.notes ? `💬 Not: ${item.notes}` : ''}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <User size={14} /> Kaydeden: {item.created_by || item.received_by || 'Personel'}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
