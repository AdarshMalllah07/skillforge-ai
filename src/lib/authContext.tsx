import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, CandidateInfo } from '../types';
import { api, getToken, setToken, clearToken } from './api';

interface AuthContextType {
  currentUser: User | null;
  usersList: User[];
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (updatedFields: Partial<User>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  removeAvatar: () => Promise<void>;
  candidateInfo: CandidateInfo;
  updateCandidateInfo: (info: Partial<CandidateInfo>) => Promise<void>;
  refreshUsers: () => Promise<void>;

  // Admin User Management
  addUserByAdmin: (user: Omit<User, 'id' | 'createdAt'> & { password?: string }) => Promise<void>;
  updateUserByAdmin: (id: string, updatedFields: Partial<User>) => Promise<void>;
  deleteUserByAdmin: (id: string) => Promise<void>;

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
  const [token, setTokenState] = useState(getToken());
  const [candidateInfo, setCandidateInfo] = useState<CandidateInfo>({
    name: '',
    email: '',
    githubProfile: '',
    linkedInProfile: '',
    portfolioWebsite: '',
    assignmentTitle: '',
    companyName: '',
    submissionDate: '',
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const applySession = (newToken: string, user: User) => {
    setToken(newToken);
    setTokenState(newToken);
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const refreshUsers = useCallback(async () => {
    try {
      if (!getToken()) return;
      const me = await api<{ user: User }>('/api/auth/me');
      if (me.user.role === 'ADMIN') {
        const users = await api<User[]>('/api/users');
        setUsersList(users);
      }
    } catch {
      // ignore — not admin or not logged in
    }
  }, []);

  // Restore session on boot
  useEffect(() => {
    const boot = async () => {
      const existing = getToken();
      if (!existing) {
        setIsLoading(false);
        return;
      }
      try {
        const { user } = await api<{ user: User }>('/api/auth/me');
        setCurrentUser(user);
        setIsAuthenticated(true);
        setTokenState(existing);
        if (user.role === 'ADMIN') {
          const users = await api<User[]>('/api/users');
          setUsersList(users);
        }
      } catch {
        clearToken();
        setTokenState('');
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
        if (data) setCandidateInfo(data);
      })
      .catch(() => {});
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    applySession(data.token, data.user);
    setIsAuthModalOpen(false);
    if (data.user.role === 'ADMIN') {
      await refreshUsers();
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    const data = await api<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    applySession(data.token, data.user);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    clearToken();
    setTokenState('');
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
    const created = await api<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
    setUsersList((prev) => [created, ...prev]);
  };

  const updateUserByAdmin = async (id: string, updatedFields: Partial<User>) => {
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
        token,
        login,
        signup,
        logout,
        updateUserProfile,
        uploadAvatar,
        removeAvatar,
        candidateInfo,
        updateCandidateInfo,
        refreshUsers,
        addUserByAdmin,
        updateUserByAdmin,
        deleteUserByAdmin,
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
