import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  ChevronDown,
  Sparkles,
  Clock,
  User,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { useCustomerData } from '../../context/CustomerDataContext';

const TITLE_MAP: Record<string, { title: string; subtitle: string }> = {
  '/customer': {
    title: 'Account Overview',
    subtitle: 'Welcome to your subscription operations portal',
  },
  '/customer/subscription': {
    title: 'My Subscription',
    subtitle: 'Active agreement terms, billing cycle, and renewal dates',
  },
  '/customer/plans': {
    title: 'Plans & Add-ons',
    subtitle: 'Explore tier upgrades and configure optional add-on modules',
  },
  '/customer/invoices': {
    title: 'Invoices & Receipts',
    subtitle: 'Tax compliant receivables, settlement records & downloadable statements',
  },
  '/customer/payments': {
    title: 'Payment History',
    subtitle: 'Verified transaction settlement log and payment references',
  },
  '/customer/profile': {
    title: 'Account Profile',
    subtitle: 'Company legal identity, billing address & security credentials',
  },
  '/customer/support': {
    title: 'Help & Support',
    subtitle: 'Frequently asked questions and direct technical support requests',
  },
};

export const CustomerHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useCustomerData();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentMeta = TITLE_MAP[location.pathname] || {
    title: 'Customer Portal',
    subtitle: 'Subscription Management',
  };

  const notifications = [
    { id: 1, title: 'Invoice #INV-2026-0104 marked as Paid', time: 'Yesterday', type: 'success' },
    { id: 2, title: 'Your subscription renews in 28 days', time: '2 days ago', type: 'info' },
    { id: 3, title: 'Support Ticket #TICK-8021 has been resolved', time: '1 week ago', type: 'success' },
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
        {/* Quick Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoices, plan details..."
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
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Account Notifications
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

        {/* Customer User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 transition-all border border-slate-200/60"
          >
            <div className="w-7 h-7 rounded-full bg-teal-100 overflow-hidden flex items-center justify-center font-bold text-xs text-teal-900 border border-teal-200">
              <span role="img" aria-label="avatar">🏢</span>
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                {profile.company}
              </span>
              <span className="text-[10px] text-slate-500 block leading-tight">
                {profile.name}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{profile.company}</p>
                <p className="text-[11px] text-slate-500">{profile.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    navigate('/customer/profile');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" /> Manage Profile
                </button>
                <button
                  onClick={() => {
                    navigate('/customer/support');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-400" /> Contact Support
                </button>
                <button
                  onClick={() => {
                    navigate('/');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" /> Exit to Homepage
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
