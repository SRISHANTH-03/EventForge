import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('ef_token');
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          }
        } catch (err) {
          console.warn('[Auth] Session restore failed:', err.message);
          localStorage.removeItem('ef_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      addToast(`Welcome back, ${res.user.name}`, 'success');
      return res.user;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const signup = async (payload) => {
    try {
      const res = await api.signup(payload);
      setUser(res.user);
      addToast('Account created successfully!', 'success');
      return res.user;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const demoLogin = async (role = 'organizer') => {
    try {
      setLoading(true);
      const res = await api.demoLogin(role);
      setUser(res.user);
      addToast(`Switched to Demo ${role.toUpperCase()} account`, 'success');
      return res.user;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
      addToast('Logged out securely.', 'info');
    } catch (err) {
      setUser(null);
    }
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    if (user.roles?.includes('admin')) return true;
    return roles.some((r) => user.roles?.includes(r));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        demoLogin,
        logout,
        hasRole,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
