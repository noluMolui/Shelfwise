import { Navigate, Route, Routes } from 'react-router-dom';
import { ProductCataloguePage } from '../pages/ProductCataloguePage';
import { ProductFormPage } from '../pages/ProductFormPage';
import { DashboardPage } from '../pages/DashboardPage';
import { SignupPage } from '../pages/SignupPage';
import { LoginPage } from '../pages/LoginPage';
import { RequireOwner, RequireProfile, RequireSession } from './RouteGuards';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      {import.meta.env.DEV ? (
        <Route
          path="/preview/s4"
          element={<ProductFormPage mode="add" preview />}
        />
      ) : null}
      <Route element={<RequireSession />}>
        <Route element={<RequireProfile />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/products" element={<ProductCataloguePage />} />
          <Route path="/products/:id" element={<ProductFormPage mode="view" />} />
          <Route element={<RequireOwner />}>
            <Route path="/products/new" element={<ProductFormPage mode="add" />} />
            <Route path="/products/:id/edit" element={<ProductFormPage mode="edit" />} />
          </Route>
          <Route path="/stock" element={<PlaceholderPage title="Stock" />} />
          <Route path="/low-stock" element={<PlaceholderPage title="Low Stock" />} />
          <Route path="/suppliers" element={<PlaceholderPage title="Suppliers" />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <main className="page-shell">
      <h1 className="page-title">{title}</h1>
      <p>This screen is not part of the current build.</p>
    </main>
  );
}
