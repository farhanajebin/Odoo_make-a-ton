import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  ChevronDown,
  Sparkles,
  Clock,
  Shield,
  ExternalLink,
} from 'lucide-react';

const TITLE_MAP: Record<string, { title: string; subtitle: string }> = {
  '/admin': { title: 'Overview', subtitle: 'Platform health, subscription metrics & live revenue telemetry' },
  '/admin/customers': { title: 'Customers', subtitle: 'Manage accounts, subscription portfolios & contact records' },
  '/admin/products': { title: 'Products', subtitle: 'Catalog, pricing models, charge types & inventory status' },
  '/admin/variants': { title: 'Product Variants', subtitle: 'Brand tiers, capacity add-ons & premium editions' },
  '/admin/plans': { title: 'Subscription Plans', subtitle: 'Billing cadences, automatic closure rules & renewal policies' },
  '/admin/quotations': { title: 'Quotations', subtitle: 'Draft proposals, custom enterprise terms & quote-to-sub conversion' },
  '/admin/subscriptions': { title: 'Subscriptions', subtitle: 'Active customer agreements, lifecycle stages & billing schedules' },
  '/admin/invoices': { title: 'Invoices', subtitle: 'Receivables ledger, tax computation & payment reconciliation' },
  '/admin/discounts': { title: 'Discounts & Coupons', subtitle: 'Promotional rules, rate reductions & redemption limits' },
  '/admin/payments': { title: 'Payments', subtitle: 'Processed transactions, settlement logs & method tracking' },
  '/admin/staff': { title: 'Staff Management', subtitle: 'Administrative team roles, departmental access & clearances' },
  '/admin/taxes': { title: 'Tax Settings', subtitle: 'Regional tax rates, compliance rules & service categories' },
  '/admin/reports': { title: 'Reports & Analytics', subtitle: 'MRR breakdown, cohort retention & fiscal performance' },
  '/admin/settings': { title: 'Settings', subtitle: 'Company identity, billing policies & administrative controls' },
};

export const AdminHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentMeta = TITLE_MAP[location.pathname] || {
    title: 'Admin Control Center',
    subtitle: 'Subscription Management & Operations',
  };

  const notifications = [
    { id: 1, title: 'Invoice #INV-2026-089 paid', time: '12m ago', type: 'success' },
    { id: 2, title: 'New enterprise quote requested by Acme Corp', time: '45m ago', type: 'info' },
    { id: 3, title: 'Subscription #SUB-0012 renewed successfully', time: '2h ago', type: 'success' },
  ];

  return (
    <header className="px-8 pt-6 pb-4 flex items-center justify-between border-b border-slate-100/80 bg-white/60 backdrop-blur-sm sticky top-0 z-20">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {currentMeta.title}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
          {currentMeta.subtitle}
        </p>
      </div>

      {/* Right Controls: Search, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Search Bar */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records, subscriptions..."
            className="w-56 lg:w-64 pl-10 pr-4 py-2 rounded-2xl bg-slate-100/90 text-xs text-slate-800 placeholder-slate-400 border border-transparent focus:border-slate-300 focus:bg-white focus:outline-none transition-all"
          />
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 flex items-center justify-center transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {/* Notification Badge Dot (pink/coral like reference) */}
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Recent Alerts
                </span>
                <span className="text-[11px] font-medium text-teal-600 cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2.5 flex items-start gap-2.5">
                    <span className="mt-0.5 p-1 rounded-lg bg-teal-50 text-teal-600">
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-800 leading-snug">
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {n.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill matching reference screenshot */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 transition-all border border-slate-200/60"
          >
            {/* Avatar with beanie / stylish look */}
            <div className="w-7 h-7 rounded-full bg-amber-200 overflow-hidden flex items-center justify-center font-bold text-xs text-amber-900 border border-amber-300">
              <span role="img" aria-label="avatar">👩‍💼</span>
            </div>
            <span className="text-xs font-semibold text-slate-800">Zoia M.</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">Zoia Mitchell</p>
                <p className="text-[11px] text-slate-500">Super Administrator</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    navigate('/admin/settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-400" /> Administrative Settings
                </button>
                <button
                  onClick={() => {
                    navigate('/');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" /> Switch to Main Portal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
