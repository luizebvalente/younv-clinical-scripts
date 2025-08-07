import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ScriptForm from '../components/forms/ScriptForm';
import scriptService from '../services/scriptService';

const EditScriptPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, userData } = useAuth();
  const [script, setScript] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadScript();
  }, [id]);

  const loadScript = async () => {
    try {
      setIsLoading(true);
      const scriptData = await scriptService.getScriptById(id);
      setScript(scriptData);
    } catch (error) {
      console.error('Erro ao carregar script:', error);
      setError('Erro ao carregar script.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (scriptData) => {
    try {
      await scriptService.updateScript(id, scriptData);
      alert('Script atualizado com sucesso!');
      
      // Redirecionar para a página de scripts da categoria
      navigate(`/scripts/${scriptData.categoryId}`);
    } catch (error) {
      console.error('Erro ao atualizar script:', error);
      setError('Erro ao atualizar script. Tente novamente.');
    }
  };

  const handleCancel = () => {
    navigate(-1); // Voltar para a página anterior
  };

  // Verificar se o usuário tem permissão para editar scripts
  if (!user || !userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600">Você não tem permissão para editar scripts.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando script...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Script não encontrado</h2>
          <p className="text-gray-600">O script solicitado não foi encontrado.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Editar Script</h1>
          <p className="mt-2 text-gray-600">
            Atualize as informações do script abaixo.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <ScriptForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            initialData={script}
          />
        </div>
      </div>
    </div>
  );
};

export default EditScriptPage;

