import { PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DashboardEmpty() {
  return (
    <section className="dashboard-empty panel" aria-labelledby="dashboard-empty-title">
      <span className="dashboard-empty__icon" aria-hidden="true"><PackageOpen size={30} /></span>
      <h2 id="dashboard-empty-title">Your inventory is empty. Add your first product to get started.</h2>
      <Link className="button button--primary button--link dashboard-empty__button" to="/products/new">
        Add product
      </Link>
    </section>
  );
}
