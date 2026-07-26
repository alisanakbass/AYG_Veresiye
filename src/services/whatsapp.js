// WhatsApp Mesaj Şablon Oluşturucu Servisi

/**
 * 1. Yeni Veresiye (Borç) Eklendiğinde Gönderilecek Şablon Mesaj
 */
export function buildTransactionMessage(customer, transaction, newTotalBalance) {
  const customerName = `${customer.first_name} ${customer.last_name}`;
  
  // Ürün listesini biçimlendir
  const itemListText = transaction.items
    .map(item => `• ${item.product_name} (${item.quantity} adet x ₺${item.unit_price}) = ₺${item.total_price}`)
    .join('\n');

  const formattedTotal = Number(transaction.total_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 });
  const formattedBalance = Number(newTotalBalance).toLocaleString('tr-TR', { minimumFractionDigits: 2 });

  return `Sayın *${customerName}*,

AY GIDA Veresiye Defterinize yeni veresiye kaydı eklenmiştir.

*Satın Alınan Ürünler:*
${itemListText}

*Eklenen Borç Tutarı:* ₺${formattedTotal}
*GÜNCEL TOPLAM BORCUNUZ:* ₺${formattedBalance}

${transaction.notes ? `*Açıklama:* ${transaction.notes}\n` : ''}Hayırlı günler dileriz. 🙏

📌 *Not:* Bu veresiye tutarı 30 gün süreyle geçerlidir. 30 günü aşan ödemelerde güncel piyasa/dükkan ürün fiyatları uygulanmaktadır.`;
}

/**
 * 2. Ödeme (Tahsilat) Alındığında Gönderilecek Şablon Mesaj
 */
export function buildPaymentMessage(customer, paidAmount, newTotalBalance) {
  const customerName = `${customer.first_name} ${customer.last_name}`;
  const formattedPaid = Number(paidAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 });
  const formattedBalance = Number(newTotalBalance).toLocaleString('tr-TR', { minimumFractionDigits: 2 });

  return `Sayın *${customerName}*,

AY GIDA Veresiye Defterinizden *₺${formattedPaid}* ödeme/tahsilat teslim alınmıştır.

*Ödenen Tutar:* ₺${formattedPaid}
*KALAN TOPLAM BORCUNUZ:* ₺${formattedBalance}

Ödemeniz için teşekkür eder, hayırlı işler dileriz. 🙏`;
}

/**
 * 3. Borç Hatırlatma Mesajı
 */
export function buildReminderMessage(customer) {
  const customerName = `${customer.first_name} ${customer.last_name}`;
  const formattedBalance = Number(customer.total_balance).toLocaleString('tr-TR', { minimumFractionDigits: 2 });

  return `Sayın *${customerName}*,

AY GIDA Veresiye Defterinizde güncel hesap bakiyeniz *₺${formattedBalance}* olarak görünmektedir.

Müsait olduğunuzda ödeme yapmanızı rica ederiz. 
Hayırlı günler dileriz. 🙏

📌 *Not:* Bu veresiye tutarları 30 gün süreyle geçerlidir. 30 günü aşan ödemelerde güncel dükkan ürün fiyatları uygulanmaktadır.`;
}

/**
 * Telefon Numarasını WhatsApp Formatına Getir ve Tıkla-Gönder Linki Üret
 */
export function createWhatsappLink(phone, message) {
  // Telefon numarasındaki boşluk ve karakterleri temizle
  let cleanPhone = phone.replace(/\D/g, '');

  // Türkiye için numara 0 ile başlıyorsa +90 yap
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '90' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('90') && cleanPhone.length === 10) {
    cleanPhone = '90' + cleanPhone;
  }

  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
}
