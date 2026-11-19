import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ProductCataloguePage } from '../pages/ProductCataloguePage';
import { ProductFormPage } from '../pages/ProductFormPage';
import { DashboardPage } from '../pages/DashboardPage';
import { SignupPage } from '../pages/SignupPage';
import { LoginPage } from '../pages/LoginPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { StockMovementsPage } from '../pages/StockMovementsPage';
import { RecordMovementPage } from '../pages/RecordMovementPage';
import LowStock from '../pages/LowStock';
import Suppliers from '../pages/Suppliers';
import { RequireOwner, RequireProfile, RequireSession } from './RouteGuards';
import { useAuth } from './AuthProvider';

export function AppRoutes() {
  const { session, isPasswordRecovery } = useAuth();
  const location = useLocation();

  if (session && isPasswordRecovery && location.pathname !== '/forgot-password') {
    return <Navigate to="/forgot-password" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      {import.meta.env.DEV ? (
        <>
          <Route
            path="/preview/s4"
            element={<ProductFormPage mode="add" preview />}
          />
          <Route
            path="/preview/s6"
            element={<RecordMovementPage preview />}
          />
        </>
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
          <Route path="/stock" element={<StockMovementsPage />} />
          <Route path="/stock/new" element={<RecordMovementPage />} />
          <Route path="/low-stock" element={<LowStock />} />
          <Route path="/suppliers" element={<Suppliers />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
