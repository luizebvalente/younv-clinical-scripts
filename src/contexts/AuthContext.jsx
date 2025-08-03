import React, { createContext, useContext, useEffect, useState } from 'react';
import mockAuthService from '../services/mockAuthService';

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
    const unsubscribe = mockAuthService.onAuthStateChange((authData) => {
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
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const result = await mockAuthService.login(email, password);
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
      const result = await mockAuthService.register(userData);
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
      await mockAuthService.logout();
      setUser(null);
      setUserData(null);
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
    return mockAuthService.hasPermission(requiredRole);
  };

  const canAccessClinic = (clinicId) => {
    return mockAuthService.canAccessClinic(clinicId);
  };

  const isAuthenticated = () => {
    return mockAuthService.isAuthenticated();
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

