import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile on mount if token exists in localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('astitva_token');
      if (token) {
        try {
          // Fetch profile using the token attached in api.js interceptor
          const { data } = await API.get('/auth/profile');
          setUser(data.data);
        } catch (error) {
          console.error('Session initialization failed:', error.message);
          localStorage.removeItem('astitva_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const { data } = await API.post('/auth/login', { email, password });
      
      const loggedUser = data.data;
      localStorage.setItem('astitva_token', loggedUser.token);
      setUser({
        _id: loggedUser._id,
        name: loggedUser.name,
        email: loggedUser.email,
        role: loggedUser.role,
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, error: message };
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    try {
      const { data } = await API.post('/auth/register', { name, email, password });
      
      const registeredUser = data.data;
      localStorage.setItem('astitva_token', registeredUser.token);
      setUser({
        _id: registeredUser._id,
        name: registeredUser.name,
        email: registeredUser.email,
        role: registeredUser.role,
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, error: message };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('astitva_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for consuming auth context easily
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
