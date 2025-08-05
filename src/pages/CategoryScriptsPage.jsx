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
import { DEFAULT_CATEGORIES } from '../types';
import { formatRelativeTime } from '../utils';

const CategoryScriptsPage = () => {
  const { categoryId } = useParams();
  const { userData, hasPermission } = useAuth();
  const [scripts, setScripts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  // Find category info
  const category = DEFAULT_CATEGORIES.find(cat => cat.id === categoryId);

  // Mock scripts data for the category
  const mockScripts = {
    'atendimento': [
      {
        id: '1',
        title: 'Primeiro Contato - Telefone',
        content: 'Olá! Bom dia/tarde/noite. Aqui é [NOME] da [CLÍNICA]. Como posso ajudá-lo(a) hoje?\n\nEstou aqui para esclarecer suas dúvidas e agendar sua consulta da melhor forma possível.',
        tags: ['telefone', 'primeiro contato', 'recepção'],
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        steps: [
          'Cumprimentar cordialmente',
          'Identificar-se e à clínica',
          'Perguntar como pode ajudar',
          'Escutar atentamente a necessidade'
        ]
      },
      {
        id: '2',
        title: 'Recepção Presencial',
        content: 'Seja muito bem-vindo(a) à [CLÍNICA]! Meu nome é [NOME], como posso ajudá-lo(a)?\n\nPor favor, tenha um assento enquanto verifico sua agenda.',
        tags: ['presencial', 'recepção', 'boas-vindas'],
        lastUsed: new Date(Date.now() - 5 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        isActive: true,
        steps: [
          'Cumprimentar com sorriso',
          'Apresentar-se',
          'Oferecer assento',
          'Verificar documentos'
        ]
      }
    ],
    'cirurgia': [
      {
        id: '3',
        title: 'Orientações Pré-Cirurgia',
        content: 'Para sua cirurgia, é importante seguir estas orientações:\n\n1) Jejum de 8 horas antes do procedimento\n2) Não usar maquiagem ou esmalte\n3) Trazer acompanhante\n4) Chegar 1 hora antes do horário marcado',
        tags: ['pré-cirurgia', 'orientações', 'jejum'],
        lastUsed: new Date(Date.now() - 4 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isActive: true,
        steps: [
          'Explicar importância do jejum',
          'Orientar sobre vestimenta',
          'Confirmar acompanhante',
          'Definir horário de chegada'
        ]
      }
    ],
    'follow-up': [
      {
        id: '4',
        title: 'Follow-up Pós-Consulta',
        content: 'Olá [NOME DO PACIENTE], como você está se sentindo após nossa consulta de ontem?\n\nGostaria de saber se tem alguma dúvida sobre o tratamento recomendado.',
        tags: ['pós-consulta', 'acompanhamento', 'whatsapp'],
        lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isActive: true,
        steps: [
          'Cumprimentar pelo nome',
          'Perguntar sobre bem-estar',
          'Verificar dúvidas',
          'Oferecer suporte adicional'
        ]
      }
    ]
  };

  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const categoryScripts = mockScripts[categoryId] || [];
      let filtered = categoryScripts.filter(script => script.isActive);

      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(script => 
          script.title.toLowerCase().includes(term) ||
          script.content.toLowerCase().includes(term) ||
          script.tags.some(tag => tag.toLowerCase().includes(term))
        );
      }

      // Sort scripts
      switch (sortBy) {
        case 'recent':
          filtered.sort((a, b) => b.lastUsed - a.lastUsed);
          break;
        case 'alphabetical':
          filtered.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'created':
          filtered.sort((a, b) => b.createdAt - a.createdAt);
          break;
        default:
          break;
      }

      setScripts(filtered);
      setIsLoading(false);
    }, 300);
  }, [categoryId, searchTerm, sortBy]);

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
          {isLoading ? 'Carregando...' : `${scripts.length} script(s) encontrado(s)`}
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
                      Usado {formatRelativeTime(script.lastUsed)}
                    </span>
                    <span>•</span>
                    <span>
                      Criado em {script.createdAt.toLocaleDateString('pt-BR')}
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

