import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  setDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  updatePassword,
  deleteUser as deleteAuthUser
} from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import authService from './authService';
import { USER_ROLES } from '../types';

class UserService {
  constructor() {
    this.collectionName = 'users';
  }

  // Create new user
  async createUser(userData) {
    try {
      // Check permissions
      if (!authService.hasPermission(['admin', 'super_admin'])) {
        throw new Error('Acesso negado. Apenas administradores podem criar usuários.');
      }

      const { userData: currentUser } = authService.getCurrentUser();
      
      // Admin can only create users for their clinic
      if (currentUser.role === USER_ROLES.ADMIN && userData.clinicId !== currentUser.clinicId) {
        throw new Error('Você só pode criar usuários para sua clínica.');
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      const user = userCredential.user;

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

      await setDoc(doc(db, this.collectionName, user.uid), userDoc);

      return { id: user.uid, ...userDoc };
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      const docRef = doc(db, this.collectionName, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const user = {
          id: docSnap.id,
          ...docSnap.data()
        };

        // Check if current user can access this user
        if (!this.canAccessUser(user)) {
          throw new Error('Acesso negado a este usuário.');
        }

        return user;
      } else {
        throw new Error('Usuário não encontrado');
      }
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  // Get all users (super admin only)
  async getAllUsers() {
    try {
      if (!authService.hasPermission('super_admin')) {
        throw new Error('Acesso negado. Apenas super administradores podem listar todos os usuários.');
      }

      const q = query(
        collection(db, this.collectionName),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(q);
      const users = [];
      
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return users;
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  }

  // Get users by clinic
  async getUsersByClinic(clinicId) {
    try {
      if (!authService.canAccessClinic(clinicId)) {
        throw new Error('Acesso negado a esta clínica.');
      }

      const q = query(
        collection(db, this.collectionName),
        where('clinicId', '==', clinicId),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(q);
      const users = [];
      
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return users;
    } catch (error) {
      console.error('Get users by clinic error:', error);
      throw error;
    }
  }

  // Update user
  async updateUser(userId, updateData) {
    try {
      const user = await this.getUserById(userId);
      
      // Check permissions
      if (!this.canAccessUser(user)) {
        throw new Error('Acesso negado a este usuário.');
      }

      const docRef = doc(db, this.collectionName, userId);
      const updatedData = {
        ...updateData,
        updatedAt: serverTimestamp()
      };

      // Remove password from Firestore update
      if (updatedData.password) {
        delete updatedData.password;
      }
      
      await updateDoc(docRef, updatedData);
      
      // Update password in Firebase Auth if provided
      if (updateData.password) {
        // Note: This would require admin SDK in a real implementation
        // For now, we'll skip password update
        console.log('Password update would be handled by admin SDK');
      }
      
      return await this.getUserById(userId);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  // Deactivate user (soft delete)
  async deactivateUser(userId) {
    try {
      const user = await this.getUserById(userId);
      
      if (!this.canAccessUser(user)) {
        throw new Error('Acesso negado a este usuário.');
      }

      const docRef = doc(db, this.collectionName, userId);
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Deactivate user error:', error);
      throw error;
    }
  }

  // Activate user
  async activateUser(userId) {
    try {
      const user = await this.getUserById(userId);
      
      if (!this.canAccessUser(user)) {
        throw new Error('Acesso negado a este usuário.');
      }

      const docRef = doc(db, this.collectionName, userId);
      await updateDoc(docRef, {
        isActive: true,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Activate user error:', error);
      throw error;
    }
  }

  // Delete user permanently (super admin only)
  async deleteUser(userId) {
    try {
      if (!authService.hasPermission('super_admin')) {
        throw new Error('Acesso negado. Apenas super administradores podem excluir usuários.');
      }

      const user = await this.getUserById(userId);
      
      // Delete from Firestore
      const docRef = doc(db, this.collectionName, userId);
      await deleteDoc(docRef);
      
      // Note: Deleting from Firebase Auth would require admin SDK
      console.log('User deletion from Firebase Auth would be handled by admin SDK');
      
      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  // Search users
  async searchUsers(searchTerm, clinicId = null) {
    try {
      let users;
      
      if (authService.hasPermission('super_admin')) {
        if (clinicId) {
          users = await this.getUsersByClinic(clinicId);
        } else {
          users = await this.getAllUsers();
        }
      } else {
        const { userData } = authService.getCurrentUser();
        users = await this.getUsersByClinic(userData.clinicId);
      }
      
      if (!searchTerm) return users;

      const searchLower = searchTerm.toLowerCase();
      const filtered = users.filter(user => {
        return (
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        );
      });
      
      return filtered;
    } catch (error) {
      console.error('Search users error:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStats(clinicId = null) {
    try {
      let users;
      
      if (clinicId) {
        if (!authService.canAccessClinic(clinicId)) {
          throw new Error('Acesso negado a esta clínica.');
        }
        users = await this.getUsersByClinic(clinicId);
      } else if (authService.hasPermission('super_admin')) {
        users = await this.getAllUsers();
      } else {
        const { userData } = authService.getCurrentUser();
        users = await this.getUsersByClinic(userData.clinicId);
      }
      
      const stats = {
        total: users.length,
        active: users.filter(u => u.isActive).length,
        inactive: users.filter(u => !u.isActive).length,
        byRole: {
          [USER_ROLES.USER]: users.filter(u => u.role === USER_ROLES.USER).length,
          [USER_ROLES.ADMIN]: users.filter(u => u.role === USER_ROLES.ADMIN).length,
          [USER_ROLES.SUPER_ADMIN]: users.filter(u => u.role === USER_ROLES.SUPER_ADMIN).length
        },
        recentlyCreated: users
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 5)
      };
      
      return stats;
    } catch (error) {
      console.error('Get user stats error:', error);
      throw error;
    }
  }

  // Check if current user can access another user
  canAccessUser(user) {
    const { userData } = authService.getCurrentUser();
    
    if (!userData) return false;
    
    // Super admin can access all users
    if (userData.role === USER_ROLES.SUPER_ADMIN) {
      return true;
    }
    
    // Admin can access users from their clinic
    if (userData.role === USER_ROLES.ADMIN) {
      return user.clinicId === userData.clinicId;
    }
    
    // Regular users can only access themselves
    return user.id === userData.id;
  }

  // Reset user password (admin only)
  async resetUserPassword(userId, newPassword) {
    try {
      const user = await this.getUserById(userId);
      
      if (!this.canAccessUser(user)) {
        throw new Error('Acesso negado a este usuário.');
      }

      if (!authService.hasPermission(['admin', 'super_admin'])) {
        throw new Error('Acesso negado. Apenas administradores podem resetar senhas.');
      }

      // Note: This would require admin SDK in a real implementation
      console.log('Password reset would be handled by admin SDK');
      
      // Mark user as needing password change
      await updateDoc(doc(db, this.collectionName, userId), {
        needsPasswordChange: true,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Update user last login
  async updateLastLogin(userId) {
    try {
      const docRef = doc(db, this.collectionName, userId);
      await updateDoc(docRef, {
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Update last login error:', error);
    }
  }
}

export default new UserService();

