import React, { useState } from 'react';
import { 
  Search, 
  Phone, 
  MapPin, 
  MessageSquare, 
  PlusCircle, 
  CreditCard, 
  FileText, 
  Trash2, 
  UserPlus,
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  FileSpreadsheet
} from 'lucide-react';
import { getCustomers, deleteCustomer } from '../services/storage';
import { buildReminderMessage, createWhatsappLink } from '../services/whatsapp';
import { exportCustomersToExcel } from '../services/excelExport';

export default function CustomerList({ onSelectCustomer, onOpenNewTransaction, onOpenNewPayment, onOpenNewCustomer, showNotification, currentUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [sortBy, setSortBy] = useState('highest_debt');
  const [viewMode, setViewMode] = useState('table');
  const [customers, setCustomers] = useState(() => getCustomers());

  React.useEffect(() => {
    setCustomers(getCustomers());
  }, []);

  let filtered = (customers || []).filter(customer => {
    if (!customer) return false;
    const firstName = customer.first_name || '';
    const lastName = customer.last_name || '';
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    const phone = customer.phone ? String(customer.phone).toLowerCase() : '';
    const query = (searchTerm || '').toLowerCase().trim();

    const matchesSearch = fullName.includes(query) || phone.includes(query);

    if (!matchesSearch) return false;

    if (filterMode === 'debtors') return Number(customer.total_balance || 0) > 0;
    if (filterMode === 'settled') return Number(customer.total_balance || 0) === 0;

    return true;
  });

  filtered.sort((a, b) => {
    if (!a || !b) return 0;
    if (sortBy === 'highest_debt') {
      return Number(b.total_balance || 0) - Number(a.total_balance || 0);
    }
    if (sortBy === 'name') {
      const aName = (a.first_name || '').trim();
      const bName = (b.first_name || '').trim();
      return aName.localeCompare(bName, 'tr');
    }
    if (sortBy === 'recent') {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    }
    return 0;
  });

  const handleDelete = (id, name) => {
    if (currentUser && currentUser.role !== 'owner') {
      alert('⚠️ Müşteri silme yetkisi sadece Dükkan Sahibi (Admin) hesabında mevcuttur.');
      return;
    }
    if (window.confirm(`${name} isimli müşteriyi silmek istediğinizden emin misiniz?`)) {
      deleteCustomer(id);
      setCustomers(getCustomers());
      if (showNotification) {
        showNotification(`🗑️ ${name} isimli müşteri silindi.`, 'warning');
      }
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>
            👥 Müşteri Defteri ({filtered.length} Kayıt)
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Tüm kayıtlı müşteriler ve güncel borç ekstreleri
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => exportCustomersToExcel(filtered)} 
            className="btn btn-success"
            title="Müşteri listesini Excel (.xlsx) olarak indir"
          >
            <FileSpreadsheet size={18} />
            <span>📊 Excel İndir</span>
          </button>

          <button onClick={onOpenNewCustomer} className="btn btn-primary">
            <UserPlus size={18} />
            <span>+ Yeni Müşteri Kaydet</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ position: 'relative', flex: '1', minWidth: '280px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="İsim, soyisim veya telefon numarası ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-card)', padding: '0.35rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setFilterMode('all')}
              className={`btn btn-sm ${filterMode === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Tüm Müşteriler ({(customers || []).length})
            </button>
            <button
              onClick={() => setFilterMode('debtors')}
              className={`btn btn-sm ${filterMode === 'debtors' ? 'btn-danger' : 'btn-secondary'}`}
            >
              Borçlu Olanlar ({(customers || []).filter(c => Number(c?.total_balance || 0) > 0).length})
            </button>
            <button
              onClick={() => setFilterMode('settled')}
              className={`btn btn-sm ${filterMode === 'settled' ? 'btn-success' : 'btn-secondary'}`}
            >
              Borcu Olmayanlar
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <SlidersHorizontal size={14} color="var(--text-muted)" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
              >
                <option value="highest_debt">En Yüksek Borç</option>
                <option value="name">İsme Göre (A-Z)</option>
                <option value="recent">Son Eklenenler</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-card)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setViewMode('table')}
                className={`btn btn-sm btn-icon ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
                title="Masaüstü Tablo Görünümü"
              >
                <TableIcon size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`btn btn-sm btn-icon ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
                title="Kart Görünümü"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Customer Data Content */}
      {filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', marginBottom: '1.25rem' }}>
            Arama kriterlerinize uygun müşteri bulunamadı.
          </p>
          <button onClick={onOpenNewCustomer} className="btn btn-primary">
            <UserPlus size={18} />
            + Yeni Müşteri Kaydet
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '1rem 0.75rem' }}>Müşteri Adı Soyadı</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Telefon</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Adres</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Not</th>
                  <th style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>Güncel Borç</th>
                  <th style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>Aksiyonlar</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(customer => {
                  const hasDebt = Number(customer.total_balance) > 0;
                  const whatsappMsg = buildReminderMessage(customer);
                  const whatsappUrl = createWhatsappLink(customer.phone, whatsappMsg);

                  return (
                    <tr 
                      key={customer.id}
                      style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.15s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '1rem 0.75rem', fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)', cursor: 'pointer' }} onClick={() => onSelectCustomer(customer)}>
                        {customer.first_name} {customer.last_name}
                      </td>

                      <td style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)' }}>
                        <a href={`tel:${customer.phone}`} style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Phone size={14} /> {customer.phone}
                        </a>
                      </td>

                      <td style={{ padding: '1rem 0.75rem', color: 'var(--text-dim)', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {customer.address || '-'}
                      </td>

                      <td style={{ padding: '1rem 0.75rem', fontSize: '0.8125rem', color: 'var(--amber-text)' }}>
                        {customer.notes ? `💡 ${customer.notes}` : '-'}
                      </td>

                      <td style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>
                        <span className={`badge ${hasDebt ? 'badge-rose' : 'badge-emerald'}`} style={{ fontSize: '1rem', padding: '0.4rem 0.9rem' }}>
                          ₺{Number(customer.total_balance).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                          <button 
                            onClick={() => onSelectCustomer(customer)}
                            className="btn btn-secondary btn-sm"
                            title="Hesap Ekstresi İncele"
                          >
                            <FileText size={14} /> Ekstre
                          </button>

                          <button 
                            onClick={() => onOpenNewTransaction(customer)}
                            className="btn btn-danger btn-sm"
                            title="Veresiye Borç Ekle"
                          >
                            <PlusCircle size={14} /> +Borç
                          </button>

                          <button 
                            onClick={() => onOpenNewPayment(customer)}
                            className="btn btn-success btn-sm"
                            title="Ödeme Al"
                          >
                            <CreditCard size={14} /> Ödeme
                          </button>

                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-whatsapp btn-sm btn-icon"
                            title="WhatsApp Mesajı Gönder"
                          >
                            <MessageSquare size={14} />
                          </a>

                          <button
                            onClick={() => handleDelete(customer.id, `${customer.first_name} ${customer.last_name}`)}
                            className="btn btn-secondary btn-sm btn-icon"
                            style={{ color: 'var(--text-dim)' }}
                            title="Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
          {filtered.map(customer => {
            const hasDebt = Number(customer.total_balance) > 0;
            const whatsappMsg = buildReminderMessage(customer);
            const whatsappUrl = createWhatsappLink(customer.phone, whatsappMsg);

            return (
              <div 
                key={customer.id}
                className="glass-card glass-card-interactive"
                style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', cursor: 'pointer' }} onClick={() => onSelectCustomer(customer)}>
                        {customer.first_name} {customer.last_name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        <Phone size={14} />
                        <a href={`tel:${customer.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {customer.phone}
                        </a>
                      </div>
                    </div>

                    <span className={`badge ${hasDebt ? 'badge-rose' : 'badge-emerald'}`} style={{ fontSize: '1rem', padding: '0.4rem 0.85rem' }}>
                      ₺{Number(customer.total_balance).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {customer.address && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                      <MapPin size={14} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>
                        {customer.address}
                      </span>
                    </div>
                  )}

                  {customer.notes && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--amber-text)', background: 'var(--amber-bg)', padding: '0.4rem 0.65rem', borderRadius: '6px', marginBottom: '0.75rem' }}>
                      💡 {customer.notes}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
                  <button 
                    onClick={() => onSelectCustomer(customer)}
                    className="btn btn-secondary btn-sm"
                  >
                    <FileText size={14} /> Ekstre
                  </button>

                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button 
                      onClick={() => onOpenNewTransaction(customer)}
                      className="btn btn-danger btn-sm"
                    >
                      <PlusCircle size={14} /> +Borç
                    </button>

                    <button 
                      onClick={() => onOpenNewPayment(customer)}
                      className="btn btn-success btn-sm"
                    >
                      <CreditCard size={14} /> Ödeme
                    </button>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp btn-sm btn-icon"
                    >
                      <MessageSquare size={14} />
                    </a>

                    <button
                      onClick={() => handleDelete(customer.id, `${customer.first_name} ${customer.last_name}`)}
                      className="btn btn-secondary btn-sm btn-icon"
                      style={{ color: 'var(--text-dim)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
