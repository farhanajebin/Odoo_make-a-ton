import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  Repeat,
  FileText,
  CreditCard,
  BarChart3,
  UserCheck,
  LogOut,
  X,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

interface StaffSidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavSection {
  title: string;
  items: Array<{
    name: string;
    path: string;
    icon: React.ElementType;
    exact?: boolean;
    badge?: string;
  }>;
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', path: '/staff', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: 'BUSINESS OPERATIONS',
    items: [
      { name: 'Customers', path: '/staff/customers', icon: Users },
      { name: 'Quotations', path: '/staff/quotations', icon: FileSpreadsheet },
      { name: 'Subscriptions', path: '/staff/subscriptions', icon: Repeat },
      { name: 'Invoices', path: '/staff/invoices', icon: FileText },
      { name: 'Payments', path: '/staff/payments', icon: CreditCard },
    ],
  },
  {
    title: 'ANALYTICS',
    items: [
      { name: 'Reports', path: '/staff/reports', icon: BarChart3 },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { name: 'My Profile', path: '/staff/profile', icon: UserCheck },
    ],
  },
];

export const StaffSidebar: React.FC<StaffSidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'ST';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-[#171717] text-white p-5 select-none rounded-[28px] shadow-2xl border border-white/5">
      {/* Top Header / Brand */}
      <div>
        <div className="flex items-center justify-between pb-6 mb-4 border-b border-white/10 px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#A9D4F5] to-[#72D8E8] text-[#171717] font-bold shadow-md shadow-[#A9D4F5]/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wide text-white">BRIGHTLOOP</span>
                <span className="text-[10px] font-semibold bg-[#A9D4F5]/20 text-[#A9D4F5] px-1.5 py-0.5 rounded-md border border-[#A9D4F5]/30">
                  STAFF
                </span>
              </div>
              <p className="text-[11px] text-[#7B8493] font-medium">Subscription Operations</p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onCloseMobile}
            className="md:hidden text-[#7B8493] hover:text-white p-1 rounded-lg"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1.5">
              <div className="px-3 text-[10px] font-bold tracking-wider text-[#7B8493] uppercase">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path);

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onCloseMobile}
                      className={cn(
                        'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative',
                        isActive
                          ? 'bg-[#A9D4F5] text-[#171717] shadow-sm font-semibold'
                          : 'text-[#9AAABD] hover:text-white hover:bg-white/10'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            'h-4 w-4 transition-transform group-hover:scale-105',
                            isActive ? 'text-[#171717]' : 'text-[#7B8493] group-hover:text-white'
                          )}
                        />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={cn(
                            'text-[10px] px-2 py-0.5 rounded-full font-semibold',
                            isActive
                              ? 'bg-[#171717] text-white'
                              : 'bg-white/10 text-white'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom User Card & Logout */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        <div className="flex items-center justify-between p-2 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#EAE3F4] to-[#A9D4F5] text-[#171717] font-bold text-xs flex items-center justify-center shrink-0 shadow-inner">
              {getInitials(user?.fullName)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.fullName || 'Sarah Jenkins'}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <p className="text-[10px] text-[#7B8493] truncate">{user?.department || 'Operations'}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-2 text-[#7B8493] hover:text-rose-400 hover:bg-white/10 rounded-xl transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Floating Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 p-4 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full p-3 z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
