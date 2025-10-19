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

class CategoryService {
  constructor() {
    this.collectionName = 'categories';
  }

  // Create new category
  async createCategory(categoryData) {
    try {
      const { userData } = authService.getCurrentUser();
      
      if (!userData) {
        throw new Error('Usuário não autenticado');
      }

      if (!authService.hasPermission(['admin', 'super_admin'])) {
        throw new Error('Acesso negado. Apenas administradores podem criar categorias.');
      }

      // Validações
      if (!categoryData.name?.trim()) {
        throw new Error('Nome da categoria é obrigatório');
      }

      if (!categoryData.clinicId) {
        throw new Error('Clínica é obrigatória');
      }

      // Check if user can create categories for this clinic
      if (!authService.canAccessClinic(categoryData.clinicId)) {
        throw new Error('Acesso negado a esta clínica.');
      }

      console.log('📝 Criando categoria:', categoryData.name);

      // Generate a unique ID based on name
      const categoryId = categoryData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const category = {
        id: `${categoryId}-${Date.now()}`,
        name: categoryData.name.trim(),
        description: categoryData.description?.trim() || '',
        icon: categoryData.icon || 'file-text',
        color: categoryData.color || '#3B82F6',
        clinicId: categoryData.clinicId,
        isCustom: true, // Marca como categoria customizada
        isActive: true,
        order: categoryData.order || 999,
        createdBy: userData.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.collectionName), category);
      
      console.log('✅ Categoria criada com sucesso:', docRef.id);
      
      return {
        firestoreId: docRef.id,
        ...category
      };
    } catch (error) {
      console.error('❌ Erro ao criar categoria:', error);
      throw error;
    }
  }

  // Get category by ID
  async getCategoryById(categoryId) {
    try {
      const docRef = doc(db, this.collectionName, categoryId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const category = {
          firestoreId: docSnap.id,
          ...docSnap.data()
        };

        // Check if user can access this category
        if (category.clinicId && !authService.canAccessClinic(category.clinicId)) {
          throw new Error('Acesso negado a esta categoria.');
        }

        return category;
      } else {
        throw new Error('Categoria não encontrada');
      }
    } catch (error) {
      console.error('Get category error:', error);
      throw error;
    }
  }

  // Get categories by clinic (includes default + custom)
  async getCategoriesByClinic(clinicId) {
    try {
      if (!clinicId) {
        throw new Error('ID da clínica é obrigatório');
      }

      if (!authService.canAccessClinic(clinicId)) {
        throw new Error('Acesso negado a esta clínica.');
      }

      console.log('🔍 Buscando categorias da clínica:', clinicId);

      // Buscar categorias customizadas da clínica
      const q = query(
        collection(db, this.collectionName),
        where('clinicId', '==', clinicId),
        where('isActive', '==', true),
        orderBy('order'),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(q);
      const customCategories = [];
      
      querySnapshot.forEach((doc) => {
        customCategories.push({
          firestoreId: doc.id,
          ...doc.data()
        });
      });
      
      console.log('✅ Categorias customizadas encontradas:', customCategories.length);
      
      return customCategories;
    } catch (error) {
      console.error('Get categories by clinic error:', error);
      throw error;
    }
  }

  // Get all categories (default + custom for user's clinic)
  async getAllCategoriesForUser() {
    try {
      const { userData } = authService.getCurrentUser();
      
      if (!userData) {
        throw new Error('Usuário não autenticado');
      }

      console.log('🔍 Buscando todas as categorias para o usuário');

      // Importar categorias padrão
      const { DEFAULT_CATEGORIES } = await import('../types');
      
      // Buscar categorias customizadas da clínica do usuário
      let customCategories = [];
      if (userData.clinicId) {
        customCategories = await this.getCategoriesByClinic(userData.clinicId);
      }

      // Combinar categorias padrão com customizadas
      const allCategories = [
        ...DEFAULT_CATEGORIES.map(cat => ({ ...cat, isCustom: false })),
        ...customCategories
      ].sort((a, b) => (a.order || 999) - (b.order || 999));

      console.log('✅ Total de categorias:', allCategories.length);
      
      return allCategories;
    } catch (error) {
      console.error('Get all categories error:', error);
      throw error;
    }
  }

  // Update category
  async updateCategory(categoryId, updateData) {
    try {
      if (!authService.hasPermission(['admin', 'super_admin'])) {
        throw new Error('Acesso negado. Apenas administradores podem editar categorias.');
      }

      console.log('✏️ Atualizando categoria:', categoryId);

      const category = await this.getCategoryById(categoryId);
      
      // Não permitir editar categorias padrão (sem clinicId)
      if (!category.clinicId || !category.isCustom) {
        throw new Error('Não é possível editar categorias padrão do sistema.');
      }

      // Check permissions
      if (!authService.canAccessClinic(category.clinicId)) {
        throw new Error('Acesso negado a esta categoria.');
      }

      // Validações
      if (updateData.name !== undefined && !updateData.name?.trim()) {
        throw new Error('Nome da categoria é obrigatório');
      }

      const docRef = doc(db, this.collectionName, categoryId);
      const updatedData = {
        ...updateData,
        updatedAt: serverTimestamp()
      };

      // Remove campos undefined/null
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] === undefined || updatedData[key] === null) {
          delete updatedData[key];
        }
      });
      
      await updateDoc(docRef, updatedData);
      
      console.log('✅ Categoria atualizada com sucesso');
      return await this.getCategoryById(categoryId);
    } catch (error) {
      console.error('Update category error:', error);
      throw error;
    }
  }

  // Delete category (soft delete)
  async deleteCategory(categoryId) {
    try {
      if (!authService.hasPermission(['admin', 'super_admin'])) {
        throw new Error('Acesso negado. Apenas administradores podem excluir categorias.');
      }

      console.log('🗑️ Excluindo categoria:', categoryId);

      const category = await this.getCategoryById(categoryId);
      
      // Não permitir excluir categorias padrão
      if (!category.clinicId || !category.isCustom) {
        throw new Error('Não é possível excluir categorias padrão do sistema.');
      }

      // Check permissions
      if (!authService.canAccessClinic(category.clinicId)) {
        throw new Error('Acesso negado a esta categoria.');
      }

      // Verificar se existem scripts usando esta categoria
      const { default: scriptService } = await import('./scriptService');
      const scripts = await scriptService.getScriptsByCategory(category.id, category.clinicId);
      
      if (scripts.length > 0) {
        throw new Error(`Não é possível excluir esta categoria pois existem ${scripts.length} script(s) associados a ela. Mova ou exclua os scripts primeiro.`);
      }

      const docRef = doc(db, this.collectionName, categoryId);
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Categoria excluída com sucesso');
      return true;
    } catch (error) {
      console.error('Delete category error:', error);
      throw error;
    }
  }

  // Get category statistics
  async getCategoryStats(clinicId) {
    try {
      if (!authService.canAccessClinic(clinicId)) {
        throw new Error('Acesso negado a esta clínica.');
      }

      console.log('📊 Buscando estatísticas de categorias:', clinicId);

      const categories = await this.getCategoriesByClinic(clinicId);
      const { default: scriptService } = await import('./scriptService');
      
      const stats = {
        total: categories.length,
        custom: categories.filter(c => c.isCustom).length,
        default: categories.filter(c => !c.isCustom).length,
        byCategory: {}
      };

      // Contar scripts por categoria
      for (const category of categories) {
        const scripts = await scriptService.getScriptsByCategory(category.id, clinicId);
        stats.byCategory[category.id] = {
          name: category.name,
          scriptsCount: scripts.length
        };
      }

      console.log('✅ Estatísticas calculadas:', stats);
      return stats;
    } catch (error) {
      console.error('Get category stats error:', error);
      throw error;
    }
  }

  // Reorder categories
  async reorderCategories(categoryIds) {
    try {
      if (!authService.hasPermission(['admin', 'super_admin'])) {
        throw new Error('Acesso negado. Apenas administradores podem reordenar categorias.');
      }

      console.log('🔄 Reordenando categorias:', categoryIds);

      const updates = categoryIds.map((categoryId, index) => {
        const docRef = doc(db, this.collectionName, categoryId);
        return updateDoc(docRef, {
          order: index,
          updatedAt: serverTimestamp()
        });
      });

      await Promise.all(updates);
      
      console.log('✅ Categorias reordenadas com sucesso');
      return true;
    } catch (error) {
      console.error('Reorder categories error:', error);
      throw error;
    }
  }
}

export default new CategoryService();
