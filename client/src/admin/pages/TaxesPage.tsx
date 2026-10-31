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
import { TaxRule } from '../types';
import { AdminCard } from '../components/common/AdminCard';
import { AdminButton } from '../components/common/AdminButton';
import { AdminBadge } from '../components/common/AdminBadge';
import { AdminModal } from '../components/common/AdminModal';
import { AdminConfirmDialog } from '../components/common/AdminConfirmDialog';

export const TaxesPage: React.FC = () => {
  const { taxes, addTax, updateTax, toggleTaxStatus, deleteTax } = useAdminData();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxRule | null>(null);
  const [taxToDelete, setTaxToDelete] = useState<TaxRule | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    rate: 18,
    type: 'Percentage' as 'Percentage' | 'Fixed Amount',
    applicableScope: 'All Products & Services',
    description: '',
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      rate: 18,
      type: 'Percentage',
      applicableScope: 'All Products & Services',
      description: '',
      isActive: true,
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (t: TaxRule) => {
    setEditingTax(t);
    setFormData({
      name: t.name,
      rate: t.rate,
      type: t.type,
      applicableScope: t.applicableScope,
      description: t.description || '',
      isActive: t.isActive,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingTax) {
      updateTax(editingTax.id, formData);
      setEditingTax(null);
    } else {
      addTax(formData);
      setIsAddModalOpen(false);
    }
    resetForm();
  };

  const filteredTaxes = taxes.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.applicableScope.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Search & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tax rules by name or scope..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>

        <AdminButton
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
        >
          Add Tax Rule
        </AdminButton>
      </div>

      {/* Table Card */}
      <AdminCard variant="default" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Tax Rule & Description</th>
                <th className="py-3.5 px-4">Rate / Calculation</th>
                <th className="py-3.5 px-4">Applicable Scope</th>
                <th className="py-3.5 px-4">Rule Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTaxes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    No tax rules configured.
                  </td>
                </tr>
              ) : (
                filteredTaxes.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900">{t.name}</div>
                      {t.description && (
                        <div className="text-slate-500 text-[11px] mt-0.5">{t.description}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 text-sm">
                        {t.rate}%
                      </span>
                      <span className="text-slate-500 ml-1">({t.type})</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {t.applicableScope}
                    </td>
                    <td className="py-3.5 px-4">
                      <AdminBadge statusText={t.isActive ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => toggleTaxStatus(t.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Toggle Active Rule"
                      >
                        {t.isActive ? (
                          <ToggleRight className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Edit Tax Rule"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setTaxToDelete(t)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Delete Tax Rule"
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
        isOpen={isAddModalOpen || !!editingTax}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTax(null);
        }}
        title={editingTax ? 'Edit Tax Rule' : 'Create Tax Rule'}
        subtitle="Define regulatory tax rates, jurisdictions, and automatic calculation scopes"
        maxWidth="md"
        footer={
          <>
            <AdminButton
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingTax(null);
              }}
            >
              Cancel
            </AdminButton>
            <AdminButton variant="primary" size="sm" onClick={handleSubmit}>
              {editingTax ? 'Save Rule' : 'Save Tax Rule'}
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tax Rule Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. GST (Standard 18%) or EU VAT"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tax Percentage (%) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Calculation Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none bg-white"
              >
                <option value="Percentage">Percentage</option>
                <option value="Fixed Amount">Fixed Amount</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Applicable Products or Services *
            </label>
            <input
              type="text"
              required
              value={formData.applicableScope}
              onChange={(e) => setFormData({ ...formData, applicableScope: e.target.value })}
              placeholder="All Products & Services, or SaaS Licenses Only"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Statutory Description / Jurisdiction
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Standard Integrated GST for domestic subscriptions"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
            />
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation */}
      <AdminConfirmDialog
        isOpen={!!taxToDelete}
        onClose={() => setTaxToDelete(null)}
        onConfirm={() => {
          if (taxToDelete) {
            deleteTax(taxToDelete.id);
            setTaxToDelete(null);
          }
        }}
        title="Delete Tax Rule"
        message={`Are you sure you want to delete tax rule ${taxToDelete?.name}?`}
        confirmText="Delete Rule"
        type="danger"
      />
    </div>
  );
};
