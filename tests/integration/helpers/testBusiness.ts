import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { loadEnv } from 'vite';
import { getSupabaseClient } from '../../../src/lib/supabase/client';
import type { Database } from '../../../src/lib/database.types';

const testEnvironment = loadEnv('test', '.', '');

type TestBusiness = {
  adminClient: SupabaseClient<Database>;
  ownerClient: SupabaseClient<Database>;
  businessId: string;
  createIndependentOwnerClient: () => Promise<SupabaseClient<Database>>;
  cleanup: () => Promise<void>;
};

function requiredEnv(name: string): string {
  const value = testEnvironment[name];
  if (!value || value.startsWith('replace-with-')) {
    throw new Error(`Set ${name} to a local Supabase test value before running integration tests.`);
  }
  return value;
}

function assertLocalSupabaseConfig(url: string): void {
  const localUrl = new URL(url);
  const localHosts = ['localhost', '127.0.0.1', '[::1]'];
  if (!localHosts.includes(localUrl.hostname)) {
    throw new Error('Integration tests may only run against a local Supabase instance.');
  }

  const browserUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!browserUrl) {
    throw new Error('Set VITE_SUPABASE_URL in .env before running integration tests.');
  }
  const appApiUrl = new URL(browserUrl);
  if (
    appApiUrl.protocol !== localUrl.protocol ||
    appApiUrl.port !== localUrl.port ||
    !localHosts.includes(appApiUrl.hostname)
  ) {
    throw new Error('VITE_SUPABASE_URL and SUPABASE_URL must both point to local Supabase.');
  }
}

export async function createTestBusiness(): Promise<TestBusiness> {
  const supabaseUrl = requiredEnv('SUPABASE_URL');
  const anonKey = requiredEnv('VITE_SUPABASE_ANON_KEY');
  const serviceRoleKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  const password = requiredEnv('SEED_TEST_PASSWORD');
  assertLocalSupabaseConfig(supabaseUrl);

  const authOptions = {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  };
  const adminClient = createClient<Database>(supabaseUrl, serviceRoleKey, authOptions);
  const email = `integration-${crypto.randomUUID()}@example.com`;
  const { data: userData, error: createUserError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: 'Integration Test Owner',
      business_name: `Integration Business ${crypto.randomUUID()}`,
    },
  });
  if (createUserError) throw createUserError;

  const { data: profile, error: profileError } = await adminClient
    .from('user_profiles')
    .select('business_id')
    .eq('id', userData.user.id)
    .single();
  if (profileError) throw profileError;

  const ownerClient = getSupabaseClient();
  const { error: signInError } = await ownerClient.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;

  const independentClients: SupabaseClient<Database>[] = [];
  return {
    adminClient,
    ownerClient,
    businessId: profile.business_id,
    async createIndependentOwnerClient() {
      const client = createClient<Database>(supabaseUrl, anonKey, authOptions);
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      independentClients.push(client);
      return client;
    },
    async cleanup() {
      const results = await Promise.all([
        ownerClient.auth.signOut(),
        ...independentClients.map((client) => client.auth.signOut()),
      ]);
      const failedSignOut = results.find(({ error }) => error);
      if (failedSignOut?.error) throw failedSignOut.error;
    },
  };
}
