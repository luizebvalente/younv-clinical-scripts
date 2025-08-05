import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInAnonymously
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, query, where, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { USER_ROLES } from '../types';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.currentUserData = null;
  }

  // Login with email and password
  async login(email, password) {
    try {
      // For demo purposes, check if it's a demo login
      if (password === '123456') {
        return await this.demoLogin(email);
      }

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
    } catch (error) {
      console.error('Login error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Demo login for development/testing
  async demoLogin(email) {
    try {
      // Find user in Firestore by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Usuário não encontrado');
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      if (!userData.isActive) {
        throw new Error('Usuário inativo');
      }

      // Sign in anonymously for demo
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      // Update profile with demo user data
      await updateProfile(user, { 
        displayName: userData.name 
      });

      // Update last login in Firestore
      await updateDoc(doc(db, 'users', userDoc.id), {
        lastLogin: new Date()
      });

      this.currentUser = user;
      this.currentUserData = { ...userData, id: userDoc.id };
      
      return { user, userData: this.currentUserData };
    } catch (error) {
      console.error('Demo login error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Register new user (only for super admin)
  async register(userData) {
    try {
      const { email, password, name, clinicId, role = USER_ROLES.USER } = userData;
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile
      await updateProfile(user, { displayName: name });

      // Save user data to Firestore
      const userDoc = {
        id: user.uid,
        email: user.email,
        name,
        clinicId,
        role,
        isActive: true,
        createdAt: new Date(),
        lastLogin: null,
        needsPasswordChange: false
      };

      await setDoc(doc(db, 'users', user.uid), userDoc);
      
      return { user, userData: userDoc };
    } catch (error) {
      console.error('Registration error:', error);
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
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Get user data from Firestore
  async getUserData(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Get user data error:', error);
      return null;
    }
  }

  // Update last login timestamp
  async updateLastLogin(uid) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        lastLogin: new Date()
      });
    } catch (error) {
      console.error('Update last login error:', error);
    }
  }

  // Check if user has permission
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

  // Check if user can access clinic data
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
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        // For anonymous users (demo), use stored userData
        if (user.isAnonymous && this.currentUserData) {
          callback({ user, userData: this.currentUserData });
        } else {
          const userData = await this.getUserData(user.uid);
          this.currentUser = user;
          this.currentUserData = userData;
          callback({ user, userData });
        }
      } else {
        this.currentUser = null;
        this.currentUserData = null;
        callback(null);
      }
    });
  }

  // Handle authentication errors
  handleAuthError(error) {
    const errorMessages = {
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/email-already-in-use': 'Email já está em uso',
      'auth/weak-password': 'Senha muito fraca',
      'auth/invalid-email': 'Email inválido',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
      'auth/network-request-failed': 'Erro de conexão. Verifique sua internet',
      'auth/invalid-credential': 'Credenciais inválidas'
    };

    return new Error(errorMessages[error.code] || error.message);
  }

  // Get current user info
  getCurrentUser() {
    return {
      user: this.currentUser,
      userData: this.currentUserData
    };
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser && !!this.currentUserData;
  }

  // Get demo users for login help
  getDemoUsers() {
    return [
      {
        email: 'admin@younv.com.br',
        role: 'Super Administrador',
        description: 'Acesso completo ao sistema'
      },
      {
        email: 'admin@clinicasaolucas.com.br',
        role: 'Administrador da Clínica',
        description: 'Gerencia clínica São Lucas'
      },
      {
        email: 'recep1@clinicasaolucas.com.br',
        role: 'Usuário',
        description: 'Recepcionista da clínica'
      }
    ];
  }
}

export default new AuthService();

