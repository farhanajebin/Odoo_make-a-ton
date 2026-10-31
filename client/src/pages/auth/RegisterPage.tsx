import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Check, X, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password requirement tests (> 8 characters, 1 uppercase, 1 lowercase, 1 special character)
  const hasMinLength = password.length > 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // Strength score: 0 to 4
  const strengthScore =
    (hasMinLength ? 1 : 0) +
    (hasUpperCase ? 1 : 0) +
    (hasLowerCase ? 1 : 0) +
    (hasSpecialChar ? 1 : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!hasMinLength || !hasUpperCase || !hasLowerCase || !hasSpecialChar) {
      setErrorMessage('Please satisfy all password complexity requirements.');
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!termsAccepted) {
      setErrorMessage('You must accept the terms and conditions.');
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName,
        email,
        password,
        confirmPassword,
        termsAccepted,
      });

      // Newly registered customers are redirected to the customer portal
      navigate('/customer', { replace: true });
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.message ||
        'Registration failed. Please check your details.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-loopnex-deepNavy px-4 py-12 relative overflow-hidden">
      {/* Background radial glow accents */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-loopnex-electricTeal/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-loopnex-violetAccent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-loopnex-electricTeal via-loopnex-softCyan to-loopnex-violetAccent p-0.5 shadow-glow-teal">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-loopnex-deepNavy">
                <span className="font-extrabold text-2xl tracking-wider text-loopnex-electricTeal">
                  LX
                </span>
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Customer Account</h1>
          <p className="text-xs text-loopnex-secondaryText mt-1">
            Sign up for the LOOPNEX customer portal and self-service billing
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-loopnex-surfaceBorder bg-loopnex-graphite/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Elena Rostova"
                  className="w-full rounded-xl border border-loopnex-surfaceBorder bg-loopnex-surface/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-loopnex-electricTeal focus:outline-none focus:ring-1 focus:ring-loopnex-electricTeal transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elena@company.com"
                  className="w-full rounded-xl border border-loopnex-surfaceBorder bg-loopnex-surface/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-loopnex-electricTeal focus:outline-none focus:ring-1 focus:ring-loopnex-electricTeal transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create strong password"
                  className="w-full rounded-xl border border-loopnex-surfaceBorder bg-loopnex-surface/80 py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-500 focus:border-loopnex-electricTeal focus:outline-none focus:ring-1 focus:ring-loopnex-electricTeal transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength Meter Bar */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1.5 h-1 w-full rounded-full overflow-hidden bg-slate-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        strengthScore === 1
                          ? 'w-1/4 bg-rose-500'
                          : strengthScore === 2
                          ? 'w-2/4 bg-amber-500'
                          : strengthScore === 3
                          ? 'w-3/4 bg-blue-500'
                          : strengthScore === 4
                          ? 'w-full bg-loopnex-electricTeal'
                          : 'w-0'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Password Checklist */}
              <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[10px]">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {hasMinLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>&gt; 8 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUpperCase ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {hasUpperCase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>Uppercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLowerCase ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {hasLowerCase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>Lowercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasSpecialChar ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {hasSpecialChar ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>Special character</span>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full rounded-xl border border-loopnex-surfaceBorder bg-loopnex-surface/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-loopnex-electricTeal focus:outline-none focus:ring-1 focus:ring-loopnex-electricTeal transition-all"
                />
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-[10px] text-rose-400 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start pt-1">
              <input
                id="terms"
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-loopnex-surfaceBorder bg-loopnex-surface text-loopnex-electricTeal focus:ring-loopnex-electricTeal focus:ring-offset-0"
              />
              <label htmlFor="terms" className="ml-2 text-xs text-slate-400 select-none leading-relaxed">
                I accept the LOOPNEX{' '}
                <a href="#terms" className="text-loopnex-electricTeal hover:underline">
                  Terms of Service
                </a>{' '}
                and Privacy Policy.
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              className="w-full justify-center mt-3 py-2.5 text-xs font-semibold shadow-glow-teal"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full border-2 border-loopnex-deepNavy border-t-transparent animate-spin" />
                  Creating Account...
                </span>
              ) : (
                'Create Customer Account'
              )}
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-loopnex-electricTeal hover:underline transition-colors"
          >
            Sign in
          </Link>
        </p>

        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-loopnex-electricTeal" />
          <span>Role Assigned: CUSTOMER • Zero Plaintext Storage</span>
        </div>
      </div>
    </div>
  );
};
