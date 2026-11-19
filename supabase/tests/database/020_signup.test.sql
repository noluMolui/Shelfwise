begin;

select plan(5);

insert into public.businesses (id, name)
values ('10000000-0000-0000-0000-000000000099', 'Existing Test Business');

select lives_ok(
  $$
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      '20000000-0000-0000-0000-000000000099',
      'authenticated', 'authenticated', 'signup-test@example.com', '',
      '{}'::jsonb,
      '{"full_name":"Test Owner","business_name":"New Test Business","business_id":"10000000-0000-0000-0000-000000000099","role":"staff_member"}'::jsonb,
      now(), now()
    )
  $$,
  'sign-up creates a user even when untrusted metadata includes a business and role'
);

select is(
  (select role from public.user_profiles where id = '20000000-0000-0000-0000-000000000099'),
  'business_owner',
  'untrusted metadata cannot select the user role'
);

select isnt(
  (select business_id from public.user_profiles where id = '20000000-0000-0000-0000-000000000099'),
  '10000000-0000-0000-0000-000000000099'::uuid,
  'untrusted metadata cannot join an existing business'
);

select is(
  (
    select business.name
    from public.user_profiles as profile
    join public.businesses as business on business.id = profile.business_id
    where profile.id = '20000000-0000-0000-0000-000000000099'
  ),
  'New Test Business',
  'sign-up creates the requested business'
);

select is(
  (select full_name from public.user_profiles where id = '20000000-0000-0000-0000-000000000099'),
  'Test Owner',
  'sign-up creates the owner profile'
);

select * from finish();
rollback;
