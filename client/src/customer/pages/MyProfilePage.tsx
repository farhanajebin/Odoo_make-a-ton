import React, { useState } from 'react';
import {
  Lock,
  Save,
  RotateCcw,
} from 'lucide-react';
import { useCustomerData } from '../context/CustomerDataContext';
import { CustomerCard } from '../components/common/CustomerCard';
import { CustomerButton } from '../components/common/CustomerButton';

export const MyProfilePage: React.FC = () => {
  const { profile, updateProfile, resetCustomerData, showToast } = useCustomerData();

  // Profile form state
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [company, setCompany] = useState(profile.company);
  const [address, setAddress] = useState(profile.address);
  const [gstin, setGstin] = useState(profile.gstin);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Name and email are required fields', 'error');
      return;
    }
    // Simple email check
    if (!email.includes('@') || !email.includes('.')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    updateProfile({
      name,
      email,
      phone,
      company,
      address,
      gstin,
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }

    showToast('Your security credentials have been successfully updated', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Overview Banner */}
      <CustomerCard variant="default" padding="md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-100 border border-teal-200 flex items-center justify-center font-bold text-xl text-teal-900 shrink-0">
            🏢
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{profile.company}</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Verified Account
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Primary Account Holder: <strong className="text-slate-800">{profile.name}</strong> • Member since {profile.memberSince}
            </p>
          </div>
        </div>
      </CustomerCard>

      {/* Edit Account Information Form */}
      <form onSubmit={handleProfileSubmit}>
        <CustomerCard variant="default" padding="md" className="space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Organization & Billing Contact</h3>
              <p className="text-xs text-slate-500">
                Official contact metadata used on tax invoices and compliance receipts
              </p>
            </div>
            <span className="text-[10px] text-slate-400">Account ID: {profile.id}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Authorized Contact Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Company Legal Name *
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Billing Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Direct Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Tax Identification / GSTIN
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full max-w-sm px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Registered Billing Address
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <CustomerButton
              type="submit"
              variant="primary"
              size="sm"
              icon={<Save className="w-4 h-4" />}
            >
              Save Profile Changes
            </CustomerButton>
          </div>
        </CustomerCard>
      </form>

      {/* Change Security Password Form */}
      <form onSubmit={handlePasswordSubmit}>
        <CustomerCard variant="default" padding="md" className="space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Security & Authentication</h3>
            <p className="text-xs text-slate-500">
              Update your account password for accessing the customer portal
            </p>
          </div>

          {passwordError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {passwordError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                New Password *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <CustomerButton
              type="submit"
              variant="outline"
              size="sm"
              icon={<Lock className="w-4 h-4" />}
            >
              Update Password
            </CustomerButton>
          </div>
        </CustomerCard>
      </form>

      {/* Factory Reset Customer Workspace */}
      <div className="flex justify-between items-center text-xs text-slate-500 pt-2 px-1">
        <span>Need to restore default mock demo data?</span>
        <button
          onClick={resetCustomerData}
          className="text-slate-600 hover:text-slate-900 underline flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Mock Portal State
        </button>
      </div>
    </div>
  );
};
