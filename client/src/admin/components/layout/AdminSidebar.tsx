import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  CalendarDays,
  FileSpreadsheet,
  Repeat,
  Receipt,
  Tag,
  CreditCard,
  UserCheck,
  Percent,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface NavItem {
  id: string;
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', name: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
  { id: 'customers', name: 'Customers', path: '/admin/customers', icon: Users },
  { id: 'products', name: 'Products', path: '/admin/products', icon: Package },
  { id: 'variants', name: 'Product Variants', path: '/admin/variants', icon: Layers },
  { id: 'plans', name: 'Plans', path: '/admin/plans', icon: CalendarDays },
  { id: 'quotations', name: 'Quotations', path: '/admin/quotations', icon: FileSpreadsheet },
  { id: 'subscriptions', name: 'Subscriptions', path: '/admin/subscriptions', icon: Repeat },
  { id: 'invoices', name: 'Invoices', path: '/admin/invoices', icon: Receipt },
  { id: 'discounts', name: 'Discounts', path: '/admin/discounts', icon: Tag },
  { id: 'payments', name: 'Payments', path: '/admin/payments', icon: CreditCard },
  { id: 'staff', name: 'Staff Management', path: '/admin/staff', icon: UserCheck },
  { id: 'taxes', name: 'Tax Settings', path: '/admin/taxes', icon: Percent },
  { id: 'reports', name: 'Reports', path: '/admin/reports', icon: BarChart3 },
  { id: 'settings', name: 'Settings', path: '/admin/settings', icon: Settings },
];

export const AdminSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <aside
      className={`
        sticky top-4 h-[calc(100vh-2rem)] my-4 ml-4 shrink-0
        bg-[#111622] text-slate-300 rounded-[2rem] shadow-2xl border border-slate-800/80
        flex flex-col justify-between transition-all duration-300 z-30
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Top Header / Logo Section */}
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Cream Logo Pill matching reference screenshot */}
            <div className="w-11 h-11 rounded-2xl bg-[#FFF8E7] flex items-center justify-center text-[#121620] shadow-sm shrink-0">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transform rotate-12"
              >
                <path
                  d="M7 6C7 4.89543 7.89543 4 9 4H15C16.1046 4 17 4.89543 17 6V8C17 9.10457 16.1046 10 15 10H9C7.89543 10 7 9.10457 7 8V6Z"
                  fill="#121620"
                />
                <path
                  d="M7 14C7 12.8954 7.89543 12 9 12H15C16.1046 12 17 12.8954 17 14V16C17 17.1046 16.1046 18 15 18H9C7.89543 18 7 17.1046 7 16V14Z"
                  fill="#121620"
                  opacity="0.8"
                />
              </svg>
            </div>

            {!collapsed && (
              <div className="overflow-hidden">
                <div className="text-sm font-bold text-white tracking-wider flex items-center gap-1.5">
                  LOOPNEX
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-slate-800 text-teal-400 border border-slate-700">
                    Admin
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Subscription Ops
                </div>
              </div>
            )}
          </div>

          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex w-7 h-7 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 items-center justify-center transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <div className="h-px bg-slate-800/80 w-full my-1" />
      </div>

      {/* Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1 scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.end}
              title={collapsed ? item.name : undefined}
              className={({ isActive }) => `
                group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150
                ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-md font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <IconComponent
                    className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  {!collapsed && (
                    <span className="truncate flex-1 tracking-tight">{item.name}</span>
                  )}
                  {isActive && !collapsed && (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Footer Section */}
      <div className="p-3 border-t border-slate-800/80 flex flex-col gap-2">
        {/* Return to Main Portal */}
        <button
          onClick={() => navigate('/')}
          title="Exit Admin Panel (Return to Main App)"
          className={`
            group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-400
            hover:text-white hover:bg-slate-800/70 transition-all duration-150 w-full
          `}
        >
          <ExternalLink className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-white" />
          {!collapsed && <span className="truncate">Exit to Main Site</span>}
        </button>

        {/* Log Out Shortcut */}
        <button
          onClick={() => navigate('/login')}
          title="Log out"
          className={`
            flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-400/80
            hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-150 w-full
          `}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
