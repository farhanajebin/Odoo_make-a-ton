import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  UserCheck,
  UserX,
  Building,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { StaffMember } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export const StaffManagementPage: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form State
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDepartment, setNewDepartment] = useState('OPERATIONS');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('StaffTemp@2026!');

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await adminApi.getStaff(searchQuery);
      setStaffList(data);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Failed to load staff accounts');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadStaff();
    }, 250);
    return () => clearTimeout(delayDebounceFn);
  }, [loadStaff]);

  const handleToggleStatus = async (staff: StaffMember) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const nextStatus = !staff.isActive;
      await adminApi.updateStaffStatus(staff.id, nextStatus);
      setSuccessMessage(
        `Staff account ${staff.fullName} was successfully ${nextStatus ? 'activated' : 'deactivated'}.`
      );
      loadStaff();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message || 'Could not update staff account status'
      );
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalLoading(true);

    try {
      await adminApi.createStaff({
        fullName: newFullName,
        email: newEmail,
        department: newDepartment,
        phone: newPhone || undefined,
        password: newPassword,
      });

      setIsAddModalOpen(false);
      setNewFullName('');
      setNewEmail('');
      setNewPhone('');
      setNewPassword('StaffTemp@2026!');
      setSuccessMessage('Staff account created successfully.');
      loadStaff();
    } catch (err: any) {
      setModalError(err.response?.data?.error?.message || 'Failed to create staff account');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="violet" size="sm">Admin Management</Badge>
            <span className="text-xs text-slate-400">Security Clearance: LEVEL 3</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Staff &amp; Workforce Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-loopnex-secondaryText mt-0.5">
            Create, search, and manage authorized operational staff accounts with role-based access boundaries.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsAddModalOpen(true)}
          className="shadow-glow-teal text-xs"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Staff Member
        </Button>
      </div>

      {/* Alert Banners */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Staff Table Card */}
      <Card className="overflow-hidden">
        {/* Search & Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-loopnex-surfaceBorder flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, department..."
              className="w-full rounded-xl border border-slate-200 dark:border-loopnex-surfaceBorder bg-slate-50 dark:bg-loopnex-surface/80 py-1.5 pl-8 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-loopnex-electricTeal focus:outline-none focus:ring-1 focus:ring-loopnex-electricTeal transition-all"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-500">
            <span>Total Staff: <strong>{staffList.length}</strong></span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-loopnex-surface/40 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-loopnex-surfaceBorder">
              <tr>
                <th className="px-5 py-3">Staff Member</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-loopnex-surfaceBorder/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <span className="inline-block h-4 w-4 rounded-full border-2 border-loopnex-electricTeal border-t-transparent animate-spin mr-2" />
                    Querying staff directory...
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    No staff records found matching your search.
                  </td>
                </tr>
              ) : (
                staffList.map((staff) => (
                  <tr
                    key={staff.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-loopnex-surface/30 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-loopnex-surface border border-loopnex-surfaceBorder flex items-center justify-center font-bold text-xs text-loopnex-softCyan">
                          {staff.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {staff.fullName}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {staff.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-slate-400" />
                        <span>{staff.department || 'Operations'}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <Badge variant="cyan" size="sm">STAFF</Badge>
                    </td>

                    <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">
                      {staff.phone || '—'}
                    </td>

                    <td className="px-5 py-3.5">
                      {staff.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <UserCheck className="h-2.5 w-2.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <UserX className="h-2.5 w-2.5" />
                          Deactivated
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {staff.isActive ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(staff)}
                          className="text-[11px] py-1 border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                        >
                          <UserX className="h-3 w-3 mr-1 text-rose-400" />
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(staff)}
                          className="text-[11px] py-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                        >
                          <UserCheck className="h-3 w-3 mr-1 text-emerald-400" />
                          Activate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Operational Staff Member"
      >
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <p className="text-xs text-slate-400">
            Create an internal operational account. Public registration cannot assign staff privileges.
          </p>

          {modalError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{modalError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Full Name *
            </label>
            <Input
              type="text"
              required
              value={newFullName}
              onChange={(e) => setNewFullName(e.target.value)}
              placeholder="Sarah Jenkins"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Corporate Email *
            </label>
            <Input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="s.jenkins@loopnex.io"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Department
              </label>
              <select
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-loopnex-surfaceBorder bg-slate-50 dark:bg-loopnex-surface py-2 px-3 text-xs text-slate-900 dark:text-white focus:border-loopnex-electricTeal focus:outline-none"
              >
                <option value="OPERATIONS">Operations</option>
                <option value="CUSTOMER_SUCCESS">Customer Success</option>
                <option value="FINANCE">Finance</option>
                <option value="SALES">Sales</option>
                <option value="ENGINEERING">Engineering</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Phone Number
              </label>
              <Input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+1 (555) 014-9921"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Temporary Password *
            </label>
            <Input
              type="text"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="StaffTemp@2026!"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Must contain &gt;8 chars, uppercase, lowercase, and special symbol.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-loopnex-surfaceBorder/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={modalLoading}
            >
              {modalLoading ? 'Creating Account...' : 'Create Staff Member'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
