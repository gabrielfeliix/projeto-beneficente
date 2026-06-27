import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://looiynayvxnmpqdtnqld.supabase.co";
const supabaseUrl = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_y1HLC-x1pqr8d6iSPc6dBg_N5znh3yy";

export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "your-supabase-url-here" &&
  supabaseAnonKey !== "your-supabase-anon-key-here"
);

if (!isSupabaseConfigured && typeof window !== "undefined") {
  console.warn(
    "⚠️ Supabase não está configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no seu arquivo .env.local para habilitar a persistência em banco de dados real. O app está utilizando persistência local fallback (localStorage/mocks)."
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function isUUID(str?: string): boolean {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}
