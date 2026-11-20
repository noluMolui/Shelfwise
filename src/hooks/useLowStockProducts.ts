import { useQuery } from '@tanstack/react-query';
import { useOnlineStatus } from './useOnlineStatus';
import { getLowStockProducts } from '../lib/api/lowStock';

export function useLowStockProducts() {
  const online = useOnlineStatus();
  const query = useQuery({
    queryKey: ['lowStockProducts'],
    queryFn: getLowStockProducts,
    enabled: online,
  });

  return { ...query, online };
}
