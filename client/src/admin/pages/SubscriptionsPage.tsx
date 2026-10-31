import React, { useState } from 'react';
import {
  Search,
  Plus,
  Play,
  Pause,
  RefreshCw,
  Eye,
  Trash2,
} from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { Subscription, SubscriptionStatus } from '../types';
import { AdminCard } from '../components/common/AdminCard';
import { AdminButton } from '../components/common/AdminButton';
import { AdminBadge } from '../components/common/AdminBadge';
import { AdminModal } from '../components/common/AdminModal';
import { AdminConfirmDialog } from '../components/common/AdminConfirmDialog';

const STATUS_PROGRESSION: SubscriptionStatus[] = [
  'Draft',
  'Quotation',
  'Confirmed',
  'Active',
  'Closed',
];

export const SubscriptionsPage: React.FC = () => {
  const {
    subscriptions,
    customers,
    plans,
    products,
    addSubscription,
    updateSubscriptionStatus,
    pauseSubscription,
    resumeSubscription,
    renewSubscription,
    deleteSubscription,
  } = useAdminData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingSub, setViewingSub] = useState<Subscription | null>(null);
  const [subToDelete, setSubToDelete] = useState<Subscription | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    customerId: customers[0]?.id || '',
    planId: plans[0]?.id || '',
    paymentTerms: 'Net 30 Days',
    autoRenew: true,
  });

  const handleCreateSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === formData.customerId);
    const plan = plans.find((p) => p.id === formData.planId);
    if (!cust || !plan) return;

    const prod = products.find((p) => p.id === plan.productId) || products[0];
    const amount = plan.price;
    const taxAmount = amount * 0.18;
    const totalAmount = amount + taxAmount;

    const startDate = new Date().toISOString().split('T')[0];
    const expiry = new Date();
    if (plan.frequency === 'Daily') expiry.setDate(expiry.getDate() + 30);
    else if (plan.frequency === 'Weekly') expiry.setDate(expiry.getDate() + 90);
    else if (plan.frequency === 'Yearly') expiry.setFullYear(expiry.getFullYear() + 1);
    else expiry.setMonth(expiry.getMonth() + 1); // Monthly

    addSubscription({
      customerId: cust.id,
      customerName: cust.name,
      customerEmail: cust.email,
      planId: plan.id,
      planName: plan.name,
      frequency: plan.frequency,
      startDate,
      expiryDate: expiry.toISOString().split('T')[0],
      paymentTerms: formData.paymentTerms,
      status: 'Active',
      lines: [
        {
          productId: prod.id,
          productName: prod.name,
          planId: plan.id,
          planName: plan.name,
          quantity: 1,
          unitPrice: plan.price,
          taxRate: 18,
          total: totalAmount,
        },
      ],
      amount,
      taxAmount,
      totalAmount,
      autoRenew: formData.autoRenew,
    });

    setIsAddModalOpen(false);
  };

  const filteredSubs = subscriptions.filter((s) => {
    const matchesSearch =
      s.subscriptionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.planName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subscriptions by number, customer, or plan..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Quotation">Quotation</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <AdminButton
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          New Subscription
        </AdminButton>
      </div>

      {/* Subscriptions Table */}
      <AdminCard variant="default" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Subscription #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Plan & Cadence</th>
                <th className="py-3.5 px-4">Billing Period</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Lifecycle Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900">{sub.subscriptionNumber}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Terms: {sub.paymentTerms}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">{sub.customerName}</div>
                      <div className="text-slate-500 text-[11px]">{sub.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{sub.planName}</span>
                      <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {sub.frequency}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div>Start: {sub.startDate}</div>
                      <div className="text-[11px]">Exp: {sub.expiryDate}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ${sub.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <AdminBadge statusText={sub.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => setViewingSub(sub)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Pause / Resume action */}
                      {sub.status === 'Active' ? (
                        <button
                          onClick={() => pauseSubscription(sub.id)}
                          className="p-1.5 text-amber-600 hover:text-amber-700 rounded-lg hover:bg-amber-50 transition-colors"
                          title="Pause Subscription"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      ) : sub.status === 'Paused' ? (
                        <button
                          onClick={() => resumeSubscription(sub.id)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
                          title="Resume Subscription"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      ) : null}

                      {/* Renew button */}
                      <button
                        onClick={() => renewSubscription(sub.id)}
                        className="p-1.5 text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Renew Subscription"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setSubToDelete(sub)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Delete Subscription"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* New Subscription Modal */}
      <AdminModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Direct Subscription"
        subtitle="Provision an agreement directly with automatic cycle computation"
        maxWidth="md"
        footer={
          <>
            <AdminButton variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton variant="primary" size="sm" onClick={handleCreateSubscription}>
              Create Subscription
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleCreateSubscription} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Customer *
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none bg-white"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.company})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Plan *
            </label>
            <select
              value={formData.planId}
              onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none bg-white"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ${p.price}/{p.frequency}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Terms
            </label>
            <select
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none bg-white"
            >
              <option value="Immediate Due">Immediate Due</option>
              <option value="Net 15 Days">Net 15 Days</option>
              <option value="Net 30 Days">Net 30 Days</option>
              <option value="Net 60 Days">Net 60 Days</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={formData.autoRenew}
              onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
              className="rounded text-slate-900 focus:ring-0 w-4 h-4"
            />
            <span className="text-xs font-medium text-slate-700">Enable Automated Renewal on Expiry</span>
          </label>
        </form>
      </AdminModal>

      {/* Subscription Details Modal */}
      {viewingSub && (
        <AdminModal
          isOpen={!!viewingSub}
          onClose={() => setViewingSub(null)}
          title={`Subscription ${viewingSub.subscriptionNumber}`}
          subtitle={`${viewingSub.customerName} • ${viewingSub.planName}`}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium">Stage:</span>
                <AdminBadge statusText={viewingSub.status} />
              </div>
              <div className="flex items-center gap-2">
                <AdminButton
                  variant="outline"
                  size="sm"
                  onClick={() => renewSubscription(viewingSub.id)}
                >
                  Renew Cycle
                </AdminButton>
                <AdminButton variant="primary" size="sm" onClick={() => setViewingSub(null)}>
                  Done
                </AdminButton>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Status Pipeline Step Indicator */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Status Progression Pipeline
              </span>
              <div className="flex items-center justify-between">
                {STATUS_PROGRESSION.map((st, i) => {
                  const isCurrent = viewingSub.status === st;
                  return (
                    <button
                      key={st}
                      onClick={() => updateSubscriptionStatus(viewingSub.id, st)}
                      className={`flex flex-col items-center gap-1 group transition-all`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-400'
                            : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                        }`}
                      >
                        {i + 1}
                      </div>
                      <span className={`text-[11px] font-medium ${isCurrent ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                        {st}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subscription Info Card */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="space-y-1.5">
                <div><span className="text-slate-500">Customer:</span> <strong className="text-slate-800">{viewingSub.customerName}</strong></div>
                <div><span className="text-slate-500">Email:</span> {viewingSub.customerEmail}</div>
                <div><span className="text-slate-500">Payment Terms:</span> {viewingSub.paymentTerms}</div>
              </div>
              <div className="space-y-1.5">
                <div><span className="text-slate-500">Plan Cadence:</span> {viewingSub.frequency}</div>
                <div><span className="text-slate-500">Start Date:</span> {viewingSub.startDate}</div>
                <div><span className="text-slate-500">Expiry Date:</span> {viewingSub.expiryDate}</div>
              </div>
            </div>

            {/* Line items */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="p-3">Product Item</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Tax Rate</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewingSub.lines.map((l, i) => (
                    <tr key={i}>
                      <td className="p-3 font-medium text-slate-900">{l.productName}</td>
                      <td className="p-3 text-center">{l.quantity}</td>
                      <td className="p-3 text-right">${l.unitPrice.toLocaleString()}</td>
                      <td className="p-3 text-right">{l.taxRate}%</td>
                      <td className="p-3 text-right font-semibold text-slate-900">
                        ${l.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pr-2">
              <div className="w-56 space-y-1 text-right">
                <div className="text-slate-500">Amount: ${viewingSub.amount.toLocaleString()}</div>
                <div className="text-slate-500">Tax Total: ${viewingSub.taxAmount.toLocaleString()}</div>
                <div className="text-base font-bold text-slate-900 pt-1 border-t border-slate-200">
                  Grand Total: ${viewingSub.totalAmount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </AdminModal>
      )}

      {/* Delete Confirmation */}
      <AdminConfirmDialog
        isOpen={!!subToDelete}
        onClose={() => setSubToDelete(null)}
        onConfirm={() => {
          if (subToDelete) {
            deleteSubscription(subToDelete.id);
            setSubToDelete(null);
          }
        }}
        title="Delete Subscription"
        message={`Are you sure you want to delete subscription ${subToDelete?.subscriptionNumber}?`}
        confirmText="Delete Subscription"
        type="danger"
      />
    </div>
  );
};
