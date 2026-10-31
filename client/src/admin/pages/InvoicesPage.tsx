import React, { useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  CheckCircle,
  Send,
  Printer,
  Trash2,
} from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { Invoice, InvoiceLine } from '../types';
import { AdminCard } from '../components/common/AdminCard';
import { AdminButton } from '../components/common/AdminButton';
import { AdminBadge } from '../components/common/AdminBadge';
import { AdminModal } from '../components/common/AdminModal';
import { AdminConfirmDialog } from '../components/common/AdminConfirmDialog';

export const InvoicesPage: React.FC = () => {
  const {
    invoices,
    customers,
    addInvoice,
    confirmInvoice,
    markInvoicePaid,
    deleteInvoice,
    showToast,
  } = useAdminData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  // New Invoice Form
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [lines, setLines] = useState<InvoiceLine[]>([
    { description: 'Monthly Cloud Infrastructure Tier', quantity: 1, unitPrice: 350, amount: 350 },
  ]);

  const addLine = () => {
    setLines([...lines, { description: 'Additional Service Line', quantity: 1, unitPrice: 100, amount: 100 }]);
  };

  const handleLineChange = (index: number, field: keyof InvoiceLine, value: any) => {
    const updated = [...lines];
    const item = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      item.amount = (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0);
    }
    updated[index] = item;
    setLines(updated);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const subtotal = lines.reduce((acc, l) => acc + l.amount, 0);
  const taxTotal = subtotal * 0.18;
  const grandTotal = subtotal + taxTotal;

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === selectedCustomerId);
    if (!cust) return;

    addInvoice({
      customerId: cust.id,
      customerName: cust.name,
      customerEmail: cust.email,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate,
      status: 'Draft',
      lines,
      subtotal,
      taxRate: 18,
      taxTotal,
      total: grandTotal,
      amountPaid: 0,
      balanceDue: grandTotal,
    });

    setIsAddModalOpen(false);
  };

  const handleSendInvoice = (inv: Invoice) => {
    showToast(`Invoice ${inv.invoiceNumber} dispatched to ${inv.customerEmail}`, 'success');
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
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
              placeholder="Search invoices by number or customer..."
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
            <option value="Confirmed">Confirmed</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <AdminButton
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Create Invoice
        </AdminButton>
      </div>

      {/* Invoices Table Card */}
      <AdminCard variant="default" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Invoice #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Dates</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Balance Due</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      {inv.invoiceNumber}
                      {inv.subscriptionNumber && (
                        <div className="text-[10px] text-slate-400 font-normal">
                          Sub: {inv.subscriptionNumber}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">{inv.customerName}</div>
                      <div className="text-slate-500 text-[11px]">{inv.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div>Issued: {inv.issueDate}</div>
                      <div className="text-[11px]">Due: {inv.dueDate}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ${inv.total.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={inv.balanceDue > 0 ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                        ${inv.balanceDue.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <AdminBadge statusText={inv.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => setViewingInvoice(inv)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleSendInvoice(inv)}
                        className="p-1.5 text-slate-500 hover:text-sky-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Send to Customer"
                      >
                        <Send className="w-4 h-4" />
                      </button>

                      {inv.status === 'Draft' && (
                        <button
                          onClick={() => confirmInvoice(inv.id)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
                          title="Confirm Invoice"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}

                      {inv.status !== 'Paid' && inv.status !== 'Cancelled' && (
                        <button
                          onClick={() => markInvoicePaid(inv.id, 'Credit Card')}
                          className="px-2 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                          title="Record Payment"
                        >
                          Mark Paid
                        </button>
                      )}

                      <button
                        onClick={() => setInvoiceToDelete(inv)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Delete Invoice"
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

      {/* Manual Invoice Creation Modal */}
      <AdminModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Issue Commercial Invoice"
        subtitle="Generate manual receivable billing with custom line items"
        maxWidth="lg"
        footer={
          <>
            <AdminButton variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton variant="primary" size="sm" onClick={handleCreateInvoice}>
              Create Invoice
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Customer *
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
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
                Payment Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none bg-white"
              />
            </div>
          </div>

          {/* Invoice Line items */}
          <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-slate-50/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Line Items
              </span>
              <button
                type="button"
                onClick={addLine}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900"
              >
                + Add Line
              </button>
            </div>

            {lines.map((l, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-lg border border-slate-100 text-xs">
                <input
                  type="text"
                  placeholder="Item description"
                  value={l.description}
                  onChange={(e) => handleLineChange(i, 'description', e.target.value)}
                  className="col-span-6 px-2 py-1.5 border border-slate-200 rounded-lg"
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={l.quantity}
                  onChange={(e) => handleLineChange(i, 'quantity', parseInt(e.target.value, 10) || 1)}
                  className="col-span-2 px-2 py-1.5 border border-slate-200 rounded-lg text-center"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={l.unitPrice}
                  onChange={(e) => handleLineChange(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                  className="col-span-3 px-2 py-1.5 border border-slate-200 rounded-lg"
                />
                <div className="col-span-1 text-right">
                  {lines.length > 1 && (
                    <button type="button" onClick={() => removeLine(i)} className="text-slate-400 hover:text-rose-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="pt-2 text-right text-xs space-y-1">
              <div className="text-slate-500">Subtotal: ${subtotal.toLocaleString()}</div>
              <div className="text-slate-500">Tax (18%): ${taxTotal.toLocaleString()}</div>
              <div className="font-bold text-slate-900">Total: ${grandTotal.toLocaleString()}</div>
            </div>
          </div>
        </form>
      </AdminModal>

      {/* Invoice Detail / Print Preview Modal */}
      {viewingInvoice && (
        <AdminModal
          isOpen={!!viewingInvoice}
          onClose={() => setViewingInvoice(null)}
          title={`Invoice ${viewingInvoice.invoiceNumber}`}
          subtitle={`Issued to ${viewingInvoice.customerName}`}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <AdminButton
                  variant="outline"
                  size="sm"
                  icon={<Printer className="w-4 h-4" />}
                  onClick={handlePrintInvoice}
                >
                  Print Invoice
                </AdminButton>
                <AdminButton
                  variant="outline"
                  size="sm"
                  icon={<Send className="w-4 h-4" />}
                  onClick={() => handleSendInvoice(viewingInvoice)}
                >
                  Send Email
                </AdminButton>
              </div>

              <div className="flex items-center gap-2">
                {viewingInvoice.status !== 'Paid' && (
                  <AdminButton
                    variant="success"
                    size="sm"
                    onClick={() => {
                      markInvoicePaid(viewingInvoice.id);
                      setViewingInvoice(null);
                    }}
                  >
                    Mark Paid
                  </AdminButton>
                )}
                <AdminButton variant="primary" size="sm" onClick={() => setViewingInvoice(null)}>
                  Done
                </AdminButton>
              </div>
            </div>
          }
        >
          <div className="space-y-5 text-xs">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h4 className="text-base font-bold text-slate-900">LOOPNEX Operations</h4>
                <p className="text-slate-500">Subscription & Revenue Cloud</p>
                <p className="text-slate-500">billing@loopnex.io</p>
              </div>
              <div className="text-right">
                <AdminBadge statusText={viewingInvoice.status} />
                <div className="text-slate-500 mt-2">Issued: {viewingInvoice.issueDate}</div>
                <div className="text-slate-500">Due: {viewingInvoice.dueDate}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">Billed To</span>
                <div className="font-bold text-slate-900">{viewingInvoice.customerName}</div>
                <div className="text-slate-600">{viewingInvoice.customerEmail}</div>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">Payment Status</span>
                <div>Amount Paid: <span className="font-semibold text-emerald-700">${viewingInvoice.amountPaid.toLocaleString()}</span></div>
                <div>Balance Due: <span className="font-semibold text-rose-600">${viewingInvoice.balanceDue.toLocaleString()}</span></div>
              </div>
            </div>

            {/* Line items table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="p-3">Item Description</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewingInvoice.lines.map((l, i) => (
                    <tr key={i}>
                      <td className="p-3 font-medium text-slate-900">{l.description}</td>
                      <td className="p-3 text-center">{l.quantity}</td>
                      <td className="p-3 text-right">${l.unitPrice.toLocaleString()}</td>
                      <td className="p-3 text-right font-semibold text-slate-900">${l.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pr-2">
              <div className="w-56 space-y-1 text-right">
                <div className="text-slate-500">Subtotal: ${viewingInvoice.subtotal.toLocaleString()}</div>
                <div className="text-slate-500">Taxes ({viewingInvoice.taxRate}%): ${viewingInvoice.taxTotal.toLocaleString()}</div>
                <div className="text-base font-bold text-slate-900 pt-1 border-t border-slate-200">
                  Total Due: ${viewingInvoice.total.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </AdminModal>
      )}

      {/* Delete Confirmation */}
      <AdminConfirmDialog
        isOpen={!!invoiceToDelete}
        onClose={() => setInvoiceToDelete(null)}
        onConfirm={() => {
          if (invoiceToDelete) {
            deleteInvoice(invoiceToDelete.id);
            setInvoiceToDelete(null);
          }
        }}
        title="Delete Invoice"
        message={`Are you sure you want to delete invoice ${invoiceToDelete?.invoiceNumber}?`}
        confirmText="Delete Invoice"
        type="danger"
      />
    </div>
  );
};
