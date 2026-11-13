import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';
import { messages } from '../messages';

let client: SupabaseClient<Database> | undefined;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (client) return client;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey || anonKey.startsWith('replace-with-')) {
    throw new Error(messages.configurationError);
  }

  client = createClient<Database>(url, anonKey);
  return client;
}

export function hasSupabaseConfig(): boolean {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL &&
      import.meta.env.VITE_SUPABASE_ANON_KEY &&
      !import.meta.env.VITE_SUPABASE_ANON_KEY.startsWith('replace-with-'),
  );
}
