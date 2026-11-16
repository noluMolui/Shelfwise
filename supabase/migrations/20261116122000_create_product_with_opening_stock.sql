create or replace function public.create_product_with_opening_stock(
  p_name text,
  p_sku text,
  p_category text,
  p_description text,
  p_unit_price numeric,
  p_low_stock_threshold integer,
  p_supplier_id uuid,
  p_opening_stock_quantity integer
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  created_product_id uuid;
begin
  if p_opening_stock_quantity is null or p_opening_stock_quantity < 0 then
    raise exception using
      errcode = '22023',
      message = 'invalid_opening_stock_quantity';
  end if;

  insert into public.products (
    name,
    sku,
    category,
    description,
    unit_price,
    low_stock_threshold,
    supplier_id
  )
  values (
    btrim(p_name),
    btrim(p_sku),
    p_category,
    nullif(btrim(coalesce(p_description, '')), ''),
    p_unit_price,
    p_low_stock_threshold,
    p_supplier_id
  )
  returning id into created_product_id;

  if p_opening_stock_quantity > 0 then
    insert into public.stock_movements (
      product_id,
      movement_type,
      quantity,
      note
    )
    values (
      created_product_id,
      'incoming',
      p_opening_stock_quantity,
      'Opening stock'
    );
  end if;

  return created_product_id;
end;
$$;

revoke all on function public.create_product_with_opening_stock(
  text, text, text, text, numeric, integer, uuid, integer
) from public, anon;
grant execute on function public.create_product_with_opening_stock(
  text, text, text, text, numeric, integer, uuid, integer
) to authenticated;
