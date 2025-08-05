import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ScriptForm from '../components/forms/ScriptForm';
import scriptService from '../services/scriptService';

const CreateScriptPage = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (scriptData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await scriptService.createScript(scriptData);
      
      // Mostrar mensagem de sucesso (você pode implementar um toast aqui)
      alert('Script criado com sucesso!');
      
      // Redirecionar para a página de scripts da categoria
      navigate(`/scripts/${scriptData.categoryId}`);
    } catch (error) {
      console.error('Erro ao criar script:', error);
      setError('Erro ao criar script. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); // Voltar para a página anterior
  };

  // Verificar se o usuário tem permissão para criar scripts
  if (!user || !userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600">Você não tem permissão para criar scripts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Dashboard
                </button>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <span className="text-gray-900 font-medium">Novo Script</span>
              </li>
            </ol>
          </nav>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erro</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <ScriptForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900">Criando script...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateScriptPage;

