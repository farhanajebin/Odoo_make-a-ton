import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { StaffSidebar } from './StaffSidebar';

export const StaffLayout: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f2f5f9] p-3 text-[#171717] antialiased md:p-4">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1600px] gap-3 md:min-h-[calc(100vh-2rem)] md:gap-4">
        <StaffSidebar
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />
        <main className="min-w-0 flex-1 rounded-[24px] border border-[#e7ebf0] bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.04)] md:rounded-[28px] md:p-6">
          <Outlet context={{ onToggleMobileMenu: () => setIsMobileOpen(true) }} />
        </main>
      </div>
    </div>
  );
};
