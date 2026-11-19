begin;

insert into public.businesses (id, name)
values
  ('10000000-0000-0000-0000-000000000001', 'Thandi''s Corner Shop (Test Data)'),
  ('10000000-0000-0000-0000-000000000002', 'Test Business B (Test Data)'),
  ('10000000-0000-0000-0000-000000000003', 'Empty Business (Test Data)');

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  email_change_token_current,
  email_change_confirm_status,
  reauthentication_token,
  phone_change_token,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'owner.a@example.com',
    '',
    now(),
    '',
    '',
    '',
    '',
    '',
    0,
    '',
    '',
    '{"provider":"email","providers":["email"],"business_id":"10000000-0000-0000-0000-000000000001","role":"business_owner"}',
    '{"full_name":"Owner A"}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'staff.a@example.com',
    '',
    now(),
    '',
    '',
    '',
    '',
    '',
    0,
    '',
    '',
    '{"provider":"email","providers":["email"],"business_id":"10000000-0000-0000-0000-000000000001","role":"staff_member"}',
    '{"full_name":"Staff A"}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000003',
    'authenticated',
    'authenticated',
    'owner.b@example.com',
    '',
    now(),
    '',
    '',
    '',
    '',
    '',
    0,
    '',
    '',
    '{"provider":"email","providers":["email"],"business_id":"10000000-0000-0000-0000-000000000002","role":"business_owner"}',
    '{"full_name":"Owner B"}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000004',
    'authenticated',
    'authenticated',
    'staff.b@example.com',
    '',
    now(),
    '',
    '',
    '',
    '',
    '',
    0,
    '',
    '',
    '{"provider":"email","providers":["email"],"business_id":"10000000-0000-0000-0000-000000000002","role":"staff_member"}',
    '{"full_name":"Staff B"}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000005',
    'authenticated',
    'authenticated',
    'owner.c@example.com',
    '',
    now(),
    '',
    '',
    '',
    '',
    '',
    0,
    '',
    '',
    '{"provider":"email","providers":["email"],"business_id":"10000000-0000-0000-0000-000000000003","role":"business_owner"}',
    '{"full_name":"Owner C"}',
    now(),
    now()
  );

insert into auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  created_at,
  updated_at
)
select
  seed_user.id,
  seed_user.email,
  seed_user.id,
  jsonb_build_object('sub', seed_user.id::text, 'email', seed_user.email, 'email_verified', true),
  'email',
  now(),
  now()
from (
  values
    ('20000000-0000-0000-0000-000000000001'::uuid, 'owner.a@example.com'),
    ('20000000-0000-0000-0000-000000000002'::uuid, 'staff.a@example.com'),
    ('20000000-0000-0000-0000-000000000003'::uuid, 'owner.b@example.com'),
    ('20000000-0000-0000-0000-000000000004'::uuid, 'staff.b@example.com'),
    ('20000000-0000-0000-0000-000000000005'::uuid, 'owner.c@example.com')
) as seed_user(id, email);

insert into public.suppliers (id, business_id, name, email, phone)
values
  (
    '30000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Mzansi Stationers',
    'orders@mzansi-stationers.example',
    '+27110000001'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'FreshSupply Distributors',
    'orders@freshsupply.example',
    '+27110000002'
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000001',
    'TechSource Wholesale',
    'orders@techsource.example',
    '+27110000003'
  ),
  (
    '30000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000002',
    'Business B Supplier',
    'orders@business-b.example',
    '+27110000004'
  );

insert into public.products (
  id,
  business_id,
  name,
  sku,
  category,
  unit_price,
  low_stock_threshold,
  supplier_id
)
values
  (
    '40000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'A4 Exercise Book',
    'ST001',
    'Stationery',
    25.00,
    10,
    '30000000-0000-0000-0000-000000000001'
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'Blue Ballpoint Pen',
    'ST002',
    'Stationery',
    8.50,
    10,
    '30000000-0000-0000-0000-000000000001'
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000001',
    '2L Bottled Water',
    'DR001',
    'Beverages',
    18.00,
    8,
    '30000000-0000-0000-0000-000000000002'
  ),
  (
    '40000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000001',
    'USB-C Cable',
    'EL001',
    'Electronics',
    79.00,
    5,
    '30000000-0000-0000-0000-000000000003'
  ),
  (
    '40000000-0000-0000-0000-000000000005',
    '10000000-0000-0000-0000-000000000002',
    'A4 Exercise Book',
    'ST001',
    'Stationery',
    25.00,
    10,
    '30000000-0000-0000-0000-000000000004'
  ),
  (
    '40000000-0000-0000-0000-000000000006',
    '10000000-0000-0000-0000-000000000002',
    'Business B Stapler',
    'GEN001',
    'General',
    45.00,
    null,
    '30000000-0000-0000-0000-000000000004'
  );

select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000001', true);

insert into public.stock_movements (
  business_id,
  product_id,
  user_id,
  movement_type,
  quantity,
  note,
  created_at
)
values
  (
    '10000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'incoming',
    20,
    'Opening stock',
    now() - interval '30 days'
  ),
  (
    '10000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    'incoming',
    10,
    'Opening stock',
    now() - interval '30 days'
  ),
  (
    '10000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000001',
    'incoming',
    24,
    'Opening stock',
    now() - interval '30 days'
  ),
  (
    '10000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000001',
    'incoming',
    5,
    'Opening stock',
    now() - interval '30 days'
  ),
  (
    '10000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'incoming',
    20,
    null,
    now() - interval '2 days'
  ),
  (
    '10000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    'outgoing',
    4,
    null,
    now() - interval '2 days' + interval '1 hour'
  ),
  (
    '10000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000001',
    'outgoing',
    2,
    null,
    now() - interval '2 days' + interval '2 hours'
  );

select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000003', true);

insert into public.stock_movements (
  business_id,
  product_id,
  user_id,
  movement_type,
  quantity,
  note
)
values (
  '10000000-0000-0000-0000-000000000002',
  '40000000-0000-0000-0000-000000000005',
  '20000000-0000-0000-0000-000000000003',
  'incoming',
  5,
  'Test business opening stock'
);

commit;
