import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DashboardMovement } from '../../lib/api/dashboard';

function formatMovementDate(value: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Africa/Johannesburg',
  }).format(new Date(value));
}

export function RecentActivityList({ movements }: { movements: DashboardMovement[] }) {
  return (
    <section className="dashboard-activity panel" aria-labelledby="recent-activity-title">
      <div className="dashboard-activity__heading">
        <div>
          <p className="eyebrow">INVENTORY</p>
          <h2 id="recent-activity-title">Recent Stock Activity</h2>
        </div>
        <Link className="dashboard-activity__all" to="/stock">View all movements</Link>
      </div>
      {movements.length ? (
        <ul className="dashboard-activity__list">
          {movements.map((movement, index) => {
            const IncomingIcon = ArrowDownLeft;
            const OutgoingIcon = ArrowUpRight;
            const Icon = movement.movement_type === 'incoming' ? IncomingIcon : OutgoingIcon;
            const movementLabel = movement.movement_type === 'incoming' ? 'Incoming' : 'Outgoing';
            return (
              <li className="dashboard-activity__row" key={`${movement.created_at}-${movement.product_name}-${index}`}>
                <time dateTime={movement.created_at}>{formatMovementDate(movement.created_at)}</time>
                <span className="dashboard-activity__product">{movement.product_name}</span>
                <span className={`dashboard-activity__type dashboard-activity__type--${movement.movement_type}`}>
                  <Icon size={17} aria-hidden="true" />
                  {movementLabel}
                </span>
                <span className="dashboard-activity__quantity">{movement.quantity}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="dashboard-activity__empty">No recent stock activity.</p>
      )}
    </section>
  );
}
