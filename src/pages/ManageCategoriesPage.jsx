import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import categoryService from '../services/categoryService';
import { 
  Plus, 
  Edit, 
  Trash2, 
  FolderPlus,
  AlertCircle,
  CheckCircle,
  X,
  Save,
  Palette
} from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../types';

const ManageCategoriesPage = () => {
  const { userData, hasPermission } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [toast, setToast] = useState(null);

  // Check permissions
  if (!hasPermission(['admin', 'super_admin'])) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">
          <FolderPlus className="w-16 h-16 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Acesso Negado
        </h1>
        <p className="text-gray-600">
          Apenas administradores podem gerenciar categorias.
        </p>
      </div>
    );
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allCategories = await categoryService.getAllCategoriesForUser();
      setCategories(allCategories);
      
      console.log('✅ Categorias carregadas:', allCategories.length);
    } catch (err) {
      console.error('❌ Erro ao carregar categorias:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    if (!category.isCustom) {
      showToast('error', 'Não é possível editar categorias padrão do sistema');
      return;
    }
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDeleteCategory = async (category) => {
    if (!category.isCustom) {
      showToast('error', 'Não é possível excluir categorias padrão do sistema');
      return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
      return;
    }

    try {
      await categoryService.deleteCategory(category.firestoreId);
      showToast('success', `Categoria "${category.name}" excluída com sucesso!`);
      await loadCategories();
    } catch (error) {
      showToast('error', error.message);
    }
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.firestoreId, categoryData);
        showToast('success', `Categoria "${categoryData.name}" atualizada com sucesso!`);
      } else {
        await categoryService.createCategory({
          ...categoryData,
          clinicId: userData.clinicId
        });
        showToast('success', `Categoria "${categoryData.name}" criada com sucesso!`);
      }
      
      setShowModal(false);
      await loadCategories();
    } catch (error) {
      showToast('error', error.message);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const defaultCategories = categories.filter(c => !c.isCustom);
  const customCategories = categories.filter(c => c.isCustom);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FolderPlus className="w-8 h-8 text-blue-600" />
              Gerenciar Categorias
            </h1>
            <p className="text-gray-600 mt-2">
              Crie e organize categorias personalizadas para sua clínica
            </p>
          </div>
          <button
            onClick={handleCreateCategory}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nova Categoria
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          toast.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Categorias</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
            <FolderPlus className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categorias Padrão</p>
              <p className="text-2xl font-bold text-gray-600">{defaultCategories.length}</p>
            </div>
            <FolderPlus className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categorias Customizadas</p>
              <p className="text-2xl font-bold text-green-600">{customCategories.length}</p>
            </div>
            <FolderPlus className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Default Categories */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Categorias Padrão do Sistema
        </h2>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-4">
            Estas são as categorias padrão do sistema e não podem ser editadas ou excluídas.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {defaultCategories.map((category) => (
              <div key={category.id} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    <div className="text-xl">📁</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <p className="text-xs text-gray-500">{category.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Categories */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Categorias Personalizadas da Clínica
        </h2>
        {customCategories.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <FolderPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma categoria personalizada
            </h3>
            <p className="text-gray-600 mb-4">
              Crie categorias específicas para as necessidades da sua clínica
            </p>
            <button
              onClick={handleCreateCategory}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <Plus className="w-5 h-5" />
              Criar Primeira Categoria
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customCategories.map((category) => (
              <div key={category.id} className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      <div className="text-xl">📁</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{category.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Editar categoria"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Excluir categoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span>Cor: {category.color}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setShowModal(false)}
          onSave={handleSaveCategory}
        />
      )}
    </div>
  );
};

// Modal Component
const CategoryModal = ({ category, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    icon: category?.icon || 'file-text',
    color: category?.color || '#3B82F6',
    order: category?.order || 999
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da categoria é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const predefinedColors = [
    { name: 'Azul', value: '#3B82F6' },
    { name: 'Verde', value: '#10B981' },
    { name: 'Roxo', value: '#8B5CF6' },
    { name: 'Rosa', value: '#EC4899' },
    { name: 'Laranja', value: '#F59E0B' },
    { name: 'Vermelho', value: '#EF4444' },
    { name: 'Amarelo', value: '#EAB308' },
    { name: 'Cinza', value: '#6B7280' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Categoria *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Teleconsulta"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Breve descrição da categoria"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Palette className="w-4 h-4 inline mr-1" />
              Cor da Categoria
            </label>
            <div className="grid grid-cols-4 gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleChange('color', color.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.color === color.value 
                      ? 'border-gray-900 scale-110' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  title={color.name}
                  style={{ backgroundColor: color.value }}
                >
                  <div className="w-full h-6"></div>
                </button>
              ))}
            </div>
            <div className="mt-2">
              <label className="text-xs text-gray-500">Ou escolha uma cor personalizada:</label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordem de Exibição
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => handleChange('order', parseInt(e.target.value) || 999)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="999"
              min="0"
            />
            <p className="mt-1 text-xs text-gray-500">
              Menor número aparece primeiro (categorias padrão usam 1-100)
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Salvando...' : (category ? 'Atualizar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageCategoriesPage;
