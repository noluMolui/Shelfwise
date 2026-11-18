# Integration tests

These tests exercise the app API and database policies against a local Supabase
instance. They create random businesses and users; stock movements are
immutable, so the test data is cleared by resetting the local database.

1. Start the local services required by these tests:
   `npx supabase start --exclude realtime,storage-api,imgproxy,studio,postgres-meta,edge-runtime,logflare,vector,mailpit,supavisor`
2. Put `SUPABASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, and `SEED_TEST_PASSWORD` in
   `.env.test.local` so these local-only values do not replace the app's
   regular environment. Both URLs must be `http://127.0.0.1:54321`; use the
   local `ANON_KEY` and `SERVICE_ROLE_KEY` from `npx supabase status`.
3. Run `npm run db:fresh` to apply migrations and clear prior test data.
4. Run `npm run test:integration`.

The test helper refuses non-local Supabase URLs. Never point these tests at a
hosted project; the service-role key is only used for local test setup.
