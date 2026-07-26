import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Pin, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Search, 
  Tag, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { getNotes, addNote, toggleNotePin, toggleNoteComplete, deleteNote } from '../services/storage';

export default function NotepadPage({ onNavigateHome }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    setNotes(getNotes());
  }, []);

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Lütfen bir not başlığı giriniz.');
      return;
    }

    addNote({ title, content, category });
    setTitle('');
    setContent('');
    setCategory('general');
    setNotes(getNotes());
  };

  const handleTogglePin = (id) => {
    const updated = toggleNotePin(id);
    setNotes(updated);
  };

  const handleToggleComplete = (id) => {
    const updated = toggleNoteComplete(id);
    setNotes(updated);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bu notu silmek istediğinizden emin misiniz?')) {
      const updated = deleteNote(id);
      setNotes(updated);
    }
  };

  // Filtreleme ve Sıralama (Sabitlenmişler en üstte)
  const filteredNotes = notes.filter(n => {
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch = n.title.toLowerCase().includes(query) || (n.content && n.content.toLowerCase().includes(query));
    
    if (!matchesSearch) return false;
    if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
    return true;
  }).sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return b.is_pinned ? 1 : -1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'reminder':
        return <span className="badge badge-rose" style={{ fontSize: '0.75rem' }}>🔔 Hatırlatma</span>;
      case 'supplier':
        return <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', border: '1px solid var(--primary)', fontSize: '0.75rem' }}>📦 Toptancı</span>;
      case 'finance':
        return <span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>💰 Alacak/Borç</span>;
      default:
        return <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>📌 Genel Not</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
            <FileText size={30} /> 📝 Hızlı Esnaf Not Defteri
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Dükkan hatırlatmaları, toptancı siparişleri ve yapılacak işler listesi
          </p>
        </div>
      </div>

      {/* 2-Column Desktop Widescreen Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Form to Add New Note */}
        <form onSubmit={handleAddNote} className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} color="var(--primary)" /> Yeni Not Ekle
          </h3>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Not Başlığı *</label>
            <input
              type="text"
              required
              placeholder="Örn: Çaykur toptancısına uğra"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-select"
            >
              <option value="general">📌 Genel Not</option>
              <option value="reminder">🔔 Hatırlatma</option>
              <option value="supplier">📦 Toptancı / Tedarikçi</option>
              <option value="finance">💰 Alacak / Borç Notu</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Detaylı Açıklama (İsteğe Bağlı)</label>
            <textarea
              rows={4}
              placeholder="Örn: 10 koli çay ve 5 koli şeker söylenecek..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="form-textarea"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontWeight: '800', fontSize: '1rem' }}>
            📝 Notu Kaydet
          </button>
        </form>

        {/* Right Column: Search, Filter & Notes List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Filter Bar */}
          <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              
              {/* Search */}
              <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Notlarda ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', padding: '0.45rem 2.5rem', fontSize: '0.875rem' }}
                />
              </div>

              {/* Category Filter Tabs */}
              <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-card)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('all')}
                  className={`btn btn-sm ${categoryFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                >
                  Tümü ({notes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('reminder')}
                  className={`btn btn-sm ${categoryFilter === 'reminder' ? 'btn-danger' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                >
                  🔔 Hatırlatma
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('supplier')}
                  className={`btn btn-sm ${categoryFilter === 'supplier' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                >
                  📦 Toptancı
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('finance')}
                  className={`btn btn-sm ${categoryFilter === 'finance' ? 'btn-amber' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                >
                  💰 Alacak
                </button>
              </div>

            </div>
          </div>

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Arama kriterlerinize uygun kayıtlı not bulunamadı.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {filteredNotes.map(n => (
                <div 
                  key={n.id}
                  className="glass-card"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    border: n.is_pinned ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: n.is_completed ? 'rgba(0, 0, 0, 0.04)' : 'var(--bg-card)',
                    opacity: n.is_completed ? 0.65 : 1,
                    position: 'relative'
                  }}
                >
                  <div>
                    {/* Header Row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {getCategoryBadge(n.category)}
                        {n.is_pinned && (
                          <span className="badge badge-amber" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                            📌 Sabitlendi
                          </span>
                        )}
                      </div>

                      {/* Pin Toggle */}
                      <button
                        onClick={() => handleTogglePin(n.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: n.is_pinned ? 'var(--amber-text)' : 'var(--text-dim)',
                          padding: '0.2rem'
                        }}
                        title={n.is_pinned ? 'İğneyi Kaldır' : 'Başa İğnele'}
                      >
                        <Pin size={16} fill={n.is_pinned ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    {/* Title */}
                    <h4 style={{ 
                      fontSize: '1.125rem', 
                      fontWeight: '800', 
                      color: 'var(--text-main)', 
                      marginBottom: '0.5rem',
                      textDecoration: n.is_completed ? 'line-through' : 'none'
                    }}>
                      {n.title}
                    </h4>

                    {/* Content */}
                    {n.content && (
                      <p style={{ 
                        fontSize: '0.875rem', 
                        color: 'var(--text-muted)', 
                        whiteSpace: 'pre-wrap', 
                        marginBottom: '1rem',
                        textDecoration: n.is_completed ? 'line-through' : 'none' 
                      }}>
                        {n.content}
                      </p>
                    )}
                  </div>

                  {/* Footer Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={12} />
                      {new Date(n.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {/* Check Complete */}
                      <button
                        onClick={() => handleToggleComplete(n.id)}
                        className={`btn btn-sm ${n.is_completed ? 'btn-success' : 'btn-secondary'}`}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        {n.is_completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                        <span>{n.is_completed ? 'Tamamlandı' : 'Tamamla'}</span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="btn btn-secondary btn-sm btn-icon"
                        style={{ color: 'var(--rose-text)' }}
                        title="Notu Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
