export type StoredProfile = {
  id: string;
  profileType: 'volunteer' | 'institution';
  name: string;
  email: string;
  avatarUrl?: string;
};

const STORAGE_KEY = 'mutirao_user_profile';

export function loadStoredProfile(): StoredProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredProfile;
  } catch {
    return null;
  }
}

export function saveStoredProfile(profile: StoredProfile) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function clearStoredProfile() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
