import React, { useState } from 'react';
import { 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  MessageSquare, 
  ArrowUpRight, 
  ArrowDownLeft,
  Calendar,
  DollarSign,
  FileSpreadsheet
} from 'lucide-react';
import { getCustomers, getTransactions, getPayments } from '../services/storage';
import { buildReminderMessage, createWhatsappLink } from '../services/whatsapp';
import { exportDashboardToExcel } from '../services/excelExport';

export default function Dashboard({ onSelectCustomer }) {
  const [dateFilter, setDateFilter] = useState('all'); // 'today', 'week', 'month', 'all'

  const customers = getCustomers();
  const allTransactions = getTransactions();
  const allPayments = getPayments();

  const filterByDate = (dateStr) => {
    if (!dateStr) return false;
    const itemDate = new Date(dateStr);
    const now = new Date();

    if (dateFilter === 'today') {
      return itemDate.toDateString() === now.toDateString();
    }
    if (dateFilter === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return itemDate >= oneWeekAgo;
    }
    if (dateFilter === 'month') {
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const filteredTransactions = allTransactions.filter(t => filterByDate(t.transaction_date));
  const filteredPayments = allPayments.filter(p => filterByDate(p.payment_date));

  const totalReceivables = customers.reduce((sum, c) => sum + Number(c.total_balance || 0), 0);
  const debtorCustomers = customers.filter(c => Number(c.total_balance) > 0);
  const debtorCount = debtorCustomers.length;
  const debtorPercentage = customers.length > 0 ? Math.round((debtorCount / customers.length) * 100) : 0;

  const totalPeriodDebtAdded = filteredTransactions.reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
  const totalPeriodCollected = filteredPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const combinedActivities = [
    ...filteredTransactions.map(t => ({ ...t, type: 'transaction', date: new Date(t.transaction_date) })),
    ...filteredPayments.map(p => ({ ...p, type: 'payment', date: new Date(p.payment_date) }))
  ].sort((a, b) => b.date - a.date);

  const topDebtors = [...debtorCustomers]
    .sort((a, b) => Number(b.total_balance) - Number(a.total_balance))
    .slice(0, 5);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header & Date Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📊 Masaüstü Kasa & Alacak Rapor Paneli
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Finansal durum, tahsilatlar ve alacak takibi raporu
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => exportDashboardToExcel(filteredTransactions, filteredPayments, customers)}
            className="btn btn-success"
            title="Tüm finans raporunu Excel (.xlsx) olarak indir"
          >
            <FileSpreadsheet size={18} />
            <span>📊 Raporu Excel İndir</span>
          </button>

          {/* Date Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-card)', padding: '0.35rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setDateFilter('today')}
              className={`btn btn-sm ${dateFilter === 'today' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Bugün
            </button>
            <button
              onClick={() => setDateFilter('week')}
              className={`btn btn-sm ${dateFilter === 'week' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Bu Hafta
            </button>
            <button
              onClick={() => setDateFilter('month')}
              className={`btn btn-sm ${dateFilter === 'month' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Bu Ay
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`btn btn-sm ${dateFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Tüm Zamanlar
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Key Financial Stat Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
        
        {/* Total Receivables */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.05em' }}>
              TOPLAM GÜNCEL ALACAK
            </span>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--rose-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={22} color="var(--rose-text)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--rose-text)' }}>
            ₺{totalReceivables.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
            {debtorCount} borçlu müşteride bekleyen bakiye
          </div>
        </div>

        {/* Collected Amount */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.05em' }}>
              DÖNEM İÇİ TAHSİLAT
            </span>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--emerald-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={22} color="var(--emerald-text)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--emerald-text)' }}>
            ₺{totalPeriodCollected.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
            {filteredPayments.length} ödeme işleminden toplanan
          </div>
        </div>

        {/* Total Debt Added */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.05em' }}>
              DÖNEM İÇİ EKLENEN BORÇ
            </span>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={22} color="var(--primary)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>
            ₺{totalPeriodDebtAdded.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
            {filteredTransactions.length} veresiye kaydı eklendi
          </div>
        </div>

        {/* Debtor Ratio & Progress */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.05em' }}>
              BORÇLU MÜŞTERİ ORANI
            </span>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--amber-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={22} color="var(--amber-text)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--amber-text)' }}>
            %{debtorPercentage} <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-muted)' }}>({debtorCount}/{customers.length})</span>
          </div>

          <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', marginTop: '0.75rem', overflow: 'hidden' }}>
            <div style={{ width: `${debtorPercentage}%`, height: '100%', background: 'linear-gradient(to right, #f59e0b, #f43f5e)', borderRadius: '4px' }}></div>
          </div>
        </div>

      </div>

      {/* Main Desktop Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Column */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileSpreadsheet size={20} color="var(--primary)" />
              📋 Detaylı İşlem Hareketleri Tablosu
            </h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {combinedActivities.length} Kayıt Gösteriliyor
            </span>
          </div>

          {combinedActivities.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0', fontSize: '0.9375rem' }}>
              Seçilen tarih aralığında herhangi bir veresiye veya ödeme hareketi bulunmamaktadır.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Tarih & Saat</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Müşteri Adı</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>İşlem Türü</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Tutar (₺)</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Personel</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {combinedActivities.map(item => {
                    const isTransaction = item.type === 'transaction';
                    const customer = customers.find(c => c.id === item.customer_id);

                    return (
                      <tr 
                        key={item.id} 
                        style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.15s ease' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-dim)', fontSize: '0.8125rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Calendar size={13} />
                            {item.date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 0.5rem', fontWeight: '700', color: 'var(--text-main)' }}>
                          {customer ? `${customer.first_name} ${customer.last_name}` : 'Müşteri'}
                        </td>

                        <td style={{ padding: '0.85rem 0.5rem' }}>
                          {isTransaction ? (
                            <span className="badge badge-rose">
                              <ArrowUpRight size={13} /> Veresiye Borç
                            </span>
                          ) : (
                            <span className="badge badge-emerald">
                              <ArrowDownLeft size={13} /> Tahsilat Ödeme
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', fontWeight: '800', fontSize: '1rem', color: isTransaction ? 'var(--rose-text)' : 'var(--emerald-text)' }}>
                          {isTransaction ? '+' : '-'}₺{Number(isTransaction ? item.total_amount : item.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </td>

                        <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                          👤 {item.created_by || item.received_by || 'Personel'}
                        </td>

                        <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                          {customer && (
                            <button 
                              onClick={() => onSelectCustomer(customer)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                            >
                              Ekstre
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--rose-text)' }}>
              ⚠️ Acil Alacak Takip Paneli
            </h3>
            <span className="badge badge-rose">Top 5 Borçlu</span>
          </div>

          {topDebtors.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
              🎉 Harika! Tüm veresiye borçları tahsil edilmiştir.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {topDebtors.map(customer => {
                const whatsappMsg = buildReminderMessage(customer);
                const whatsappUrl = createWhatsappLink(customer.phone, whatsappMsg);

                return (
                  <div 
                    key={customer.id} 
                    style={{ 
                      padding: '1rem',
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ cursor: 'pointer' }} onClick={() => onSelectCustomer(customer)}>
                      <div style={{ fontWeight: '700', fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                        {customer.first_name} {customer.last_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        📞 {customer.phone}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--rose-text)' }}>
                          ₺{Number(customer.total_balance).toLocaleString('tr-TR')}
                        </div>
                      </div>

                      <a 
                        href={whatsappUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp btn-sm btn-icon"
                        title="WhatsApp Hatırlatma Mesajı Gönder"
                      >
                        <MessageSquare size={16} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
