import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { OverviewPage } from '../pages/OverviewPage';
import { UpcomingPage } from '../pages/UpcomingPage';
import { NAVIGATION_ITEMS } from '../constants/navigation';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        {/* Main implemented Overview screen */}
        <Route index element={<OverviewPage />} />

        {/* Upcoming milestone screens */}
        {NAVIGATION_ITEMS.filter((item) => item.path !== '/').map((item) => (
          <Route key={item.id} path={item.path} element={<UpcomingPage />} />
        ))}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
