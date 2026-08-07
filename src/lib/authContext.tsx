'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, CandidateInfo } from '../types';
import { api, clearLegacyToken } from './api';

interface AuthContextType {
  currentUser: User | null;
  usersList: User[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updatedFields: Partial<User>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  removeAvatar: () => Promise<void>;
  candidateInfo: CandidateInfo;
  updateCandidateInfo: (info: Partial<CandidateInfo>) => Promise<void>;
  refreshUsers: () => Promise<void>;

  // Admin User Management
  addUserByAdmin: (user: Omit<User, 'id' | 'createdAt'> & { password?: string }) => Promise<void>;
  updateUserByAdmin: (id: string, updatedFields: Partial<User> & { password?: string }) => Promise<void>;
  deleteUserByAdmin: (id: string) => Promise<void>;
  resendSetupEmailByAdmin: (
    id: string,
    options?: { force?: boolean }
  ) => Promise<
    | { status: 'sent'; message: string }
    | { status: 'needs_confirm'; message: string; expiresAt?: string }
  >;

  // Modal controls
  isAuthModalOpen: boolean;
  authModalMode: 'LOGIN' | 'SIGNUP';
  openLoginModal: () => void;
  openSignupModal: () => void;
  closeAuthModal: () => void;

  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [candidateInfo, setCandidateInfo] = useState<CandidateInfo>({
    name: '',
    email: '',
    githubProfile: 'https://github.com/AdarshMalllah07',
    linkedInProfile: 'https://www.linkedin.com/in/adarsh-mallah-011279312/',
    portfolioWebsite: '',
    assignmentTitle: '',
    companyName: '',
    submissionDate: '',
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const applySession = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const refreshUsers = useCallback(async () => {
    try {
      const me = await api<{ user: User }>('/api/auth/me');
      if (me.user.role === 'ADMIN') {
        const users = await api<User[]>('/api/users');
        setUsersList(users);
      }
    } catch {
      // ignore — not admin or not logged in
    }
  }, []);

  // Restore session on boot (httpOnly cookie)
  useEffect(() => {
    clearLegacyToken();
    const boot = async () => {
      try {
        const { user } = await api<{ user: User }>('/api/auth/me');
        setCurrentUser(user);
        setIsAuthenticated(true);
        if (user.role === 'ADMIN') {
          const users = await api<User[]>('/api/users');
          setUsersList(users);
        }
      } catch {
        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    boot();
  }, []);

  useEffect(() => {
    api<CandidateInfo | null>('/api/candidate')
      .then((data) => {
        if (data) {
          setCandidateInfo({
            ...data,
            githubProfile: data.githubProfile || 'https://github.com/AdarshMalllah07',
            linkedInProfile:
              data.linkedInProfile || 'https://www.linkedin.com/in/adarsh-mallah-011279312/',
          });
        }
      })
      .catch(() => {});
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api<{ user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    applySession(data.user);
    setIsAuthModalOpen(false);
    if (data.user.role === 'ADMIN') {
      await refreshUsers();
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    const data = await api<{ user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    applySession(data.user);
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch {
      // clear local session even if network fails
    }
    clearLegacyToken();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setUsersList([]);
  };

  const updateUserProfile = async (updatedFields: Partial<User>) => {
    const { user } = await api<{ user: User }>('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify(updatedFields),
    });
    setCurrentUser(user);
    setUsersList((prev) => prev.map((u) => (u.id === user.id ? user : u)));
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    await api('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  };

  const uploadAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const { user } = await api<{ user: User }>('/api/auth/me/avatar', {
      method: 'POST',
      body: formData,
    });
    setCurrentUser(user);
    setUsersList((prev) => prev.map((u) => (u.id === user.id ? user : u)));
  };

  const removeAvatar = async () => {
    const { user } = await api<{ user: User }>('/api/auth/me/avatar', {
      method: 'DELETE',
    });
    setCurrentUser(user);
    setUsersList((prev) => prev.map((u) => (u.id === user.id ? user : u)));
  };

  const addUserByAdmin = async (user: Omit<User, 'id' | 'createdAt'> & { password?: string }) => {
    const payload = {
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      bio: user.bio,
      skills: user.skills,
      avatar: user.avatar,
      githubUrl: user.githubUrl,
      linkedInUrl: user.linkedInUrl,
      password: user.password,
    };
    const created = await api<User & { emailType?: string }>('/api/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const { emailType: _emailType, ...userOnly } = created as User & { emailType?: string };
    setUsersList((prev) => [userOnly as User, ...prev]);
  };

  const updateUserByAdmin = async (id: string, updatedFields: Partial<User> & { password?: string }) => {
    const updated = await api<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedFields),
    });
    setUsersList((prev) => prev.map((u) => (u.id === id ? updated : u)));
    if (currentUser?.id === id) {
      setCurrentUser(updated);
    }
  };

  const deleteUserByAdmin = async (id: string) => {
    await api(`/api/users/${id}`, { method: 'DELETE' });
    setUsersList((prev) => prev.filter((u) => u.id !== id));
  };

  const resendSetupEmailByAdmin = async (
    id: string,
    options?: { force?: boolean }
  ): Promise<
    | { status: 'sent'; message: string }
    | { status: 'needs_confirm'; message: string; expiresAt?: string }
  > => {
    const res = await fetch(`/api/users/${id}/resend-setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ force: Boolean(options?.force) }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
      requiresConfirm?: boolean;
      expiresAt?: string;
      user?: User;
    };

    if (res.status === 409 && data.requiresConfirm) {
      return {
        status: 'needs_confirm',
        message: data.message || data.error || 'An active setup link already exists.',
        expiresAt: data.expiresAt,
      };
    }

    if (!res.ok) {
      throw new Error(data.error || data.message || 'Failed to resend setup email');
    }

    if (data.user) {
      setUsersList((prev) => prev.map((u) => (u.id === id ? { ...u, ...data.user } : u)));
    } else {
      setUsersList((prev) =>
        prev.map((u) => (u.id === id ? { ...u, invitePending: true } : u))
      );
    }

    return { status: 'sent', message: data.message || 'Account setup email sent.' };
  };

  const updateCandidateInfo = async (info: Partial<CandidateInfo>) => {
    const updated = { ...candidateInfo, ...info };
    setCandidateInfo(updated);
    try {
      await api('/api/candidate', {
        method: 'PUT',
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.error('Failed to sync candidate profile with server', e);
      throw e;
    }
  };

  const openLoginModal = () => {
    setAuthModalMode('LOGIN');
    setIsAuthModalOpen(true);
  };

  const openSignupModal = () => {
    setAuthModalMode('SIGNUP');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        usersList,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        updateUserProfile,
        changePassword,
        uploadAvatar,
        removeAvatar,
        candidateInfo,
        updateCandidateInfo,
        refreshUsers,
        addUserByAdmin,
        updateUserByAdmin,
        deleteUserByAdmin,
        resendSetupEmailByAdmin,
        isAuthModalOpen,
        authModalMode,
        openLoginModal,
        openSignupModal,
        closeAuthModal,
        isProfileModalOpen,
        openProfileModal,
        closeProfileModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
