import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminDataProvider } from './context/AdminDataContext';
import { AdminLayout } from './components/layout/AdminLayout';

// 14 Admin Domain Pages
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductVariantsPage } from './pages/ProductVariantsPage';
import { PlansPage } from './pages/PlansPage';
import { QuotationsPage } from './pages/QuotationsPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { DiscountsPage } from './pages/DiscountsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { StaffPage } from './pages/StaffPage';
import { TaxesPage } from './pages/TaxesPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export const AdminApp: React.FC = () => {
  return (
    <AdminDataProvider>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="variants" element={<ProductVariantsPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="quotations" element={<QuotationsPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="discounts" element={<DiscountsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="taxes" element={<TaxesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </AdminDataProvider>
  );
};

export default AdminApp;
