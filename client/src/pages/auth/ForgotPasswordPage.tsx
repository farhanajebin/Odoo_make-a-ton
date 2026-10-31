import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { authApi } from '../../services/api';
import { Button } from '../../components/ui/Button';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const message = await authApi.forgotPassword(email);
      setSuccessMessage(message);
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.message ||
        'Unable to process password reset request.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Recover Password</h1>
          <p className="text-xs text-loopnex-secondaryText mt-1">
            Receive a cryptographically secure, time-limited reset link
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-loopnex-surfaceBorder bg-loopnex-graphite/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
          {successMessage ? (
            <div className="text-center py-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="text-base font-semibold text-white">Instructions Dispatched</h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {successMessage}
              </p>
              <p className="text-[11px] text-slate-500 mt-3">
                Check your terminal logs for the development reset link if running in local environment mode.
              </p>
              <div className="mt-6">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="w-full justify-center text-xs">
                    <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                    Return to Sign In
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
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Registered Email Address
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
                      placeholder="name@company.com"
                      className="w-full rounded-xl border border-loopnex-surfaceBorder bg-loopnex-surface/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-loopnex-electricTeal focus:outline-none focus:ring-1 focus:ring-loopnex-electricTeal transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5">
                    We will send a 30-minute one-time recovery token.
                  </p>
                </div>

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
                      Dispatching Reset Link...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Send Reset Instructions
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Remember your credentials?{' '}
          <Link
            to="/login"
            className="font-medium text-loopnex-electricTeal hover:underline transition-colors"
          >
            Back to Sign in
          </Link>
        </p>

        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-loopnex-electricTeal" />
          <span>Anti-Enumeration Protection • Cryptographic Token Hashing</span>
        </div>
      </div>
    </div>
  );
};
