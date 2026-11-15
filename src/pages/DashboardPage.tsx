import { Link } from 'react-router-dom';
import { AppHeader } from '../components/common/AppHeader';
import { MainNavigation } from '../components/common/MainNavigation';

export function DashboardPage() {
  return (
    <>
      <AppHeader title="Dashboard" signedIn />
      <div className="app-layout">
        <MainNavigation />
        <main className="page-shell">
          <h1 className="page-title">Dashboard</h1>
          <section className="panel dashboard-panel">
            <h2>Welcome to ShelfWise</h2>
            <p>Start by viewing your product catalogue.</p>
            <Link className="button button--primary button--link" to="/products">
              Go to products
            </Link>
          </section>
        </main>
      </div>
    </>
  );
}
