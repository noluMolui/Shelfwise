
-- Prevent deletion of suppliers linked to active products.

create or replace function public.block_supplier_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.products p
    where p.supplier_id = old.id
      and p.business_id = old.business_id
      and p.is_archived = false
  ) then
    raise exception using
      message = 'supplier_in_use',
      errcode = '23503',
      detail = 'This supplier is linked to active products and cannot be deleted.';
  end if;

  return old;
end;
$$;

create trigger prevent_supplier_delete_when_in_use
before delete on public.suppliers
for each row
execute function public.block_supplier_delete();

-- The function is only intended to run through its trigger.
revoke all on function public.block_supplier_delete()
from public, anon, authenticated;
