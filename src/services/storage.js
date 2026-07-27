// Local Storage ve Supabase Hibrit Veri Tabanı Yönetimi (Ay Gıda Veresiye Defteri)
import { supabase } from './supabase';

const CUSTOMERS_KEY = 'ayg_veresiye_customers_v1';
const TRANSACTIONS_KEY = 'ayg_veresiye_transactions_v1';
const PAYMENTS_KEY = 'ayg_veresiye_payments_v1';
const ACTIVE_USER_KEY = 'ayg_veresiye_active_user_v1';
const NOTES_KEY = 'ayg_veresiye_notes_v1';

// Personel / Kullanıcı Listesi (PIN'li ve Rol Tanımlı)
export const USERS = [
  { id: 'u1', name: 'Ahmet (Dükkan Sahibi)', role: 'owner', pin: '1234', title: '👑 Dükkan Sahibi' },
  { id: 'u2', name: 'Mehmet (Kasiyer)', role: 'staff', pin: '0000', title: '👤 Kasiyer' },
  { id: 'u3', name: 'Ali (Tezgahtar)', role: 'staff', pin: '0000', title: '👤 Tezgahtar' }
];

const CUSTOM_USERS_KEY = 'ayg_veresiye_custom_users_v2';

export function getUsers() {
  try {
    const saved = localStorage.getItem(CUSTOM_USERS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return USERS;
}

export function updateUserProfile(userId, { name, pin }) {
  const currentUsers = getUsers();
  const index = currentUsers.findIndex(u => u.id === userId);
  if (index !== -1) {
    if (name && name.trim()) {
      const trimmedName = name.trim();
      currentUsers[index].name = trimmedName;
      currentUsers[index].title = (currentUsers[index].role === 'owner' ? '👑 ' : '👤 ') + trimmedName;
    }
    if (pin && pin.trim()) {
      currentUsers[index].pin = String(pin).trim();
    }
    localStorage.setItem(CUSTOM_USERS_KEY, JSON.stringify(currentUsers));

    // Aktif kullanıcı ise aktif oturumu da güncelle
    const active = getActiveUser();
    if (active && active.id === userId) {
      setActiveUser(currentUsers[index]);
    }
  }
  return currentUsers;
}

export function verifyUserPin(userId, inputPin) {
  const users = getUsers();
  const found = users.find(u => u.id === userId);
  const expectedPin = found ? found.pin : '0000';
  return expectedPin === String(inputPin).trim();
}

export function getActiveUser() {
  try {
    const localUser = localStorage.getItem(ACTIVE_USER_KEY);
    if (localUser) return JSON.parse(localUser);

    const sessionUser = sessionStorage.getItem(ACTIVE_USER_KEY);
    if (sessionUser) return JSON.parse(sessionUser);

    return null;
  } catch {
    return null;
  }
}

export function setActiveUser(user, remember = true) {
  if (!user) return;
  const data = JSON.stringify(user);
  if (remember) {
    localStorage.setItem(ACTIVE_USER_KEY, data);
    sessionStorage.removeItem(ACTIVE_USER_KEY);
  } else {
    sessionStorage.setItem(ACTIVE_USER_KEY, data);
    localStorage.removeItem(ACTIVE_USER_KEY);
  }
}

export function logoutUser() {
  localStorage.removeItem(ACTIVE_USER_KEY);
  sessionStorage.removeItem(ACTIVE_USER_KEY);
}

// Varsayılan Demo Müşteriler (Üretim ortamında temiz sıfır başlangıç)
const INITIAL_CUSTOMERS = [];

// Varsayılan Demo Veresiye Kayıtları
const INITIAL_TRANSACTIONS = [];

// Varsayılan Demo Ödeme Kayıtları
const INITIAL_PAYMENTS = [];

// Varsayılan Demo Notlar
const INITIAL_NOTES = [];

// Veritabanı Sıfırlama (Tüm yerel ve Supabase verilerini temizleme)
export function clearAllData() {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify([]));
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([]));
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify([]));
  localStorage.setItem(NOTES_KEY, JSON.stringify([]));

  safeSupabaseCall(supabase.from('transactions').delete().neq('id', '0'));
  safeSupabaseCall(supabase.from('payments').delete().neq('id', '0'));
  safeSupabaseCall(supabase.from('notes').delete().neq('id', '0'));
  safeSupabaseCall(supabase.from('customers').delete().neq('id', '0'));
}

const HAS_CLEARED_DEMO_KEY = 'ayg_veresiye_cleared_demo_v2';

// Depo Başlatıcı ve Supabase Senkronizasyonu
export function initStorage() {

  if (!localStorage.getItem(CUSTOMERS_KEY)) {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(TRANSACTIONS_KEY)) {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(PAYMENTS_KEY)) {
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(ACTIVE_USER_KEY)) {
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(USERS[0]));
  }
  if (!localStorage.getItem(NOTES_KEY)) {
    localStorage.setItem(NOTES_KEY, JSON.stringify([]));
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

  const firstNameTrimmed = customerData.first_name.trim();
  const lastNameTrimmed = customerData.last_name.trim();

  // Aynı Ad ve Soyada sahip müşteri kontrolü (küçük/büyük harf duyarsız)
  const isDuplicate = customers.some(
    c => c.first_name.toLowerCase().trim() === firstNameTrimmed.toLowerCase() &&
         c.last_name.toLowerCase().trim() === lastNameTrimmed.toLowerCase()
  );

  if (isDuplicate) {
    throw new Error(`"${firstNameTrimmed} ${lastNameTrimmed}" adında kayıtlı bir müşteri zaten var! Lütfen farklı bir isim giriniz veya ayırt edici bir unvan/lakap ekleyiniz.`);
  }

  const newCustomer = {
    id: 'c_' + Date.now(),
    first_name: firstNameTrimmed,
    last_name: lastNameTrimmed,
    phone: customerData.phone ? customerData.phone.trim() : '',
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

export function updateNote(noteId, { title, content, category }) {
  const notes = getNotes();
  const idx = notes.findIndex(n => n.id === noteId);
  if (idx > -1) {
    notes[idx] = {
      ...notes[idx],
      title: title.trim(),
      content: content ? content.trim() : '',
      category: category || notes[idx].category,
      updated_at: new Date().toISOString()
    };
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
