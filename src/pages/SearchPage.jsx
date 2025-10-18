import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Copy, Clock, Tag, ArrowRight, Edit, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_CATEGORIES } from '../types';
import { formatRelativeTime } from '../utils';
import scriptService from '../services/scriptService';

const SearchPage = () => {
  const { userData, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredScripts, setFilteredScripts] = useState([]);
  const [allScripts, setAllScripts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingScriptId, setDeletingScriptId] = useState(null);

  // Carregar scripts da clínica do usuário
  useEffect(() => {
    const loadScripts = async () => {
      console.log('SearchPage - Carregando scripts da clínica', { 
        clinicId: userData?.clinicId,
        userEmail: userData?.email 
      });
      
      if (!userData?.clinicId) {
        console.log('SearchPage - Aguardando dados do usuário...');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Buscar todos os scripts da clínica do usuário
        const result = await scriptService.getScriptsByClinic(userData.clinicId, {
          limitCount: 1000,
          isActive: true
        });

        console.log('SearchPage - Scripts carregados:', result.scripts.length);
        
        // Enriquecer scripts com nome da categoria
        const enrichedScripts = result.scripts.map(script => {
          const category = DEFAULT_CATEGORIES.find(cat => cat.id === script.categoryId);
          return {
            ...script,
            categoryName: category?.name || 'Sem categoria'
          };
        });

        setAllScripts(enrichedScripts);
        setFilteredScripts(enrichedScripts);
      } catch (error) {
        console.error('Erro ao carregar scripts:', error);
        setError(error.message || 'Erro ao carregar scripts');
      } finally {
        setIsLoading(false);
      }
    };

    loadScripts();
  }, [userData?.clinicId]);

  // Filtrar scripts quando searchTerm ou selectedCategory mudar
  useEffect(() => {
    let filtered = [...allScripts];

    // Filtrar por termo de busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(script => 
        script.title.toLowerCase().includes(term) ||
        script.content.toLowerCase().includes(term) ||
        (script.tags && script.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    // Filtrar por categoria
    if (selectedCategory) {
      filtered = filtered.filter(script => script.categoryId === selectedCategory);
    }

    console.log('SearchPage - Filtros aplicados:', {
      searchTerm,
      selectedCategory,
      totalScripts: allScripts.length,
      filteredScripts: filtered.length
    });

    setFilteredScripts(filtered);
  }, [searchTerm, selectedCategory, allScripts]);

  const handleCopyScript = async (script) => {
    try {
      await navigator.clipboard.writeText(script.content);
      console.log('✅ Script copiado para a área de transferência');
      // TODO: Adicionar toast de sucesso
    } catch (err) {
      console.error('❌ Erro ao copiar script:', err);
      // TODO: Adicionar toast de erro
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
      console.log('❌ Exclusão cancelada pelo usuário');
      return;
    }

    try {
      console.log('🗑️ Excluindo script:', script.id);
      setDeletingScriptId(script.id);
      
      await scriptService.deleteScript(script.id);
      
      console.log('✅ Script excluído com sucesso');
      
      // Remover o script das listas locais
      setAllScripts(prevScripts => prevScripts.filter(s => s.id !== script.id));
      setFilteredScripts(prevScripts => prevScripts.filter(s => s.id !== script.id));
      
      // TODO: Adicionar toast de sucesso
    } catch (error) {
      console.error('❌ Erro ao excluir script:', error);
      setError(`Erro ao excluir script: ${error.message}`);
      // TODO: Adicionar toast de erro
    } finally {
      setDeletingScriptId(null);
    }
  };

  const highlightText = (text, highlight) => {
    if (!highlight?.trim()) return text;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === highlight.toLowerCase() ? 
        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark> : part
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Buscar Scripts
          </h1>
          <p className="text-gray-600 mt-1">
            Encontre rapidamente o script que você precisa na sua clínica
          </p>
        </div>
      </div>

      {/* Informação da Clínica */}
      {userData?.clinicName && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Buscando em:</strong> {userData.clinicName}
          </p>
        </div>
      )}

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

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Digite palavras-chave, título ou conteúdo do script..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[200px]"
            >
              <option value="">Todas as categorias</option>
              {DEFAULT_CATEGORIES.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            {isLoading ? 'Buscando...' : `${filteredScripts.length} script(s) encontrado(s)`}
          </span>
          {(searchTerm || selectedCategory) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando scripts...</p>
          </div>
        ) : filteredScripts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedCategory ? 'Nenhum script encontrado' : 'Digite algo para buscar'}
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory 
                ? 'Tente usar palavras-chave diferentes ou remover os filtros.'
                : 'Use palavras-chave, títulos ou tags para encontrar seus scripts.'
              }
            </p>
          </div>
        ) : (
          filteredScripts.map((script) => (
            <div key={script.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {highlightText(script.title, searchTerm)}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {script.categoryName}
                        </span>
                        {script.updatedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatRelativeTime(script.updatedAt.toDate?.() || script.updatedAt)}
                          </span>
                        )}
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
                      <p className="text-gray-700 whitespace-pre-line line-clamp-3">
                        {highlightText(script.content, searchTerm)}
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
                            {highlightText(tag, searchTerm)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {script.createdAt && (
                        <>
                          Criado em {script.createdAt.toDate ? 
                            script.createdAt.toDate().toLocaleDateString('pt-BR') : 
                            new Date(script.createdAt).toLocaleDateString('pt-BR')
                          }
                        </>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => navigate(`/scripts/${script.categoryId}`)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      Ver categoria
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchPage;
