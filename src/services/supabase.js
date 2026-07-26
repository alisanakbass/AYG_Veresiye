import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lczhlcpmiitgldamawae.supabase.co';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_q5LZlboxb4A2HGcy3HccYQ_VgV_503F';

export const supabase = createClient(rawUrl, rawKey);
