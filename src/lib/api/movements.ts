import type {
  MovementType,
  StockMovement,
} from '../database.types';
import { getSupabaseClient } from '../supabase/client';
import { messages } from '../messages';

const pageSize = 20;

export type StockMovementPage = {
  movements: StockMovement[];
  hasMore: boolean;
  totalCount: number;
};

export type StockMovementFilters = {
  page: number;
  movementType: MovementType | '';
  fromDate: string;
  toDate: string;
};

export type ActiveProductOption = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
};

export type RecordStockMovementInput = {
  productId: string;
  movementType: MovementType;
  quantity: number;
  note: string | null;
};

function sastStartOfDay(date: string): string {
  return new Date(`${date}T00:00:00+02:00`).toISOString();
}

function nextCalendarDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
}

function sastStartOfNextDay(date: string): string {
  return sastStartOfDay(nextCalendarDate(date));
}

function getMovementSaveError(error: { code?: string; message?: string }): string {
  const details = `${error.code ?? ''} ${error.message ?? ''}`.toLowerCase();
  if (details.includes('insufficient_stock')) return messages.insufficientStock;
  if (details.includes('invalid_quantity') || error.code === '23514') {
    return messages.invalidMovementQuantity;
  }
  if (error.code === '42501' || error.code === 'PGRST301') return messages.notAllowed;
  if (/failed to fetch|network|fetch error|offline/.test(details)) return messages.offline;
  return messages.recordMovementError;
}

export async function listStockMovements(
  filters: StockMovementFilters,
): Promise<StockMovementPage> {
  const { page, movementType, fromDate, toDate } = filters;
  let query = getSupabaseClient()
    .from('stock_movements')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (movementType) query = query.eq('movement_type', movementType);
  if (fromDate) query = query.gte('created_at', sastStartOfDay(fromDate));
  if (toDate) query = query.lt('created_at', sastStartOfNextDay(toDate));

  const { data, error, count } = await query;
  if (error) throw error;

  const movements = data ?? [];
  if (movements.length === 0) {
    return { movements: [], hasMore: false, totalCount: count ?? 0 };
  }

  const productIds = [...new Set(movements.map(({ product_id }) => product_id))];
  const userIds = [...new Set(movements.map(({ user_id }) => user_id))];
  const [productsResult, profilesResult] = await Promise.all([
    getSupabaseClient().from('products').select('id, name, sku').in('id', productIds),
    getSupabaseClient().from('user_profiles').select('id, full_name').in('id', userIds),
  ]);
  if (productsResult.error) throw productsResult.error;
  if (profilesResult.error) throw profilesResult.error;

  const products = new Map((productsResult.data ?? []).map((product) => [product.id, product]));
  const profiles = new Map((profilesResult.data ?? []).map((profile) => [profile.id, profile]));
  const enriched = movements.map((movement) => ({
    ...movement,
    product: products.get(movement.product_id),
    recorder: profiles.get(movement.user_id),
  }));

  return {
    movements: enriched,
    hasMore: (count ?? 0) > (page + 1) * pageSize,
    totalCount: count ?? enriched.length,
  };
}

export async function listActiveProducts(): Promise<ActiveProductOption[]> {
  const { data, error } = await getSupabaseClient()
    .from('products')
    .select('id, name, sku, quantity')
    .eq('is_archived', false)
    .order('name');

  if (error) throw error;
  return data ?? [];
}

export async function recordStockMovement(
  input: RecordStockMovementInput,
): Promise<StockMovement> {
  let result;
  try {
    result = await getSupabaseClient()
      .from('stock_movements')
      .insert({
        product_id: input.productId,
        movement_type: input.movementType,
        quantity: input.quantity,
        note: input.note,
      })
      .select('*')
      .single();
  } catch (error) {
    if (error instanceof TypeError && /fetch|network/i.test(error.message)) {
      throw new Error(messages.offline, { cause: error });
    }
    throw error;
  }

  if (result.error) throw new Error(getMovementSaveError(result.error));
  return result.data;
}
