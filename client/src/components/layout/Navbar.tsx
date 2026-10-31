import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Server,
  Database,
  ChevronDown,
  User,
  Shield,
  HelpCircle,
  LogOut,
  Menu,
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useHealth } from '../../hooks/useHealth';
import { Badge } from '../ui/Badge';

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { health, isBackendOnline, loading: healthLoading } = useHealth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    {
      id: '1',
      title: 'Platform Architecture Initialized',
      description: 'Commit 01 Foundation deployed successfully.',
      time: 'Just now',
      read: false,
    },
    {
      id: '2',
      title: 'Prisma Models Configured',
      description: 'All 21 planned entities mapped with Decimal precision.',
      time: '10m ago',
      read: false,
    },
    {
      id: '3',
      title: 'PostgreSQL Driver Ready',
      description: 'Set DATABASE_URL in .env to activate live sync.',
      time: '1h ago',
      read: true,
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-loopnex-surfaceBorder bg-white/95 dark:bg-loopnex-graphite/95 px-4 sm:px-6 backdrop-blur transition-colors">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation sidebar"
          className="rounded-lg p-2 text-slate-500 dark:text-loopnex-secondaryText hover:bg-slate-100 dark:hover:bg-loopnex-surface hover:text-slate-900 dark:hover:text-loopnex-primaryText transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md hidden sm:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-loopnex-secondaryText">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search subscriptions, customers, invoices, MRR... (Press / to search)"
            className="w-full rounded-lg border border-slate-200 dark:border-loopnex-surfaceBorder bg-slate-50 dark:bg-loopnex-surface/80 py-1.5 pl-9 pr-12 text-xs text-slate-900 dark:text-loopnex-primaryText placeholder-slate-400 dark:placeholder-slate-500 focus:border-loopnex-electricTeal focus:outline-none focus:ring-1 focus:ring-loopnex-electricTeal transition-all"
          />
          <kbd className="absolute right-2.5 top-2 hidden sm:inline-flex items-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-loopnex-graphite px-1.5 text-[10px] text-slate-400 dark:text-loopnex-secondaryText font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Status Pill, Theme Toggle, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Backend & DB Health Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-loopnex-surfaceBorder bg-slate-50 dark:bg-loopnex-surface/60 text-xs">
          <div className="flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5 text-slate-400 dark:text-loopnex-secondaryText" />
            <span className="text-[11px] text-slate-600 dark:text-loopnex-secondaryText">API:</span>
            {healthLoading ? (
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            ) : isBackendOnline ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-loopnex-electricTeal">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 dark:bg-loopnex-electricTeal animate-pulse" />
                Live ({health?.uptimeSeconds || 0}s)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-500">
                <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />
                Offline
              </span>
            )}
          </div>

          <div className="h-3 w-px bg-slate-200 dark:bg-loopnex-surfaceBorder" />

          <div className="flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-slate-400 dark:text-loopnex-secondaryText" />
            <span className="text-[11px] text-slate-600 dark:text-loopnex-secondaryText">DB:</span>
            {health?.database.status === 'connected' ? (
              <span className="text-[11px] font-medium text-emerald-500">Connected ({health.database.latencyMs}ms)</span>
            ) : (
              <span className="text-[11px] text-amber-500 font-medium" title="Configure DATABASE_URL to connect PostgreSQL">
                Ready (Pending URL)
              </span>
            )}
          </div>
        </div>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          className="rounded-lg p-2 text-slate-500 dark:text-loopnex-secondaryText hover:bg-slate-100 dark:hover:bg-loopnex-surface hover:text-slate-900 dark:hover:text-loopnex-primaryText transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400 hover:text-amber-300" />
          ) : (
            <Moon className="h-4 w-4 text-slate-600 hover:text-slate-900" />
          )}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Open notifications"
            className="relative rounded-lg p-2 text-slate-500 dark:text-loopnex-secondaryText hover:bg-slate-100 dark:hover:bg-loopnex-surface hover:text-slate-900 dark:hover:text-loopnex-primaryText transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-loopnex-electricTeal opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-loopnex-electricTeal" />
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 dark:border-loopnex-surfaceBorder bg-white dark:bg-loopnex-graphite p-3 shadow-xl z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-loopnex-surfaceBorder/60">
                <span className="text-xs font-semibold text-slate-900 dark:text-loopnex-primaryText">
                  Notifications
                </span>
                <Badge variant="teal" size="sm">3 New</Badge>
              </div>
              <div className="mt-2 divide-y divide-slate-100 dark:divide-loopnex-surfaceBorder/40">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2.5 first:pt-1 last:pb-1">
                    <p className="text-xs font-medium text-slate-800 dark:text-loopnex-primaryText">
                      {n.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-loopnex-secondaryText mt-0.5">
                      {n.description}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                      {n.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-loopnex-surface transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-loopnex-electricTeal to-loopnex-violetAccent text-loopnex-deepNavy font-bold text-xs shadow-sm">
              AD
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-semibold text-slate-900 dark:text-loopnex-primaryText leading-none">
                Alex Drake
              </p>
              <p className="text-[10px] text-slate-400 dark:text-loopnex-secondaryText mt-0.5">
                Chief Revenue Officer
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 dark:text-loopnex-secondaryText hidden xl:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-loopnex-surfaceBorder bg-white dark:bg-loopnex-graphite p-2 shadow-xl z-50">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-loopnex-surfaceBorder/60">
                <p className="text-xs font-semibold text-slate-900 dark:text-loopnex-primaryText">
                  Alex Drake
                </p>
                <p className="text-[11px] text-slate-500 dark:text-loopnex-secondaryText truncate">
                  alex.drake@enterprise.io
                </p>
                <div className="mt-1.5">
                  <Badge variant="violet" size="sm">Admin Role</Badge>
                </div>
              </div>
              <div className="mt-1 space-y-0.5">
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-loopnex-primaryText hover:bg-slate-50 dark:hover:bg-loopnex-surface rounded-lg">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  Account Profile
                </button>
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-loopnex-primaryText hover:bg-slate-50 dark:hover:bg-loopnex-surface rounded-lg">
                  <Shield className="h-3.5 w-3.5 text-slate-400" />
                  Security & Access
                </button>
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-loopnex-primaryText hover:bg-slate-50 dark:hover:bg-loopnex-surface rounded-lg">
                  <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                  Documentation & Support
                </button>
                <div className="border-t border-slate-100 dark:border-loopnex-surfaceBorder/60 my-1" />
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg">
                  <LogOut className="h-3.5 w-3.5 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
