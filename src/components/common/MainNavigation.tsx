import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Truck, Warehouse, AlertTriangle } from 'lucide-react';

const destinations = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/products', label: 'Products', Icon: Package },
  { to: '/stock', label: 'Stock', Icon: Warehouse },
  { to: '/low-stock', label: 'Low Stock', Icon: AlertTriangle },
  { to: '/suppliers', label: 'Suppliers', Icon: Truck },
];

export function MainNavigation() {
  return (
    <nav className="main-nav" aria-label="Main navigation">
      {destinations.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `main-nav__link${isActive ? ' is-active' : ''}`}
        >
          <Icon size={18} aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
