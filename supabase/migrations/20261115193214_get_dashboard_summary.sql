create or replace function public.get_dashboard_summary()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'total_products',
    (
      select count(*)
      from public.products as product
      where not product.is_archived
    ),
    'inventory_value',
    coalesce(
      (
        select sum(product.unit_price * product.quantity)
        from public.products as product
        where not product.is_archived
      ),
      0
    ),
    'low_stock_count',
    (
      select count(*)
      from public.products as product
      where not product.is_archived
        and product.low_stock_threshold is not null
        and product.quantity <= product.low_stock_threshold
    ),
    'recent_movement_count',
    (
      select count(*)
      from public.stock_movements as movement
      where movement.created_at >= now() - interval '7 days'
        and movement.created_at <= now()
    ),
    'recent_movements',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'created_at', recent.created_at,
            'product_name', recent.product_name,
            'movement_type', recent.movement_type,
            'quantity', recent.quantity
          )
          order by recent.created_at desc, recent.id desc
        )
        from (
          select
            movement.id,
            movement.created_at,
            product.name as product_name,
            movement.movement_type,
            movement.quantity
          from public.stock_movements as movement
          join public.products as product
            on product.id = movement.product_id
          order by movement.created_at desc, movement.id desc
          limit 5
        ) as recent
      ),
      '[]'::jsonb
    )
  );
$$;

revoke all on function public.get_dashboard_summary() from public, anon;
grant execute on function public.get_dashboard_summary() to authenticated;
