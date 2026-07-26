import React from 'react';
import { 
  X, 
  Phone, 
  MapPin, 
  PlusCircle, 
  CreditCard, 
  MessageSquare, 
  Calendar, 
  User, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Package 
} from 'lucide-react';
import { getTransactions, getPayments } from '../services/storage';
import { buildReminderMessage, createWhatsappLink } from '../services/whatsapp';

export default function CustomerDetailModal({ customer, isOpen, onClose, onOpenNewTransaction, onOpenNewPayment }) {
  if (!isOpen || !customer) return null;

  const transactions = getTransactions(customer.id);
  const payments = getPayments(customer.id);

  // Tüm hareketleri kronolojik tarihe göre birleştirip sıralama
  const history = [
    ...transactions.map(t => ({ ...t, type: 'transaction', date: new Date(t.transaction_date) })),
    ...payments.map(p => ({ ...p, type: 'payment', date: new Date(p.payment_date) }))
  ].sort((a, b) => b.date - a.date);

  const whatsappMsg = buildReminderMessage(customer);
  const whatsappUrl = createWhatsappLink(customer.phone, whatsappMsg);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {customer.first_name} {customer.last_name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Phone size={13} /> {customer.phone}
              </span>
              {customer.address && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={13} /> {customer.address}
                </span>
              )}
            </div>
          </div>

          <button onClick={onClose} className="btn btn-secondary btn-icon btn-sm">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Top Balance Banner & Quick Actions */}
          <div style={{
            padding: '1.25rem',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                GÜNCEL HESAP BAKİYESİ
              </div>
              <div style={{
                fontSize: '1.75rem',
                fontWeight: '800',
                color: Number(customer.total_balance) > 0 ? 'var(--rose-text)' : 'var(--emerald-text)'
              }}>
                ₺{Number(customer.total_balance).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => { onClose(); onOpenNewTransaction(customer); }} 
                className="btn btn-danger btn-sm"
              >
                <PlusCircle size={15} /> + Veresiye Ekle
              </button>

              <button 
                onClick={() => { onClose(); onOpenNewPayment(customer); }} 
                className="btn btn-success btn-sm"
              >
                <CreditCard size={15} /> + Ödeme Al
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-sm"
              >
                <MessageSquare size={15} /> WhatsApp
              </a>
            </div>
          </div>

          {/* Account Ledger Timeline */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>
              📜 Hesap Hareket Geçmişi ({history.length})
            </h4>

            {history.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                Henüz bu müşteriye ait borç veya ödeme kaydı bulunmamaktadır.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {history.map((item) => {
                  const isTransaction = item.type === 'transaction';

                  return (
                    <div 
                      key={item.id}
                      style={{
                        padding: '1rem',
                        background: 'rgba(15, 23, 42, 0.6)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: `4px solid ${isTransaction ? 'var(--rose)' : 'var(--emerald)'}`,
                        borderTop: '1px solid var(--border-color)',
                        borderRight: '1px solid var(--border-color)',
                        borderBottom: '1px solid var(--border-color)'
                      }}
                    >
                      {/* Header Row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {isTransaction ? (
                            <div className="badge badge-rose">
                              <ArrowUpRight size={14} /> Veresiye Borcu
                            </div>
                          ) : (
                            <div className="badge badge-emerald">
                              <ArrowDownLeft size={14} /> Tahsilat Ödemesi
                            </div>
                          )}
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={12} /> {item.date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div style={{ fontSize: '1.125rem', fontWeight: '800', color: isTransaction ? 'var(--rose-text)' : 'var(--emerald-text)' }}>
                          {isTransaction ? '+' : '-'}₺{Number(isTransaction ? item.total_amount : item.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      {/* Items Breakdown (if transaction) */}
                      {isTransaction && item.items && item.items.length > 0 && (
                        <div style={{ margin: '0.5rem 0', background: 'rgba(30, 41, 59, 0.5)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Package size={12} /> ALINAN ÜRÜNLER:
                          </div>
                          {item.items.map((prod, pIdx) => (
                            <div key={pIdx} style={{ fontSize: '0.8125rem', display: 'flex', justifyContent: 'space-between', padding: '0.15rem 0' }}>
                              <span>• {prod.product_name} ({prod.quantity} adet x ₺{Number(prod.unit_price).toLocaleString('tr-TR')})</span>
                              <span style={{ fontWeight: '600' }}>₺{Number(prod.total_price).toLocaleString('tr-TR')}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Notes & Staff info */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
                        <span>{item.notes ? `💬 Not: ${item.notes}` : ''}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <User size={11} /> Kaydeden: {item.created_by || item.received_by || 'Personel'}
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
}
