import { supabase } from './supabase';

export type StoredProfile = {
  id: string;
  profileType: 'volunteer' | 'institution';
  name: string;
  email: string;
  avatarUrl?: string;
};

// Since we are moving to Supabase, we don't use localStorage for auth anymore.
// We will export helper functions to get the current profile from Supabase.

export async function getCurrentProfile(): Promise<StoredProfile | null> {
  if (typeof window === 'undefined') return null;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, profile_type, name, email, avatar_url')
      .eq('id', user.id)
      .single();

    if (error || !profile) return null;

    return {
      id: profile.id,
      profileType: profile.profile_type,
      name: profile.name,
      email: profile.email,
      avatarUrl: profile.avatar_url,
    };
  } catch {
    return null;
  }
}

export async function signOut() {
  await supabase.auth.signOut();
}
