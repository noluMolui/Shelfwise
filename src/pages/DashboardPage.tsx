import { Activity, AlertTriangle, CircleDollarSign, Package } from 'lucide-react';
import { AppHeader } from '../components/common/AppHeader';
import { MainNavigation } from '../components/common/MainNavigation';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { Button } from '../components/common/Button';
import { DashboardEmpty } from '../components/dashboard/DashboardEmpty';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { RecentActivityList } from '../components/dashboard/RecentActivityList';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { formatZar } from '../utils/format';
import '../components/dashboard/Dashboard.css';

const dashboardError = "We couldn't load your dashboard. Please try again.";
const offlineMessage = "You're offline. Showing only information already loaded.";

export function DashboardPage() {
  const query = useDashboardSummary();

  return (
    <>
      <AppHeader title="Dashboard" signedIn />
      <div className="app-layout">
        <MainNavigation />
        <main className="page-shell">
          <div className="page-heading-row">
            <div>
              <p className="eyebrow">OVERVIEW</p>
              <h1 className="page-title">Dashboard</h1>
              <p className="page-subtitle">A snapshot of your inventory and recent activity.</p>
            </div>
          </div>

          {!query.online ? <OfflineBanner message={offlineMessage} /> : null}

          {query.isPending && query.online ? <DashboardSkeleton /> : null}

          {query.isError && !query.data ? (
            <div className="notice notice--error dashboard-error" role="alert">
              <span>{dashboardError}</span>
              <Button type="button" onClick={() => void query.refetch()}>Retry</Button>
            </div>
          ) : null}

          {query.data?.total_products === 0 ? <DashboardEmpty /> : null}

          {query.data && query.data.total_products > 0 ? (
            <>
              <section className="dashboard-summary-grid" aria-label="Inventory summary">
                <SummaryCard
                  title="Total Products"
                  value={query.data.total_products}
                  Icon={Package}
                  to="/products"
                />
                <SummaryCard
                  title="Inventory Value"
                  value={formatZar(query.data.inventory_value)}
                  Icon={CircleDollarSign}
                />
                <SummaryCard
                  title="Low-Stock Products"
                  value={query.data.low_stock_count}
                  Icon={AlertTriangle}
                  to="/low-stock"
                  warning
                />
                <SummaryCard
                  title="Recent Stock Activity"
                  value={query.data.recent_movement_count}
                  Icon={Activity}
                  to="/stock"
                />
              </section>
              <RecentActivityList movements={query.data.recent_movements} />
            </>
          ) : null}
        </main>
      </div>
    </>
  );
}
