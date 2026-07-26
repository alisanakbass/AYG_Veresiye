import * as XLSX from 'xlsx';

// Tarih Formatlayıcı (YYYY-MM-DD)
function getFormattedDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 1. Tüm Müşteri Defterini Excel Olarak İndir
 */
export function exportCustomersToExcel(customers = []) {
  const dataRows = customers.map((c, index) => ({
    'Sıra No': index + 1,
    'Müşteri Adı': c.first_name,
    'Soyadı': c.last_name,
    'Telefon Numarası': c.phone,
    'Adres': c.address || '-',
    'Özel Not': c.notes || '-',
    'Güncel Borç Bakiyesi (₺)': Number(c.total_balance || 0),
    'Kayıt Tarihi': c.created_at ? new Date(c.created_at).toLocaleDateString('tr-TR') : '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataRows);
  
  // Sütun genişliklerini otomatik ayarla
  worksheet['!cols'] = [
    { wch: 8 },  // Sıra No
    { wch: 15 }, // Müşteri Adı
    { wch: 15 }, // Soyadı
    { wch: 16 }, // Telefon
    { wch: 30 }, // Adres
    { wch: 25 }, // Özel Not
    { wch: 22 }, // Borç Bakiyesi
    { wch: 14 }  // Kayıt Tarihi
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Müşteri Defteri');

  const fileName = `AYG_Musteri_Defteri_${getFormattedDate()}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * 2. Müşteri Detay Ekstresini Excel Olarak İndir
 */
export function exportCustomerLedgerToExcel(customer, history = []) {
  if (!customer) return;

  const dataRows = history.map((item, index) => {
    const isTransaction = item.type === 'transaction';
    
    // Ürün listesi dökümü
    let productDetails = '-';
    if (isTransaction && item.items && item.items.length > 0) {
      productDetails = item.items.map(p => `${p.product_name} (${p.quantity} Adet x ₺${p.unit_price})`).join(' | ');
    }

    return {
      'İşlem No': index + 1,
      'Tarih & Saat': item.date ? item.date.toLocaleString('tr-TR') : '-',
      'İşlem Türü': isTransaction ? '🔴 Veresiye Borç' : '🟢 Tahsilat Ödeme',
      'Satın Alınan Ürünler': productDetails,
      'Tutar (₺)': isTransaction ? Number(item.total_amount) : Number(item.amount),
      'Açıklama / Not': item.notes || '-',
      'İşlemi Yapan Personel': item.created_by || item.received_by || 'Personel'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(dataRows);

  worksheet['!cols'] = [
    { wch: 10 }, // İşlem No
    { wch: 20 }, // Tarih
    { wch: 18 }, // İşlem Türü
    { wch: 45 }, // Ürünler
    { wch: 15 }, // Tutar
    { wch: 25 }, // Not
    { wch: 22 }  // Personel
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Hesap Ekstresi');

  const customerNameClean = `${customer.first_name}_${customer.last_name}`.replace(/\s+/g, '_');
  const fileName = `AYG_Hesap_Ekstresi_${customerNameClean}_${getFormattedDate()}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * 3. Kasa & Alacak Raporunu Excel Olarak İndir
 */
export function exportDashboardToExcel(transactions = [], payments = [], customers = []) {
  // Sayfa 1: İşlem Hareketleri
  const activityRows = [
    ...transactions.map(t => ({
      'Tarih': new Date(t.transaction_date).toLocaleString('tr-TR'),
      'İşlem Türü': '🔴 Veresiye Borç',
      'Müşteri ID': t.customer_id,
      'Tutar (₺)': Number(t.total_amount),
      'Personel': t.created_by || 'Personel',
      'Not': t.notes || '-'
    })),
    ...payments.map(p => ({
      'Tarih': new Date(p.payment_date).toLocaleString('tr-TR'),
      'İşlem Türü': '🟢 Tahsilat Ödeme',
      'Müşteri ID': p.customer_id,
      'Tutar (₺)': Number(p.amount),
      'Personel': p.received_by || 'Personel',
      'Not': p.notes || '-'
    }))
  ].sort((a, b) => new Date(b.Tarih) - new Date(a.Tarih));

  const worksheetActivities = XLSX.utils.json_to_sheet(activityRows);

  // Sayfa 2: Borçlu Müşteriler
  const debtors = customers
    .filter(c => Number(c.total_balance) > 0)
    .map(c => ({
      'Müşteri Adı Soyadı': `${c.first_name} ${c.last_name}`,
      'Telefon': c.phone,
      'Güncel Borç Bakiyesi (₺)': Number(c.total_balance),
      'Not': c.notes || '-'
    }));

  const worksheetDebtors = XLSX.utils.json_to_sheet(debtors);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheetActivities, 'Kasa Hareketleri');
  XLSX.utils.book_append_sheet(workbook, worksheetDebtors, 'Borçlu Müşteriler');

  const fileName = `AYG_Kasa_ve_Alacak_Raporu_${getFormattedDate()}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
