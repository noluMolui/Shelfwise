create or replace function public.get_low_stock_products()
returns table (
  id uuid,
  name text,
  sku text,
  category text,
  quantity integer,
  low_stock_threshold integer
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    product.id,
    product.name,
    product.sku,
    product.category,
    product.quantity,
    product.low_stock_threshold
  from public.products as product
  where not product.is_archived
    and product.low_stock_threshold is not null
    and product.quantity <= product.low_stock_threshold
  order by product.quantity asc, product.name asc, product.id asc;
$$;

revoke all on function public.get_low_stock_products() from public, anon;
grant execute on function public.get_low_stock_products() to authenticated;
