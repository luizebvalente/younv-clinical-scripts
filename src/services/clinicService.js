import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import authService from './authService';

class ClinicService {
  constructor() {
    this.collectionName = 'clinics';
  }

  // Create new clinic
  async createClinic(clinicData) {
    try {
      // Check if user has permission (only super admin)
      if (!authService.hasPermission('super_admin')) {
        throw new Error('Acesso negado. Apenas super administradores podem criar clínicas.');
      }

      const clinic = {
        ...clinicData,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.collectionName), clinic);
      
      return {
        id: docRef.id,
        ...clinic
      };
    } catch (error) {
      console.error('Create clinic error:', error);
      throw error;
    }
  }

  // Get clinic by ID
  async getClinicById(clinicId) {
    try {
      // Check if user can access this clinic
      if (!authService.canAccessClinic(clinicId)) {
        throw new Error('Acesso negado a esta clínica.');
      }

      const docRef = doc(db, this.collectionName, clinicId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error('Clínica não encontrada');
      }
    } catch (error) {
      console.error('Get clinic error:', error);
      throw error;
    }
  }

  // Get all clinics (only for super admin)
  async getAllClinics() {
    try {
      if (!authService.hasPermission('super_admin')) {
        throw new Error('Acesso negado. Apenas super administradores podem listar todas as clínicas.');
      }

      const q = query(
        collection(db, this.collectionName),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(q);
      const clinics = [];
      
      querySnapshot.forEach((doc) => {
        clinics.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return clinics;
    } catch (error) {
      console.error('Get all clinics error:', error);
      throw error;
    }
  }

  // Get active clinics
  async getActiveClinics() {
    try {
      if (!authService.hasPermission('super_admin')) {
        throw new Error('Acesso negado.');
      }

      const q = query(
        collection(db, this.collectionName),
        where('isActive', '==', true),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(q);
      const clinics = [];
      
      querySnapshot.forEach((doc) => {
        clinics.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return clinics;
    } catch (error) {
      console.error('Get active clinics error:', error);
      throw error;
    }
  }

  // Update clinic
  async updateClinic(clinicId, updateData) {
    try {
      // Check permissions
      if (!authService.canAccessClinic(clinicId)) {
        throw new Error('Acesso negado a esta clínica.');
      }

      const docRef = doc(db, this.collectionName, clinicId);
      const updatedData = {
        ...updateData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(docRef, updatedData);
      
      // Return updated clinic
      return await this.getClinicById(clinicId);
    } catch (error) {
      console.error('Update clinic error:', error);
      throw error;
    }
  }

  // Deactivate clinic (soft delete)
  async deactivateClinic(clinicId) {
    try {
      if (!authService.hasPermission('super_admin')) {
        throw new Error('Acesso negado. Apenas super administradores podem desativar clínicas.');
      }

      const docRef = doc(db, this.collectionName, clinicId);
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Deactivate clinic error:', error);
      throw error;
    }
  }

  // Activate clinic
  async activateClinic(clinicId) {
    try {
      if (!authService.hasPermission('super_admin')) {
        throw new Error('Acesso negado. Apenas super administradores podem ativar clínicas.');
      }

      const docRef = doc(db, this.collectionName, clinicId);
      await updateDoc(docRef, {
        isActive: true,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Activate clinic error:', error);
      throw error;
    }
  }

  // Delete clinic permanently (only super admin)
  async deleteClinic(clinicId) {
    try {
      if (!authService.hasPermission('super_admin')) {
        throw new Error('Acesso negado. Apenas super administradores podem excluir clínicas.');
      }

      const docRef = doc(db, this.collectionName, clinicId);
      await deleteDoc(docRef);
      
      return true;
    } catch (error) {
      console.error('Delete clinic error:', error);
      throw error;
    }
  }

  // Get clinic statistics
  async getClinicStats(clinicId) {
    try {
      if (!authService.canAccessClinic(clinicId)) {
        throw new Error('Acesso negado a esta clínica.');
      }

      // This would typically involve querying related collections
      // For now, return basic structure
      return {
        totalUsers: 0,
        totalScripts: 0,
        totalCategories: 0,
        lastActivity: null
      };
    } catch (error) {
      console.error('Get clinic stats error:', error);
      throw error;
    }
  }

  // Search clinics by name (super admin only)
  async searchClinics(searchTerm) {
    try {
      if (!authService.hasPermission('super_admin')) {
        throw new Error('Acesso negado.');
      }

      // Firestore doesn't support full-text search natively
      // This is a simple implementation that gets all clinics and filters
      const allClinics = await this.getAllClinics();
      
      if (!searchTerm) return allClinics;
      
      const filtered = allClinics.filter(clinic => 
        clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (clinic.email && clinic.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      return filtered;
    } catch (error) {
      console.error('Search clinics error:', error);
      throw error;
    }
  }
}

export default new ClinicService();

