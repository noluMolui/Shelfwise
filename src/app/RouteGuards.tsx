import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useCurrentProfile } from './useCurrentProfile';

function LoadingPage() {
  return (
    <main className="center-state" role="status">
      <span className="loading-spinner" aria-hidden="true" />
      <span>Loading ShelfWise…</span>
    </main>
  );
}

export function RequireSession() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingPage />;
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

export function RequireProfile() {
  const profile = useCurrentProfile();
  if (profile.isLoading) return <LoadingPage />;
  if (!profile.data) {
    return (
      <main className="center-state">
        <p role="alert">We couldn’t load your business profile. Please contact your administrator.</p>
        <button className="text-button" type="button" onClick={() => void profile.refetch()}>
          Try again
        </button>
      </main>
    );
  }
  return <Outlet />;
}

export function RequireOwner() {
  const profile = useCurrentProfile();
  if (profile.isLoading) return <LoadingPage />;
  if (profile.data?.role !== 'business_owner') return <Navigate to="/products" replace />;
  return <Outlet />;
}
