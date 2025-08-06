import React, { useState, useEffect } from 'react';
import { Search, Filter, Copy, Clock, Tag, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_CATEGORIES } from '../types';
import { formatRelativeTime } from '../utils';

const SearchPage = () => {
  const { userData } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredScripts, setFilteredScripts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock scripts data for demonstration
  const mockScripts = [
    {
      id: '1',
      title: 'Primeiro Contato - Telefone',
      content: 'Olá! Bom dia/tarde/noite. Aqui é [NOME] da [CLÍNICA]. Como posso ajudá-lo(a) hoje?',
      category: 'atendimento',
      categoryName: 'Atendimento',
      tags: ['telefone', 'primeiro contato', 'recepção'],
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isActive: true
    },
    {
      id: '2',
      title: 'Orientações Pré-Cirurgia',
      content: 'Para sua cirurgia, é importante seguir estas orientações: 1) Jejum de 8 horas antes do procedimento...',
      category: 'cirurgia',
      categoryName: 'Cirurgia',
      tags: ['pré-cirurgia', 'orientações', 'jejum'],
      lastUsed: new Date(Date.now() - 4 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      isActive: true
    },
    {
      id: '3',
      title: 'Follow-up Pós-Consulta',
      content: 'Olá [NOME DO PACIENTE], como você está se sentindo após nossa consulta de ontem?',
      category: 'follow-up',
      categoryName: 'Follow-up',
      tags: ['pós-consulta', 'acompanhamento', 'whatsapp'],
      lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      isActive: true
    },
    {
      id: '4',
      title: 'Agendamento de Consulta',
      content: 'Temos disponibilidade para [DATA] às [HORÁRIO]. Essa data funciona para você?',
      category: 'agendamento',
      categoryName: 'Agendamento',
      tags: ['agendamento', 'horário', 'disponibilidade'],
      lastUsed: new Date(Date.now() - 6 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isActive: true
    },
    {
      id: '5',
      title: 'Resposta a Objeção - Preço',
      content: 'Entendo sua preocupação com o investimento. Vamos conversar sobre as opções de pagamento disponíveis...',
      category: 'objecoes',
      categoryName: 'Objeções',
      tags: ['objeção', 'preço', 'pagamento'],
      lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      isActive: true
    }
  ];

  // Filter scripts based on search term and category
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API delay
    const timer = setTimeout(() => {
      let filtered = mockScripts.filter(script => script.isActive);

      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(script => 
          script.title.toLowerCase().includes(term) ||
          script.content.toLowerCase().includes(term) ||
          script.tags.some(tag => tag.toLowerCase().includes(term))
        );
      }

      // Filter by category
      if (selectedCategory) {
        filtered = filtered.filter(script => script.category === selectedCategory);
      }

      setFilteredScripts(filtered);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);

  const handleCopyScript = async (script) => {
    try {
      await navigator.clipboard.writeText(script.content);
      // In a real app, you'd show a toast notification here
      console.log('Script copiado para a área de transferência');
    } catch (err) {
      console.error('Erro ao copiar script:', err);
    }
  };

  const highlightText = (text, highlight) => {
    if (!highlight) return text;
    
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
            Encontre rapidamente o script que você precisa
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="medical-card p-6">
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
          <div className="medical-card p-8 text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        ) : filteredScripts.length === 0 ? (
          <div className="medical-card p-8 text-center">
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
            <div key={script.id} className="medical-card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {highlightText(script.title, searchTerm)}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="clinic-badge">
                          {script.categoryName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatRelativeTime(script.lastUsed)}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleCopyScript(script)}
                      className="copy-button flex-shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                      Copiar
                    </button>
                  </div>

                  {/* Content Preview */}
                  <div className="mb-4">
                    <p className="text-gray-700 line-clamp-3">
                      {highlightText(script.content, searchTerm)}
                    </p>
                  </div>

                  {/* Tags */}
                  {script.tags.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
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

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Criado em {script.createdAt.toLocaleDateString('pt-BR')}
                    </div>
                    
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                      Ver detalhes
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

