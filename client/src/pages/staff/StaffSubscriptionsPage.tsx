import { useOutletContext } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
  Eye,
  X,
  ShieldCheck,
} from 'lucide-react';
import { StaffHeader } from '../../components/layout/StaffHeader';
import { staffApi } from '../../services/api';
import { SubscriptionItem, InvoiceItem } from '../../types';

interface OutletContextType {
  onToggleMobileMenu: () => void;
}

export const StaffSubscriptionsPage: React.FC = () => {
  const { onToggleMobileMenu } = useOutletContext<OutletContextType>();

  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [planFilter, setPlanFilter] = useState('ALL');

  // Details Modal
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [subDetails, setSubDetails] = useState<{
    subscription: SubscriptionItem;
    invoices: InvoiceItem[];
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await staffApi.getSubscriptions({
        search: searchQuery,
        status: statusFilter,
        plan: planFilter,
      });
      setSubscriptions(data);
    } catch (err) {
      console.error('Failed to load subscriptions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, [searchQuery, statusFilter, planFilter]);

  const handleViewSubscription = async (id: string) => {
    setSelectedSubId(id);
    try {
      setDetailLoading(true);
      const data = await staffApi.getSubscriptionDetails(id);
      setSubDetails(data);
    } catch (err) {
      console.error('Failed to load subscription details', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#DDF0E1] text-[#14532D]">
            Active
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E2F0FC] text-[#1E3A8A]">
            Confirmed
          </span>
        );
      case 'QUOTATION':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F5EFD8] text-[#713F12]">
            Quotation
          </span>
        );
      case 'DRAFT':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-[#7B8493]">
            Draft
          </span>
        );
      case 'CLOSED':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700">
            Closed
          </span>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <StaffHeader
        title="Subscription Engine"
        subtitle="Manage active customer subscription contracts, billing cadences, and automated renewals"
        onToggleMobileMenu={onToggleMobileMenu}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search subscriptions by ID, customer name, or plan..."
      />

      {/* Control & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-[#E9EDF2]">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#7B8493]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-medium py-1.5 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="QUOTATION">Quotation</option>
              <option value="DRAFT">Draft</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Plan Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#7B8493]">Plan Tier:</span>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="text-xs font-medium py-1.5 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
            >
              <option value="ALL">All Plans</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Scale">Scale</option>
              <option value="Growth">Growth</option>
              <option value="Starter">Starter</option>
            </select>
          </div>
        </div>

        <span className="text-xs font-semibold text-[#7B8493]">
          {subscriptions.length} records tracked
        </span>
      </div>

      {/* Subscriptions Table */}
      <div className="rounded-3xl border border-[#E9EDF2] bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E9EDF2] bg-slate-50/75 text-[11px] font-bold text-[#7B8493] uppercase tracking-wider">
                <th className="py-3.5 px-4">Sub ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Product & Plan</th>
                <th className="py-3.5 px-4">Billing Frequency</th>
                <th className="py-3.5 px-4">Start Date</th>
                <th className="py-3.5 px-4">Next Billing</th>
                <th className="py-3.5 px-4 text-right">Cadence Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EDF2] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#7B8493]">
                    Loading subscriptions...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#7B8493]">
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#171717]">
                      {sub.subNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#171717]">
                      {sub.customerName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-[#171717] block">{sub.plan}</span>
                      <span className="text-[11px] text-[#7B8493]">{sub.variant}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E2F0FC] text-[#1E3A8A]">
                        {sub.cadence}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#7B8493]">
                      {new Date(sub.startedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#171717]">
                      {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#171717]">
                      {formatCurrency(sub.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(sub.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleViewSubscription(sub.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E9EDF2] bg-white hover:bg-slate-50 text-xs font-semibold text-[#171717] shadow-sm transition-all"
                      >
                        <Eye className="h-3.5 w-3.5 text-[#7B8493]" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Details Modal */}
      {selectedSubId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#E9EDF2] shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E9EDF2]">
              <div>
                <h3 className="text-lg font-bold text-[#171717]">Subscription Parameters</h3>
                <p className="text-xs text-[#7B8493]">{subDetails?.subscription.subNumber}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedSubId(null);
                  setSubDetails(null);
                }}
                className="p-2 rounded-xl text-[#7B8493] hover:text-[#171717] hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {detailLoading ? (
              <div className="py-12 text-center text-[#7B8493] text-sm">
                Loading parameters...
              </div>
            ) : subDetails ? (
              <div className="space-y-6">
                {/* Contract Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-[#E9EDF2]">
                  <div>
                    <span className="text-[10px] font-semibold text-[#7B8493] uppercase block">Customer</span>
                    <span className="text-xs font-bold text-[#171717] block mt-0.5 truncate">
                      {subDetails.subscription.customerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-[#7B8493] uppercase block">Plan Cadence</span>
                    <span className="text-xs font-bold text-[#171717] block mt-0.5">
                      {subDetails.subscription.cadence}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-[#7B8493] uppercase block">Contract Value</span>
                    <span className="text-xs font-bold text-[#171717] block mt-0.5">
                      {formatCurrency(subDetails.subscription.amount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-[#7B8493] uppercase block">Status</span>
                    <div className="mt-0.5">{getStatusBadge(subDetails.subscription.status)}</div>
                  </div>
                </div>

                {/* Enabled Add-ons */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#171717] uppercase tracking-wider text-[#7B8493]">
                    Active Module Add-ons
                  </h4>
                  {subDetails.subscription.addOns.length === 0 ? (
                    <p className="text-xs text-[#7B8493]">No specialized add-ons configured.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {subDetails.subscription.addOns.map((addon) => (
                        <div
                          key={addon}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E2F0FC] text-xs font-semibold text-[#1E3A8A] border border-[#A9D4F5]/40"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>{addon}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Associated Invoices */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#171717] uppercase tracking-wider text-[#7B8493]">
                    Associated Billing Invoices ({subDetails.invoices.length})
                  </h4>
                  {subDetails.invoices.length === 0 ? (
                    <p className="text-xs text-[#7B8493]">No invoices attached to this contract.</p>
                  ) : (
                    <div className="space-y-2">
                      {subDetails.invoices.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between p-3 rounded-2xl border border-[#E9EDF2] bg-white text-xs"
                        >
                          <div>
                            <span className="font-bold text-[#171717] block">{inv.invoiceNumber}</span>
                            <span className="text-[11px] text-[#7B8493]">
                              Due: {new Date(inv.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-[#171717] block">
                              {formatCurrency(inv.total)}
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-700 bg-[#DDF0E1] px-2 py-0.5 rounded-full">
                              {inv.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
