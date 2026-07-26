// Local Storage ve Supabase Hibrit Veri Tabanı Yönetimi (Ay Gıda Veresiye Defteri)
import { supabase } from './supabase';

const CUSTOMERS_KEY = 'ayg_veresiye_customers_v1';
const TRANSACTIONS_KEY = 'ayg_veresiye_transactions_v1';
const PAYMENTS_KEY = 'ayg_veresiye_payments_v1';
const ACTIVE_USER_KEY = 'ayg_veresiye_active_user_v1';
const NOTES_KEY = 'ayg_veresiye_notes_v1';

// Personel / Kullanıcı Listesi (Max 3 Personel)
export const USERS = [
  { id: 'u1', name: 'Ahmet (Dükkan Sahibi)', role: 'owner' },
  { id: 'u2', name: 'Mehmet (Kasiyer)', role: 'staff' },
  { id: 'u3', name: 'Ali (Tezgahtar)', role: 'staff' }
];

// Varsayılan Demo Müşteriler
const INITIAL_CUSTOMERS = [
  {
    id: 'c1',
    first_name: 'Hasan',
    last_name: 'Kaya',
    phone: '05321112233',
    address: 'Atatürk Cad. No:14/A',
    notes: 'Mahalle fırıncısı, haftalık öder',
    total_balance: 1450,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'c2',
    first_name: 'Ayşe',
    last_name: 'Demir',
    phone: '05432223344',
    address: 'Gül Sok. Orkide Apt. D:3',
    notes: 'Maaş günü ödeme yapıyor (Her ayın 15\'i)',
    total_balance: 620,
    created_at: new Date('2026-06-05').toISOString()
  },
  {
    id: 'c3',
    first_name: 'Mustafa',
    last_name: 'Yılmaz',
    phone: '05553334455',
    address: 'Sanayi Sit. 4. Blok No:8',
    notes: 'Oto tamircisi Mustafa usta',
    total_balance: 2800,
    created_at: new Date('2026-06-10').toISOString()
  },
  {
    id: 'c4',
    first_name: 'Fatma',
    last_name: 'Şahin',
    phone: '05054445566',
    address: 'Çınar Mah. 12. Sok No:5',
    notes: 'Borcu yok, temiz çalışır',
    total_balance: 0,
    created_at: new Date('2026-06-15').toISOString()
  }
];

// Varsayılan Demo Veresiye Kayıtları
const INITIAL_TRANSACTIONS = [
  {
    id: 't1',
    customer_id: 'c1',
    items: [
      { product_name: 'Çaykur Rize Çay 1 kg', quantity: 2, unit_price: 180, total_price: 360 },
      { product_name: 'Zeytin 1 kg', quantity: 1, unit_price: 240, total_price: 240 }
    ],
    total_amount: 600,
    notes: 'Sabah teslim edildi',
    created_by: 'Ahmet (Dükkan Sahibi)',
    transaction_date: new Date('2026-07-20T09:30:00').toISOString()
  },
  {
    id: 't2',
    customer_id: 'c1',
    items: [
      { product_name: 'Sütaş Peynir 1 kg', quantity: 2, unit_price: 225, total_price: 450 },
      { product_name: 'Şeker 5 kg', quantity: 2, unit_price: 200, total_price: 400 }
    ],
    total_amount: 850,
    notes: '',
    created_by: 'Mehmet (Kasiyer)',
    transaction_date: new Date('2026-07-22T14:15:00').toISOString()
  },
  {
    id: 't3',
    customer_id: 'c2',
    items: [
      { product_name: 'Ayçiçek Yağı 5L', quantity: 1, unit_price: 320, total_price: 320 },
      { product_name: 'Baldo Pirinç 2 kg', quantity: 2, unit_price: 150, total_price: 300 }
    ],
    total_amount: 620,
    notes: 'Çırak götürdü',
    created_by: 'Ali (Tezgahtar)',
    transaction_date: new Date('2026-07-23T11:00:00').toISOString()
  },
  {
    id: 't4',
    customer_id: 'c3',
    items: [
      { product_name: 'Kuru Fasulye 2 kg', quantity: 4, unit_price: 120, total_price: 480 },
      { product_name: 'Dana Kıymalık Meat 2 kg', quantity: 4, unit_price: 580, total_price: 2320 }
    ],
    total_amount: 2800,
    notes: 'Dükkana sipariş verildi',
    created_by: 'Ahmet (Dükkan Sahibi)',
    transaction_date: new Date('2026-07-24T16:45:00').toISOString()
  }
];

// Varsayılan Demo Ödeme Kayıtları
const INITIAL_PAYMENTS = [
  {
    id: 'p1',
    customer_id: 'c4',
    amount: 500,
    payment_method: 'cash',
    notes: 'Elden teslim edildi, borcu kapandı',
    received_by: 'Ahmet (Dükkan Sahibi)',
    payment_date: new Date('2026-07-21T10:00:00').toISOString()
  }
];

// Varsayılan Demo Notlar
const INITIAL_NOTES = [
  {
    id: 'n1',
    title: 'Çaykur Toptancı Siparişi',
    content: 'Perşembe günü 10 koli Rize Çay ve 5 koli Filiz Çay siparişi verilecek.',
    category: 'supplier',
    is_pinned: true,
    is_completed: false,
    created_at: new Date('2026-07-24T08:00:00').toISOString()
  },
  {
    id: 'n2',
    title: 'Hasan Fırıncı Hatırlatması',
    content: 'Cumartesi günü haftalık hesap kapatılacak, fişleri hazırla.',
    category: 'reminder',
    is_pinned: true,
    is_completed: false,
    created_at: new Date('2026-07-25T09:30:00').toISOString()
  },
  {
    id: 'n3',
    title: 'Elektrik Faturası Ödemesi',
    content: 'Son ödeme tarihi 28 Temmuz olan dükkan faturası ödenecek.',
    category: 'finance',
    is_pinned: false,
    is_completed: true,
    created_at: new Date('2026-07-20T11:00:00').toISOString()
  }
];

// Depo Başlatıcı ve Supabase Senkronizasyonu
export function initStorage() {
  if (!localStorage.getItem(CUSTOMERS_KEY)) {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(INITIAL_CUSTOMERS));
  }
  if (!localStorage.getItem(TRANSACTIONS_KEY)) {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
  }
  if (!localStorage.getItem(PAYMENTS_KEY)) {
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(INITIAL_PAYMENTS));
  }
  if (!localStorage.getItem(ACTIVE_USER_KEY)) {
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(USERS[0]));
  }
  if (!localStorage.getItem(NOTES_KEY)) {
    localStorage.setItem(NOTES_KEY, JSON.stringify(INITIAL_NOTES));
  }

  // Arka planda Supabase senkronizasyonunu tetikle
  syncFromSupabase().catch(() => {});
}

// Supabase'den Verileri Arka Planda Çekme ve Yerel Depo İle Senkronizasyon
export async function syncFromSupabase() {
  try {
    const { data: cData, error: cErr } = await supabase.from('customers').select('*');
    if (!cErr && cData && cData.length > 0) {
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(cData));
    }

    const { data: tData, error: tErr } = await supabase.from('transactions').select('*');
    if (!tErr && tData && tData.length > 0) {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(tData));
    }

    const { data: pData, error: pErr } = await supabase.from('payments').select('*');
    if (!pErr && pData && pData.length > 0) {
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(pData));
    }

    const { data: nData, error: nErr } = await supabase.from('notes').select('*');
    if (!nErr && nData && nData.length > 0) {
      localStorage.setItem(NOTES_KEY, JSON.stringify(nData));
    }
  } catch (err) {
    console.warn('Supabase senkronizasyon hatası (offline çalışılıyor):', err.message);
  }
}

// Aktif Personel Yönetimi
export function getActiveUser() {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(ACTIVE_USER_KEY)) || USERS[0];
  } catch {
    return USERS[0];
  }
}

export function setActiveUser(user) {
  localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
}

// Müşterileri Getir
export function getCustomers() {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(CUSTOMERS_KEY)) || [];
  } catch {
    return [];
  }
}

const safeSupabaseCall = (query) => {
  try {
    Promise.resolve(query).catch(err => console.warn('Supabase arka plan senkronizasyon uyarısı:', err?.message || err));
  } catch {}
};

// Müşteri Ekle
export function addCustomer(customerData) {
  const customers = getCustomers();
  const newCustomer = {
    id: 'c_' + Date.now(),
    first_name: customerData.first_name.trim(),
    last_name: customerData.last_name.trim(),
    phone: customerData.phone.trim(),
    address: customerData.address ? customerData.address.trim() : '',
    notes: customerData.notes ? customerData.notes.trim() : '',
    total_balance: 0,
    created_at: new Date().toISOString()
  };
  customers.push(newCustomer);
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));

  // Supabase'e ekle
  safeSupabaseCall(supabase.from('customers').upsert([newCustomer]));

  return newCustomer;
}

// Müşteri Sil
export function deleteCustomer(customerId) {
  const customers = getCustomers().filter(c => c.id !== customerId);
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));

  const transactions = getTransactions().filter(t => t.customer_id !== customerId);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));

  const payments = getPayments().filter(p => p.customer_id !== customerId);
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));

  // Supabase'den sil
  safeSupabaseCall(supabase.from('customers').delete().eq('id', customerId));
  safeSupabaseCall(supabase.from('transactions').delete().eq('customer_id', customerId));
  safeSupabaseCall(supabase.from('payments').delete().eq('customer_id', customerId));
}

// Veresiyeleri Getir
export function getTransactions(customerId = null) {
  initStorage();
  try {
    const list = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY)) || [];
    if (customerId) {
      return list.filter(t => t.customer_id === customerId);
    }
    return list;
  } catch {
    return [];
  }
}

// Veresiye (Borç) Ekle
export function addTransaction({ customerId, items, notes }) {
  const customers = getCustomers();
  const customerIndex = customers.findIndex(c => c.id === customerId);

  if (customerIndex === -1) {
    throw new Error('Müşteri bulunamadı');
  }

  const activeUser = getActiveUser();
  const totalAmount = items.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);

  const newTransaction = {
    id: 't_' + Date.now(),
    customer_id: customerId,
    items,
    total_amount: totalAmount,
    notes: notes ? notes.trim() : '',
    created_by: activeUser.name,
    transaction_date: new Date().toISOString()
  };

  const transactions = getTransactions();
  transactions.push(newTransaction);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));

  customers[customerIndex].total_balance = Number(customers[customerIndex].total_balance || 0) + totalAmount;
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));

  // Supabase'e ekle ve bakiyeyi güncelle
  safeSupabaseCall(supabase.from('transactions').upsert([newTransaction]));
  safeSupabaseCall(supabase.from('customers').upsert([customers[customerIndex]]));

  return {
    transaction: newTransaction,
    newTotalBalance: customers[customerIndex].total_balance,
    customer: customers[customerIndex]
  };
}

// Veresiye Kaydı Fiyatlarını Güncelleme (Sonradan Fiyatlandırma)
export function updateTransactionPrices({ transactionId, updatedItems, notes }) {
  const transactions = getTransactions();
  const txIndex = transactions.findIndex(t => t.id === transactionId);

  if (txIndex === -1) {
    throw new Error('Veresiye kaydı bulunamadı');
  }

  const existingTx = transactions[txIndex];
  const oldTotalAmount = Number(existingTx.total_amount || 0);

  const processedItems = updatedItems.map(item => {
    const qty = Number(item.quantity) || 0;
    const isPending = Boolean(item.is_pending_price);
    const unitPrice = isPending ? 0 : Number(item.unit_price) || 0;
    const totalPrice = isPending ? 0 : qty * unitPrice;
    return {
      ...item,
      quantity: qty,
      unit_price: unitPrice,
      total_price: totalPrice,
      is_pending_price: isPending
    };
  });

  const newTotalAmount = processedItems.reduce((sum, item) => sum + item.total_price, 0);

  transactions[txIndex] = {
    ...existingTx,
    items: processedItems,
    total_amount: newTotalAmount,
    notes: notes !== undefined ? notes : existingTx.notes,
    updated_at: new Date().toISOString()
  };

  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));

  const customers = getCustomers();
  const customerIndex = customers.findIndex(c => c.id === existingTx.customer_id);

  if (customerIndex !== -1) {
    const currentBalance = Number(customers[customerIndex].total_balance || 0);
    const balanceDiff = newTotalAmount - oldTotalAmount;
    customers[customerIndex].total_balance = Math.max(0, currentBalance + balanceDiff);
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));

    const dbTx = {
      id: transactions[txIndex].id,
      customer_id: transactions[txIndex].customer_id,
      items: transactions[txIndex].items,
      total_amount: transactions[txIndex].total_amount,
      notes: transactions[txIndex].notes || '',
      created_by: transactions[txIndex].created_by || '',
      transaction_date: transactions[txIndex].transaction_date
    };

    const dbCust = {
      id: customers[customerIndex].id,
      first_name: customers[customerIndex].first_name,
      last_name: customers[customerIndex].last_name,
      phone: customers[customerIndex].phone || '',
      address: customers[customerIndex].address || '',
      notes: customers[customerIndex].notes || '',
      total_balance: customers[customerIndex].total_balance,
      created_at: customers[customerIndex].created_at
    };

    safeSupabaseCall(supabase.from('transactions').upsert([dbTx]));
    safeSupabaseCall(supabase.from('customers').upsert([dbCust]));

    return {
      transaction: transactions[txIndex],
      customer: customers[customerIndex],
      newTotalBalance: customers[customerIndex].total_balance
    };
  }

  return { transaction: transactions[txIndex] };
}

// Ödemeleri Getir
export function getPayments(customerId = null) {
  initStorage();
  try {
    const list = JSON.parse(localStorage.getItem(PAYMENTS_KEY)) || [];
    if (customerId) {
      return list.filter(p => p.customer_id === customerId);
    }
    return list;
  } catch {
    return [];
  }
}

// Ödeme (Tahsilat) Al
export function addPayment({ customerId, amount, paymentMethod = 'cash', notes = '' }) {
  const customers = getCustomers();
  const customerIndex = customers.findIndex(c => c.id === customerId);

  if (customerIndex === -1) {
    throw new Error('Müşteri bulunamadı');
  }

  const activeUser = getActiveUser();
  const payAmount = Number(amount) || 0;

  const newPayment = {
    id: 'p_' + Date.now(),
    customer_id: customerId,
    amount: payAmount,
    payment_method: paymentMethod,
    notes: notes ? notes.trim() : '',
    received_by: activeUser.name,
    payment_date: new Date().toISOString()
  };

  const payments = getPayments();
  payments.push(newPayment);
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));

  const currentBalance = Number(customers[customerIndex].total_balance || 0);
  const updatedBalance = Math.max(0, currentBalance - payAmount);
  customers[customerIndex].total_balance = updatedBalance;
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));

  // Supabase'e ekle ve bakiyeyi güncelle
  safeSupabaseCall(supabase.from('payments').upsert([newPayment]));
  safeSupabaseCall(supabase.from('customers').upsert([customers[customerIndex]]));

  return {
    payment: newPayment,
    newTotalBalance: updatedBalance,
    customer: customers[customerIndex]
  };
}

// --- NOT DEFTESİ (NOTEPAD) YÖNETİMİ ---

export function getNotes() {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY)) || [];
  } catch {
    return [];
  }
}

export function addNote({ title, content, category = 'general' }) {
  const notes = getNotes();
  const newNote = {
    id: 'n_' + Date.now(),
    title: title.trim(),
    content: content ? content.trim() : '',
    category,
    is_pinned: false,
    is_completed: false,
    created_at: new Date().toISOString()
  };
  notes.unshift(newNote);
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));

  safeSupabaseCall(supabase.from('notes').upsert([newNote]));

  return newNote;
}

export function toggleNotePin(noteId) {
  const notes = getNotes();
  const idx = notes.findIndex(n => n.id === noteId);
  if (idx > -1) {
    notes[idx].is_pinned = !notes[idx].is_pinned;
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    safeSupabaseCall(supabase.from('notes').upsert([notes[idx]]));
  }
  return notes;
}

export function toggleNoteComplete(noteId) {
  const notes = getNotes();
  const idx = notes.findIndex(n => n.id === noteId);
  if (idx > -1) {
    notes[idx].is_completed = !notes[idx].is_completed;
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    safeSupabaseCall(supabase.from('notes').upsert([notes[idx]]));
  }
  return notes;
}

export function deleteNote(noteId) {
  const notes = getNotes().filter(n => n.id !== noteId);
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  safeSupabaseCall(supabase.from('notes').delete().eq('id', noteId));
  return notes;
}

// Demo Verileri Sıfırla ve Supabase İle Senkronize Et
export async function resetToDemoData() {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(INITIAL_CUSTOMERS));
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(INITIAL_PAYMENTS));
  localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(USERS[0]));
  localStorage.setItem(NOTES_KEY, JSON.stringify(INITIAL_NOTES));

  try {
    await supabase.from('customers').upsert(INITIAL_CUSTOMERS);
    await supabase.from('transactions').upsert(INITIAL_TRANSACTIONS);
    await supabase.from('payments').upsert(INITIAL_PAYMENTS);
    await supabase.from('notes').upsert(INITIAL_NOTES);
  } catch {}

  window.location.reload();
}
