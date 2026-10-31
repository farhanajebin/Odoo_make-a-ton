import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminToast } from '../common/AdminToast';

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F3F5F9] text-slate-900 flex font-sans antialiased overflow-x-hidden selection:bg-slate-900 selection:text-white">
      {/* Toast Feedback Anchor */}
      <AdminToast />

      {/* Modern Rounded Floating Dark Sidebar */}
      <AdminSidebar />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pr-4 py-4 h-screen overflow-y-auto">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 flex-1 flex flex-col overflow-hidden min-h-[calc(100vh-2rem)]">
          {/* Header */}
          <AdminHeader />

          {/* Sub-view Content Router */}
          <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-slate-50/40">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
