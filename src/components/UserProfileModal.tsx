'use client';
import React, { useRef, useState } from 'react';
import { useAuth } from '../lib/authContext';
import {
  X, Shield, Github, Linkedin, Check, Edit3, ExternalLink, Upload, Trash2, Camera,
  Lock, Eye, EyeOff, KeyRound,
} from 'lucide-react';

export default function UserProfileModal() {
  const {
    currentUser,
    isProfileModalOpen,
    closeProfileModal,
    updateUserProfile,
    changePassword,
    uploadAvatar,
    removeAvatar,
    logout,
  } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const resetPasswordForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setIsChangingPassword(false);
  };

  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setTitle(currentUser.title || '');
      setBio(currentUser.bio || '');
      setAvatar(currentUser.avatar);
      setGithubUrl(currentUser.githubUrl || '');
      setLinkedInUrl(currentUser.linkedInUrl || '');
      setSkills(currentUser.skills || []);
      setIsEditing(false);
      resetPasswordForm();
      setError('');
      setSuccess('');
    }
  }, [currentUser, isProfileModalOpen]);

  if (!isProfileModalOpen || !currentUser) return null;

  const isUploadedAvatar = avatar.startsWith('/uploads/profiles/');

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, WebP, or GIF)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5MB or smaller');
      return;
    }

    setUploading(true);
    setError('');
    try {
      await uploadAvatar(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Avatar upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setUploading(true);
    setError('');
    try {
      await removeAvatar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateUserProfile({
        name,
        title,
        bio,
        githubUrl,
        linkedInUrl,
        skills,
      });
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword) {
      setError('Current password and new password are required');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (oldPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(oldPassword, newPassword);
      resetPasswordForm();
      setSuccess('Password updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const userSkills = currentUser.skills || [];

  const passwordField = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    show: boolean,
    setShow: (v: boolean) => void,
    placeholder: string,
    minLen?: number,
  ) => (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type={show ? 'text' : 'password'}
          required
          minLength={minLen}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-xs pl-9 pr-10 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative rounded-t-2xl">
          <button
            onClick={closeProfileModal}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4">
            <img
              src={avatar || currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-500/30 border border-white/20 shadow-lg bg-slate-800"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-extrabold text-white">{currentUser.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">{currentUser.title || 'Platform Member'}</p>
              <p className="text-[11px] text-slate-400 font-mono mt-1">{currentUser.email}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium">
              {success}
            </div>
          )}

          {!isEditing && !isChangingPassword ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 flex items-center">
                  <Shield className="w-4 h-4 mr-1.5 text-indigo-600" />
                  Active Session Profile
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSuccess('');
                      setError('');
                      setIsChangingPassword(true);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center space-x-1"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Update Password</span>
                  </button>
                  <button
                    onClick={() => {
                      setSuccess('');
                      setError('');
                      setIsEditing(true);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center space-x-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Professional Bio
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
                  {currentUser.bio || 'No bio provided yet. Click "Edit Profile" to add your professional background.'}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Technical Expertise & Skills
                </h4>
                {userSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {userSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    No skills added yet.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentUser.githubUrl ? (
                  <a
                    href={currentUser.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs flex items-center justify-between text-slate-800 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Github className="w-4 h-4 text-slate-700" />
                      <span className="font-bold">GitHub Profile</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs flex items-center space-x-2 text-slate-400">
                    <Github className="w-4 h-4" />
                    <span className="font-bold">GitHub not linked</span>
                  </div>
                )}

                {currentUser.linkedInUrl ? (
                  <a
                    href={currentUser.linkedInUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs flex items-center justify-between text-slate-800 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Linkedin className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold">LinkedIn Profile</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs flex items-center space-x-2 text-slate-400">
                    <Linkedin className="w-4 h-4" />
                    <span className="font-bold">LinkedIn not linked</span>
                  </div>
                )}
              </div>
            </div>
          ) : isChangingPassword ? (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                Update Password
              </h4>
              <p className="text-xs text-slate-500">
                Enter your current password, then choose a new one (minimum 6 characters).
              </p>

              {passwordField(
                'Current Password *',
                oldPassword,
                setOldPassword,
                showOldPassword,
                setShowOldPassword,
                '••••••••••••',
              )}
              {passwordField(
                'New Password *',
                newPassword,
                setNewPassword,
                showNewPassword,
                setShowNewPassword,
                '••••••••••••',
                6,
              )}
              {passwordField(
                'Confirm New Password *',
                confirmPassword,
                setConfirmPassword,
                showConfirmPassword,
                setShowConfirmPassword,
                '••••••••••••',
                6,
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    resetPasswordForm();
                    setError('');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-60 flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Edit Personal & Professional Details
              </h4>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-700">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={avatar || currentUser.avatar}
                      alt={currentUser.name}
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-200 bg-white"
                    />
                    <div className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-indigo-600 text-white shadow">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleAvatarFileChange}
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 disabled:opacity-60"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
                      </button>
                      {isUploadedAvatar && (
                        <button
                          type="button"
                          disabled={uploading}
                          onClick={handleRemoveAvatar}
                          className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold flex items-center space-x-1.5 disabled:opacity-60"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      JPEG, PNG, WebP, or GIF up to 5MB. Replacing or removing deletes the previous uploaded file.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Professional Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                    placeholder="e.g. Senior Fullstack Engineer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                  placeholder="Describe your engineering expertise and focus..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">GitHub Profile URL</label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                    placeholder="https://github.com/username"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={linkedInUrl}
                    onChange={(e) => setLinkedInUrl(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Manage Skills Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-xs font-bold flex items-center space-x-1"
                    >
                      <span>{s}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s)}
                        className="text-indigo-500 hover:text-red-600 font-bold ml-1"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add skill tag (e.g. Docker, GraphQL)"
                    className="flex-1 text-xs p-2 border border-slate-300 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-60 flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center rounded-b-2xl">
          <button
            onClick={() => {
              logout();
              closeProfileModal();
            }}
            className="text-xs font-bold text-red-600 hover:text-red-800"
          >
            Sign Out
          </button>
          <button
            onClick={closeProfileModal}
            className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
