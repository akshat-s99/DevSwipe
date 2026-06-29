import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

// Create the Context object to share across the application
export const AuthContext = createContext(null);

/**
 * AuthProvider component that wraps the app tree and provides
 * state and functions related to user authentication.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  /**
   * Reset auth states and remove JWT from local storage.
   */
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  /**
   * Sends user credentials to login endpoint.
   * On success, saves token and fetches the user's detailed profile.
   */
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: receivedToken } = response.data;
      
      // Store token in local storage and state
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      
      // Fetch full developer profile details (bio, stack, github etc)
      const profileResponse = await api.get('/profile', {
        headers: { Authorization: `Bearer ${receivedToken}` }
      });
      setUser(profileResponse.data);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed. Please verify credentials.'
      };
    }
  };

  /**
   * Sends registration details to registration endpoint.
   * On success, saves token and fetches the new profile.
   */
  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token: receivedToken } = response.data;
      
      // Store token in local storage and state
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      
      // Fetch profile (which will be blank/empty stack initially)
      const profileResponse = await api.get('/profile', {
        headers: { Authorization: `Bearer ${receivedToken}` }
      });
      setUser(profileResponse.data);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed. Please try again.'
      };
    }
  };

  /**
   * Verifies the authenticity of the local token.
   * Fetches user profile data from backend. If request fails, logs the user out.
   */
  const verifyToken = async (currentToken) => {
    try {
      const profileResponse = await api.get('/profile', {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      setUser(profileResponse.data);
    } catch (error) {
      console.warn('Initial session restore failed. Clearing session.');
      logout();
    } finally {
      // Finished checking token validation
      setLoading(false);
    }
  };

  // Run once on application startup to auto-login if token is present
  useEffect(() => {
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Set up custom event listener to log out when Axios catches a 401 response
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    
    // Clean up event listener when provider unmounts
    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        setUser // For updates to profile after edit
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
