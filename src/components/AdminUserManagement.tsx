'use client';
import React, { useState } from 'react';
import { useAuth } from '../lib/authContext';
import { User, UserRole } from '../types';
import { 
  UserPlus, Search, Filter, Shield, GraduationCap, CheckCircle2, 
  Edit3, Trash2, BookOpen, FileCheck2, X, Lock, User as UserIcon, Eye, EyeOff,
  Mail, Loader2, KeyRound
} from 'lucide-react';

interface AdminUserManagementProps {
  onViewUserCurriculums?: (userId: string) => void;
  onViewUserSubmissions?: (userId: string) => void;
}

export default function AdminUserManagement({ onViewUserCurriculums, onViewUserSubmissions }: AdminUserManagementProps) {
  const {
    usersList,
    currentUser,
    addUserByAdmin,
    updateUserByAdmin,
    deleteUserByAdmin,
    resendSetupEmailByAdmin,
  } = useAuth();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [resendingId, setResendingId] = useState<string | null>(null);

  // Form State for Create/Edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'INSTRUCTOR' as UserRole,
    title: '',
    bio: '',
    skills: '',
    avatar: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!currentUser) return null;

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase()) ||
                          (u.title && u.title.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const adminCount = usersList.filter(u => u.role === 'ADMIN').length;
  const instructorCount = usersList.filter(u => u.role === 'INSTRUCTOR').length;
  const studentCount = usersList.filter(u => u.role === 'STUDENT').length;
  const evaluatorCount = usersList.filter(u => u.role === 'EVALUATOR').length;

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormError('');
    setSaving(false);
    setFormData({
      name: '',
      email: '',
      role: 'INSTRUCTOR',
      title: '',
      bio: '',
      skills: '',
      avatar: '',
      password: '',
      confirmPassword: '',
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormError('');
    setSaving(false);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title || '',
      bio: user.bio || '',
      skills: (user.skills || []).join(', '),
      avatar: user.avatar,
      password: '',
      confirmPassword: '',
    });
    setIsCreateModalOpen(true);
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
    setFormError('');

    if (!editingUser) {
      if (formData.password) {
        if (formData.password.length < 6) {
          setFormError('Password must be at least 6 characters');
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setFormError('Passwords do not match');
          return;
        }
      }
    } else if (formData.password) {
      if (formData.password.length < 6) {
        setFormError('Password must be at least 6 characters');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match');
        return;
      }
    }

    setSaving(true);
    try {
      if (editingUser) {
        await updateUserByAdmin(editingUser.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          title: formData.title,
          bio: formData.bio,
          skills: skillsArray,
          avatar: formData.avatar,
          ...(formData.password ? { password: formData.password } : {}),
        });
      } else {
        await addUserByAdmin({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          title: formData.title,
          bio: formData.bio,
          skills: skillsArray,
          avatar: formData.avatar,
          ...(formData.password ? { password: formData.password } : {}),
        });
      }
      setIsCreateModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleResendSetup = async (user: User, force = false) => {
    if (resendingId) return;
    setResendingId(user.id);
    try {
      const result = await resendSetupEmailByAdmin(user.id, { force });
      if (result.status === 'needs_confirm') {
        const when = result.expiresAt
          ? new Date(result.expiresAt).toLocaleString()
          : 'soon';
        const proceed = window.confirm(
          `${result.message}\n\nActive link expires: ${when}\n\nSend Anyway? This will expire the old link and email a new setup link.`
        );
        if (proceed) {
          const forced = await resendSetupEmailByAdmin(user.id, { force: true });
          if (forced.status === 'sent') {
            alert(forced.message);
          }
        }
        return;
      }
      alert(result.message);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to resend setup email');
    } finally {
      setResendingId(null);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1"><Shield className="w-3 h-3 text-purple-600" /> Admin</span>;
      case 'INSTRUCTOR':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1"><GraduationCap className="w-3 h-3 text-indigo-600" /> Instructor</span>;
      case 'EVALUATOR':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-amber-600" /> Evaluator</span>;
      case 'STUDENT':
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1"><UserIcon className="w-3 h-3 text-emerald-600" /> Student</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Shield className="w-80 h-80 text-indigo-400" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>Super Admin & System Security Console</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            User Directory & Role Administration
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Manage all platform members, assign elevated roles (Instructors, Evaluators, Admins), inspect user curriculums, and supervise candidate evaluation permissions.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create New User (Assign Role)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role Distribution Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Admins</span>
            <Shield className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{adminCount}</p>
          <span className="text-[10px] text-purple-600 font-medium">Full system access</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Instructors</span>
            <GraduationCap className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{instructorCount}</p>
          <span className="text-[10px] text-indigo-600 font-medium">Course & Rubric Creators</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Students</span>
            <UserIcon className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{studentCount}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Candidates Enrolled</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Evaluators</span>
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{evaluatorCount}</p>
          <span className="text-[10px] text-amber-600 font-medium">Technical Assessors</span>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search user by name, email, or title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Role Filter & Action */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 text-xs text-slate-600 font-bold">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Role:</span>
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 font-bold text-slate-700"
          >
            <option value="ALL">All Roles ({usersList.length})</option>
            <option value="ADMIN">Admins ({adminCount})</option>
            <option value="INSTRUCTOR">Instructors ({instructorCount})</option>
            <option value="STUDENT">Students ({studentCount})</option>
            <option value="EVALUATOR">Evaluators ({evaluatorCount})</option>
          </select>
        </div>

      </div>

      {/* User Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/20 border border-slate-100"
                  />
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">{user.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                  </div>
                </div>

                {getRoleBadge(user.role)}
              </div>

              {user.invitePending && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-800 uppercase tracking-wide">
                  <KeyRound className="w-3 h-3" />
                  Password setup pending
                </div>
              )}

              {/* Title & Bio */}
              <div className="mt-3 space-y-1">
                <p className="text-xs font-bold text-slate-800">{user.title || 'Platform Member'}</p>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {user.bio || 'No bio provided for this profile.'}
                </p>
              </div>

              {/* Skill Tags */}
              <div className="mt-3 flex flex-wrap gap-1">
                {(user.skills || []).length > 0 ? (
                  (user.skills || []).map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold border border-slate-200">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-400">No skills listed</span>
                )}
              </div>
            </div>

            {/* Admin Actions Toolbar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                {onViewUserCurriculums && (user.role === 'INSTRUCTOR' || user.role === 'ADMIN') && (
                  <button
                    onClick={() => onViewUserCurriculums(user.id)}
                    className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-[11px] hover:bg-indigo-100 transition-colors flex items-center space-x-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Curriculums</span>
                  </button>
                )}

                {onViewUserSubmissions && (user.role === 'STUDENT' || user.role === 'EVALUATOR') && (
                  <button
                    onClick={() => onViewUserSubmissions(user.id)}
                    className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-[11px] hover:bg-emerald-100 transition-colors flex items-center space-x-1"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Submissions</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-1">
                {user.invitePending && (
                  <button
                    onClick={() => handleResendSetup(user)}
                    disabled={resendingId === user.id}
                    className="px-2.5 py-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg font-bold text-[11px] transition-colors flex items-center space-x-1 disabled:opacity-60"
                    title="Resend account setup email"
                  >
                    {resendingId === user.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Mail className="w-3.5 h-3.5" />
                    )}
                    <span>{resendingId === user.id ? 'Sending...' : 'Resend Setup'}</span>
                  </button>
                )}

                <button
                  onClick={() => handleOpenEditModal(user)}
                  className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Edit User Role & Details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                {user.id !== currentUser.id && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
                        deleteUserByAdmin(user.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* CREATE / EDIT USER MODAL (ADMIN ONLY) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative rounded-t-2xl">
              <button
                onClick={() => !saving && setIsCreateModalOpen(false)}
                disabled={saving}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2 text-indigo-400 mb-1">
                <Shield className="w-4 h-4" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest">Super Admin Console</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">
                {editingUser ? `Edit Profile: ${editingUser.name}` : 'Provision New Platform User'}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {editingUser
                  ? 'Update user role, title, bio, and system permissions.'
                  : 'Super admins can assign any role (Instructor, Evaluator, Student, or Admin).'}
              </p>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmitUser} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                  {formError}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assign User Role *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'INSTRUCTOR' })}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      formData.role === 'INSTRUCTOR'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
                    <span className="text-[11px] block">Instructor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'EVALUATOR' })}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      formData.role === 'EVALUATOR'
                        ? 'border-amber-600 bg-amber-50 text-amber-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                    <span className="text-[11px] block">Evaluator</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      formData.role === 'STUDENT'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <UserIcon className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                    <span className="text-[11px] block">Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      formData.role === 'ADMIN'
                        ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Shield className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                    <span className="text-[11px] block">Admin</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Robert Chen"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {editingUser ? 'New Password (optional)' : 'Password (optional)'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={false}
                    minLength={formData.password ? 6 : undefined}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder={
                      editingUser
                        ? 'Leave blank to keep current password'
                        : 'Leave blank to email a setup link'
                    }
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
                {!editingUser && (
                  <p className="mt-1 text-[10px] text-slate-500">
                    If left blank, the user receives a welcome email with a 30-minute password setup link.
                    If set, they receive a normal welcome email and can sign in immediately.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {editingUser ? 'Confirm New Password' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required={!!formData.password}
                    minLength={formData.password ? 6 : undefined}
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full text-xs pl-9 pr-10 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Professional Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Principal Curriculum Evaluator"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bio / Profile Description</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Brief summary of expertise..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Skills Tags (Comma Separated)</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={e => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g. TypeScript, Next.js, Rubric Design"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md disabled:opacity-60 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {saving
                      ? editingUser
                        ? 'Saving...'
                        : 'Provisioning...'
                      : editingUser
                        ? 'Save User Changes'
                        : 'Provision User Account'}
                  </span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
