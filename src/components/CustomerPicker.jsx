import React, { useState, useEffect, useRef } from 'react';
import { Search, UserCheck, ChevronDown, Check } from 'lucide-react';

export default function CustomerPicker({ customers = [], selectedCustomerId = '', onSelectCustomer, autoFocus = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Dışarı tıklandığında menüyü kapat
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Seçili müşteri değiştiğinde arama kutusunun yazısını güncelle
  useEffect(() => {
    if (selectedCustomer && !isOpen) {
      setSearchTerm(`${selectedCustomer.first_name} ${selectedCustomer.last_name}`);
    }
  }, [selectedCustomerId, isOpen]);

  // Arama filtreleme mantığı (İsim, Soyisim veya Telefon)
  const filteredCustomers = customers.filter(c => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
    const phone = c.phone ? c.phone.toLowerCase() : '';
    return fullName.includes(query) || phone.includes(query);
  });

  const handleSelect = (customer) => {
    onSelectCustomer(customer);
    setSearchTerm(`${customer.first_name} ${customer.last_name}`);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % Math.max(1, filteredCustomers.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + filteredCustomers.length) % Math.max(1, filteredCustomers.length));
    } else if (e.key === 'Enter') {
      if (isOpen && filteredCustomers.length > 0) {
        e.preventDefault();
        handleSelect(filteredCustomers[highlightedIndex] || filteredCustomers[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      
      {/* Input Box */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search size={18} color="var(--primary)" style={{ position: 'absolute', left: '14px', zIndex: 2 }} />
        
        <input
          ref={inputRef}
          type="text"
          data-field="customer"
          autoFocus={autoFocus}
          placeholder="Müşteri adı, soyadı veya telefon yazıp arayın..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="form-input"
          style={{
            paddingLeft: '2.75rem',
            paddingRight: selectedCustomer ? '140px' : '2.5rem',
            fontSize: '1.05rem',
            fontWeight: '600'
          }}
        />

        {/* Selected Customer Balance Badge inside input */}
        {selectedCustomer && (
          <div style={{ position: 'absolute', right: '35px', zIndex: 2 }}>
            <span className={`badge ${Number(selectedCustomer.total_balance) > 0 ? 'badge-rose' : 'badge-emerald'}`} style={{ fontSize: '0.8125rem' }}>
              ₺{Number(selectedCustomer.total_balance).toLocaleString('tr-TR')}
            </span>
          </div>
        )}

        <ChevronDown size={18} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', zIndex: 2, pointerEvents: 'none' }} />
      </div>

      {/* Floating Dropdown List */}
      {isOpen && (
        <div 
          className="glass-card"
          style={{
            position: 'absolute',
            top: '105%',
            left: 0,
            right: 0,
            maxHeight: '280px',
            overflowY: 'auto',
            zIndex: 1000,
            padding: '0.5rem',
            boxShadow: 'var(--shadow-lg)',
            background: 'var(--modal-bg)',
            border: '1px solid var(--border-highlight)'
          }}
        >
          {filteredCustomers.length === 0 ? (
            <div style={{ padding: '0.85rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Eşleşen müşteri bulunamadı.
            </div>
          ) : (
            filteredCustomers.map((c, index) => {
              const isSelected = selectedCustomerId === c.id;
              const isHighlighted = highlightedIndex === index;

              return (
                <div
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    background: isHighlighted ? 'var(--primary-light)' : 'transparent',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                    marginBottom: '0.25rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'var(--bg-card)',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      fontWeight: '700',
                      fontSize: '0.875rem',
                      color: 'var(--primary)'
                    }}>
                      {c.first_name[0]}{c.last_name[0]}
                    </div>

                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                        {c.first_name} {c.last_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        📞 {c.phone}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`badge ${Number(c.total_balance) > 0 ? 'badge-rose' : 'badge-emerald'}`}>
                      ₺{Number(c.total_balance).toLocaleString('tr-TR')}
                    </span>
                    {isSelected && <Check size={16} color="var(--primary)" />}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
}
