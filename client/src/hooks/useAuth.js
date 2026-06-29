import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom React hook to consume AuthContext values safely.
 * Returns { user, token, isAuthenticated, loading, login, register, logout, setUser }
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;
