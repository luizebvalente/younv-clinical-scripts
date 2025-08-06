import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Copy, 
  Clock, 
  Tag, 
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Phone,
  Scissors,
  Stethoscope,
  MessageCircle,
  Calendar,
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import scriptService from '../services/scriptService';
import { DEFAULT_CATEGORIES } from '../types';
import { formatRelativeTime } from '../utils';

const CategoryScriptsPage = () => {
  const { categoryId } = useParams();
  const { userData, hasPermission } = useAuth();
  const [scripts, setScripts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [error, setError] = useState(null);

  // Find category info
  const category = DEFAULT_CATEGORIES.find(cat => cat.id === categoryId);

  useEffect(() => {
    const loadScripts = async () => {
      if (!userData?.clinicId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await scriptService.getScriptsByCategory(categoryId, userData.clinicId);
        let filtered = result || [];

        // Filter by search term
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter(script => 
            script.title.toLowerCase().includes(term) ||
            script.content.toLowerCase().includes(term) ||
            (script.tags && script.tags.some(tag => tag.toLowerCase().includes(term)))
          );
        }

        // Sort scripts
        switch (sortBy) {
          case 'recent':
            filtered.sort((a, b) => {
              const aDate = a.lastUsedAt ? new Date(a.lastUsedAt.seconds * 1000) : new Date(a.updatedAt.seconds * 1000);
              const bDate = b.lastUsedAt ? new Date(b.lastUsedAt.seconds * 1000) : new Date(b.updatedAt.seconds * 1000);
              return bDate - aDate;
            });
            break;
          case 'alphabetical':
            filtered.sort((a, b) => a.title.localeCompare(b.title));
            break;
          case 'created':
            filtered.sort((a, b) => {
              const aDate = new Date(a.createdAt.seconds * 1000);
              const bDate = new Date(b.createdAt.seconds * 1000);
              return bDate - aDate;
            });
            break;
          default:
            break;
        }

        setScripts(filtered);
      } catch (error) {
        console.error('Erro ao carregar scripts:', error);
        setError(error.message);
        setScripts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadScripts();
  }, [categoryId, userData?.clinicId, searchTerm, sortBy]);

  const handleCopyScript = async (script) => {
    try {
      await navigator.clipboard.writeText(script.content);
      console.log('Script copiado para a área de transferência');
    } catch (err) {
      console.error('Erro ao copiar script:', err);
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

  return (
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
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {category.name}
              </h1>
              <p className="text-gray-600">
                {category.description}
              </p>
            </div>
          </div>
        </div>

        {hasPermission('admin') && (
          <Link
            to="/scripts/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Script
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="medical-card p-6">
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
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[180px]"
            >
              <option value="recent">Mais recentes</option>
              <option value="alphabetical">Alfabética</option>
              <option value="created">Data de criação</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          {isLoading ? 'Carregando...' : error ? `Erro: ${error}` : `${scripts.length} script(s) encontrado(s)`}
        </div>
      </div>

      {/* Scripts List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="medical-card p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))
        ) : error ? (
          <div className="medical-card p-8 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconComponent className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Erro ao carregar scripts
            </h3>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : scripts.length === 0 ? (
          <div className="medical-card p-8 text-center">
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
            {hasPermission('admin') && !searchTerm && (
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
          scripts.map((script) => (
            <div key={script.id} className="medical-card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {script.title}
                  </h3>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Usado {script.lastUsedAt 
                        ? formatRelativeTime(new Date(script.lastUsedAt.seconds * 1000))
                        : 'nunca'
                      }
                    </span>
                    <span>•</span>
                    <span>
                      Criado em {new Date(script.createdAt.seconds * 1000).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyScript(script)}
                    className="copy-button"
                  >
                    <Copy className="w-4 h-4" />
                    Copiar
                  </button>
                  
                  {hasPermission('admin') && (
                    <>
                      <Link
                        to={`/scripts/edit/${script.id}`}
                        className="p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Editar script"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Excluir script"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Content Preview */}
              <div className="mb-4">
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="text-gray-700 whitespace-pre-line line-clamp-4">
                    {script.content}
                  </p>
                </div>
              </div>

              {/* Steps (if available) */}
              {script.steps && script.steps.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Etapas do Script:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {script.steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                          {index + 1}
                        </div>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {script.tags.length > 0 && (
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
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryScriptsPage;

