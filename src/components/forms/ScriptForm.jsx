import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DEFAULT_CATEGORIES } from '../../types';
import { X, Plus, Save } from 'lucide-react';

const ScriptForm = ({ onSubmit, onCancel, initialData = null, isLoading = false }) => {
  const { userData } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    clinicId: userData?.clinicId || '',
    tags: [],
    isTemplate: false,
    isActive: true
  });
  
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  // Carregar dados iniciais quando o componente montar ou quando initialData mudar
  useEffect(() => {
    if (initialData) {
      console.log('📝 Carregando dados iniciais no formulário:', initialData);
      
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        categoryId: initialData.categoryId || '',
        clinicId: initialData.clinicId || userData?.clinicId || '',
        tags: initialData.tags || [],
        isTemplate: initialData.isTemplate || false,
        isActive: initialData.isActive !== undefined ? initialData.isActive : true
      });
    }
  }, [initialData, userData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Conteúdo é obrigatório';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Categoria é obrigatória';
    }

    if (!formData.clinicId) {
      newErrors.clinicId = 'Clínica é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('📤 Submetendo formulário com dados:', formData);

    if (validateForm()) {
      onSubmit(formData);
    } else {
      console.log('❌ Formulário com erros:', errors);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleChange('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    handleChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título do Script *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ex: Script de Boas-vindas ao Paciente"
          disabled={isLoading}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Categoria */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categoria *
        </label>
        <select
          value={formData.categoryId}
          onChange={(e) => handleChange('categoryId', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.categoryId ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        >
          <option value="">Selecione uma categoria</option>
          {DEFAULT_CATEGORIES.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
        )}
      </div>

      {/* Conteúdo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Conteúdo do Script *
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => handleChange('content', e.target.value)}
          rows={10}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
            errors.content ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Digite o conteúdo do script aqui..."
          disabled={isLoading}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Use variáveis como [NOME_PACIENTE], [DATA], etc. para personalização
        </p>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (opcional)
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Digite uma tag e pressione Enter"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={handleAddTag}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>
        
        {/* Lista de Tags */}
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  disabled={isLoading}
                  className="hover:text-blue-900 disabled:opacity-50"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Tags ajudam a organizar e buscar scripts
        </p>
      </div>

      {/* Opções Adicionais */}
      <div className="space-y-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isTemplate}
            onChange={(e) => handleChange('isTemplate', e.target.checked)}
            disabled={isLoading}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            Marcar como template (pode ser usado como base para outros scripts)
          </span>
        </label>

        {initialData && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              disabled={isLoading}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Script ativo (desmarque para desativar temporariamente)
            </span>
          </label>
        )}
      </div>

      {/* Informações da Clínica (somente leitura) */}
      {formData.clinicId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Clínica:</strong> {userData?.clinicName || formData.clinicId}
          </p>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {initialData ? 'Atualizar Script' : 'Criar Script'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ScriptForm;
