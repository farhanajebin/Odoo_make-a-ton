import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Users,
  Package,
  Layers,
  FileSpreadsheet,
  Repeat,
  FileText,
  CreditCard,
  Tag,
  RefreshCw,
  Radar,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkle,
} from 'lucide-react';
import { NAVIGATION_ITEMS, NavItem } from '../../constants/navigation';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Activity,
  Users,
  Package,
  Layers,
  FileSpreadsheet,
  Repeat,
  FileText,
  CreditCard,
  Tag,
  RefreshCw,
  Radar,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Settings,
};

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const renderNavSection = (sectionName: string, items: NavItem[]) => {
    return (
      <div className="mb-4">
        {!isCollapsed && (
          <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
            {sectionName}
          </p>
        )}
        <div className="space-y-0.5">
          {items.map((item) => {
            const Icon = iconMap[item.iconName] || Sparkle;
            const isUpcoming = item.status === 'upcoming';

            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={onCloseMobile}
                title={isCollapsed ? `${item.name}${isUpcoming ? ' (Upcoming)' : ''}` : undefined}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150',
                    isActive
                      ? 'bg-loopnex-surfaceLight text-slate-900 dark:text-white dark:bg-loopnex-surface font-semibold shadow-sm border border-slate-200 dark:border-loopnex-surfaceBorder'
                      : 'text-slate-600 dark:text-loopnex-secondaryText hover:bg-slate-100 dark:hover:bg-loopnex-surface/60 hover:text-slate-900 dark:hover:text-loopnex-primaryText',
                    isCollapsed && 'justify-center px-2 py-2.5'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-colors',
                        isActive
                          ? 'text-loopnex-electricTeal'
                          : 'text-slate-400 dark:text-loopnex-secondaryText group-hover:text-slate-700 dark:group-hover:text-loopnex-primaryText'
                      )}
                    />

                    {!isCollapsed && (
                      <div className="flex flex-1 items-center justify-between overflow-hidden">
                        <span className="truncate">{item.name}</span>
                        {item.badge && (
                          <Badge
                            variant={item.badgeColor || 'slate'}
                            size="sm"
                            className="ml-auto text-[9px] px-1.5 py-0 uppercase tracking-tighter"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Active highlight bar on left */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-loopnex-electricTeal" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    );
  };

  const coreItems = NAVIGATION_ITEMS.filter((i) => i.section === 'core');
  const operationsItems = NAVIGATION_ITEMS.filter((i) => i.section === 'operations');
  const intelligenceItems = NAVIGATION_ITEMS.filter((i) => i.section === 'intelligence');
  const systemItems = NAVIGATION_ITEMS.filter((i) => i.section === 'system');

  const sidebarContent = (
    <aside
      className={cn(
        'relative flex flex-col h-full border-r border-slate-200 dark:border-loopnex-surfaceBorder bg-white dark:bg-loopnex-deepNavy transition-all duration-300 z-40',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-loopnex-surfaceBorder shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Logo Mark */}
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-loopnex-electricTeal via-loopnex-softCyan to-loopnex-violetAccent p-0.5 shadow-glow-teal">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-loopnex-deepNavy">
              <span className="font-extrabold text-sm tracking-wider text-loopnex-electricTeal">
                LX
              </span>
            </div>
          </div>

          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-loopnex-primaryText">
                LOOPNEX
              </span>
              <span className="text-[10px] text-slate-400 dark:text-loopnex-secondaryText leading-none truncate">
                RevOps Platform
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Trigger */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-loopnex-surfaceBorder text-slate-400 hover:text-slate-600 dark:text-loopnex-secondaryText dark:hover:text-loopnex-primaryText hover:bg-slate-100 dark:hover:bg-loopnex-surface transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Navigation Links Area */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {renderNavSection('Overview', coreItems)}
        {renderNavSection('Revenue Operations', operationsItems)}
        {renderNavSection('Intelligence & Differentiators', intelligenceItems)}
        {renderNavSection('Administration', systemItems)}
      </nav>

      {/* Footer / Architecture badge */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-200 dark:border-loopnex-surfaceBorder/80 bg-slate-50/50 dark:bg-loopnex-graphite/40 shrink-0">
          <div className="rounded-xl border border-slate-200 dark:border-loopnex-surfaceBorder p-2.5 bg-white dark:bg-loopnex-surface/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-slate-700 dark:text-loopnex-primaryText">
                COMMIT 01
              </span>
              <span className="text-[9px] font-mono text-loopnex-electricTeal font-medium">
                v0.1.0-alpha
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-loopnex-secondaryText leading-relaxed">
              Foundation Core & Architecture active.
            </p>
          </div>
        </div>
      )}
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 md:hidden transform transition-transform duration-300 ease-in-out',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </div>
    </>
  );
};
