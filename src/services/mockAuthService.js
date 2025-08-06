// Mock authentication service for development
import { mockAuth } from '../data/seedData';
import { USER_ROLES } from '../types';

class MockAuthService {
  constructor() {
    this.currentUser = null;
    this.currentUserData = null;
    this.listeners = [];
  }

  // Mock login
  async login(email, password) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Find user in mock data
    const userEntry = Object.values(mockAuth).find(
      auth => auth.user.email === email
    );

    if (!userEntry || password !== '123456') {
      throw new Error('Email ou senha incorretos');
    }

    if (!userEntry.userData.isActive) {
      throw new Error('Usuário inativo ou não encontrado');
    }

    this.currentUser = userEntry.user;
    this.currentUserData = userEntry.userData;

    // Notify listeners
    this.notifyListeners({ 
      user: this.currentUser, 
      userData: this.currentUserData 
    });

    return { 
      user: this.currentUser, 
      userData: this.currentUserData 
    };
  }

  // Mock logout
  async logout() {
    this.currentUser = null;
    this.currentUserData = null;
    this.notifyListeners(null);
  }

  // Mock register (only for super admin)
  async register(userData) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!this.hasPermission('super_admin')) {
      throw new Error('Acesso negado');
    }

    // In a real implementation, this would create a new user
    throw new Error('Registro não implementado no modo mock');
  }

  // Get user data
  async getUserData(uid) {
    return this.currentUserData;
  }

  // Update last login
  async updateLastLogin(uid) {
    // Mock implementation - do nothing
  }

  // Check permissions
  hasPermission(requiredRole) {
    if (!this.currentUserData) return false;
    
    const roleHierarchy = {
      [USER_ROLES.USER]: 1,
      [USER_ROLES.ADMIN]: 2,
      [USER_ROLES.SUPER_ADMIN]: 3
    };

    const userLevel = roleHierarchy[this.currentUserData.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  }

  // Check clinic access
  canAccessClinic(clinicId) {
    if (!this.currentUserData) return false;
    
    // Super admin can access all clinics
    if (this.currentUserData.role === USER_ROLES.SUPER_ADMIN) {
      return true;
    }
    
    // Other users can only access their own clinic
    return this.currentUserData.clinicId === clinicId;
  }

  // Listen to auth state changes
  onAuthStateChange(callback) {
    this.listeners.push(callback);
    
    // Immediately call with current state
    callback(this.currentUser ? {
      user: this.currentUser,
      userData: this.currentUserData
    } : null);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners
  notifyListeners(authData) {
    this.listeners.forEach(listener => listener(authData));
  }

  // Handle auth errors
  handleAuthError(error) {
    return error;
  }

  // Get current user
  getCurrentUser() {
    return {
      user: this.currentUser,
      userData: this.currentUserData
    };
  }

  // Check if authenticated
  isAuthenticated() {
    return !!this.currentUser && !!this.currentUserData;
  }
}

export default new MockAuthService();

