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
  deleteUser as deleteAuthUser,
  updateProfile
} from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import authService from './authService';
import { USER_ROLES } from '../types';

class UserService {
  constructor() {
    this.collectionName = 'users';
  }

  // Create new user with proper clinic validation
  async createUser(userData) {
    try {
      console.log('🔄 Iniciando criação de usuário:', userData.email);

      // Check permissions
      if (!authService.hasPermission(['admin', 'super_admin'])) {
        throw new Error('Acesso negado. Apenas administradores podem criar usuários.');
      }

      const { userData: currentUser } = authService.getCurrentUser();
      
      // Validações básicas
      if (!userData.name?.trim()) {
        throw new Error('Nome é obrigatório');
      }

      if (!userData.email?.trim()) {
        throw new Error('Email é obrigatório');
      }

      if (!userData.password || userData.password.length < 6) {
        throw new Error('Senha deve ter pelo menos 6 caracteres');
      }

      if (!userData.clinicId) {
        throw new Error('Clínica é obrigatória');
      }

      // Admin comum só pode criar usuários para sua clínica
      if (currentUser.role === USER_ROLES.ADMIN && userData.clinicId !== currentUser.clinicId) {
        throw new Error('Você só pode criar usuários para sua clínica.');
      }

      // Super admin pode criar para qualquer clínica, mas deve validar se a clínica existe
      if (currentUser.role === USER_ROLES.SUPER_ADMIN) {
        const clinicExists = await this.validateClinicExists(userData.clinicId);
        if (!clinicExists) {
          throw new Error('Clínica selecionada não existe ou está inativa.');
        }
      }

      // Verificar se o email já está em uso
      const emailExists = await this.checkEmailExists(userData.email);
      if (emailExists) {
        throw new Error('Este email já está sendo usado por outro usuário.');
      }

      console.log('✅ Validações passaram, criando usuário no Firebase Auth...');

      // Create user in Firebase Auth
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

      console.log('✅ Usuário criado no Auth, criando documento no Firestore...');

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
        createdBy: currentUser.id,
        lastLogin: null,
        needsPasswordChange: userData.needsPasswordChange || false
      };

      await setDoc(doc(db, this.collectionName, user.uid), userDoc);

      console.log('✅ Usuário criado com sucesso:', userData.name);

      return { id: user.uid, ...userDoc };
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      
      // Se o erro foi no Firestore mas o usuário foi criado no Auth, tentar limpar
      if (error.message.includes('Firestore') && auth.currentUser) {
        try {
          await deleteAuthUser(auth.currentUser);
          console.log('🧹 Usuário removido do Auth devido a erro no Firestore');
        } catch (cleanupError) {
          console.error('❌ Erro ao limpar usuário do Auth:', cleanupError);
        }
      }
      
      throw error;
    }
  }

  // Validate if clinic exists and is active
  async validateClinicExists(clinicId) {
    try {
      const clinicDoc = await getDoc(doc(db, 'clinics', clinicId));
      return clinicDoc.exists() && clinicDoc.data()?.isActive === true;
    } catch (error) {
      console.error('Erro ao validar clínica:', error);
      return false;
    }
  }

  // Check if email already exists
  async checkEmailExists(email) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('email', '==', email.toLowerCase())
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      return false;
    }
  }

  // Get user by ID with clinic access validation
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

      console.log('🔍 Buscando todos os usuários...');

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
      
      console.log('✅ Usuários encontrados:', users.length);
      return users;
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  }

  // Get users by clinic with proper access control
  async getUsersByClinic(clinicId) {
    try {
      if (!authService.canAccessClinic(clinicId)) {
        throw new Error('Acesso negado a esta clínica.');
      }

      console.log('🔍 Buscando usuários da clínica:', clinicId);

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
      
      console.log('✅ Usuários da clínica encontrados:', users.length);
      return users;
    } catch (error) {
      console.error('Get users by clinic error:', error);
      throw error;
    }
  }

  // Update user with clinic validation
  async updateUser(userId, updateData) {
    try {
      console.log('🔄 Atualizando usuário:', userId);

      const user = await this.getUserById(userId);
      
      // Check permissions
      if (!this.canAccessUser(user)) {
        throw new Error('Acesso negado a este usuário.');
      }

      // Validações
      if (updateData.name !== undefined && !updateData.name?.trim()) {
        throw new Error('Nome é obrigatório');
      }

      if (updateData.email !== undefined) {
        if (!updateData.email?.trim()) {
          throw new Error('Email é obrigatório');
        }
        
        // Verificar se o email já está em uso por outro usuário
        if (updateData.email !== user.email) {
          const emailExists = await this.checkEmailExists(updateData.email);
          if (emailExists) {
            throw new Error('Este email já está sendo usado por outro usuário.');
          }
        }
      }

      // Validar mudança de clínica
      if (updateData.clinicId && updateData.clinicId !== user.clinicId) {
        const { userData: currentUser } = authService.getCurrentUser();
        
        // Admin comum não pode mover usuários entre clínicas
        if (currentUser.role === USER_ROLES.ADMIN) {
          throw new Error('Você não pode mover usuários entre clínicas.');
        }
        
        // Super admin pode, mas deve validar se a clínica existe
        if (currentUser.role === USER_ROLES.SUPER_ADMIN) {
          const clinicExists = await this.validateClinicExists(updateData.clinicId);
          if (!clinicExists) {
            throw new Error('Clínica de destino não existe ou está inativa.');
          }
        }
      }

      const docRef = doc(db, this.collectionName, userId);
      const updatedData = {
        ...updateData,
        updatedAt: serverTimestamp()
      };

      // Remove password from Firestore update (handled separately)
      if (updatedData.password) {
        delete updatedData.password;
      }

      // Remove campos undefined/null
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] === undefined || updatedData[key] === null) {
          delete updatedData[key];
        }
      });
      
      await updateDoc(docRef, updatedData);
      
      console.log('✅ Usuário atualizado com sucesso');
      return await this.getUserById(userId);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  // Deactivate user (soft delete)
  async deactivateUser(userId) {
    try {
      console.log('🔄 Desativando usuário:', userId);

      const user = await this.getUserById(userId);
      
      if (!this.canAccessUser(user)) {
        throw new Error('Acesso negado a este usuário.');
      }

      // Não permitir desativar o próprio usuário
      const { userData: currentUser } = authService.getCurrentUser();
      if (userId === currentUser.id) {
        throw new Error('Você não pode desativar sua própria conta.');
      }

      const docRef = doc(db, this.collectionName, userId);
      await updateDoc(docRef, {
        isActive: false,
        deactivatedAt: serverTimestamp(),
        deactivatedBy: currentUser.id,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Usuário desativado com sucesso');
      return true;
    } catch (error) {
      console.error('Deactivate user error:', error);
      throw error;
    }
  }

  // Activate user
  async activateUser(userId) {
    try {
      console.log('🔄 Ativando usuário:', userId);

      const user = await this.getUserById(userId);
      
      if (!this.canAccessUser(user)) {
        throw new Error('Acesso negado a este usuário.');
      }

      const { userData: currentUser } = authService.getCurrentUser();

      const docRef = doc(db, this.collectionName, userId);
      await updateDoc(docRef, {
        isActive: true,
        activatedAt: serverTimestamp(),
        activatedBy: currentUser.id,
        deactivatedAt: null,
        deactivatedBy: null,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Usuário ativado com sucesso');
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

      console.log('🗑️ Excluindo usuário permanentemente:', userId);

      // Não permitir excluir o próprio usuário
      const { userData: currentUser } = authService.getCurrentUser();
      if (userId === currentUser.id) {
        throw new Error('Você não pode excluir sua própria conta.');
      }

      const user = await this.getUserById(userId);
      
      // Delete from Firestore
      const docRef = doc(db, this.collectionName, userId);
      await deleteDoc(docRef);
      
      console.log('✅ Usuário excluído do Firestore');
      
      // Note: Deleting from Firebase Auth would require admin SDK in production
      // For now, we just log this action
      console.log('ℹ️ Exclusão do Firebase Auth deve ser feita via Admin SDK');
      
      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  // Search users with proper filtering
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
      
      if (!searchTerm?.trim()) return users;

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

  // Get user statistics with clinic breakdown
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
        byClinic: {},
        recentlyCreated: users
          .filter(u => u.createdAt)
          .sort((a, b) => {
            const aTime = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
            const bTime = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            return bTime - aTime;
          })
          .slice(0, 5)
      };

      // Group by clinic for super admin
      if (authService.hasPermission('super_admin')) {
        users.forEach(user => {
          if (!stats.byClinic[user.clinicId]) {
            stats.byClinic[user.clinicId] = 0;
          }
          stats.byClinic[user.clinicId]++;
        });
      }
      
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

  // Get users count by clinic (for clinic management)
  async getUsersCountByClinic(clinicId) {
    try {
      if (!authService.canAccessClinic(clinicId)) {
        throw new Error('Acesso negado a esta clínica.');
      }

      const users = await this.getUsersByClinic(clinicId);
      
      return {
        total: users.length,
        active: users.filter(u => u.isActive).length,
        inactive: users.filter(u => !u.isActive).length,
        admins: users.filter(u => u.role === USER_ROLES.ADMIN).length,
        regularUsers: users.filter(u => u.role === USER_ROLES.USER).length
      };
    } catch (error) {
      console.error('Get users count error:', error);
      throw error;
    }
  }

  // Update user last login (called by auth service)
  async updateLastLogin(userId) {
    try {
      const docRef = doc(db, this.collectionName, userId);
      await updateDoc(docRef, {
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Último login atualizado para:', userId);
    } catch (error) {
      console.error('Update last login error:', error);
      // Don't throw here, as this is called during login process
    }
  }

  // Bulk operations for admin
  async bulkUpdateUserStatus(userIds, isActive) {
    try {
      if (!authService.hasPermission(['admin', 'super_admin'])) {
        throw new Error('Acesso negado.');
      }

      console.log(`🔄 Atualização em lote - ${isActive ? 'ativando' : 'desativando'} ${userIds.length} usuários`);

      const { userData: currentUser } = authService.getCurrentUser();
      const updates = [];

      for (const userId of userIds) {
        // Não permitir alterar próprio status
        if (userId === currentUser.id) {
          continue;
        }

        const user = await this.getUserById(userId);
        if (this.canAccessUser(user)) {
          const docRef = doc(db, this.collectionName, userId);
          updates.push(
            updateDoc(docRef, {
              isActive,
              updatedAt: serverTimestamp(),
              [isActive ? 'activatedBy' : 'deactivatedBy']: currentUser.id,
              [isActive ? 'activatedAt' : 'deactivatedAt']: serverTimestamp()
            })
          );
        }
      }

      await Promise.all(updates);
      
      console.log('✅ Atualização em lote concluída');
      return updates.length;
    } catch (error) {
      console.error('Bulk update error:', error);
      throw error;
    }
  }
}

export default new UserService();
