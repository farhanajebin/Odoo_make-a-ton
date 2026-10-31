import React, { useState } from 'react';
import {
  Layers,
  Search,
  Plus,
  Edit2,
  Trash2,
  Tag,
} from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { ProductVariant } from '../types';
import { AdminCard } from '../components/common/AdminCard';
import { AdminButton } from '../components/common/AdminButton';
import { AdminBadge } from '../components/common/AdminBadge';
import { AdminModal } from '../components/common/AdminModal';
import { AdminConfirmDialog } from '../components/common/AdminConfirmDialog';

export const ProductVariantsPage: React.FC = () => {
  const { variants, products, addVariant, updateVariant, deleteVariant } = useAdminData();

  const [searchQuery, setSearchQuery] = useState('');
  const [productFilter, setProductFilter] = useState<string>('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [variantToDelete, setVariantToDelete] = useState<ProductVariant | null>(null);

  const [formData, setFormData] = useState({
    productId: products[0]?.id || '',
    productName: products[0]?.name || '',
    name: '',
    additionalPrice: 0,
    sku: '',
    status: 'Active' as 'Active' | 'Inactive',
  });

  const resetForm = () => {
    const defaultProduct = products[0];
    setFormData({
      productId: defaultProduct?.id || '',
      productName: defaultProduct?.name || '',
      name: '',
      additionalPrice: 0,
      sku: '',
      status: 'Active',
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (v: ProductVariant) => {
    setEditingVariant(v);
    setFormData({
      productId: v.productId,
      productName: v.productName,
      name: v.name,
      additionalPrice: v.additionalPrice,
      sku: v.sku,
      status: v.status,
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
    if (!formData.name || !formData.productId) return;

    if (editingVariant) {
      updateVariant(editingVariant.id, formData);
      setEditingVariant(null);
    } else {
      addVariant({
        ...formData,
        sku: formData.sku || `VAR-${Date.now().toString().slice(-4)}`,
      });
      setIsAddModalOpen(false);
    }
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (variantToDelete) {
      deleteVariant(variantToDelete.id);
      setVariantToDelete(null);
    }
  };

  const filteredVariants = variants.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProduct = productFilter === 'All' || v.productId === productFilter;
    return matchesSearch && matchesProduct;
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
              placeholder="Search variants by brand, name, or SKU..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option value="All">All Base Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <AdminButton variant="primary" size="md" icon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
          Add Variant
        </AdminButton>
      </div>

      {/* Info Callout for Brand Pricing Rules */}
      <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">Dynamic Brand Tiering Rule</div>
            <p className="text-[11px] text-slate-600">
              e.g., Selecting the <span className="font-semibold text-slate-900">Odoo Brand</span> or <span className="font-semibold text-slate-900">Enterprise SLA</span> applies an additive surcharge (e.g. +₹560 or +$120) over the base product price.
            </p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <AdminCard variant="default" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Variant / Brand Name</th>
                <th className="py-3.5 px-4">Associated Product</th>
                <th className="py-3.5 px-4">SKU Code</th>
                <th className="py-3.5 px-4">Additional Pricing</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredVariants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No product variants found.
                  </td>
                </tr>
              ) : (
                filteredVariants.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>{v.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {v.productName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                      {v.sku}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-700">
                        +${v.additionalPrice.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <AdminBadge statusText={v.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(v)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Edit Variant"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setVariantToDelete(v)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Delete Variant"
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
        isOpen={isAddModalOpen || !!editingVariant}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingVariant(null);
        }}
        title={editingVariant ? 'Edit Product Variant' : 'Add Product Variant'}
        subtitle="Associate brand attributes and price surcharges to a base product"
        maxWidth="md"
        footer={
          <>
            <AdminButton
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingVariant(null);
              }}
            >
              Cancel
            </AdminButton>
            <AdminButton variant="primary" size="sm" onClick={handleSubmit}>
              {editingVariant ? 'Save Variant' : 'Create Variant'}
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
                  {p.name} (${p.sellingPrice.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Brand / Variant Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Odoo Brand Edition or High-Performance SLA"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Additional Pricing ($ or ₹) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.additionalPrice}
                onChange={(e) => setFormData({ ...formData, additionalPrice: parseFloat(e.target.value) || 0 })}
                placeholder="560"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Variant SKU Code
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="VAR-ODOO-560"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none bg-white"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation */}
      <AdminConfirmDialog
        isOpen={!!variantToDelete}
        onClose={() => setVariantToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Product Variant"
        message={`Are you sure you want to delete ${variantToDelete?.name}?`}
        confirmText="Delete Variant"
        type="danger"
      />
    </div>
  );
};
