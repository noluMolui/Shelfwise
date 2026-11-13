import type { UserProfile } from '../database.types';
import { getSupabaseClient } from '../supabase/client';

export async function getCurrentProfile(userId: string): Promise<UserProfile> {
  const supabase = getSupabaseClient();
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('id, business_id, full_name, role, created_at')
    .eq('id', userId)
    .single();

  if (error) throw error;

  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('name')
    .eq('id', profile.business_id)
    .single();

  if (businessError) throw businessError;

  return { ...profile, business_name: business.name };
}
