import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, Check, X, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../services/api';
import { Button } from '../../components/ui/Button';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlToken = searchParams.get('token') || '';
  const [token, setToken] = useState(urlToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Requirements tests
  const hasMinLength = password.length > 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const strengthScore =
    (hasMinLength ? 1 : 0) +
    (hasUpperCase ? 1 : 0) +
    (hasLowerCase ? 1 : 0) +
    (hasSpecialChar ? 1 : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token.trim()) {
      setErrorMessage('Reset token is required.');
      return;
    }

    if (!hasMinLength || !hasUpperCase || !hasLowerCase || !hasSpecialChar) {
      setErrorMessage('Please satisfy all password complexity requirements.');
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword({
        token: token.trim(),
        password,
        confirmPassword,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.message ||
        'Unable to reset password. The link may have expired or been already used.';
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Set New Password</h1>
          <p className="text-xs text-loopnex-secondaryText mt-1">
            Choose a strong, compliant password for your LOOPNEX account
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-loopnex-surfaceBorder bg-loopnex-graphite/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
          {success ? (
            <div className="text-center py-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="text-base font-semibold text-white">Password Updated!</h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Your password has been securely updated and all previous sessions revoked. Redirecting to sign in...
              </p>
              <div className="mt-6">
                <Link to="/login">
                  <Button variant="primary" size="sm" className="w-full justify-center text-xs">
                    Sign In Now
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Reset Token (Read-only if present in URL, otherwise editable) */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Security Verification Token
                  </label>
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste your 64-char hex reset token"
                    className="w-full rounded-xl border border-loopnex-surfaceBorder bg-loopnex-surface/80 py-2.5 px-3.5 text-xs font-mono text-white placeholder-slate-500 focus:border-loopnex-electricTeal focus:outline-none focus:ring-1 focus:ring-loopnex-electricTeal transition-all"
                  />
                  {!urlToken && (
                    <p className="text-[10px] text-slate-500 mt-1">
                      Provided in the password recovery email.
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    New Password
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
                      placeholder="Enter new strong password"
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
                    Confirm New Password
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
                      placeholder="Re-enter new password"
                      className="w-full rounded-xl border border-loopnex-surfaceBorder bg-loopnex-surface/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-loopnex-electricTeal focus:outline-none focus:ring-1 focus:ring-loopnex-electricTeal transition-all"
                    />
                  </div>
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="text-[10px] text-rose-400 mt-1">Passwords do not match</p>
                  )}
                </div>

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
                      Validating &amp; Updating...
                    </span>
                  ) : (
                    'Reset Account Password'
                  )}
                </Button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          <Link
            to="/login"
            className="font-medium text-loopnex-electricTeal hover:underline transition-colors"
          >
            Return to Sign in
          </Link>
        </p>

        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-loopnex-electricTeal" />
          <span>Single-Use Hash Invalidation • Session Revocation Enforced</span>
        </div>
      </div>
    </div>
  );
};
