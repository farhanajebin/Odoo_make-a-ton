import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Shield,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { Staff, StaffRole } from '../types';
import { AdminCard } from '../components/common/AdminCard';
import { AdminButton } from '../components/common/AdminButton';
import { AdminBadge } from '../components/common/AdminBadge';
import { AdminModal } from '../components/common/AdminModal';
import { AdminConfirmDialog } from '../components/common/AdminConfirmDialog';

export const StaffPage: React.FC = () => {
  const { staff, addStaff, updateStaff, toggleStaffStatus, deleteStaff } = useAdminData();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Operations',
    role: 'Operations' as StaffRole,
    accessClearance: 'Level 2 - Operations Admin',
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: 'Operations',
      role: 'Operations',
      accessClearance: 'Level 2 - Operations Admin',
      isActive: true,
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (s: Staff) => {
    setEditingStaff(s);
    setFormData({
      name: s.name,
      email: s.email,
      phone: s.phone,
      department: s.department,
      role: s.role,
      accessClearance: s.accessClearance,
      isActive: s.isActive,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (editingStaff) {
      updateStaff(editingStaff.id, formData);
      setEditingStaff(null);
    } else {
      addStaff(formData);
      setIsAddModalOpen(false);
    }
    resetForm();
  };

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || s.role === roleFilter;
    return matchesSearch && matchesRole;
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
              placeholder="Search staff members by name or department..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Operations">Operations</option>
            <option value="Finance">Finance</option>
            <option value="Customer Support">Customer Support</option>
          </select>
        </div>

        <AdminButton
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
        >
          Add Staff Member
        </AdminButton>
      </div>

      {/* Admin Authorization Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
          <Shield className="w-4 h-4" />
        </div>
        <div className="text-xs">
          <span className="font-bold text-amber-950">Privileged Staff Administration Access:</span>
          <p className="text-amber-800 mt-0.5">
            Only authenticated Super Administrators are authorized to provision staff credentials, grant clearance levels, or revoke permissions.
          </p>
        </div>
      </div>

      {/* Table Card */}
      <AdminCard variant="default" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Staff Member</th>
                <th className="py-3.5 px-4">Role & Department</th>
                <th className="py-3.5 px-4">Access Clearance</th>
                <th className="py-3.5 px-4">Last Activity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No staff members found.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900">{s.name}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{s.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{s.role}</div>
                      <div className="text-slate-500 text-[11px]">{s.department}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        {s.accessClearance}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{s.lastActive}</td>
                    <td className="py-3.5 px-4">
                      <AdminBadge statusText={s.isActive ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => toggleStaffStatus(s.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Toggle Active Status"
                      >
                        {s.isActive ? (
                          <ToggleRight className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Edit Staff"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setStaffToDelete(s)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Delete Staff"
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

      {/* Add / Edit Staff Modal */}
      <AdminModal
        isOpen={isAddModalOpen || !!editingStaff}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingStaff(null);
        }}
        title={editingStaff ? 'Edit Staff Member' : 'Provision Staff Account'}
        subtitle="Configure administrative role credentials, departmental assignment, and clearances"
        maxWidth="md"
        footer={
          <>
            <AdminButton
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingStaff(null);
              }}
            >
              Cancel
            </AdminButton>
            <AdminButton variant="primary" size="sm" onClick={handleSubmit}>
              {editingStaff ? 'Save Changes' : 'Provision Account'}
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Samuel Bennett"
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
                placeholder="staff@loopnex.io"
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
                Role Assignment *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none bg-white"
              >
                <option value="Admin">Admin</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
                <option value="Customer Support">Customer Support</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Revenue Ops"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Access Clearance Level
            </label>
            <select
              value={formData.accessClearance}
              onChange={(e) => setFormData({ ...formData, accessClearance: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none bg-white"
            >
              <option value="Level 1 - Read Only">Level 1 - Read Only</option>
              <option value="Level 2 - Operations Admin">Level 2 - Operations Admin</option>
              <option value="Level 3 - Finance Controller">Level 3 - Finance Controller</option>
              <option value="Level 4 - Super Admin">Level 4 - Super Admin (Full Clearance)</option>
            </select>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation */}
      <AdminConfirmDialog
        isOpen={!!staffToDelete}
        onClose={() => setStaffToDelete(null)}
        onConfirm={() => {
          if (staffToDelete) {
            deleteStaff(staffToDelete.id);
            setStaffToDelete(null);
          }
        }}
        title="Revoke Staff Access"
        message={`Are you sure you want to delete ${staffToDelete?.name}? Their access credentials will be permanently deactivated.`}
        confirmText="Revoke Access"
        type="danger"
      />
    </div>
  );
};
