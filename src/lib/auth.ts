import { supabase } from "./supabase";

export type StoredProfile = {
  id: string;
  profileType: "volunteer" | "institution";
  name: string;
  email: string;
  avatarUrl?: string;
};

const STORAGE_KEY = "mutirao_user_profile";

function setCookieAuth(value: string) {
  if (typeof document === "undefined") return;
  // Cookie acessível pelo middleware (sem httpOnly para client-side definição)
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias
  document.cookie = `${STORAGE_KEY}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

function clearCookieAuth() {
  if (typeof document === "undefined") return;
  document.cookie = `${STORAGE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

export function loadStoredProfile(): StoredProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredProfile;
  } catch {
    return null;
  }
}

export function saveStoredProfile(profile: StoredProfile) {
  if (typeof window === "undefined") return;
  const serialized = JSON.stringify(profile);
  window.localStorage.setItem(STORAGE_KEY, serialized);
  // Também define cookie para que o middleware possa verificar autenticação
  setCookieAuth(serialized);
}

export function clearStoredProfile() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  clearCookieAuth();
}

export async function getCurrentProfile(): Promise<StoredProfile | null> {
  if (!supabase) return loadStoredProfile();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return loadStoredProfile();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, profile_type, name, email, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !profile) return loadStoredProfile();

    const mapped: StoredProfile = {
      id: profile.id,
      profileType: profile.profile_type as "volunteer" | "institution",
      name: profile.name,
      email: profile.email,
      avatarUrl: profile.avatar_url || undefined,
    };

    // Persiste localmente e define cookie de sessão
    saveStoredProfile(mapped);
    return mapped;
  } catch {
    return loadStoredProfile();
  }
}

export async function signOut() {
  clearStoredProfile();
  if (supabase) {
    await supabase.auth.signOut();
  }
}
