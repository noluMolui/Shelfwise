import { createClient } from '@supabase/supabase-js';

const seedUserIds = [
  '20000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000003',
  '20000000-0000-0000-0000-000000000004',
  '20000000-0000-0000-0000-000000000005',
];

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const seedPassword = process.env.SEED_TEST_PASSWORD;

if (!supabaseUrl || !serviceRoleKey || !seedPassword) {
  throw new Error('Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SEED_TEST_PASSWORD in .env.');
}

if (seedPassword.length < 6) {
  throw new Error('SEED_TEST_PASSWORD must be at least 6 characters.');
}

const localHosts = ['localhost', '127.0.0.1', '[::1]'];
if (!localHosts.includes(new URL(supabaseUrl).hostname)) {
  throw new Error('Seed passwords may only be set against a local Supabase instance.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

for (const userId of seedUserIds) {
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: seedPassword,
  });
  if (error) {
    throw new Error(`Could not set the password for seed user ${userId}: ${error.message}`);
  }
}
