/**
 * Serviço de autenticação simplificado
 * 
 * Este serviço gerencia a autenticação de usuários usando Firebase Auth
 * sem dependência de usuários demo hardcoded.
 */

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { USER_ROLES } from '../types';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.currentUserData = null;
    this.listeners = [];
  }

  // Initialize auth state listener
  async initialize() {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const userData = await this.getUserData(user.uid);
            if (userData) {
              this.currentUser = user;
              this.currentUserData = userData;
              this.notifyListeners({ user, userData });
            } else {
              // Usuário existe no Auth mas não no Firestore
              console.warn('Usuário encontrado no Auth mas não no Firestore:', user.email);
              await this.logout();
              this.notifyListeners(null);
            }
          } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            this.currentUser = null;
            this.currentUserData = null;
            this.notifyListeners(null);
          }
        } else {
          this.currentUser = null;
          this.currentUserData = null;
          this.notifyListeners(null);
        }
        resolve();
      });

      // Store unsubscribe function
      this.authUnsubscribe = unsubscribe;
    });
  }

  // Login with email and password
  async login(email, password) {
    try {
      console.log('🔐 Tentando fazer login:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user data from Firestore
      const userData = await this.getUserData(user.uid);
      
      if (!userData) {
        await this.logout();
        throw new Error('Usuário não encontrado no sistema. Entre em contato com o administrador.');
      }
      
      // Verificar se o usuário está ativo
      if (!userData.isActive) {
        await this.logout();
        throw new Error('Usuário inativo. Entre em contato com o administrador.');
      }

      // Update last login
      await this.updateLastLogin(user.uid);
      
      this.currentUser = user;
      this.currentUserData = userData;

      console.log('✅ Login realizado com sucesso:', userData.name);
      return { user, userData };
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw this.handleAuthError(error);
    }
  }

  // Register new user (only for admins)
  async register(userData) {
    try {
      if (!this.hasPermission(['admin', 'super_admin'])) {
        throw new Error('Acesso negado. Apenas administradores podem criar usuários.');
      }

      console.log('👤 Criando novo usuário:', userData.email);

      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      const user = userCredential.user;

      // Update user profile
      await updateProfile(user, {
        displayName: userData.name
      });

      // Create user document in Firestore
      const userDoc = {
        id: user.uid,
        email: userData.email,
        name: userData.name,
        clinicId: userData.clinicId,
        role: userData.role || USER_ROLES.USER,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: null,
        needsPasswordChange: userData.needsPasswordChange || false
      };

      await setDoc(doc(db, 'users', user.uid), userDoc);

      console.log('✅ Usuário criado com sucesso:', userData.name);
      return { user, userData: userDoc };
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      throw this.handleAuthError(error);
    }
  }

  // Logout
  async logout() {
    try {
      await signOut(auth);
      this.currentUser = null;
      this.currentUserData = null;
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      throw this.handleAuthError(error);
    }
  }

  // Get user data from Firestore
  async getUserData(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return { id: uid, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      throw error;
    }
  }

  // Update last login timestamp
  async updateLastLogin(uid) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar último login:', error);
    }
  }

  // Send password reset email
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Email de reset enviado para:', email);
    } catch (error) {
      console.error('❌ Erro ao enviar email de reset:', error);
      throw this.handleAuthError(error);
    }
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
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.some(role => {
        const requiredLevel = roleHierarchy[role] || 0;
        return userLevel >= requiredLevel;
      });
    }
    
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
    const errorMessages = {
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/invalid-email': 'Email inválido',
      'auth/user-disabled': 'Usuário desabilitado',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
      'auth/email-already-in-use': 'Email já está em uso',
      'auth/weak-password': 'Senha muito fraca',
      'auth/invalid-credential': 'Credenciais inválidas',
      'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.'
    };

    const message = errorMessages[error.code] || error.message || 'Erro de autenticação';
    return new Error(message);
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

  // Cleanup
  destroy() {
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
    }
    this.listeners = [];
  }
}

export default new AuthService();

