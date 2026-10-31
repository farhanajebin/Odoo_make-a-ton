import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { Product, ProductType } from '../types';
import { AdminCard } from '../components/common/AdminCard';
import { AdminButton } from '../components/common/AdminButton';
import { AdminBadge } from '../components/common/AdminBadge';
import { AdminModal } from '../components/common/AdminModal';
import { AdminConfirmDialog } from '../components/common/AdminConfirmDialog';

export const ProductsPage: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useAdminData();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'Recurring Subscription' as ProductType,
    sellingPrice: 0,
    costPrice: 0,
    notes: '',
    status: 'Active' as 'Active' | 'Archived',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'Recurring Subscription',
      sellingPrice: 0,
      costPrice: 0,
      notes: '',
      status: 'Active',
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      code: p.code,
      type: p.type,
      sellingPrice: p.sellingPrice,
      costPrice: p.costPrice,
      notes: p.notes || '',
      status: p.status,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
      setEditingProduct(null);
    } else {
      addProduct({
        ...formData,
        code: formData.code || `PRD-${Date.now().toString().slice(-4)}`,
      });
      setIsAddModalOpen(false);
    }
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || p.type === typeFilter;
    return matchesSearch && matchesType;
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
              placeholder="Search products by title or sku code..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option value="All">All Types</option>
            <option value="Recurring Subscription">Recurring Subscription</option>
            <option value="One-Time Charge">One-Time Charge</option>
            <option value="Usage Metered">Usage Metered</option>
            <option value="Addon">Addon</option>
          </select>
        </div>

        <AdminButton variant="primary" size="md" icon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
          Add Product
        </AdminButton>
      </div>

      {/* Table Card */}
      <AdminCard variant="default" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Product Code & Name</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Selling Price</th>
                <th className="py-3.5 px-4">Cost Price</th>
                <th className="py-3.5 px-4">Gross Margin</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const margin = p.sellingPrice - p.costPrice;
                  const marginPct = p.sellingPrice > 0 ? ((margin / p.sellingPrice) * 100).toFixed(0) : '0';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900">{p.name}</div>
                        <div className="text-slate-500 text-[11px] font-mono mt-0.5">{p.code}</div>
                        {p.notes && <div className="text-slate-400 text-[10px] italic mt-0.5">{p.notes}</div>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800">{p.type}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ${p.sellingPrice.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        ${p.costPrice.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-emerald-700">
                          +${margin.toLocaleString()} ({marginPct}%)
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <AdminBadge statusText={p.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(p)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* Add / Edit Modal */}
      <AdminModal
        isOpen={isAddModalOpen || !!editingProduct}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        subtitle="Specify product catalog details, billing type, and pricing parameters"
        maxWidth="md"
        footer={
          <>
            <AdminButton
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingProduct(null);
              }}
            >
              Cancel
            </AdminButton>
            <AdminButton variant="primary" size="sm" onClick={handleSubmit}>
              {editingProduct ? 'Save Product' : 'Create Product'}
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Enterprise Cloud Suite"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Code / SKU
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="PRD-CLOUD-ENT"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ProductType })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none bg-white"
              >
                <option value="Recurring Subscription">Recurring Subscription</option>
                <option value="One-Time Charge">One-Time Charge</option>
                <option value="Usage Metered">Usage Metered</option>
                <option value="Addon">Addon</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Selling Price ($) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cost Price ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Archived' })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none bg-white"
              >
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notes
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional internal remarks"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation */}
      <AdminConfirmDialog
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete ${productToDelete?.name}? Existing subscriptions may be impacted.`}
        confirmText="Delete Product"
        type="danger"
      />
    </div>
  );
};
