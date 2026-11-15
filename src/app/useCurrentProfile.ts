import { useQuery } from '@tanstack/react-query';
import { getCurrentProfile } from '../lib/api/profile';
import { useAuth } from './AuthProvider';

export function useCurrentProfile() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => {
      if (!userId) throw new Error('A signed-in user is required to load the profile.');
      return getCurrentProfile(userId);
    },
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
}
