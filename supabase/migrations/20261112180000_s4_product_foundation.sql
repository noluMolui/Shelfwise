create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 1 and 120),
  created_at timestamptz not null default now()
);

create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  business_id uuid not null references public.businesses(id) on delete restrict,
  full_name text not null check (length(btrim(full_name)) between 1 and 120),
  role text not null check (role in ('business_owner', 'staff_member')),
  created_at timestamptz not null default now()
);

create index user_profiles_business_id_idx on public.user_profiles (business_id);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  name text not null check (length(btrim(name)) between 1 and 120),
  contact_person text check (contact_person is null or length(contact_person) <= 120),
  email text check (email is null or email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  phone text check (phone is null or phone ~ '^\+27[0-9]{9}$'),
  created_at timestamptz not null default now(),
  unique (id, business_id)
);

create index suppliers_business_name_idx on public.suppliers (business_id, name);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  name text not null check (length(btrim(name)) between 1 and 120),
  sku text not null check (sku = btrim(sku) and length(sku) between 1 and 60),
  category text not null check (
    category in ('Stationery', 'Beverages', 'Electronics', 'Hardware', 'Consumables', 'General')
  ),
  description text check (description is null or length(description) <= 1000),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  quantity integer not null default 0 check (quantity >= 0),
  low_stock_threshold integer check (low_stock_threshold is null or low_stock_threshold >= 0),
  supplier_id uuid,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, business_id),
  unique (business_id, sku),
  foreign key (supplier_id, business_id)
    references public.suppliers(id, business_id)
    on delete set null (supplier_id)
);

create index products_business_name_idx on public.products (business_id, name);
create index products_business_archived_idx on public.products (business_id, is_archived);
create index products_supplier_id_idx on public.products (supplier_id);

create or replace function public.current_business_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select profile.business_id
  from public.user_profiles as profile
  where profile.id = (select auth.uid())
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select profile.role
  from public.user_profiles as profile
  where profile.id = (select auth.uid())
$$;

alter table public.suppliers
  alter column business_id set default public.current_business_id();
alter table public.products
  alter column business_id set default public.current_business_id();

alter table public.businesses enable row level security;
alter table public.user_profiles enable row level security;
alter table public.suppliers enable row level security;
alter table public.products enable row level security;

create policy "Members can read their business"
on public.businesses for select to authenticated
using (id = (select public.current_business_id()));

create policy "Owners can update their business"
on public.businesses for update to authenticated
using (
  id = (select public.current_business_id())
  and (select public.current_user_role()) = 'business_owner'
)
with check (
  id = (select public.current_business_id())
  and (select public.current_user_role()) = 'business_owner'
);

create policy "Members can read profiles in their business"
on public.user_profiles for select to authenticated
using (business_id = (select public.current_business_id()));

create policy "Members can read their suppliers"
on public.suppliers for select to authenticated
using (business_id = (select public.current_business_id()));

create policy "Owners can create suppliers"
on public.suppliers for insert to authenticated
with check (
  business_id = (select public.current_business_id())
  and (select public.current_user_role()) = 'business_owner'
);

create policy "Owners can update suppliers"
on public.suppliers for update to authenticated
using (
  business_id = (select public.current_business_id())
  and (select public.current_user_role()) = 'business_owner'
)
with check (
  business_id = (select public.current_business_id())
  and (select public.current_user_role()) = 'business_owner'
);

create policy "Owners can delete suppliers"
on public.suppliers for delete to authenticated
using (
  business_id = (select public.current_business_id())
  and (select public.current_user_role()) = 'business_owner'
);

create policy "Members can read products in their business"
on public.products for select to authenticated
using (business_id = (select public.current_business_id()));

create policy "Owners can create products"
on public.products for insert to authenticated
with check (
  business_id = (select public.current_business_id())
  and (select public.current_user_role()) = 'business_owner'
);

create policy "Owners can update products"
on public.products for update to authenticated
using (
  business_id = (select public.current_business_id())
  and (select public.current_user_role()) = 'business_owner'
)
with check (
  business_id = (select public.current_business_id())
  and (select public.current_user_role()) = 'business_owner'
);

revoke all on public.businesses, public.user_profiles, public.suppliers, public.products
  from anon, public;
grant select on public.businesses, public.user_profiles, public.suppliers, public.products
  to authenticated;
grant insert, update, delete on public.suppliers to authenticated;
grant insert (name, sku, category, description, unit_price, low_stock_threshold, supplier_id)
  on public.products to authenticated;
grant update (name, sku, category, description, unit_price, low_stock_threshold, supplier_id, is_archived)
  on public.products to authenticated;
revoke all on function public.current_business_id() from public, anon;
revoke all on function public.current_user_role() from public, anon;
grant execute on function public.current_business_id() to authenticated;
grant execute on function public.current_user_role() to authenticated;

create or replace function public.set_products_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_products_updated_at();

revoke all on function public.set_products_updated_at() from public, anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  business_id uuid;
  full_name text;
  role text;
  business_name text;
begin
  full_name := nullif(btrim(new.raw_user_meta_data ->> 'full_name'), '');
  if new.raw_app_meta_data ? 'business_id' then
    business_id := (new.raw_app_meta_data ->> 'business_id')::uuid;
    role := coalesce(new.raw_app_meta_data ->> 'role', 'staff_member');
    insert into public.user_profiles (id, business_id, full_name, role)
    values (new.id, business_id, coalesce(full_name, 'ShelfWise User'), role);
  else
    business_name := nullif(btrim(new.raw_user_meta_data ->> 'business_name'), '');
    if business_name is null or full_name is null then
      raise exception 'business_name and full_name are required';
    end if;
    insert into public.businesses (name)
    values (business_name)
    returning id into business_id;
    insert into public.user_profiles (id, business_id, full_name, role)
    values (new.id, business_id, full_name, 'business_owner');
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

revoke all on function public.handle_new_user() from public, anon, authenticated;
