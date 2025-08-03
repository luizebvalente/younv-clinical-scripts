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
  serverTimestamp,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import authService from './authService';

class ScriptService {
  constructor() {
    this.collectionName = 'scripts';
  }

  // Create new script
  async createScript(scriptData) {
    try {
      const { user, userData } = authService.getCurrentUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Check if user can create scripts for this clinic
      if (!authService.canAccessClinic(scriptData.clinicId)) {
        throw new Error('Acesso negado a esta clínica.');
      }

      const script = {
        ...scriptData,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        tags: scriptData.tags || [],
        steps: scriptData.steps || [],
        isTemplate: scriptData.isTemplate || false
      };

      const docRef = await addDoc(collection(db, this.collectionName), script);
      
      return {
        id: docRef.id,
        ...script
      };
    } catch (error) {
      console.error('Create script error:', error);
      throw error;
    }
  }

  // Get script by ID
  async getScriptById(scriptId) {
    try {
      const docRef = doc(db, this.collectionName, scriptId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const script = {
          id: docSnap.id,
          ...docSnap.data()
        };

        // Check if user can access this script
        if (!authService.canAccessClinic(script.clinicId)) {
          throw new Error('Acesso negado a este script.');
        }

        return script;
      } else {
        throw new Error('Script não encontrado');
      }
    } catch (error) {
      console.error('Get script error:', error);
      throw error;
    }
  }

  // Get scripts by clinic
  async getScriptsByClinic(clinicId, options = {}) {
    try {
      if (!authService.canAccessClinic(clinicId)) {
        throw new Error('Acesso negado a esta clínica.');
      }

      const { categoryId, isActive = true, limitCount = 50, lastDoc } = options;

      let q = query(
        collection(db, this.collectionName),
        where('clinicId', '==', clinicId),
        where('isActive', '==', isActive)
      );

      // Add category filter if specified
      if (categoryId) {
        q = query(q, where('categoryId', '==', categoryId));
      }

      // Add ordering and pagination
      q = query(q, orderBy('updatedAt', 'desc'), limit(limitCount));

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const scripts = [];
      
      querySnapshot.forEach((doc) => {
        scripts.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        scripts,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
        hasMore: querySnapshot.docs.length === limitCount
      };
    } catch (error) {
      console.error('Get scripts by clinic error:', error);
      throw error;
    }
  }

  // Get scripts by category
  async getScriptsByCategory(categoryId, clinicId) {
    try {
      if (!authService.canAccessClinic(clinicId)) {
        throw new Error('Acesso negado a esta clínica.');
      }

      const q = query(
        collection(db, this.collectionName),
        where('categoryId', '==', categoryId),
        where('clinicId', '==', clinicId),
        where('isActive', '==', true),
        orderBy('title')
      );
      
      const querySnapshot = await getDocs(q);
      const scripts = [];
      
      querySnapshot.forEach((doc) => {
        scripts.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return scripts;
    } catch (error) {
      console.error('Get scripts by category error:', error);
      throw error;
    }
  }

  // Search scripts
  async searchScripts(searchTerm, clinicId, options = {}) {
    try {
      if (!authService.canAccessClinic(clinicId)) {
        throw new Error('Acesso negado a esta clínica.');
      }

      // Get all scripts for the clinic (Firestore doesn't support full-text search natively)
      const { scripts } = await this.getScriptsByClinic(clinicId, { limitCount: 1000 });
      
      if (!searchTerm) return scripts;

      const searchLower = searchTerm.toLowerCase();
      const filtered = scripts.filter(script => {
        return (
          script.title.toLowerCase().includes(searchLower) ||
          script.content.toLowerCase().includes(searchLower) ||
          script.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      });
      
      return filtered;
    } catch (error) {
      console.error('Search scripts error:', error);
      throw error;
    }
  }

  // Update script
  async updateScript(scriptId, updateData) {
    try {
      const script = await this.getScriptById(scriptId);
      
      // Check if user can edit this script
      if (!authService.canAccessClinic(script.clinicId)) {
        throw new Error('Acesso negado a este script.');
      }

      const docRef = doc(db, this.collectionName, scriptId);
      const updatedData = {
        ...updateData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(docRef, updatedData);
      
      return await this.getScriptById(scriptId);
    } catch (error) {
      console.error('Update script error:', error);
      throw error;
    }
  }

  // Delete script (soft delete)
  async deleteScript(scriptId) {
    try {
      const script = await this.getScriptById(scriptId);
      
      // Check permissions
      if (!authService.canAccessClinic(script.clinicId)) {
        throw new Error('Acesso negado a este script.');
      }

      const docRef = doc(db, this.collectionName, scriptId);
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Delete script error:', error);
      throw error;
    }
  }

  // Clone script to another clinic (super admin only)
  async cloneScript(scriptId, targetClinicId) {
    try {
      if (!authService.hasPermission('super_admin')) {
        throw new Error('Acesso negado. Apenas super administradores podem clonar scripts.');
      }

      const originalScript = await this.getScriptById(scriptId);
      
      // Create new script with updated clinic ID
      const clonedScript = {
        ...originalScript,
        clinicId: targetClinicId,
        title: `${originalScript.title} (Cópia)`,
        isTemplate: false
      };

      // Remove the ID to create a new document
      delete clonedScript.id;
      delete clonedScript.createdAt;
      delete clonedScript.updatedAt;

      return await this.createScript(clonedScript);
    } catch (error) {
      console.error('Clone script error:', error);
      throw error;
    }
  }

  // Get template scripts (for cloning)
  async getTemplateScripts() {
    try {
      if (!authService.hasPermission('super_admin')) {
        throw new Error('Acesso negado.');
      }

      const q = query(
        collection(db, this.collectionName),
        where('isTemplate', '==', true),
        where('isActive', '==', true),
        orderBy('title')
      );
      
      const querySnapshot = await getDocs(q);
      const templates = [];
      
      querySnapshot.forEach((doc) => {
        templates.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return templates;
    } catch (error) {
      console.error('Get template scripts error:', error);
      throw error;
    }
  }

  // Mark script as template
  async markAsTemplate(scriptId) {
    try {
      if (!authService.hasPermission('super_admin')) {
        throw new Error('Acesso negado.');
      }

      const docRef = doc(db, this.collectionName, scriptId);
      await updateDoc(docRef, {
        isTemplate: true,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Mark as template error:', error);
      throw error;
    }
  }

  // Get script statistics
  async getScriptStats(clinicId) {
    try {
      if (!authService.canAccessClinic(clinicId)) {
        throw new Error('Acesso negado a esta clínica.');
      }

      const { scripts } = await this.getScriptsByClinic(clinicId, { limitCount: 1000 });
      
      const stats = {
        total: scripts.length,
        byCategory: {},
        recentlyUpdated: scripts.slice(0, 5),
        totalTags: new Set()
      };

      scripts.forEach(script => {
        // Count by category
        if (!stats.byCategory[script.categoryId]) {
          stats.byCategory[script.categoryId] = 0;
        }
        stats.byCategory[script.categoryId]++;

        // Collect unique tags
        script.tags.forEach(tag => stats.totalTags.add(tag));
      });

      stats.totalTags = stats.totalTags.size;
      
      return stats;
    } catch (error) {
      console.error('Get script stats error:', error);
      throw error;
    }
  }

  // Duplicate script within same clinic
  async duplicateScript(scriptId) {
    try {
      const originalScript = await this.getScriptById(scriptId);
      
      const duplicatedScript = {
        ...originalScript,
        title: `${originalScript.title} (Cópia)`,
        isTemplate: false
      };

      // Remove fields that should be regenerated
      delete duplicatedScript.id;
      delete duplicatedScript.createdAt;
      delete duplicatedScript.updatedAt;

      return await this.createScript(duplicatedScript);
    } catch (error) {
      console.error('Duplicate script error:', error);
      throw error;
    }
  }
}

export default new ScriptService();

