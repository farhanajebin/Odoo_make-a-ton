import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { StaffSidebar } from './StaffSidebar';

export const StaffLayout: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex text-[#171717] antialiased">
      {/* Floating Black Vertical Sidebar */}
      <StaffSidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Outer Frame */}
      <div className="flex-1 flex flex-col min-w-0 p-4 md:p-6 md:pl-2">
        {/* Large White Workspace Container */}
        <div className="flex-1 bg-white rounded-[28px] border border-[#E9EDF2] shadow-sm p-6 md:p-8 flex flex-col min-w-0">
          <Outlet context={{ onToggleMobileMenu: () => setIsMobileOpen(true) }} />
        </div>
      </div>
    </div>
  );
};

