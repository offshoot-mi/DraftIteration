// Rewrite/client/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// USE ENVIRONMENT VARIABLE FOR API URL
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'draftiterationj.onrender.com/api',
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rewriteToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('rewriteToken'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchUserProfile = useCallback(async (currentToken) => {
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
      const { data } = await apiClient.get('/auth/me');
      // Create a new object to guarantee React re-renders consumers
      setUser(prevUser => ({ ...prevUser, ...data }));
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      localStorage.removeItem('rewriteToken');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('rewriteToken');
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, [fetchUserProfile]);


  const login = async (username, password) => {
    setLoading(true); setError(null);
    try {
      const { data } = await apiClient.post('/auth/login', { username, password });
      localStorage.setItem('rewriteToken', data.token); setToken(data.token); setUser(data);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setLoading(false); navigate('/'); return true;
    } catch (err) {
      console.error('Login failed:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.error || 'Login failed. Please try again.');
      setLoading(false); return false;
    }
  };
  const signup = async (username, password, agreedToTerms) => {
    // This function is kept for consistency but the SignupPage now handles its own submission
    // to manage the CAPTCHA token directly.
    setLoading(true); setError(null);
    try {
      const { data } = await apiClient.post('/auth/signup', { username, password, agreedToTerms });
      localStorage.setItem('rewriteToken', data.token); setToken(data.token); setUser(data);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setLoading(false); navigate('/'); return true;
    } catch (err) {
      console.error('Signup failed:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
      setLoading(false); return false;
    }
  };
  const logout = () => {
    setLoading(true); localStorage.removeItem('rewriteToken');
    setUser(null); setToken(null); delete apiClient.defaults.headers.common['Authorization'];
    setLoading(false); navigate('/login');
  };

  // Robust function to update user object in context
  const updateUser = (newUserData) => {
    setUser(currentUser => {
      if (!currentUser) return newUserData; 
      return {
        ...currentUser,
        ...newUserData
      };
    });
  };

  const clearError = () => { setError(null); };
  // Fix the googleLogin function in AuthContext.jsx
const googleLogin = async (credential) => {
  setLoading(true);
  setError(null);

  try {
    const { data } = await apiClient.post('/auth/google', {
      token: credential
    });

    console.log('Google login response:', data); // Debug log

    localStorage.setItem('rewriteToken', data.token);
    setToken(data.token);
    
    // FIX: The user data is at the top level, not data.user
    setUser({
      id: data.id,
      username: data.username,
      email: data.email,
      role: data.role,
      isPrivate: data.isPrivate,
      createdAt: data.createdAt
    });

    apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

    navigate('/');
    return true;

  } catch (err) {
    console.error('Google login failed:', err.response ? err.response.data : err.message);
    setError(err.response?.data?.error || 'Google authentication failed.');
    return false;
  } finally {
    setLoading(false);
  }
};

  const value = {
    user,
      googleLogin,   // ⭐ ADD THIS
    token,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    signup,
    logout,
    fetchUserProfile,
    updateUser,
    apiClient,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
