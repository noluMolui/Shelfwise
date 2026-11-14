import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  AlertTriangle,
  ChevronDown,
  LayoutDashboard,
  Menu,
  Package,
  Truck,
  X,
} from "lucide-react";
import "./Layout.css";

const navigation = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Products", path: "/products", icon: Package },
  { name: "Stock", path: "/stock", icon: Package },
  { name: "Low Stock", path: "/low-stock", icon: AlertTriangle },
  { name: "Suppliers", path: "/suppliers", icon: Truck },
];

function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const currentPage =
    navigation.find((item) => item.path === pathname)?.name ?? "ShelfWise";

  const renderNavigation = (mobile = false) => (
    <nav
      aria-label="Main navigation"
      className={mobile ? "mobile-navigation-links" : "sidebar-navigation"}
    >
      {navigation.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `app-navigation-link${isActive ? " is-active" : ""}`
            }
          >
            <Icon size={18} aria-hidden="true" />
            <span>{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <NavLink className="app-brand" to="/" aria-label="ShelfWise home">
          ShelfWise<span>.</span>
        </NavLink>
        {renderNavigation()}
      </aside>

      <div className="app-main">
        <header className="app-header">
          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <NavLink className="mobile-brand" to="/">
            ShelfWise<span>.</span>
          </NavLink>
          <span className="header-section-label">{currentPage}</span>

          <div className="account-menu">
            <button
              type="button"
              className="account-menu-toggle"
              aria-expanded={accountMenuOpen}
              onClick={() => setAccountMenuOpen((open) => !open)}
            >
              Account
              <ChevronDown size={16} aria-hidden="true" />
            </button>
            {accountMenuOpen && (
              <div className="account-menu-popover">
                <span>Business Owner</span>
                <button type="button" onClick={() => setAccountMenuOpen(false)}>
                  Log out
                </button>
              </div>
            )}
          </div>
        </header>

        <div className={`mobile-navigation${mobileMenuOpen ? " is-open" : ""}`}>
          {renderNavigation(true)}
        </div>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
