-- AYG Veresiye Defteri - Supabase Veritabanı Tablo ve RLS Yapılandırması
-- Bu SQL betiğini Supabase Dashboard -> SQL Editor kısmına yapıştırıp "Run" butonuna basarak çalıştırabilirsiniz.

-- 1. Müşteriler Tablosu (customers)
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    address TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    total_balance NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Veresiye Kayıtları Tablosu (transactions)
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES public.customers(id) ON DELETE CASCADE,
    items JSONB DEFAULT '[]'::jsonb,
    total_amount NUMERIC DEFAULT 0,
    notes TEXT DEFAULT '',
    created_by TEXT DEFAULT '',
    transaction_date TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tahsilat / Ödeme Kayıtları Tablosu (payments)
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES public.customers(id) ON DELETE CASCADE,
    amount NUMERIC DEFAULT 0,
    payment_method TEXT DEFAULT 'cash',
    notes TEXT DEFAULT '',
    received_by TEXT DEFAULT '',
    payment_date TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Not Defteri Tablosu (notes)
CREATE TABLE IF NOT EXISTS public.notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    category TEXT DEFAULT 'general',
    is_pinned BOOLEAN DEFAULT FALSE,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) İzinlerini Etkinleştirme ve Anonim / Genel Erişime Açma

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Müşteriler Politikası
DROP POLICY IF EXISTS "Public Customers Access" ON public.customers;
CREATE POLICY "Public Customers Access" ON public.customers FOR ALL USING (true) WITH CHECK (true);

-- Veresiyeler Politikası
DROP POLICY IF EXISTS "Public Transactions Access" ON public.transactions;
CREATE POLICY "Public Transactions Access" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

-- Ödemeler Politikası
DROP POLICY IF EXISTS "Public Payments Access" ON public.payments;
CREATE POLICY "Public Payments Access" ON public.payments FOR ALL USING (true) WITH CHECK (true);

-- Notlar Politikası
DROP POLICY IF EXISTS "Public Notes Access" ON public.notes;
CREATE POLICY "Public Notes Access" ON public.notes FOR ALL USING (true) WITH CHECK (true);
