import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { useClinics } from '../../hooks/useClinics';
import { DEFAULT_CATEGORIES } from '../../types';
import { Plus, Save, X } from 'lucide-react';

const ScriptForm = ({ onSubmit, onCancel, initialData = null }) => {
  const { user, userData } = useAuth();
  const { clinics } = useClinics();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [steps, setSteps] = useState(initialData?.steps || []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      categoryId: initialData?.categoryId || 'atendimento',
      clinicId: initialData?.clinicId || (user?.role === 'super_admin' ? '' : user?.clinicId),
      tags: initialData?.tags?.join(', ') || '',
      status: initialData?.status || 'active'
    }
  });

  const addStep = () => {
    setSteps([...steps, { order: steps.length + 1, description: '' }]);
  };

  const removeStep = (index) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps.map((step, i) => ({ ...step, order: i + 1 })));
  };

  const updateStep = (index, description) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], description };
    setSteps(newSteps);
  };

  const onFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const scriptData = {
        ...data,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        steps: steps.filter(step => step.description.trim()),
        createdBy: user.uid,
        createdAt: initialData ? initialData.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: initialData?.usageCount || 0,
        lastUsedAt: initialData?.lastUsedAt || null
      };

      await onSubmit(scriptData);
    } catch (error) {
      console.error('Erro ao salvar script:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSuperAdmin = userData?.role === 'super_admin';

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {initialData ? 'Editar Script' : 'Novo Script'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título do Script *
          </label>
          <input
            {...register('title', { required: 'Título é obrigatório' })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Primeiro Contato - Telefone"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Categoria e Clínica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria *
            </label>
            <select
              {...register('categoryId', { required: 'Categoria é obrigatória' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {DEFAULT_CATEGORIES.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
            )}
          </div>

          {isSuperAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clínica *
              </label>
              <select
                {...register('clinicId', { required: 'Clínica é obrigatória' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione uma clínica</option>
                {clinics.map(clinic => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </option>
                ))}
              </select>
              {errors.clinicId && (
                <p className="mt-1 text-sm text-red-600">{errors.clinicId.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conteúdo do Script *
          </label>
          <textarea
            {...register('content', { required: 'Conteúdo é obrigatório' })}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Digite o conteúdo do script aqui. Use [NOME], [CLÍNICA], [DATA] como placeholders..."
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Dica: Use placeholders como [NOME], [CLÍNICA], [DATA], [HORÁRIO] para personalização
          </p>
        </div>

        {/* Etapas Guiadas */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Etapas Guiadas (Opcional)
            </label>
            <button
              type="button"
              onClick={addStep}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar Etapa
            </button>
          </div>
          
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-3 mb-2">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                {step.order}
              </span>
              <input
                type="text"
                value={step.description}
                onChange={(e) => updateStep(index, e.target.value)}
                placeholder="Descrição da etapa"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => removeStep(index)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {steps.length === 0 && (
            <p className="text-sm text-gray-500 italic">
              Nenhuma etapa adicionada. As etapas ajudam a guiar o atendimento passo a passo.
            </p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (separadas por vírgula)
          </label>
          <input
            {...register('tags')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="telefone, recepção, primeiro contato"
          />
          <p className="mt-1 text-sm text-gray-500">
            Tags ajudam na busca e organização dos scripts
          </p>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            {...register('status')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>

        {/* Botões */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Salvando...' : (initialData ? 'Atualizar' : 'Criar Script')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScriptForm;

