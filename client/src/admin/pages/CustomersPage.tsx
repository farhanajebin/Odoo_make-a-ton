import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Building,
} from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { Customer, CustomerStatus } from '../types';
import { AdminCard } from '../components/common/AdminCard';
import { AdminButton } from '../components/common/AdminButton';
import { AdminBadge } from '../components/common/AdminBadge';
import { AdminModal } from '../components/common/AdminModal';
import { AdminConfirmDialog } from '../components/common/AdminConfirmDialog';

export const CustomersPage: React.FC = () => {
  const { customers, subscriptions, invoices, addCustomer, updateCustomer, deleteCustomer } = useAdminData();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [detailTab, setDetailTab] = useState<'details' | 'subscriptions' | 'invoices'>('details');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'Active' as CustomerStatus,
    currency: 'USD',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      status: 'Active',
      currency: 'USD',
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      email: c.email,
      phone: c.phone,
      company: c.company,
      status: c.status,
      currency: c.currency,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
      setEditingCustomer(null);
    } else {
      addCustomer(formData);
      setIsAddModalOpen(false);
    }
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (customerToDelete) {
      deleteCustomer(customerToDelete.id);
      setCustomerToDelete(null);
      if (viewingCustomer?.id === customerToDelete.id) {
        setViewingCustomer(null);
      }
    }
  };

  // Filter logic
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Associated records for viewing customer
  const customerSubs = viewingCustomer
    ? subscriptions.filter((s) => s.customerId === viewingCustomer.id)
    : [];
  const customerInvs = viewingCustomer
    ? invoices.filter((i) => i.customerId === viewingCustomer.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Action & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers by name, company, or email..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Lead">Lead</option>
            <option value="Delinquent">Delinquent</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <AdminButton variant="primary" size="md" icon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
          Add Customer
        </AdminButton>
      </div>

      {/* Customer Table Card */}
      <AdminCard variant="default" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Customer / Company</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Active Subs</th>
                <th className="py-3.5 px-4">Total Invoiced</th>
                <th className="py-3.5 px-4">Balance</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No customers found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900">{c.name}</div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3" /> {c.company}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800">{c.email}</div>
                      <div className="text-slate-500 text-[11px]">{c.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <AdminBadge statusText={c.status} />
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {c.activeSubscriptionsCount}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      ${c.totalInvoiced.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      <span className={c.balance > 0 ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                        ${c.balance.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => {
                          setViewingCustomer(c);
                          setDetailTab('details');
                        }}
                        className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                        title="View Customer Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Edit Customer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCustomerToDelete(c)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Delete Customer"
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

      {/* Add / Edit Customer Modal */}
      <AdminModal
        isOpen={isAddModalOpen || !!editingCustomer}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingCustomer(null);
        }}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        subtitle="Manage customer account metadata and billing profile"
        maxWidth="md"
        footer={
          <>
            <AdminButton
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingCustomer(null);
              }}
            >
              Cancel
            </AdminButton>
            <AdminButton variant="primary" size="sm" onClick={handleSubmit}>
              {editingCustomer ? 'Save Changes' : 'Create Customer'}
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contact Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Eleanor Vance"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="billing@company.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Acme Global Inc"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none bg-white"
              >
                <option value="Active">Active</option>
                <option value="Lead">Lead</option>
                <option value="Delinquent">Delinquent</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </form>
      </AdminModal>

      {/* Customer Details Drawer / Modal */}
      {viewingCustomer && (
        <AdminModal
          isOpen={!!viewingCustomer}
          onClose={() => setViewingCustomer(null)}
          title={viewingCustomer.name}
          subtitle={viewingCustomer.company}
          maxWidth="lg"
          footer={
            <AdminButton variant="outline" size="sm" onClick={() => setViewingCustomer(null)}>
              Close
            </AdminButton>
          }
        >
          <div className="space-y-5">
            {/* Nav Tabs inside modal */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <button
                onClick={() => setDetailTab('details')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  detailTab === 'details' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setDetailTab('subscriptions')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  detailTab === 'subscriptions' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Subscription History ({customerSubs.length})
              </button>
              <button
                onClick={() => setDetailTab('invoices')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  detailTab === 'invoices' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Invoice History ({customerInvs.length})
              </button>
            </div>

            {/* Overview Tab */}
            {detailTab === 'details' && (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Contact Info</div>
                  <div><span className="font-semibold text-slate-700">Email:</span> {viewingCustomer.email}</div>
                  <div><span className="font-semibold text-slate-700">Phone:</span> {viewingCustomer.phone}</div>
                  <div><span className="font-semibold text-slate-700">Company:</span> {viewingCustomer.company}</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Financial Summary</div>
                  <div><span className="font-semibold text-slate-700">Status:</span> <AdminBadge statusText={viewingCustomer.status} /></div>
                  <div><span className="font-semibold text-slate-700">Active Subs:</span> {viewingCustomer.activeSubscriptionsCount}</div>
                  <div><span className="font-semibold text-slate-700">Total Invoiced:</span> ${viewingCustomer.totalInvoiced.toLocaleString()}</div>
                  <div><span className="font-semibold text-slate-700">Outstanding:</span> ${viewingCustomer.balance.toLocaleString()}</div>
                </div>
              </div>
            )}

            {/* Subscriptions Tab */}
            {detailTab === 'subscriptions' && (
              <div className="space-y-2">
                {customerSubs.length === 0 ? (
                  <p className="text-center py-6 text-slate-400 text-xs">No subscriptions registered for this customer.</p>
                ) : (
                  customerSubs.map((sub) => (
                    <div key={sub.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-900">{sub.subscriptionNumber} • {sub.planName}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">Frequency: {sub.frequency} | Expires: {sub.expiryDate}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900">${sub.totalAmount.toLocaleString()}</span>
                        <AdminBadge statusText={sub.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Invoices Tab */}
            {detailTab === 'invoices' && (
              <div className="space-y-2">
                {customerInvs.length === 0 ? (
                  <p className="text-center py-6 text-slate-400 text-xs">No invoices on record for this customer.</p>
                ) : (
                  customerInvs.map((inv) => (
                    <div key={inv.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-900">{inv.invoiceNumber}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">Due: {inv.dueDate} | Issued: {inv.issueDate}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900">${inv.total.toLocaleString()}</span>
                        <AdminBadge statusText={inv.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </AdminModal>
      )}

      {/* Delete Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Customer Account"
        message={`Are you sure you want to delete ${customerToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete Customer"
        type="danger"
      />
    </div>
  );
};
