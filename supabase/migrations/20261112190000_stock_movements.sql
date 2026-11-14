create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null default public.current_business_id()
    references public.businesses(id) on delete restrict,
  product_id uuid not null,
  user_id uuid not null default auth.uid()
    references public.user_profiles(id) on delete restrict,
  movement_type text not null check (movement_type in ('incoming', 'outgoing')),
  quantity integer not null check (quantity > 0),
  note text check (note is null or length(note) <= 500),
  created_at timestamptz not null default now(),
  foreign key (product_id, business_id)
    references public.products(id, business_id) on delete restrict
);

create index stock_movements_business_created_idx
  on public.stock_movements (business_id, created_at desc, id desc);
create index stock_movements_product_id_idx
  on public.stock_movements (product_id);

alter table public.stock_movements enable row level security;

create policy "Members can read stock movements in their business"
on public.stock_movements for select to authenticated
using (business_id = (select public.current_business_id()));

create policy "Members can record stock movements in their business"
on public.stock_movements for insert to authenticated
with check (
  business_id = (select public.current_business_id())
  and user_id = (select auth.uid())
  and (select public.current_user_role()) in ('business_owner', 'staff_member')
);

revoke all on public.stock_movements from anon, public;
grant select on public.stock_movements to authenticated;
grant insert (product_id, movement_type, quantity, note)
  on public.stock_movements to authenticated;

create or replace function public.apply_stock_movement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_quantity integer;
  is_archived boolean;
begin
  if new.business_id <> (select public.current_business_id())
    or new.user_id <> (select auth.uid())
    or (select public.current_user_role()) not in ('business_owner', 'staff_member') then
    raise exception using errcode = '42501', message = 'movement_not_allowed';
  end if;

  select product.quantity, product.is_archived
    into current_quantity, is_archived
    from public.products as product
    where product.id = new.product_id
      and product.business_id = new.business_id
    for update;

  if not found or is_archived then
    raise exception using message = 'product_archived';
  end if;

  if new.movement_type = 'outgoing' and new.quantity > current_quantity then
    raise exception using message = 'insufficient_stock';
  end if;

  update public.products
    set quantity = case
      when new.movement_type = 'incoming' then quantity + new.quantity
      else quantity - new.quantity
    end
    where id = new.product_id
      and business_id = new.business_id;

  return new;
end;
$$;

create trigger apply_stock_movement
before insert on public.stock_movements
for each row execute function public.apply_stock_movement();

create or replace function public.prevent_stock_movement_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception using message = 'movement_immutable';
end;
$$;

create trigger stock_movements_immutable
before update or delete on public.stock_movements
for each row execute function public.prevent_stock_movement_mutation();

revoke all on function public.apply_stock_movement() from public, anon, authenticated;
revoke all on function public.prevent_stock_movement_mutation() from public, anon, authenticated;
