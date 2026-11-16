import { useQuery } from '@tanstack/react-query';
import { useOnlineStatus } from './useOnlineStatus';
import { getDashboardSummary } from '../lib/api/dashboard';

export function useDashboardSummary() {
  const online = useOnlineStatus();
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardSummary,
    enabled: online,
  });

  return { ...query, online };
}
