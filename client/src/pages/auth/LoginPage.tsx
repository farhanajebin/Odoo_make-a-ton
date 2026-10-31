import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const user = await login(email, password, rememberMe);
      // Redirect according to role
      if (from && from !== '/' && !from.startsWith('/login') && !from.startsWith('/portal')) {
        navigate(from, { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'STAFF') {
        navigate('/staff', { replace: true });
      } else if (user.role === 'CUSTOMER') {
        navigate('/customer', { replace: true });
      } else {
        navigate('/admin', { replace: true });
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.message ||
        'Failed to authenticate. Please check your credentials.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-loopnex-deepNavy px-4 py-12 relative overflow-hidden">
      {/* Background radial glow accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-loopnex-electricTeal/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-loopnex-violetAccent/10 rounded-full blur-3xl pointer-events-none" />

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
          <h1 className="text-2xl font-bold text-white tracking-tight">LOOPNEX</h1>
          <p className="text-xs text-loopnex-secondaryText mt-1">
            Intelligent Subscription Management & Revenue Operations
          </p>
        </div>

        {/* Authentication Card */}
        <div className="rounded-2xl border border-loopnex-surfaceBorder bg-loopnex-graphite/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Sign In to Platform</h2>
            <p className="text-xs text-loopnex-secondaryText mt-0.5">
              Enter your enterprise credentials to access your workspace
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Work Email Address
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
                  placeholder="name@enterprise.io"
                  className="w-full rounded-xl border border-loopnex-surfaceBorder bg-loopnex-surface/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-loopnex-electricTeal focus:outline-none focus:ring-1 focus:ring-loopnex-electricTeal transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-medium text-loopnex-electricTeal hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
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
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-loopnex-surfaceBorder bg-loopnex-surface text-loopnex-electricTeal focus:ring-loopnex-electricTeal focus:ring-offset-0"
              />
              <label htmlFor="remember-me" className="ml-2 text-xs text-slate-400 select-none">
                Remember this session for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              className="w-full justify-center mt-2 py-2.5 text-xs font-semibold shadow-glow-teal"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full border-2 border-loopnex-deepNavy border-t-transparent animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              )}
            </Button>
          </form>

          {/* Quick-fill Role Demos */}
          <div className="mt-6 pt-5 border-t border-loopnex-surfaceBorder/60">
            <p className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-loopnex-softCyan" />
              Demo Role Profiles:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@loopnex.io', 'Loopnex@Admin2026!')}
                className="rounded-lg border border-loopnex-surfaceBorder bg-loopnex-surface/50 hover:bg-loopnex-surface p-2 text-left transition-colors group"
              >
                <span className="block text-[11px] font-semibold text-loopnex-violetAccent group-hover:text-purple-300">
                  Admin
                </span>
                <span className="block text-[9px] text-slate-400 truncate">Executive</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('staff@loopnex.io', 'Loopnex@Staff2026!')}
                className="rounded-lg border border-loopnex-surfaceBorder bg-loopnex-surface/50 hover:bg-loopnex-surface p-2 text-left transition-colors group"
              >
                <span className="block text-[11px] font-semibold text-loopnex-softCyan group-hover:text-cyan-300">
                  Staff
                </span>
                <span className="block text-[9px] text-slate-400 truncate">RevOps</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('customer@loopnex.io', 'Loopnex@Customer2026!')}
                className="rounded-lg border border-loopnex-surfaceBorder bg-loopnex-surface/50 hover:bg-loopnex-surface p-2 text-left transition-colors group"
              >
                <span className="block text-[11px] font-semibold text-loopnex-electricTeal group-hover:text-teal-300">
                  Customer
                </span>
                <span className="block text-[9px] text-slate-400 truncate">Subscriber</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Don&apos;t have a customer account?{' '}
          <Link
            to="/register"
            className="font-medium text-loopnex-electricTeal hover:underline transition-colors"
          >
            Register as Customer
          </Link>
        </p>

        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-loopnex-electricTeal" />
          <span>Encrypted with SHA-256 + Bcrypt • SOC2 Compliant Identity Engine</span>
        </div>
      </div>
    </div>
  );
};
