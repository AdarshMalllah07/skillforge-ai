import React, { useState } from 'react';
import { Mail, KeyRound, ArrowLeft, CheckCircle2, Sparkles, Shield } from 'lucide-react';
import { api } from '../../lib/api';

interface ForgotPasswordPageProps {
  onNavigateToLogin: () => void;
}

export default function ForgotPasswordPage({ onNavigateToLogin }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-900 to-slate-900 text-white shadow-lg mb-2">
            <KeyRound className="w-8 h-8 text-indigo-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Reset Account Password
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Enter your registered House of EdTech email to receive a password reset link.
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Registered Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Sending Request...' : 'Send Password Reset Link'}</span>
            </button>
          </form>
        ) : (
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-extrabold text-emerald-950">Password Reset Link Sent!</h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              We have dispatched instructions to <strong>{email}</strong>. Check your inbox to set a new password.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              Resend email link
            </button>
          </div>
        )}

        <div className="text-center pt-2 border-t border-slate-100">
          <button
            onClick={onNavigateToLogin}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </button>
        </div>

      </div>
    </div>
  );
}
