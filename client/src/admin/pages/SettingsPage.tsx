import React, { useState } from 'react';
import {
  Building,
  Shield,
  Save,
  RotateCcw,
} from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { CompanySettings } from '../types';
import { AdminCard } from '../components/common/AdminCard';
import { AdminButton } from '../components/common/AdminButton';
import { AdminConfirmDialog } from '../components/common/AdminConfirmDialog';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetToDefaults } = useAdminData();
  const [formData, setFormData] = useState<CompanySettings>({ ...settings });
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleChange = (field: keyof CompanySettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const handleConfirmReset = () => {
    resetToDefaults();
    setIsResetConfirmOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Identity */}
        <AdminCard variant="default" padding="md">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-4">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Company Information</h3>
              <p className="text-xs text-slate-500">Legal entity information and tax identification</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Legal Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trading Name (Brand)</label>
                <input
                  type="text"
                  value={formData.tradingName}
                  onChange={(e) => handleChange('tradingName', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tax ID / GSTIN</label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => handleChange('taxId', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Support Email</label>
                <input
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) => handleChange('supportEmail', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Billing Phone</label>
                <input
                  type="text"
                  value={formData.billingPhone}
                  onChange={(e) => handleChange('billingPhone', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operating Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full max-w-xs px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-slate-300 focus:outline-none"
              >
                <option value="USD">USD ($) - United States Dollar</option>
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Registered Address</label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>
          </div>
        </AdminCard>

        {/* Administrative & Billing Preferences */}
        <AdminCard variant="default" padding="md">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-4">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Administrative Preferences</h3>
              <p className="text-xs text-slate-500">Default payment terms, dunning automations, and security policies</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Payment Terms</label>
                <select
                  value={formData.defaultPaymentTerms}
                  onChange={(e) => handleChange('defaultPaymentTerms', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-slate-300 focus:outline-none"
                >
                  <option value="Immediate Due">Immediate Due</option>
                  <option value="Net 15 Days">Net 15 Days</option>
                  <option value="Net 30 Days">Net 30 Days</option>
                  <option value="Net 60 Days">Net 60 Days</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Grace Period Days (Overdue)</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={formData.gracePeriodDays}
                  onChange={(e) => handleChange('gracePeriodDays', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-900 block">Automated Dunning Retries</span>
                  <span className="text-[11px] text-slate-500">
                    Automatically send payment reminders and attempt auto-charge before subscription suspension
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enableAutoDunning}
                  onChange={(e) => handleChange('enableAutoDunning', e.target.checked)}
                  className="rounded text-slate-900 focus:ring-0 w-4 h-4 ml-4"
                />
              </label>

              <div className="h-px bg-slate-200/80" />

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-900 block">Enforce 2-Factor Authentication</span>
                  <span className="text-[11px] text-slate-500">
                    Require TOTP authentication for all staff members accessing the admin panel
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.twoFactorRequired}
                  onChange={(e) => handleChange('twoFactorRequired', e.target.checked)}
                  className="rounded text-slate-900 focus:ring-0 w-4 h-4 ml-4"
                />
              </label>
            </div>
          </div>
        </AdminCard>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <AdminButton
            type="button"
            variant="ghost"
            size="sm"
            icon={<RotateCcw className="w-4 h-4 text-slate-400" />}
            onClick={() => setIsResetConfirmOpen(true)}
          >
            Reset All Data to Factory Defaults
          </AdminButton>

          <AdminButton
            type="submit"
            variant="primary"
            size="md"
            icon={<Save className="w-4 h-4" />}
          >
            Save Administrative Settings
          </AdminButton>
        </div>
      </form>

      {/* Reset Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset All Admin Panel Data"
        message="This will reset all 14 modules (customers, subscriptions, quotes, invoices) to the default sample dataset. Are you sure?"
        confirmText="Reset to Defaults"
        type="warning"
      />
    </div>
  );
};
