import { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/common/AppHeader';
import { Button } from '../components/common/Button';
import { MainNavigation } from '../components/common/MainNavigation';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { SelectField } from '../components/common/SelectField';
import { TextField } from '../components/common/TextField';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { listStockMovements } from '../lib/api/movements';
import type { MovementType, StockMovement } from '../lib/database.types';
import { messages } from '../lib/messages';

const movementTypeOptions = [
  { value: 'incoming', label: 'Incoming' },
  { value: 'outgoing', label: 'Outgoing' },
];

function formatSastTimestamp(value: string): string {
  return new Intl.DateTimeFormat('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Johannesburg',
  }).format(new Date(value));
}

function MovementRows({ movements }: { movements: StockMovement[] }) {
  return (
    <div className="table-scroll">
      <table className="movement-table">
        <thead>
          <tr>
            <th scope="col">Date/time (SAST)</th>
            <th scope="col">Product name</th>
            <th scope="col">SKU</th>
            <th scope="col">Movement type</th>
            <th scope="col">Quantity</th>
            <th scope="col">Recorded by</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((movement) => (
            <tr key={movement.id}>
              <td data-label="Date/time (SAST)">{formatSastTimestamp(movement.created_at)}</td>
              <td data-label="Product name">{movement.product?.name ?? 'Unknown product'}</td>
              <td data-label="SKU">{movement.product?.sku ?? '—'}</td>
              <td data-label="Movement type">
                <span className={`movement-badge movement-badge--${movement.movement_type}`}>
                  {movement.movement_type === 'incoming' ? 'Incoming' : 'Outgoing'}
                </span>
              </td>
              <td data-label="Quantity">{movement.quantity}</td>
              <td data-label="Recorded by">{movement.recorder?.full_name ?? 'Unknown user'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StockMovementsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const [movementType, setMovementType] = useState<MovementType | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [toast, setToast] = useState<string | null>(() => {
    const state = location.state as { message?: string } | null;
    return state?.message ?? null;
  });

  const movementsQuery = useInfiniteQuery({
    queryKey: ['stockMovements', movementType, fromDate, toDate],
    enabled: online,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      listStockMovements({ page: pageParam, movementType, fromDate, toDate }),
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
  });
  const movements = movementsQuery.data?.pages.flatMap((page) => page.movements) ?? [];
  const totalCount = movementsQuery.data?.pages[0]?.totalCount ?? 0;

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function dismissToast() {
    setToast(null);
    if (location.state) navigate(location.pathname, { replace: true, state: null });
  }

  return (
    <>
      <AppHeader title="Stock" signedIn />
      <div className="app-layout">
        <MainNavigation />
        <main className="page-shell">
          <div className="page-heading-row">
            <div>
              <p className="eyebrow">INVENTORY</p>
              <h1 className="page-title">Stock Movements</h1>
              <p className="page-subtitle">Audit log of inventory changes and dispatches.</p>
            </div>
            <Link to="/stock/new" className="button button--primary button--link">
              + Record movement
            </Link>
          </div>

          {!online ? (
            <OfflineBanner message={messages.offlineMovementsRead} />
          ) : null}
          {toast ? (
            <div className="notice notice--success movement-toast" role="status">
              <span>{toast}</span>
              <button
                type="button"
                className="toast__dismiss"
                onClick={dismissToast}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          ) : null}

          <section className="panel catalogue-panel movement-panel" aria-label="Stock movements">
            <div className="movement-toolbar">
              <div className="movement-filters">
                <SelectField
                  label="Movement type"
                  name="movementType"
                  value={movementType}
                  onChange={(event) => setMovementType(event.target.value as MovementType | '')}
                  placeholder="All types"
                  options={movementTypeOptions}
                />
                <TextField
                  label="From"
                  name="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                />
                <TextField
                  label="To"
                  name="toDate"
                  type="date"
                  min={fromDate || undefined}
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                />
              </div>
              <span className="movement-count">{totalCount} {totalCount === 1 ? 'record' : 'records'} (SAST)</span>
            </div>

            {movementsQuery.isLoading ? (
              <div className="movement-loading" role="status" aria-label="Loading stock activity">
                <span className="loading-spinner" aria-hidden="true" />
                Loading stock activity…
              </div>
            ) : null}
            {movementsQuery.isError ? (
              <div className="notice notice--error movement-error" role="alert">
                <span>{messages.loadMovementsError}</span>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => void movementsQuery.refetch()}
                >
                  Retry
                </button>
              </div>
            ) : null}
            {!movementsQuery.isLoading && movements.length === 0 && !movementsQuery.isError ? (
              <div className="empty-state movement-empty">
                <h2>
                  {!online && !movementsQuery.data
                    ? 'No cached stock activity is available.'
                    : movementType || fromDate || toDate
                    ? 'No stock movements match these filters.'
                    : 'No stock movements have been recorded yet.'}
                </h2>
                <p>
                  {!online && !movementsQuery.data
                    ? 'Reconnect to load your stock history.'
                    : 'Stock adjustments, inventory received, and dispatch history will display here.'}
                </p>
                {online ? (
                  <Link to="/stock/new" className="button button--primary button--link">
                    + Record movement
                  </Link>
                ) : null}
              </div>
            ) : null}
            {movements.length > 0 ? (
              <>
                <MovementRows movements={movements} />
                <div className="movement-list-footer">
                  <span>Showing {movements.length} of {totalCount} movements</span>
                  {movementsQuery.hasNextPage ? (
                    <Button
                      variant="secondary"
                      loading={movementsQuery.isFetchingNextPage}
                      onClick={() => void movementsQuery.fetchNextPage()}
                    >
                      Load more
                    </Button>
                  ) : (
                    <span>All dates displayed in South African Standard Time (SAST)</span>
                  )}
                </div>
              </>
            ) : null}
          </section>
        </main>
      </div>
    </>
  );
}
