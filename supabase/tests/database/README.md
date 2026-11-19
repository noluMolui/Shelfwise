# Database tests

The pgTAP tests here check database behavior and permissions. CI starts a local
Supabase instance and runs `npx supabase test db` on pull requests and pushes to
main. To run them locally, start Supabase with `npx supabase start` first, then
run `npx supabase test db`.
