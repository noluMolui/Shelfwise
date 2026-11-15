export function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton" role="status" aria-label="Loading dashboard">
      <span className="visually-hidden">Loading dashboard</span>
      <div className="dashboard-skeleton__cards" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => <div className="dashboard-skeleton-card" key={index} />)}
      </div>
      <div className="dashboard-skeleton__activity" aria-hidden="true">
        <div className="dashboard-skeleton-row" />
        <div className="dashboard-skeleton-row" />
        <div className="dashboard-skeleton-row" />
      </div>
    </div>
  );
}
