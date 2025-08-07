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

      if (!authService.hasPermission(['admin', 'super_admin'])) {
        throw new Error('Acesso negado. Apenas administradores podem criar scripts.');
      }

      // Validações básicas
      if (!scriptData.title?.trim()) {
        throw new Error('Título do script é obrigatório');
      }

      if (!scriptData.content?.trim()) {
        throw new Error('Conteúdo do script é obrigatório');
      }

      if (!scriptData.categoryId) {
        throw new Error('Categoria é obrigatória');
      }

      if (!scriptData.clinicId) {
        throw new Error('Clínica é obrigatória');
      }

      // Check if user can create scripts for this clinic
      if (!authService.canAccessClinic(scriptData.clinicId)) {
        throw new Error('Acesso negado a esta clínica.');
      }

      console.log('📝 Criando script:', scriptData.title);

      const script = {
        title: scriptData.title.trim(),
        content: scriptData.content.trim(),
        categoryId: scriptData.categoryId,
        clinicId: scriptData.clinicId,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        tags: scriptData.tags || [],
        steps: scriptData.steps || [],
        isTemplate: scriptData.isTemplate || false,
        usage: {
          totalViews: 0,
          totalUses: 0,
          lastUsed: null
        }
      };

      const docRef = await addDoc(collection(db, this.collectionName), script);
      
      console.log('✅ Script criado com sucesso:', docRef.id);
      
      return {
        id: docRef.id,
        ...script
      };
    } catch (error) {
      console.error('❌ Erro ao criar script:', error);
      throw error;
    }
  }

  // Get script by ID
  async getScriptById(scriptId) {
    try {
      if (!scriptId) {
        throw new Error('ID do script é obrigatório');
      }

      console.log('🔍 Buscando script:', scriptId);

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

        console.log('✅ Script encontrado:', script.title);
        return script;
      } else {
        throw new Error('Script não encontrado');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar script:', error);
      throw error;
    }
  }

  // Get scripts by clinic
  async getScriptsByClinic(clinicId, options = {}) {
    try {
      if (!clinicId) {
        throw new Error('ID da clínica é obrigatório');
      }

      if (!authService.canAccessClinic(clinicId)) {
        throw new Error('Acesso negado a esta clínica.');
      }

      console.log('🔍 Buscando scripts da clínica:', clinicId);

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
      
      console.log('✅ Scripts encontrados:', scripts.length);
      
      return {
        scripts,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
        hasMore: querySnapshot.docs.length === limitCount
      };
    } catch (error) {
      console.error('❌ Erro ao buscar scripts da clínica:', error);
      throw error;
    }
  }

  // Get scripts by category
  async getScriptsByCategory(categoryId, clinicId) {
    try {
      if (!categoryId) {
        throw new Error('ID da categoria é obrigatório');
      }

      if (!clinicId) {
        throw new Error('ID da clínica é obrigatório');
      }

      console.log('🔍 Buscando scripts por categoria:', { categoryId, clinicId });
      
      if (!authService.canAccessClinic(clinicId)) {
        console.log('❌ Acesso negado à clínica:', clinicId);
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
      
      console.log('✅ Scripts por categoria encontrados:', scripts.length);
      return scripts;
    } catch (error) {
      console.error('❌ Erro ao buscar scripts por categoria:', error);
      throw error;
    }
  }

  // Search scripts
  async searchScripts(searchTerm, clinicId, options = {}) {
    try {
      if (!clinicId) {
        throw new Error('ID da clínica é obrigatório');
      }

      if (!authService.canAccessClinic(clinicId)) {
        throw new Error('Acesso negado a esta clínica.');
      }

      console.log('🔍 Pesquisando scripts:', searchTerm);

      // Get all scripts for the clinic (Firestore doesn't support full-text search natively)
      const { scripts } = await this.getScriptsByClinic(clinicId, { limitCount: 1000 });
      
      if (!searchTerm?.trim()) {
        return scripts;
      }

      const searchLower = searchTerm.toLowerCase().trim();
      const filtered = scripts.filter(script => {
        return (
          script.title.toLowerCase().includes(searchLower) ||
          script.content.toLowerCase().includes(searchLower) ||
          (script.tags && script.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        );
      });
      
      console.log('✅ Scripts encontrados na pesquisa:', filtered.length);
      return filtered;
    } catch (error) {
      console.error('❌ Erro na pesquisa de scripts:', error);
      throw error;
    }
  }

  // Update script
  async updateScript(scriptId, updateData) {
    try {
      if (!scriptId) {
        throw new Error('ID do script é obrigatório');
      }

      if (!authService.hasPermission(['admin', 'super_admin'])) {
        throw new Error('Acesso negado. Apenas administradores podem editar scripts.');
      }

      console.log('✏️ Atualizando script:', scriptId);

      const script = await this.getScriptById(scriptId);
      
      // Check if user can edit this script
      if (!authService.canAccessClinic(script.clinicId)) {
        throw new Error('Acesso negado a este script.');
      }

      // Validações
      if (updateData.title !== undefined && !updateData.title?.trim()) {
        throw new Error('Título do script é obrigatório');
      }

      if (updateData.content !== undefined && !updateData.content?.trim()) {
        throw new Error('Conteúdo do script é obrigatório');
      }

      const docRef = doc(db, this.collectionName, scriptId);
      const updatedData = {
        ...updateData,
        updatedAt: serverTimestamp()
      };

      // Limpar campos vazios
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] === undefined || updatedData[key] === null) {
          delete updatedData[key];
        }
      });
      
      await updateDoc(docRef, updatedData);
      
      console.log('✅ Script atualizado com sucesso');
      return await this.getScriptById(scriptId);
    } catch (error) {
      console.error('❌ Erro ao atualizar script:', error);
      throw error;
    }
  }

  // Delete script (soft delete)
  async deleteScript(scriptId) {
    try {
      if (!scriptId) {
        throw new Error('ID do script é obrigatório');
      }

      if (!authService.hasPermission(['admin', 'super_admin'])) {
        throw new Error('Acesso negado. Apenas administradores podem excluir scripts.');
      }

      console.log('🗑️ Excluindo script:', scriptId);

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
      
      console.log('✅ Script excluído com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao excluir script:', error);
      throw error;
    }
  }

  // Duplicate script within same clinic
  async duplicateScript(scriptId) {
    try {
      if (!scriptId) {
        throw new Error('ID do script é obrigatório');
      }

      if (!authService.hasPermission(['admin', 'super_admin'])) {
        throw new Error('Acesso negado. Apenas administradores podem duplicar scripts.');
      }

      console.log('📋 Duplicando script:', scriptId);

      const originalScript = await this.getScriptById(scriptId);
      
      const duplicatedScript = {
        title: `${originalScript.title} (Cópia)`,
        content: originalScript.content,
        categoryId: originalScript.categoryId,
        clinicId: originalScript.clinicId,
        tags: originalScript.tags || [],
        steps: originalScript.steps || [],
        isTemplate: false
      };

      const newScript = await this.createScript(duplicatedScript);
      console.log('✅ Script duplicado com sucesso');
      return newScript;
    } catch (error) {
      console.error('❌ Erro ao duplicar script:', error);
      throw error;
    }
  }

  // Get script statistics
  async getScriptStats(clinicId) {
    try {
      if (!clinicId) {
        throw new Error('ID da clínica é obrigatório');
      }

      if (!authService.canAccessClinic(clinicId)) {
        throw new Error('Acesso negado a esta clínica.');
      }

      console.log('📊 Buscando estatísticas de scripts:', clinicId);

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
        if (script.tags) {
          script.tags.forEach(tag => stats.totalTags.add(tag));
        }
      });

      stats.totalTags = stats.totalTags.size;
      
      console.log('✅ Estatísticas calculadas:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
      throw error;
    }
  }
}

export default new ScriptService();

