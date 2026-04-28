import { FC } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import DashboardPage from '../pages/Dashboard';
import LoginPage from '../pages/Login';
import POSPage from '../pages/POS';
import ProductEditPage from '../pages/ProductEdit';
import ProductNewPage from '../pages/ProductNew';
import ProductsPage from '../pages/Products';
import ReportsPage from '../pages/Reports';
import SaleDetailPage from '../pages/SaleDetail';
import SalesPage from '../pages/Sales';
import StockPage from '../pages/Stock';
import UserNewPage from '../pages/UserNew';
import UsersPage from '../pages/Users';
import AdminRoute from './AdminRoute';
import PrivateRoute from './PrivateRoute';

const AppRouter: FC = () => (
  <BrowserRouter>
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Authenticated — all wrapped with drawer layout */}
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pos"       element={<POSPage />} />
          <Route path="/sales"     element={<SalesPage />} />
          <Route path="/sales/:id" element={<SaleDetailPage />} />
          <Route path="/products"  element={<ProductsPage />} />
          <Route path="/stock"     element={<StockPage />} />
          <Route path="/reports"   element={<ReportsPage />} />

          {/* Admin only */}
          <Route element={<AdminRoute />}>
            <Route path="/products/new"      element={<ProductNewPage />} />
            <Route path="/products/:id/edit" element={<ProductEditPage />} />
            <Route path="/users"             element={<UsersPage />} />
            <Route path="/users/new"         element={<UserNewPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
