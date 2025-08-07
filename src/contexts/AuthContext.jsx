import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize auth service and set up listener
    const initAuth = async () => {
      try {
        await authService.initialize();
        
        const unsubscribe = authService.onAuthStateChange((authData) => {
          if (authData) {
            setUser(authData.user);
            setUserData(authData.userData);
          } else {
            setUser(null);
            setUserData(null);
          }
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        setLoading(false);
      }
    };

    const unsubscribePromise = initAuth();
    
    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const result = await authService.login(email, password);
      setUser(result.user);
      setUserData(result.userData);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const result = await authService.register(userData);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await authService.logout();
      setUser(null);
      setUserData(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      setError(null);
      await authService.resetPassword(email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Permission helpers
  const hasPermission = (requiredRole) => {
    return authService.hasPermission(requiredRole);
  };

  const canAccessClinic = (clinicId) => {
    return authService.canAccessClinic(clinicId);
  };

  const isAuthenticated = () => {
    return authService.isAuthenticated();
  };

  const value = {
    // State
    user,
    userData,
    loading,
    error,
    
    // Actions
    login,
    register,
    logout,
    resetPassword,
    clearError,
    
    // Helpers
    hasPermission,
    canAccessClinic,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

