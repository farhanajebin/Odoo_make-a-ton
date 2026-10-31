import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  CreditCard,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  Layers,
  LogOut,
  Repeat,
  UserCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

interface StaffSidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/staff', icon: LayoutDashboard, exact: true },
  { name: 'Customers', path: '/staff/customers', icon: Users },
  { name: 'Quotations', path: '/staff/quotations', icon: FileSpreadsheet },
  { name: 'Subscriptions', path: '/staff/subscriptions', icon: Repeat },
  { name: 'Invoices', path: '/staff/invoices', icon: FileText },
  { name: 'Payments', path: '/staff/payments', icon: CreditCard },
  { name: 'Reports', path: '/staff/reports', icon: BarChart3 },
  { name: 'Profile', path: '/staff/profile', icon: UserCheck },
];

export const StaffSidebar: React.FC<StaffSidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to sign out', error);
    } finally {
      navigate('/login');
    }
  };

  const getInitials = (name?: string) =>
    name
      ? name
          .split(/\s+/)
          .map((part) => part[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : 'ST';

  const sidebarContent = (
    <div className="flex h-full flex-col items-center justify-between rounded-[22px] border border-white/5 bg-[#171717] px-2 py-4 text-white shadow-[0_16px_36px_-8px_rgba(0,0,0,0.25)]">
      <div className="flex w-full flex-col items-center">
        <NavLink
          to="/staff"
          aria-label="Brightloop staff dashboard"
          onClick={onCloseMobile}
          className="mb-1 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#171717] shadow-sm"
        >
          <Layers className="h-5 w-5 text-[#006a61]" />
        </NavLink>
        <span className="mb-6 text-[9px] font-semibold tracking-[0.16em] text-[#9aa6b2]">B-LOOP</span>

        <nav className="flex w-full flex-col items-center gap-2" aria-label="Staff navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                title={item.name}
                aria-label={item.name}
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-xl transition-colors',
                  isActive
                    ? 'bg-white text-[#171717] shadow-sm'
                    : 'text-[#9aa6b2] hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#eae3f4] to-[#a9d4f5] text-[10px] font-bold text-[#171717]"
          title={user?.fullName || 'Staff account'}
        >
          {getInitials(user?.fullName)}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          title="Sign out"
          aria-label="Sign out"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[#9aa6b2] transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[76px] shrink-0 md:flex">
        {sidebarContent}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-label="Close navigation"
          />
          <div className="relative z-10 m-3 h-[calc(100%-1.5rem)] w-[76px]">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
