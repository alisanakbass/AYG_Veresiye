import React from 'react';
import { 
  PlusCircle, 
  CreditCard, 
  Users, 
  BarChart3, 
  UserPlus, 
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { getCustomers, getTransactions, getPayments, getNotes } from '../services/storage';

export default function HomeHub({ 
  onOpenNewTransaction, 
  onOpenNewPayment, 
  onNavigateCustomers, 
  onNavigateDashboard,
  onOpenNewCustomer,
  onNavigateNotepad
}) {
  const customers = getCustomers();
  const transactions = getTransactions();
  const payments = getPayments();
  const notes = getNotes();

  const totalReceivables = customers.reduce((sum, c) => sum + Number(c.total_balance || 0), 0);
  const activeNotesCount = notes.filter(n => !n.is_completed).length;

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Top Banner Stats Widescreen Bar */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(16, 185, 129, 0.08))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-emerald">
                <ShieldCheck size={14} /> Dev Ortamı Aktif
              </span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Masaüstü Veresiye Takip Portalı</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>
              Hoş Geldiniz 👋 Neler Yapmak İstersiniz?
            </h2>
          </div>

          {/* Quick Summary Numbers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Kayıtlı Müşteri
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>
                {customers.length} Kişi
              </div>
            </div>

            <div style={{ height: '35px', width: '1px', background: 'var(--border-color)' }}></div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Toplam Alacak
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--rose-text)' }}>
                ₺{totalReceivables.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3x2 MATRIX GRID (3 Columns Row 1, 3 Columns Row 2) */}
      <div className="home-cards-grid">
        
        {/* ROW 1 - CARD 1: 🔴 VERESİYE (BORÇ) EKLE */}
        <div 
          onClick={() => onOpenNewTransaction(null)}
          className="glass-card glass-card-interactive"
          style={{
            padding: '2.25rem 2rem',
            borderLeft: '8px solid var(--rose)',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            minHeight: '220px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--rose-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PlusCircle size={32} color="var(--rose-text)" />
              </div>
              <span className="badge badge-rose" style={{ fontSize: '0.875rem', padding: '0.4rem 0.85rem' }}>
                Hızlı Giriş
              </span>
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              🔴 Veresiye (Borç) Ekle
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Müşterinize satılan veresiye ürünleri ve tutarlarını saniyeler içinde kaydedin.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', color: 'var(--rose-text)', fontWeight: '800', fontSize: '0.9375rem' }}>
            <span>İşleme Başla</span>
            <ArrowRight size={18} />
          </div>
        </div>

        {/* ROW 1 - CARD 2: 🟢 ÖDEME (TAHSİLAT) AL */}
        <div 
          onClick={() => onOpenNewPayment(null)}
          className="glass-card glass-card-interactive"
          style={{
            padding: '2.25rem 2rem',
            borderLeft: '8px solid var(--emerald)',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            minHeight: '220px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--emerald-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={32} color="var(--emerald-text)" />
              </div>
              <span className="badge badge-emerald" style={{ fontSize: '0.875rem', padding: '0.4rem 0.85rem' }}>
                Nakit / Kart
              </span>
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              🟢 Ödeme (Tahsilat) Al
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Müşteriden alınan nakit, kredi kartı veya havale ödemelerini borçtan düşün.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', color: 'var(--emerald-text)', fontWeight: '800', fontSize: '0.9375rem' }}>
            <span>Tahsilat Yap</span>
            <ArrowRight size={18} />
          </div>
        </div>

        {/* ROW 1 - CARD 3: 👤 YENİ MÜŞTERİ KAYDET */}
        <div 
          onClick={onOpenNewCustomer}
          className="glass-card glass-card-interactive"
          style={{
            padding: '2.25rem 2rem',
            borderLeft: '8px solid var(--primary)',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            minHeight: '220px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserPlus size={32} color="var(--primary)" />
              </div>
              <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary)', fontSize: '0.875rem', padding: '0.4rem 0.85rem' }}>
                Müşteri Ekle
              </span>
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              👤 Yeni Müşteri Kaydet
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Defterinize yeni ad, soyad ve telefon kaydı ekleyin.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', color: 'var(--primary)', fontWeight: '800', fontSize: '0.9375rem' }}>
            <span>Müşteri Oluştur</span>
            <ArrowRight size={18} />
          </div>
        </div>

        {/* ROW 2 - CARD 4: 👥 MÜŞTERİ DEFTERİ */}
        <div 
          onClick={onNavigateCustomers}
          className="glass-card glass-card-interactive"
          style={{
            padding: '2.25rem 2rem',
            borderLeft: '8px solid #8b5cf6',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            minHeight: '220px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={32} color="#8b5cf6" />
              </div>
              <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', border: '1px solid #8b5cf6', fontSize: '0.875rem', padding: '0.4rem 0.85rem' }}>
                {customers.length} Kayıt
              </span>
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              👥 Müşteri Defteri
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Tüm müşterileri arayın, güncel borçlarını inceleyin ve hesap ekstresi alın.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', color: '#8b5cf6', fontWeight: '800', fontSize: '0.9375rem' }}>
            <span>Defteri Aç</span>
            <ArrowRight size={18} />
          </div>
        </div>

        {/* ROW 2 - CARD 5: 📊 KASA & ALACAK RAPOR PANELİ */}
        <div 
          onClick={onNavigateDashboard}
          className="glass-card glass-card-interactive"
          style={{
            padding: '2.25rem 2rem',
            borderLeft: '8px solid var(--amber)',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            minHeight: '220px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--amber-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart3 size={32} color="var(--amber-text)" />
              </div>
              <span className="badge badge-amber" style={{ fontSize: '0.875rem', padding: '0.4rem 0.85rem' }}>
                Finans Raporu
              </span>
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              📊 Kasa & Alacak Paneli
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Bugün, bu hafta veya bu ay yapılan toplam veresiyeleri ve tahsilatları görün.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', color: 'var(--amber-text)', fontWeight: '800', fontSize: '0.9375rem' }}>
            <span>Raporu İncele</span>
            <ArrowRight size={18} />
          </div>
        </div>

        {/* ROW 2 - CARD 6: 📝 HIZLI ESNAF NOT DEFTERİ */}
        <div 
          onClick={onNavigateNotepad}
          className="glass-card glass-card-interactive"
          style={{
            padding: '2.25rem 2rem',
            borderLeft: '8px solid #ec4899',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            minHeight: '220px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={32} color="#ec4899" />
              </div>
              <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', border: '1px solid #ec4899', fontSize: '0.875rem', padding: '0.4rem 0.85rem' }}>
                {activeNotesCount} Aktif Not
              </span>
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              📝 Hızlı Not Defteri
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Toptancı siparişleri, dükkan hatırlatmaları ve yapacaklar listenizi tutun.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', color: '#ec4899', fontWeight: '800', fontSize: '0.9375rem' }}>
            <span>Not Defterine Git</span>
            <ArrowRight size={18} />
          </div>
        </div>

      </div>

    </div>
  );
}
