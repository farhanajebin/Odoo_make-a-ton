import { useOutletContext, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Lock,
} from 'lucide-react';
import { StaffHeader } from '../../components/layout/StaffHeader';
import { userApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';

interface OutletContextType {
  onToggleMobileMenu: () => void;
}

export const StaffProfilePage: React.FC = () => {
  const { onToggleMobileMenu } = useOutletContext<OutletContextType>();
  const { user: authUser, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<User | null>(authUser);
  

  // Edit details form state
  const [fullName, setFullName] = useState(authUser?.fullName || '');
  const [phone, setPhone] = useState(authUser?.phone || '');
  
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    async function fetchLatest() {
      try {
        
        const data = await userApi.getProfile();
        setProfile(data);
        setFullName(data.fullName);
        setPhone(data.phone || '');
        
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        
      }
    }
    fetchLatest();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);

    try {
      setSavingProfile(true);
      const updated = await userApi.updateProfile({
        fullName,
        phone,
      });
      setProfile(updated);
      setProfileSuccess('Profile details successfully updated.');
      await refreshUser();
    } catch (err: any) {
      setProfileError(err.response?.data?.error?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    try {
      setSavingPassword(true);
      await userApi.updateProfile({
        currentPassword,
        newPassword,
      });
      setPasswordSuccess('Password successfully changed.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.response?.data?.error?.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'ST';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <StaffHeader
        title="My Profile"
        subtitle="Manage your staff identity, personal contact details, and account security"
        onToggleMobileMenu={onToggleMobileMenu}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Staff Identity Card */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#E9EDF2] p-6 bg-white shadow-sm space-y-4">
            <div className="flex flex-col items-center text-center pb-4 border-b border-[#E9EDF2]">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-[#A9D4F5] to-[#EAE3F4] text-[#171717] font-bold text-2xl flex items-center justify-center shadow-inner mb-3">
                {getInitials(profile?.fullName)}
              </div>
              <h2 className="text-base font-bold text-[#171717]">{profile?.fullName || 'Sarah Jenkins'}</h2>
              <p className="text-xs text-[#7B8493]">{profile?.email || 'staff@loopnex.io'}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E2F0FC] text-[#1E3A8A] border border-[#A9D4F5]/40">
                <Shield className="h-3.5 w-3.5" />
                <span>Operations Staff</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-[#7B8493]">
                <span>Department:</span>
                <span className="font-semibold text-[#171717]">{profile?.department || 'Operations'}</span>
              </div>
              <div className="flex items-center justify-between text-[#7B8493]">
                <span>Phone:</span>
                <span className="font-semibold text-[#171717]">{profile?.phone || '+1 (555) 014-9921'}</span>
              </div>
              <div className="flex items-center justify-between text-[#7B8493]">
                <span>Account Status:</span>
                <span className="text-emerald-600 font-bold">Active</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100/70 text-rose-700 text-xs font-semibold transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Access Control Notice */}
          <div className="p-4.5 rounded-2xl bg-[#E2F0FC]/60 border border-[#A9D4F5]/40 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#1E3A8A]">
              <Lock className="h-4 w-4 shrink-0" />
              <span>Role-Based Access Governance</span>
            </div>
            <p className="text-[11px] text-[#1E3A8A]/90 leading-relaxed">
              Staff operational access is governed strictly by Brightloop system policy. Staff cannot elevate their own permissions, modify global system settings, or administer other staff accounts.
            </p>
          </div>
        </div>

        {/* Right Columns: Edit Information & Change Password */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Profile Form */}
          <div className="rounded-3xl border border-[#E9EDF2] p-6 bg-white shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#171717]">Edit Contact Details</h3>

            {profileSuccess && (
              <div className="p-3 rounded-2xl bg-[#DDF0E1] border border-[#86EFAC]/40 text-[#14532D] text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}
            {profileError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-xs py-2.5 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full text-xs py-2.5 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                  Email Address (Read-Only)
                </label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || 'staff@loopnex.io'}
                  className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 border border-[#E9EDF2] text-[#7B8493] cursor-not-allowed"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 rounded-xl bg-[#171717] text-white hover:bg-slate-800 text-xs font-semibold transition-all disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="rounded-3xl border border-[#E9EDF2] p-6 bg-white shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#171717]">Change Security Password</h3>

            {passwordSuccess && (
              <div className="p-3 rounded-2xl bg-[#DDF0E1] border border-[#86EFAC]/40 text-[#14532D] text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}
            {passwordError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full text-xs py-2.5 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full text-xs py-2.5 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full text-xs py-2.5 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-5 py-2 rounded-xl bg-[#171717] text-white hover:bg-slate-800 text-xs font-semibold transition-all disabled:opacity-50"
                >
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
