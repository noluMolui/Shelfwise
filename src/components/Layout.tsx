
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Truck,
  AlertTriangle,
  Settings,
  Package,
} from "lucide-react";

function Layout() {
  const navigation = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Low Stock", path: "/low-stock", icon: AlertTriangle },
    { name: "Suppliers", path: "/suppliers", icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-gray-200 bg-white p-6 md:block">

        <h1 className="mb-10 text-2xl font-bold text-primary">
          ShelfWise<span className="text-accent">.</span>
        </h1>

        <nav className="space-y-3">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <Icon size={19} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-gray-600 hover:bg-gray-100">
            <Settings size={19} />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Page */}
      <main className="min-h-screen md:ml-64">

        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-primary">
              ShelfWise Inventory
            </h2>
            <p className="text-sm text-gray-500">
              Smart inventory management
            </p>
          </div>

          <Package className="text-accent" size={25} />
        </header>

        <div>
          <Outlet />
        </div>

      </main>
    </div>
  );
}

export default Layout;
