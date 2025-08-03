import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
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
        lastLogin: null
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
        const userData = await this.getUserData(user.uid);
        this.currentUser = user;
        this.currentUserData = userData;
        callback({ user, userData });
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
      'auth/network-request-failed': 'Erro de conexão. Verifique sua internet'
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
}

export default new AuthService();

