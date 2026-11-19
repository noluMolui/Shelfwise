begin;

select plan(15);

insert into public.businesses (id, name)
values
  ('10000000-0000-0000-0000-000000000091', 'Policy Test A'),
  ('10000000-0000-0000-0000-000000000092', 'Policy Test B');

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000091',
    'authenticated', 'authenticated', 'policy-owner@example.com', '',
    '{"business_id":"10000000-0000-0000-0000-000000000091","role":"business_owner"}'::jsonb,
    '{"full_name":"Owner"}'::jsonb, now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000092',
    'authenticated', 'authenticated', 'policy-staff@example.com', '',
    '{"business_id":"10000000-0000-0000-0000-000000000091","role":"staff_member"}'::jsonb,
    '{"full_name":"Staff"}'::jsonb, now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000093',
    'authenticated', 'authenticated', 'policy-other@example.com', '',
    '{"business_id":"10000000-0000-0000-0000-000000000092","role":"business_owner"}'::jsonb,
    '{"full_name":"Other"}'::jsonb, now(), now()
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000091', true);

select is(
  (select count(*)::integer from public.businesses),
  1,
  'a member can read only their own business'
);
select is(
  (select count(*)::integer from public.user_profiles),
  2,
  'a member can read profiles from their business only'
);
select lives_ok(
  $$ update public.user_profiles set full_name = 'Updated Owner'
     where id = '20000000-0000-0000-0000-000000000091' $$,
  'a member can update their own profile name'
);
select is(
  (select full_name from public.user_profiles where id = '20000000-0000-0000-0000-000000000091'),
  'Updated Owner',
  'the own-name update is saved'
);
select lives_ok(
  $$ update public.user_profiles set full_name = 'Must Not Change'
     where id = '20000000-0000-0000-0000-000000000092' $$,
  'updating another member profile affects no accessible row'
);
select is(
  (select full_name from public.user_profiles where id = '20000000-0000-0000-0000-000000000092'),
  'Staff',
  'another member profile remains unchanged'
);
select ok(
  not has_column_privilege('authenticated', 'public.user_profiles', 'role', 'UPDATE'),
  'members cannot change profile roles'
);
select ok(
  not has_column_privilege('authenticated', 'public.user_profiles', 'business_id', 'UPDATE'),
  'members cannot move profiles between businesses'
);
select ok(
  not has_table_privilege('authenticated', 'public.user_profiles', 'INSERT'),
  'members cannot insert profiles through the API'
);
select ok(
  not has_table_privilege('authenticated', 'public.user_profiles', 'DELETE'),
  'members cannot delete profiles through the API'
);
select lives_ok(
  $$ update public.businesses set name = 'Updated Policy Test A'
     where id = '10000000-0000-0000-0000-000000000091' $$,
  'an owner can update their business name'
);
select is(
  (select name from public.businesses where id = '10000000-0000-0000-0000-000000000091'),
  'Updated Policy Test A',
  'the owner business-name update is saved'
);

select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000092', true);
select lives_ok(
  $$ update public.businesses set name = 'Staff Must Not Change This'
     where id = '10000000-0000-0000-0000-000000000091' $$,
  'a staff update is safely filtered by row-level security'
);
select is(
  (select name from public.businesses where id = '10000000-0000-0000-0000-000000000091'),
  'Updated Policy Test A',
  'staff cannot change the business name'
);
select is(
  (select count(*)::integer from public.businesses),
  1,
  'staff still see only their own business'
);

reset role;
select * from finish();
rollback;
