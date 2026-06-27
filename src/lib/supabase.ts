import { createClient } from '@supabase/supabase-js';

// Usamos um fallback de URL válida para que a aplicação não quebre (crash)
// antes de você colocar as chaves reais no .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your-supabase-url-here' && process.env.NEXT_PUBLIC_SUPABASE_URL 
  ? process.env.NEXT_PUBLIC_SUPABASE_URL 
  : 'https://xyzxyzxyzxyzxyzxyzxyz.supabase.co';

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-supabase-anon-key-here' && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
  : 'public-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
