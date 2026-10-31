import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useNavigate, useOutletContext } from 'react-router-dom';
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CreditCard,
  FileText,
  MoreHorizontal,
  RefreshCw,
  Repeat,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { StaffHeader } from '../../components/layout/StaffHeader';
import { staffApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { StaffOverviewData, SubscriptionItem } from '../../types';

interface OutletContextType {
  onToggleMobileMenu: () => void;
}

const dashboardLinks = [
  { label: 'Overview', to: '/staff', end: true },
  { label: 'Subscriptions', to: '/staff/subscriptions' },
  { label: 'Invoices', to: '/staff/invoices' },
  { label: 'Customers', to: '/staff/customers' },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(date));

const getStatusStyles = (status: SubscriptionItem['status']) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-[#ddf0e1] text-[#047857]';
    case 'CONFIRMED':
      return 'bg-[#e2f0fc] text-[#0369a1]';
    case 'QUOTATION':
    case 'DRAFT':
      return 'bg-[#f5efd8] text-[#b45309]';
    case 'CLOSED':
      return 'bg-[#f1f4f8] text-[#64748b]';
  }
};

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export const StaffDashboardPage: React.FC = () => {
  const { onToggleMobileMenu } = useOutletContext<OutletContextType>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState<StaffOverviewData | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, subscriptionData] = await Promise.all([
        staffApi.getOverview(),
        staffApi.getSubscriptions(),
      ]);
      setOverview(overviewData);
      setSubscriptions(subscriptionData);
    } catch (loadError) {
      console.error('Failed to load staff dashboard data', loadError);
      setError('Dashboard data could not be loaded. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredSubscriptions = useMemo(
    () =>
      subscriptions
        .filter((subscription) =>
          [
            subscription.customerName,
            subscription.subNumber,
            subscription.plan,
            subscription.status,
          ]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch)
        )
        .slice(0, 5),
    [subscriptions, normalizedSearch]
  );
  const filteredTasks = useMemo(
    () =>
      (overview?.pendingTasks ?? []).filter((task) =>
        `${task.title} ${task.subtitle}`.toLowerCase().includes(normalizedSearch)
      ),
    [overview?.pendingTasks, normalizedSearch]
  );
  const filteredActivities = useMemo(
    () =>
      (overview?.recentActivities ?? []).filter((activity) =>
        `${activity.title} ${activity.description}`.toLowerCase().includes(normalizedSearch)
      ),
    [overview?.recentActivities, normalizedSearch]
  );

  const today = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date());

  const statCards = [
    {
      label: 'Assigned customers',
      value: overview?.assignedCustomers,
      detail: 'Customer accounts',
      icon: Users,
      tint: 'bg-[#f4f8fe]',
    },
    {
      label: 'Active subscriptions',
      value: overview?.activeSubscriptions,
      detail: 'Recurring contracts',
      icon: Repeat,
      tint: 'bg-[#eaf7f3]',
    },
    {
      label: 'Pending quotes',
      value: overview?.pendingQuotations,
      detail: 'Awaiting decision',
      icon: FileText,
      tint: 'bg-[#f7f4eb]',
    },
    {
      label: 'Payments collected',
      value: overview ? formatCurrency(overview.paymentsCollected) : undefined,
      detail: 'Collected payments',
      icon: CreditCard,
      tint: 'bg-[#386bf6] text-white',
      featured: true,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <nav className="flex min-w-0 items-center gap-1 overflow-x-auto rounded-xl bg-[#f1f4f8] p-1">
          {dashboardLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) =>
                [
                  'whitespace-nowrap rounded-lg px-3 py-2 text-[12px] font-medium transition-colors',
                  isActive
                    ? 'bg-white text-[#171717] shadow-sm'
                    : 'text-[#586679] hover:text-[#171717]',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 text-[11px] text-[#586679] sm:flex">
          <CalendarDays className="h-4 w-4" />
          {today}
          <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-[#ddf0e1] px-2 py-1 font-medium text-[#047857]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
            Live
          </span>
        </div>
      </div>

      <StaffHeader
        title="Staff Overview"
        subtitle={`Welcome back, ${user?.fullName || 'there'}. Here is your operations pulse.`}
        onToggleMobileMenu={onToggleMobileMenu}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search subscriptions, customers, and activities..."
      />

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void loadData()}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-rose-800 shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      <section aria-label="Staff performance" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={[
                'rounded-[18px] border border-[#e9edf2] p-4 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.12)]',
                  card.featured ? 'border-[#386bf6] shadow-[0_8px_24px_-10px_rgba(56,107,246,0.6)]' : 'bg-white',
                  card.tint,
              ].join(' ')}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span
                  className={[
                    'text-[11px] font-semibold uppercase tracking-[0.08em]',
                    card.featured ? 'text-white/85' : 'text-[#586679]',
                  ].join(' ')}
                >
                  {card.label}
                </span>
                <span
                  className={[
                    'inline-flex h-8 w-8 items-center justify-center rounded-full',
                    card.featured ? 'bg-white/20 text-white' : 'bg-white/80 text-[#334155]',
                  ].join(' ')}
                >
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <div className={['text-[25px] font-bold tracking-[-0.03em]', card.featured ? 'text-white' : 'text-[#171717]'].join(' ')}>
                {loading ? '—' : (card.value ?? '—')}
              </div>
              <div className={['mt-1 text-[11px]', card.featured ? 'text-white/75' : 'text-[#7b8593]'].join(' ')}>
                {card.detail}
              </div>
              {card.featured && (
                <div className="mt-4 rounded-xl bg-white/10 px-3 py-2 text-[11px] text-white/85">
                  Payments recorded in the staff workspace
                </div>
              )}
            </div>
          );
        })}
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          <div className="grid gap-5 lg:grid-cols-12">
            <section className="flex flex-col justify-between rounded-[20px] bg-gradient-to-b from-[#e3efff] to-[#f4f8fe] p-5 lg:col-span-5">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[#334155] shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-[#386bf6]" />
                    Operations focus
                  </span>
                  <span className="text-[10px] font-medium text-[#64748b]">Staff workspace</span>
                </div>
                <div className="relative my-6 flex h-24 items-center justify-center">
                  <div className="absolute h-20 w-20 rounded-full bg-[#386bf6]/15 blur-2xl" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-[6px] border-[#d6e5ff] bg-white/70 shadow-sm">
                    <Sparkles className="h-7 w-7 text-[#386bf6]" />
                  </div>
                </div>
                <div className="rounded-2xl bg-white/75 p-4 text-center shadow-sm">
                  <h2 className="text-[16px] font-semibold leading-6 tracking-[-0.02em] text-[#171717]">
                    What needs attention in your operations today?
                  </h2>
                  <p className="mt-1 text-[12px] leading-5 text-[#607086]">
                    Review pending actions, subscriptions, and recent account activity from one place.
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  <span className="rounded-full bg-white/85 px-2.5 py-1 text-[10px] text-[#394862]">Pending tasks</span>
                  <span className="rounded-full bg-white/85 px-2.5 py-1 text-[10px] text-[#394862]">Renewals</span>
                  <span className="rounded-full bg-white/85 px-2.5 py-1 text-[10px] text-[#394862]">Collections</span>
                </div>
              </div>
              <Link
                to="/staff/reports"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#171717] px-4 py-3 text-[12px] font-semibold text-white shadow-md transition-colors hover:bg-[#30343a]"
              >
                <Sparkles className="h-4 w-4 text-[#8be7d1]" />
                Review operations report
              </Link>
            </section>

            <section className="rounded-[20px] border border-[#e9edf2] bg-white p-5 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.1)] lg:col-span-7">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#171717]">
                    Subscription activity
                  </h2>
                  <p className="mt-1 text-[11px] text-[#64748b]">Active subscription trend from the staff overview</p>
                </div>
                <span className="rounded-lg bg-[#f1f4f8] px-2.5 py-1.5 text-[10px] font-semibold text-[#475569]">
                  Last 6 periods
                </span>
              </div>
              <div className="h-[220px] w-full">
                {overview?.subscriptionTrends.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={overview.subscriptionTrends} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="staffActiveArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#27d3c2" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#27d3c2" stopOpacity={0.03} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#edf1f5" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip
                        contentStyle={{
                          border: '1px solid #e9edf2',
                          borderRadius: '12px',
                          boxShadow: '0 12px 28px rgba(15,23,42,0.08)',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="active"
                        name="Active subscriptions"
                        stroke="#087e73"
                        strokeWidth={2.5}
                        fill="url(#staffActiveArea)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[#7b8593]">
                    {loading ? 'Loading subscription trend…' : 'No subscription trend data available.'}
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-[#f7f9fb] px-3 py-2.5 text-[11px]">
                <span className="inline-flex items-center gap-2 text-[#334155]">
                  <span className="h-2 w-2 rounded-full bg-[#087e73]" />
                  {overview?.activeSubscriptions ?? 0} Active Subscriptions
                </span>
                <Link to="/staff/subscriptions" className="font-semibold text-[#087e73] hover:underline">
                  Manage plans <span aria-hidden="true">→</span>
                </Link>
              </div>
            </section>
          </div>

          <section className="rounded-[20px] border border-[#e9edf2] bg-white p-5 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.1)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#171717]">Active Plan Pipeline</h2>
                <p className="mt-1 text-[12px] text-[#607086]">Current subscriptions and billing period details</p>
              </div>
              <Link
                to="/staff/subscriptions"
                className="inline-flex items-center gap-1 rounded-full bg-[#edf5ff] px-3 py-1.5 text-[10px] font-semibold text-[#1d4ed8]"
              >
                View subscriptions <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="overflow-x-auto rounded-xl border border-[#ebeff4]">
              <table className="w-full min-w-[700px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#f4f6f8] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5f6f82]">
                    <th className="px-3 py-3">Subscriber</th>
                    <th className="px-3 py-3">Plan</th>
                    <th className="px-3 py-3">Cycle value</th>
                    <th className="px-3 py-3">Renewal term</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3 text-right">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef2f6] bg-white">
                  {filteredSubscriptions.map((subscription) => (
                    <tr key={subscription.id} className="text-[12px] text-[#171717] transition-colors hover:bg-[#f9fbfe]">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf1f5] text-[10px] font-bold">
                            {getInitials(subscription.customerName)}
                          </span>
                          <span>
                            <span className="block font-semibold">{subscription.customerName}</span>
                            <span className="block text-[10px] text-[#7b8593]">{subscription.subNumber}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-md bg-[#eae3f4] px-2 py-1 text-[10px] font-semibold text-[#6d28d9]">
                          {subscription.plan}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono text-[12px] font-semibold">
                        {formatCurrency(subscription.amount)}
                        <span className="ml-1 text-[10px] font-normal text-[#7b8593]">
                          /{subscription.cadence.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[11px] text-[#5b6778]">
                        {formatDate(subscription.currentPeriodEnd)}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${getStatusStyles(subscription.status)}`}>
                          {subscription.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          type="button"
                          aria-label={`View ${subscription.customerName} subscription`}
                          onClick={() => navigate('/staff/subscriptions')}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#5c687a] transition-colors hover:bg-[#f3f5f8] hover:text-[#171717]"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && filteredSubscriptions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#7b8593]">
                        {normalizedSearch ? 'No subscriptions match your search.' : 'No subscriptions to show yet.'}
                      </td>
                    </tr>
                  )}
                  {loading && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#7b8593]">
                        Loading subscriptions…
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="space-y-5 lg:col-span-4">
          <section className="rounded-[20px] bg-[#171717] p-4 text-white shadow-[0_12px_30px_-14px_rgba(15,23,42,0.5)]">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-[17px] font-semibold tracking-[-0.02em]">Priority Holding &amp; Triage</h2>
                <p className="mt-1 text-[10px] text-[#9aa6b2]">Operational tasks requiring attention</p>
              </div>
              <Link to="/staff/reports" className="text-[11px] font-semibold text-[#5cf7e5]">
                View all <span aria-hidden="true">›</span>
              </Link>
            </div>
            <div className="mb-3 rounded-2xl bg-[#23262b] p-3">
              <div className="mb-2 flex items-center justify-between gap-2 text-[10px] text-[#c0c9d5]">
                <span>Pending actions</span>
                <span className="rounded-full bg-[#dff9f2] px-2 py-1 font-semibold text-[#0f766e]">
                  {overview?.pendingTasks.length ?? 0} to review
                </span>
              </div>
              <div className="text-[22px] font-bold text-white">{overview?.pendingTasks.length ?? '—'}</div>
              <div className="text-[10px] text-[#9aa6b2]">Tasks across your staff workspace</div>
            </div>
            <div className="space-y-2.5">
              {filteredTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="rounded-[14px] bg-[#1f2327] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[12px] font-semibold text-white">{task.title}</div>
                      <div className="mt-1 text-[10px] leading-4 text-[#9aa6b2]">{task.subtitle}</div>
                    </div>
                    <span
                      className={[
                        'mt-1 h-2 w-2 shrink-0 rounded-full',
                        task.urgency === 'high'
                          ? 'bg-rose-400'
                          : task.urgency === 'medium'
                            ? 'bg-amber-300'
                            : 'bg-sky-300',
                      ].join(' ')}
                      aria-label={`${task.urgency} priority`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(task.targetPath)}
                    className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#dff9f2] px-2 py-2 text-[10px] font-semibold text-[#0b5e54] transition-colors hover:bg-[#baf2e5]"
                  >
                    {task.actionLabel}
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {!loading && filteredTasks.length === 0 && (
                <p className="rounded-xl bg-[#1f2327] px-3 py-4 text-center text-[11px] text-[#9aa6b2]">
                  No pending tasks match your search.
                </p>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] text-[#9aa6b2]">
              <span>Staff operations</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#5cf7e5]" />
                Workspace active
              </span>
            </div>
          </section>

          <section className="rounded-[20px] border border-[#e9edf2] bg-white p-4 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.1)]">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#dffaf4] text-[#0b7c6d]">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <div>
                  <h2 className="text-[14px] font-semibold tracking-[-0.02em] text-[#171717]">Live staff audit feed</h2>
                  <p className="text-[10px] text-[#7b8593]">Recent operational activity</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void loadData()}
                aria-label="Refresh dashboard activity"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#64748b] transition-colors hover:bg-[#f1f4f8]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-2.5">
              {filteredActivities.slice(0, 4).map((activity) => (
                <div key={activity.id} className="flex items-start gap-2.5 rounded-xl bg-[#f7f9fb] p-2.5">
                  <div className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e7ebef] text-[#087e73]">
                    <Bell className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-semibold text-[#171717]">{activity.title}</span>
                      <span className="shrink-0 text-[9px] text-[#7b8593]">{activity.time}</span>
                    </div>
                    <p className="mt-1 text-[10px] leading-4 text-[#5d6b7d]">{activity.description}</p>
                    <span className="mt-1 inline-flex rounded-full bg-white px-2 py-0.5 text-[9px] font-medium text-[#64748b]">
                      {activity.badge}
                    </span>
                  </div>
                </div>
              ))}
              {!loading && filteredActivities.length === 0 && (
                <p className="py-5 text-center text-[11px] text-[#7b8593]">
                  No recent activities match your search.
                </p>
              )}
            </div>
            <Link
              to="/staff/reports"
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-[#f1f4f8] px-3 py-2.5 text-[11px] font-medium text-[#334155] transition-colors hover:bg-[#e8edf3]"
            >
              Open staff reports <ArrowUpRight className="h-3 w-3" />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
};
