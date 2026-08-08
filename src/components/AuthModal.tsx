'use client';
import React, { useState } from 'react';
import { useAuth } from '../lib/authContext';
import { X, Lock, Mail, User as UserIcon, Sparkles, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    login,
    signup,
  } = useAuth();

  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>(authModalMode || 'LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'LOGIN') {
        await login(email, password);
      } else {
        // Public signup always creates a STUDENT; staff roles are assigned by admins.
        await signup(name, email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-indigo-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest">SkillForge AI</span>
          </div>

          <h3 className="text-xl font-extrabold text-white">
            {mode === 'LOGIN' ? 'Welcome Back' : 'Create Student Account'}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            {mode === 'LOGIN'
              ? 'Sign in to manage courses, view assignment submissions, and run AI evaluations.'
              : 'Public signup creates a Candidate (Student) account. Instructors and evaluators are provisioned by an admin.'}
          </p>

          {/* Tab Switcher */}
          <div className="flex bg-slate-800/80 p-1 rounded-xl mt-4 border border-slate-700/80">
            <button
              onClick={() => setMode('LOGIN')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                mode === 'LOGIN'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => setMode('SIGNUP')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                mode === 'SIGNUP'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {error}
            </div>
          )}
          
          {mode === 'SIGNUP' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Password</label>
              {mode === 'LOGIN' && (
                <a
                  href="/forgot-password"
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                >
                  Forgot Password?
                </a>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full text-xs pl-9 pr-10 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'SIGNUP' && (
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Your account will be created with the <strong>Student</strong> role. An administrator
              can later assign Instructor, Evaluator, or Admin roles from Users &amp; Roles.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : mode === 'LOGIN' ? 'Sign In to Dashboard' : 'Create Student Account'}
          </button>
        </form>

      </div>
    </div>
  );
}
