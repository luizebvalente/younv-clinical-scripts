import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ScriptForm from '../components/forms/ScriptForm';
import scriptService from '../services/scriptService';
import { ArrowLeft, AlertCircle } from 'lucide-react';

const EditScriptPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, userData } = useAuth();
  const [script, setScript] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadScript();
  }, [id]);

  const loadScript = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📝 Carregando script para edição:', id);
      
      if (!id) {
        throw new Error('ID do script não fornecido');
      }

      const scriptData = await scriptService.getScriptById(id);
      
      console.log('✅ Script carregado:', scriptData);
      
      // Verificar se o usuário tem permissão para editar este script
      if (scriptData.clinicId !== userData?.clinicId && userData?.role !== 'super_admin') {
        throw new Error('Você não tem permissão para editar este script.');
      }
      
      setScript(scriptData);
    } catch (error) {
      console.error('❌ Erro ao carregar script:', error);
      setError(error.message || 'Erro ao carregar script');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (scriptData) => {
    try {
      setIsSaving(true);
      setError(null);
      
      console.log('💾 Salvando alterações do script:', id);
      console.log('Dados a serem salvos:', scriptData);
      
      await scriptService.updateScript(id, scriptData);
      
      console.log('✅ Script atualizado com sucesso!');
      
      // Redirecionar para a página de scripts da categoria
      navigate(`/scripts/${scriptData.categoryId}`);
    } catch (error) {
      console.error('❌ Erro ao atualizar script:', error);
      setError(error.message || 'Erro ao atualizar script. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    console.log('❌ Edição cancelada, voltando...');
    navigate(-1); // Voltar para a página anterior
  };

  // Verificar se o usuário tem permissão para editar scripts
  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Carregando...</h2>
          <p className="text-gray-600">Verificando permissões</p>
        </div>
      </div>
    );
  }

  if (userData.role !== 'admin' && userData.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Você não tem permissão para editar scripts.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando script...</p>
        </div>
      </div>
    );
  }

  if (error && !script) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao Carregar Script</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={loadScript}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Script não encontrado</h2>
          <p className="text-gray-600 mb-4">O script solicitado não foi encontrado.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Script</h1>
              <p className="mt-2 text-gray-600">
                Atualize as informações do script abaixo.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 mb-1">Erro</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <span className="sr-only">Fechar</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <ScriptForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            initialData={script}
            isLoading={isSaving}
          />
        </div>
      </div>

      {/* Loading Overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3 shadow-xl">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-900 font-medium">Salvando alterações...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditScriptPage;
