import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('replate_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('replate_token'));
  const [loading, setLoading] = useState(() => !localStorage.getItem('replate_token'));

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('replate_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('replate_user', JSON.stringify(res.user));
          } else {
            logout();
          }
        } catch (err) {
          // If status is 401 unauthorized, session has truly ended
          if (err.message && (err.message.includes('401') || err.message.includes('expired'))) {
            logout();
          } else {
            console.warn('Network issue during session revalidation, using cached profile:', err.message);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('replate_token', res.token);
      localStorage.setItem('replate_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (payload) => {
    const res = await api.register(payload);
    if (res.success && res.token) {
      localStorage.setItem('replate_token', res.token);
      localStorage.setItem('replate_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const demoLogin = async (role) => {
    const res = await api.demoLogin(role);
    if (res.success && res.token) {
      localStorage.setItem('replate_token', res.token);
      localStorage.setItem('replate_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Demo sign-in failed');
  };

  const logout = () => {
    localStorage.removeItem('replate_token');
    localStorage.removeItem('replate_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        loading,
        login,
        register,
        demoLogin,
        logout,
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
