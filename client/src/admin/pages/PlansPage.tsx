import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { Plan, PlanFrequency } from '../types';
import { AdminCard } from '../components/common/AdminCard';
import { AdminButton } from '../components/common/AdminButton';
import { AdminBadge } from '../components/common/AdminBadge';
import { AdminModal } from '../components/common/AdminModal';
import { AdminConfirmDialog } from '../components/common/AdminConfirmDialog';

export const PlansPage: React.FC = () => {
  const { plans, products, addPlan, updatePlan, deletePlan } = useAdminData();

  const [searchQuery, setSearchQuery] = useState('');
  const [freqFilter, setFreqFilter] = useState<string>('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    productId: products[0]?.id || '',
    productName: products[0]?.name || '',
    frequency: 'Monthly' as PlanFrequency,
    price: 99,
    minQuantity: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    autoClose: false,
    allowPause: true,
    allowEarlyClosure: false,
    allowRenewal: true,
    status: 'Active' as 'Active' | 'Archived',
  });

  const resetForm = () => {
    const defaultProduct = products[0];
    setFormData({
      name: '',
      code: '',
      productId: defaultProduct?.id || '',
      productName: defaultProduct?.name || '',
      frequency: 'Monthly',
      price: 99,
      minQuantity: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      autoClose: false,
      allowPause: true,
      allowEarlyClosure: false,
      allowRenewal: true,
      status: 'Active',
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      code: plan.code,
      productId: plan.productId,
      productName: plan.productName,
      frequency: plan.frequency,
      price: plan.price,
      minQuantity: plan.minQuantity,
      startDate: plan.startDate,
      endDate: plan.endDate || '',
      autoClose: plan.autoClose,
      allowPause: plan.allowPause,
      allowEarlyClosure: plan.allowEarlyClosure,
      allowRenewal: plan.allowRenewal,
      status: plan.status,
    });
  };

  const handleProductChange = (productId: string) => {
    const matched = products.find((p) => p.id === productId);
    setFormData({
      ...formData,
      productId,
      productName: matched ? matched.name : '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingPlan) {
      updatePlan(editingPlan.id, formData);
      setEditingPlan(null);
    } else {
      addPlan({
        ...formData,
        code: formData.code || `PLAN-${Date.now().toString().slice(-4)}`,
      });
      setIsAddModalOpen(false);
    }
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (planToDelete) {
      deletePlan(planToDelete.id);
      setPlanToDelete(null);
    }
  };

  const filteredPlans = plans.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFreq = freqFilter === 'All' || p.frequency === freqFilter;
    return matchesSearch && matchesFreq;
  });

  return (
    <div className="space-y-6">
      {/* Top Search & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plans by name, code, or product..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <select
            value={freqFilter}
            onChange={(e) => setFreqFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option value="All">All Frequencies</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>

        <AdminButton variant="primary" size="md" icon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
          Create Plan
        </AdminButton>
      </div>

      {/* Plans Table Card */}
      <AdminCard variant="default" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Plan Title & Code</th>
                <th className="py-3.5 px-4">Frequency</th>
                <th className="py-3.5 px-4">Price / Min Qty</th>
                <th className="py-3.5 px-4">Lifecycle Rules</th>
                <th className="py-3.5 px-4">Subscribers</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No subscription plans found.
                  </td>
                </tr>
              ) : (
                filteredPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900">{plan.name}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Product: {plan.productName} • <span className="font-mono">{plan.code}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200">
                        {plan.frequency}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">${plan.price.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500">Min: {plan.minQuantity} units</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {plan.allowPause && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200">
                            Pause OK
                          </span>
                        )}
                        {plan.allowRenewal && (
                          <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-medium border border-sky-200">
                            Auto-Renew
                          </span>
                        )}
                        {plan.autoClose && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-200">
                            Auto-Close
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {plan.subscribersCount} active
                    </td>
                    <td className="py-3.5 px-4">
                      <AdminBadge statusText={plan.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(plan)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Edit Plan"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPlanToDelete(plan)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Delete Plan"
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

      {/* Add / Edit Plan Modal */}
      <AdminModal
        isOpen={isAddModalOpen || !!editingPlan}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPlan(null);
        }}
        title={editingPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
        subtitle="Configure billing intervals, automated closure parameters, and pause/renewal flags"
        maxWidth="lg"
        footer={
          <>
            <AdminButton
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingPlan(null);
              }}
            >
              Cancel
            </AdminButton>
            <AdminButton variant="primary" size="sm" onClick={handleSubmit}>
              {editingPlan ? 'Save Plan' : 'Create Plan'}
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Plan Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Standard Monthly Cloud"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Plan Code
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="PLAN-STD-M"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Associated Product *
              </label>
              <select
                value={formData.productId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none bg-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Billing Frequency *
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as PlanFrequency })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none bg-white"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Price ($) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Min Quantity
              </label>
              <input
                type="number"
                min="1"
                value={formData.minQuantity}
                onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Availability Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Availability End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none bg-white"
              />
            </div>
          </div>

          {/* Toggle Switches for Pause, Auto-Close, Early-Closure, Renewal */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Plan Policy Rules
            </span>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowPause}
                  onChange={(e) => setFormData({ ...formData, allowPause: e.target.checked })}
                  className="rounded text-slate-900 focus:ring-0 w-4 h-4"
                />
                <span className="font-medium text-slate-700">Allow Customer to Pause</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowRenewal}
                  onChange={(e) => setFormData({ ...formData, allowRenewal: e.target.checked })}
                  className="rounded text-slate-900 focus:ring-0 w-4 h-4"
                />
                <span className="font-medium text-slate-700">Support Automatic Renewal</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoClose}
                  onChange={(e) => setFormData({ ...formData, autoClose: e.target.checked })}
                  className="rounded text-slate-900 focus:ring-0 w-4 h-4"
                />
                <span className="font-medium text-slate-700">Auto-Close on Expiration</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowEarlyClosure}
                  onChange={(e) => setFormData({ ...formData, allowEarlyClosure: e.target.checked })}
                  className="rounded text-slate-900 focus:ring-0 w-4 h-4"
                />
                <span className="font-medium text-slate-700">Allow Early Closure</span>
              </label>
            </div>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation */}
      <AdminConfirmDialog
        isOpen={!!planToDelete}
        onClose={() => setPlanToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Plan"
        message={`Are you sure you want to delete ${planToDelete?.name}?`}
        confirmText="Delete Plan"
        type="danger"
      />
    </div>
  );
};
