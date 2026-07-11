/**
 * Per-user onboarding preferences, persisted in the Supabase `profiles` table.
 *
 * Both functions no-op / return null when Supabase isn't configured or there's
 * no session, so the guest/dev flow keeps using the client-only onboarding
 * store unchanged.
 */
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export type ProfileData = {
  skill: string | null;
  dietary: string[];
  allergens: string[];
  completed: boolean;
};

async function currentUserId(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

/** Load the signed-in user's saved preferences, or null if none/unavailable. */
export async function fetchProfile(): Promise<ProfileData | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('skill, dietary, allergens, onboarding_completed')
    .eq('id', uid)
    .maybeSingle();
  if (error || !data) return null;
  return {
    skill: data.skill ?? null,
    dietary: data.dietary ?? [],
    allergens: data.allergens ?? [],
    completed: !!data.onboarding_completed,
  };
}

/** Upsert the signed-in user's preferences. No-op for guest / unconfigured. */
export async function saveProfile(profile: ProfileData): Promise<void> {
  const uid = await currentUserId();
  if (!uid) return;
  await supabase.from('profiles').upsert({
    id: uid,
    skill: profile.skill,
    dietary: profile.dietary,
    allergens: profile.allergens,
    onboarding_completed: profile.completed,
    updated_at: new Date().toISOString(),
  });
}
