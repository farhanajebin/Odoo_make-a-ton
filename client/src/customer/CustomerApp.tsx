import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CustomerDataProvider } from './context/CustomerDataContext';
import { CustomerLayout } from './components/layout/CustomerLayout';

// 7 Customer Portal Pages
import { OverviewPage } from './pages/OverviewPage';
import { MySubscriptionPage } from './pages/MySubscriptionPage';
import { PlansAddonsPage } from './pages/PlansAddonsPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { MyProfilePage } from './pages/MyProfilePage';
import { SupportPage } from './pages/SupportPage';

export const CustomerApp: React.FC = () => {
  return (
    <CustomerDataProvider>
      <Routes>
        <Route element={<CustomerLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="subscription" element={<MySubscriptionPage />} />
          <Route path="plans" element={<PlansAddonsPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="profile" element={<MyProfilePage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="*" element={<Navigate to="/customer" replace />} />
        </Route>
      </Routes>
    </CustomerDataProvider>
  );
};

export default CustomerApp;
