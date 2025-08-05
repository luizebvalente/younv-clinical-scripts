/**
 * Serviço de autenticação com setup automático de usuários
 * 
 * Este serviço estende o Firebase Auth para criar automaticamente
 * os usuários de demonstração na primeira tentativa de login.
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
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { USER_ROLES } from '../types';

// Usuários de demonstração
const demoUsers = [
  {
    email: 'luizebvalente@gmail.com',
    password: '123456',
    name: 'Luiz Valente',
    role: USER_ROLES.ADMIN,
    clinicId: 'clinica-sao-lucas',
    isActive: true
  },
  {
    email: 'admin@younv.com.br',
    password: '123456',
    name: 'Super Administrador',
    role: USER_ROLES.SUPER_ADMIN,
    clinicId: null,
    isActive: true
  },
  {
    email: 'user@clinica.com.br',
    password: '123456',
    name: 'Usuário Regular',
    role: USER_ROLES.USER,
    clinicId: 'clinica-sao-lucas',
    isActive: true
  }
];

class AutoSetupAuthService {
  constructor() {
    this.currentUser = null;
    this.currentUserData = null;
    this.listeners = [];
    this.setupComplete = false;
    
    // Verificar se o setup já foi feito
    const setupDone = localStorage.getItem('firebase_setup_complete');
    if (setupDone === 'true') {
      this.setupComplete = true;
    }
  }

  // Initialize auth state listener
  async initialize() {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const userData = await this.getUserData(user.uid);
            this.currentUser = user;
            this.currentUserData = userData;
            this.notifyListeners({ user, userData });
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
      // Verificar se é um usuário de demonstração
      const isDemoUser = demoUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (isDemoUser && !this.setupComplete) {
        // Tentar fazer login primeiro para ver se o usuário já existe
        try {
          const result = await signInWithEmailAndPassword(auth, email, password);
          // Se chegou aqui, o usuário existe
          const user = result.user;
          
          // Get user data from Firestore
          const userData = await this.getUserData(user.uid);
          
          if (!userData || !userData.isActive) {
            await this.logout();
            throw new Error('Usuário inativo ou não encontrado');
          }

          // Update last login
          await this.updateLastLogin(user.uid);
          
          this.currentUser = user;
          this.currentUserData = userData;

          return { user, userData };
        } catch (loginError) {
          // Se o erro for auth/user-not-found, criar o usuário
          if (loginError.code === 'auth/user-not-found' || loginError.code === 'auth/invalid-credential') {
            console.log('Usuário de demonstração não encontrado, criando automaticamente...');
            
            // Encontrar dados do usuário
            const demoUserData = demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
            
            if (demoUserData) {
              // Criar usuário
              await this.createDemoUser(demoUserData);
              
              // Tentar login novamente
              return this.login(email, password);
            }
          }
          
          // Se não for um erro de usuário não encontrado ou não for um usuário de demonstração, repassar o erro
          throw loginError;
        }
      } else {
        // Login normal para usuários não-demo ou quando o setup já foi feito
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Get user data from Firestore
        const userData = await this.getUserData(user.uid);
        
        if (!userData || !userData.isActive) {
          await this.logout();
          throw new Error('Usuário inativo ou não encontrado');
        }

        // Update last login
        await this.updateLastLogin(user.uid);
        
        this.currentUser = user;
        this.currentUserData = userData;

        return { user, userData };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw this.handleAuthError(error);
    }
  }

  // Criar usuário de demonstração
  async createDemoUser(userData) {
    try {
      console.log(`Criando usuário de demonstração: ${userData.email}`);
      
      // Criar usuário no Firebase Auth
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

      // Verificar se a clínica existe, se não, criar
      if (userData.clinicId) {
        const clinicRef = doc(db, 'clinics', userData.clinicId);
        const clinicDoc = await getDoc(clinicRef);
        
        if (!clinicDoc.exists()) {
          // Criar clínica
          await setDoc(clinicRef, {
            id: userData.clinicId,
            name: userData.clinicId === 'clinica-sao-lucas' ? 'Clínica São Lucas' : 'Nova Clínica',
            address: 'Endereço da clínica',
            phone: '(11) 1234-5678',
            email: 'contato@clinica.com.br',
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          console.log(`Clínica criada: ${userData.clinicId}`);
        }
      }

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
        needsPasswordChange: false
      };

      await setDoc(doc(db, 'users', user.uid), userDoc);
      
      console.log(`Usuário de demonstração criado: ${userData.email}`);
      
      // Marcar setup como concluído
      localStorage.setItem('firebase_setup_complete', 'true');
      this.setupComplete = true;

      return { user, userData: userDoc };
    } catch (error) {
      console.error('Erro ao criar usuário de demonstração:', error);
      throw error;
    }
  }

  // Register new user (only for super admin)
  async register(userData) {
    try {
      if (!this.hasPermission('super_admin')) {
        throw new Error('Acesso negado');
      }

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
        needsPasswordChange: false
      };

      await setDoc(doc(db, 'users', user.uid), userDoc);

      return { user, userData: userDoc };
    } catch (error) {
      console.error('Erro no registro:', error);
      throw this.handleAuthError(error);
    }
  }

  // Logout
  async logout() {
    try {
      await signOut(auth);
      this.currentUser = null;
      this.currentUserData = null;
    } catch (error) {
      console.error('Erro no logout:', error);
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
    } catch (error) {
      console.error('Erro ao enviar email de reset:', error);
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
      'auth/invalid-credential': 'Credenciais inválidas'
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

export default new AutoSetupAuthService();

