import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Copy, 
  Clock, 
  Tag, 
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Phone,
  Scissors,
  Stethoscope,
  MessageCircle,
  Calendar,
  FileText,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Save
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import scriptService from '../services/scriptService';
import { DEFAULT_CATEGORIES } from '../types';
import { formatRelativeTime } from '../utils';

const CategoryScriptsPage = () => {
  const { categoryId } = useParams();
  const { userData, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [scripts, setScripts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('order'); // Padrão: ordem personalizada
  const [error, setError] = useState(null);
  const [deletingScriptId, setDeletingScriptId] = useState(null);
  const [isReordering, setIsReordering] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // State for category
  const [category, setCategory] = useState(null);
  const [loadingCategory, setLoadingCategory] = useState(true);

  // Load category (can be default or custom)
  useEffect(() => {
    const loadCategory = async () => {
      setLoadingCategory(true);
      try {
        // First check if it's a default category
        const defaultCategory = DEFAULT_CATEGORIES.find(cat => cat.id === categoryId);
        
        if (defaultCategory) {
          setCategory(defaultCategory);
        } else {
          // If not default, try to load from categoryService
          const categoryService = (await import('../services/categoryService')).default;
          const allCategories = await categoryService.getAllCategoriesForUser();
          const customCategory = allCategories.find(cat => cat.id === categoryId);
          
          if (customCategory) {
            setCategory(customCategory);
          } else {
            setCategory(null);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar categoria:', error);
        setCategory(null);
      } finally {
        setLoadingCategory(false);
      }
    };

    loadCategory();
  }, [categoryId]);

  useEffect(() => {
    const loadScripts = async () => {
      console.log('CategoryScriptsPage - loadScripts iniciado', { categoryId, userData });
      
      if (!userData?.clinicId) {
        console.log('CategoryScriptsPage - Aguardando dados do usuário...');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('CategoryScriptsPage - Buscando scripts...', { categoryId, clinicId: userData.clinicId });
        const result = await scriptService.getScriptsByCategory(categoryId, userData.clinicId);
        console.log('CategoryScriptsPage - Scripts encontrados:', result);
        
        setScripts(result || []);
      } catch (error) {
        console.error('Erro ao carregar scripts:', error);
        setError(error.message);
        setScripts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadScripts();
  }, [categoryId, userData?.clinicId]);

  const handleCopyScript = async (script) => {
    try {
      await navigator.clipboard.writeText(script.content);
      console.log('✅ Script copiado para a área de transferência');
    } catch (err) {
      console.error('❌ Erro ao copiar script:', err);
    }
  };

  const handleEditScript = (scriptId) => {
    console.log('✏️ Navegando para editar script:', scriptId);
    navigate(`/scripts/edit/${scriptId}`);
  };

  const handleDeleteScript = async (script) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir o script "${script.title}"?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingScriptId(script.id);
      await scriptService.deleteScript(script.id);
      setScripts(prevScripts => prevScripts.filter(s => s.id !== script.id));
    } catch (error) {
      console.error('❌ Erro ao excluir script:', error);
      setError(`Erro ao excluir script: ${error.message}`);
    } finally {
      setDeletingScriptId(null);
    }
  };

  // Mover script para cima na ordem
  const handleMoveUp = (index) => {
    if (index === 0) return; // Já está no topo
    
    const newScripts = [...scripts];
    const temp = newScripts[index];
    newScripts[index] = newScripts[index - 1];
    newScripts[index - 1] = temp;
    
    setScripts(newScripts);
    setHasUnsavedChanges(true);
  };

  // Mover script para baixo na ordem
  const handleMoveDown = (index) => {
    if (index === scripts.length - 1) return; // Já está no final
    
    const newScripts = [...scripts];
    const temp = newScripts[index];
    newScripts[index] = newScripts[index + 1];
    newScripts[index + 1] = temp;
    
    setScripts(newScripts);
    setHasUnsavedChanges(true);
  };

  // Salvar nova ordem dos scripts
  const handleSaveOrder = async () => {
    try {
      setIsReordering(true);
      setError(null);

      // Criar um array com os IDs dos scripts na nova ordem
      const scriptIds = scripts.map(script => script.id);
      
      // Atualizar ordem no backend
      await scriptService.reorderScripts(categoryId, userData.clinicId, scriptIds);
      
      console.log('✅ Ordem dos scripts salva com sucesso');
      setHasUnsavedChanges(false);
      
      // Recarregar scripts para garantir sincronização
      const result = await scriptService.getScriptsByCategory(categoryId, userData.clinicId);
      setScripts(result || []);
    } catch (error) {
      console.error('❌ Erro ao salvar ordem:', error);
      setError(`Erro ao salvar ordem: ${error.message}`);
    } finally {
      setIsReordering(false);
    }
  };

  // Cancelar alterações de ordem
  const handleCancelReorder = async () => {
    try {
      setIsReordering(true);
      // Recarregar scripts da ordem original
      const result = await scriptService.getScriptsByCategory(categoryId, userData.clinicId);
      setScripts(result || []);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('❌ Erro ao cancelar:', error);
      setError(`Erro ao cancelar: ${error.message}`);
    } finally {
      setIsReordering(false);
    }
  };

  const getIconComponent = (iconName) => {
    const icons = {
      Phone,
      Scissors,
      Stethoscope,
      MessageCircle,
      Calendar,
      Clock
    };
    return icons[iconName] || FileText;
  };

  if (loadingCategory) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando categoria...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Categoria não encontrada
        </h1>
        <Link 
          to="/dashboard"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  const IconComponent = getIconComponent(category.icon);

  // Filtrar scripts
  const filteredScripts = scripts.filter(script => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      script.title.toLowerCase().includes(term) ||
      script.content.toLowerCase().includes(term) ||
      (script.tags && script.tags.some(tag => tag.toLowerCase().includes(term)))
    );
  });

  // Ordenar scripts
  const sortedScripts = [...filteredScripts].sort((a, b) => {
    switch (sortBy) {
      case 'order':
        // Ordem personalizada (usando índice do array)
        return 0; // Mantém ordem atual
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      case 'created':
        const aTime = a.createdAt?.seconds ? a.createdAt.seconds : 0;
        const bTime = b.createdAt?.seconds ? b.createdAt.seconds : 0;
        return bTime - aTime;
      case 'recent':
      default:
        const aUpdated = a.updatedAt?.seconds ? a.updatedAt.seconds : 0;
        const bUpdated = b.updatedAt?.seconds ? b.updatedAt.seconds : 0;
        return bUpdated - aUpdated;
    }
  });

  // Usar scripts originais quando sortBy é 'order'
  const displayScripts = sortBy === 'order' ? filteredScripts : sortedScripts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="p-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: category.color ? `${category.color}20` : '#3B82F620' }}
              >
                <IconComponent className="w-5 h-5" style={{ color: category.color || '#3B82F6' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {category.name}
                  {category.isCustom && (
                    <span className="ml-2 text-sm font-normal text-gray-500">(Personalizada)</span>
                  )}
                </h1>
                <p className="text-gray-600">
                  {category.description}
                </p>
              </div>
            </div>
          </div>

          {hasPermission && (hasPermission('admin') || hasPermission('super_admin')) && (
            <Link
              to="/scripts/create"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Novo Script
            </Link>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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

        {/* Unsaved Changes Warning */}
        {hasUnsavedChanges && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Alterações não salvas</h3>
                  <p className="text-sm text-yellow-700">Você tem alterações na ordem dos scripts que ainda não foram salvas.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelReorder}
                  disabled={isReordering}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveOrder}
                  disabled={isReordering}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isReordering ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar Ordem
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar scripts nesta categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[200px]"
              >
                <option value="order">Ordem personalizada</option>
                <option value="alphabetical">Alfabética</option>
                <option value="created">Data de criação</option>
                <option value="recent">Mais recentes</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            {isLoading ? 'Carregando...' : `${displayScripts.length} script(s) encontrado(s)`}
            {sortBy === 'order' && hasPermission && (hasPermission('admin') || hasPermission('super_admin')) && (
              <span className="ml-2 text-blue-600">
                • Use as setas para reordenar os scripts
              </span>
            )}
          </div>
        </div>

        {/* Scripts List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ) : displayScripts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <IconComponent className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Nenhum script encontrado' : 'Nenhum script nesta categoria'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Tente usar palavras-chave diferentes.'
                  : 'Seja o primeiro a criar um script para esta categoria.'
                }
              </p>
              {hasPermission && (hasPermission('admin') || hasPermission('super_admin')) && !searchTerm && (
                <Link
                  to="/scripts/create"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Criar Primeiro Script
                </Link>
              )}
            </div>
          ) : (
            displayScripts.map((script, index) => (
              <div key={script.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Drag Handle e Setas de Ordenação */}
                  {sortBy === 'order' && hasPermission && (hasPermission('admin') || hasPermission('super_admin')) && (
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0 || isReordering}
                        className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                          index === 0 ? 'opacity-30 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'
                        }`}
                        title="Mover para cima"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === displayScripts.length - 1 || isReordering}
                        className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                          index === displayScripts.length - 1 ? 'opacity-30 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'
                        }`}
                        title="Mover para baixo"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Conteúdo do Script */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {script.title}
                        </h3>
                        
                        <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Criado em {script.createdAt && script.createdAt.seconds 
                              ? new Date(script.createdAt.seconds * 1000).toLocaleDateString('pt-BR')
                              : 'Data não disponível'
                            }
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyScript(script)}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          title="Copiar script"
                        >
                          <Copy className="w-4 h-4" />
                          Copiar
                        </button>
                        
                        {hasPermission && (hasPermission('admin') || hasPermission('super_admin')) && (
                          <>
                            <button
                              onClick={() => handleEditScript(script.id)}
                              className="p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                              title="Editar script"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteScript(script)}
                              disabled={deletingScriptId === script.id}
                              className={`p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors ${
                                deletingScriptId === script.id ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              title="Excluir script"
                            >
                              {deletingScriptId === script.id ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div className="mb-4">
                      <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <p className="text-gray-700 whitespace-pre-line">
                          {script.content}
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    {script.tags && script.tags.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <div className="flex flex-wrap gap-1">
                          {script.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryScriptsPage;
