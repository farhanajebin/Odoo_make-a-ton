import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { Discount, DiscountType, DiscountScope } from '../types';
import { AdminCard } from '../components/common/AdminCard';
import { AdminButton } from '../components/common/AdminButton';
import { AdminBadge } from '../components/common/AdminBadge';
import { AdminModal } from '../components/common/AdminModal';
import { AdminConfirmDialog } from '../components/common/AdminConfirmDialog';

export const DiscountsPage: React.FC = () => {
  const { discounts, products, addDiscount, updateDiscount, toggleDiscountStatus, deleteDiscount } =
    useAdminData();

  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState<string>('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [discountToDelete, setDiscountToDelete] = useState<Discount | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    type: 'Percentage' as DiscountType,
    value: 15,
    minPurchaseAmount: 100,
    minQuantity: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maxUsageLimit: 100,
    scope: 'Subscription-wide' as DiscountScope,
    applicableProductId: '',
    applicableProductName: '',
    status: 'Active' as 'Active' | 'Expired',
  });

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'Percentage',
      value: 15,
      minPurchaseAmount: 100,
      minQuantity: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      maxUsageLimit: 100,
      scope: 'Subscription-wide',
      applicableProductId: '',
      applicableProductName: '',
      status: 'Active',
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (d: Discount) => {
    setEditingDiscount(d);
    setFormData({
      code: d.code,
      type: d.type,
      value: d.value,
      minPurchaseAmount: d.minPurchaseAmount,
      minQuantity: d.minQuantity,
      startDate: d.startDate,
      endDate: d.endDate,
      maxUsageLimit: d.maxUsageLimit,
      scope: d.scope,
      applicableProductId: d.applicableProductId || '',
      applicableProductName: d.applicableProductName || '',
      status: d.status,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code) return;

    if (editingDiscount) {
      updateDiscount(editingDiscount.id, formData);
      setEditingDiscount(null);
    } else {
      addDiscount(formData);
      setIsAddModalOpen(false);
    }
    resetForm();
  };

  const filteredDiscounts = discounts.filter((d) => {
    const matchesSearch = d.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesScope = scopeFilter === 'All' || d.scope === scopeFilter;
    return matchesSearch && matchesScope;
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
              placeholder="Search discount promo codes..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option value="All">All Scopes</option>
            <option value="Subscription-wide">Subscription-wide</option>
            <option value="Product-specific">Product-specific</option>
          </select>
        </div>

        <AdminButton
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
        >
          Add Discount Rule
        </AdminButton>
      </div>

      {/* Table Card */}
      <AdminCard variant="default" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Promo Code</th>
                <th className="py-3.5 px-4">Type & Value</th>
                <th className="py-3.5 px-4">Scope</th>
                <th className="py-3.5 px-4">Thresholds</th>
                <th className="py-3.5 px-4">Usage / Limit</th>
                <th className="py-3.5 px-4">Validity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDiscounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No discounts configured.
                  </td>
                </tr>
              ) : (
                filteredDiscounts.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-bold font-mono text-slate-900 tracking-wider">
                      {d.code}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-700">
                        {d.type === 'Percentage' ? `${d.value}% OFF` : `$${d.value} OFF`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-medium">{d.scope}</span>
                      {d.applicableProductName && (
                        <div className="text-[10px] text-slate-400">
                          Applies to: {d.applicableProductName}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div>Min Spend: ${d.minPurchaseAmount}</div>
                      <div className="text-[11px]">Min Qty: {d.minQuantity}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {d.usageCount} / {d.maxUsageLimit}
                      </div>
                      <div className="w-20 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className="bg-teal-600 h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (d.usageCount / d.maxUsageLimit) * 100)}%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div>{d.startDate}</div>
                      <div className="text-[11px]">to {d.endDate}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <AdminBadge statusText={d.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => toggleDiscountStatus(d.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Toggle Status"
                      >
                        {d.status === 'Active' ? (
                          <ToggleRight className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(d)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Edit Discount"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDiscountToDelete(d)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Delete Discount"
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

      {/* Add / Edit Modal */}
      <AdminModal
        isOpen={isAddModalOpen || !!editingDiscount}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingDiscount(null);
        }}
        title={editingDiscount ? 'Edit Discount Rule' : 'Create Discount Coupon'}
        subtitle="Configure promotional terms, discount scopes, and maximum redemptions"
        maxWidth="lg"
        footer={
          <>
            <AdminButton
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingDiscount(null);
              }}
            >
              Cancel
            </AdminButton>
            <AdminButton variant="primary" size="sm" onClick={handleSubmit}>
              {editingDiscount ? 'Save Rule' : 'Create Discount'}
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Coupon Code *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="ENTERPRISE25"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Discount Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as DiscountType })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none bg-white"
              >
                <option value="Percentage">Percentage (%)</option>
                <option value="Fixed Amount">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Discount Value *
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                required
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                placeholder="20"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Discount Scope *
              </label>
              <select
                value={formData.scope}
                onChange={(e) => setFormData({ ...formData, scope: e.target.value as DiscountScope })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none bg-white"
              >
                <option value="Subscription-wide">Subscription-wide (Entire Agreement)</option>
                <option value="Product-specific">Product-specific Item</option>
              </select>
            </div>

            {formData.scope === 'Product-specific' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Applicable Product
                </label>
                <select
                  value={formData.applicableProductId}
                  onChange={(e) => {
                    const pr = products.find((p) => p.id === e.target.value);
                    setFormData({
                      ...formData,
                      applicableProductId: e.target.value,
                      applicableProductName: pr ? pr.name : '',
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none bg-white"
                >
                  <option value="">Select Target Product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Min Purchase ($)
              </label>
              <input
                type="number"
                min="0"
                value={formData.minPurchaseAmount}
                onChange={(e) => setFormData({ ...formData, minPurchaseAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Min Quantity
              </label>
              <input
                type="number"
                min="1"
                value={formData.minQuantity}
                onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max Usage Limit
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxUsageLimit}
                onChange={(e) => setFormData({ ...formData, maxUsageLimit: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation */}
      <AdminConfirmDialog
        isOpen={!!discountToDelete}
        onClose={() => setDiscountToDelete(null)}
        onConfirm={() => {
          if (discountToDelete) {
            deleteDiscount(discountToDelete.id);
            setDiscountToDelete(null);
          }
        }}
        title="Delete Discount Rule"
        message={`Are you sure you want to delete discount code ${discountToDelete?.code}?`}
        confirmText="Delete Discount"
        type="danger"
      />
    </div>
  );
};
