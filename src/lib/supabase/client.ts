import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before using Supabase.",
  );
}

/**
 * Browser client uses only public VITE_ variables.
 * Never add a service-role key to this module or any code under src/.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
