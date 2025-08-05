import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Copy, 
  Eye,
  Clock,
  Tag,
  ArrowUpDown,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DEFAULT_CATEGORIES } from '../../types';
import { formatRelativeTime } from '../../utils';

const AdminScriptsPage = () => {
  const { userData, hasPermission } = useAuth();
  const [scripts, setScripts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedScripts, setSelectedScripts] = useState([]);

  // Mock scripts data for admin view
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
      createdBy: 'Super Admin',
      clinicId: 'clinic1',
      clinicName: 'Clínica São Lucas',
      isActive: true,
      usageCount: 45
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
      createdBy: 'Dr. Silva',
      clinicId: 'clinic1',
      clinicName: 'Clínica São Lucas',
      isActive: true,
      usageCount: 32
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
      createdBy: 'Recepcionista Maria',
      clinicId: 'clinic2',
      clinicName: 'Clínica Vida Nova',
      isActive: true,
      usageCount: 28
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
      createdBy: 'Admin Clínica',
      clinicId: 'clinic1',
      clinicName: 'Clínica São Lucas',
      isActive: false,
      usageCount: 15
    }
  ];

  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      let filtered = mockScripts;

      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(script => 
          script.title.toLowerCase().includes(term) ||
          script.content.toLowerCase().includes(term) ||
          script.tags.some(tag => tag.toLowerCase().includes(term)) ||
          script.clinicName.toLowerCase().includes(term)
        );
      }

      // Filter by category
      if (selectedCategory) {
        filtered = filtered.filter(script => script.category === selectedCategory);
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
        case 'usage':
          filtered.sort((a, b) => b.usageCount - a.usageCount);
          break;
        default:
          break;
      }

      setScripts(filtered);
      setIsLoading(false);
    }, 300);
  }, [searchTerm, selectedCategory, sortBy]);

  const handleSelectScript = (scriptId) => {
    setSelectedScripts(prev => 
      prev.includes(scriptId) 
        ? prev.filter(id => id !== scriptId)
        : [...prev, scriptId]
    );
  };

  const handleSelectAll = () => {
    if (selectedScripts.length === scripts.length) {
      setSelectedScripts([]);
    } else {
      setSelectedScripts(scripts.map(script => script.id));
    }
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action} for scripts:`, selectedScripts);
    // In a real app, this would call the appropriate API
    setSelectedScripts([]);
  };

  const handleDeleteScript = (scriptId) => {
    if (window.confirm('Tem certeza que deseja excluir este script?')) {
      console.log('Deleting script:', scriptId);
      // In a real app, this would call the delete API
    }
  };

  const handleCloneScript = (script) => {
    console.log('Cloning script:', script);
    // In a real app, this would open a clone dialog
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gerenciar Scripts
          </h1>
          <p className="text-gray-600 mt-1">
            Administre todos os scripts do sistema
          </p>
        </div>

        <Link
          to="/admin/scripts/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Script
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="medical-card p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por título, conteúdo, tags ou clínica..."
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

          {/* Sort */}
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[180px]"
            >
              <option value="recent">Mais recentes</option>
              <option value="alphabetical">Alfabética</option>
              <option value="created">Data de criação</option>
              <option value="usage">Mais usados</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedScripts.length > 0 && (
          <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-sm font-medium text-blue-900">
              {selectedScripts.length} script(s) selecionado(s)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Ativar
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Desativar
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
          <span>
            {isLoading ? 'Carregando...' : `${scripts.length} script(s) encontrado(s)`}
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

      {/* Scripts Table */}
      <div className="medical-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedScripts.length === scripts.length && scripts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Script
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clínica
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                  </tr>
                ))
              ) : scripts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium mb-2">
                        {searchTerm || selectedCategory ? 'Nenhum script encontrado' : 'Nenhum script cadastrado'}
                      </h3>
                      <p className="mb-4">
                        {searchTerm || selectedCategory 
                          ? 'Tente usar filtros diferentes.'
                          : 'Comece criando seu primeiro script.'
                        }
                      </p>
                      {!searchTerm && !selectedCategory && (
                        <Link
                          to="/admin/scripts/new"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Criar Script
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                scripts.map((script) => (
                  <tr key={script.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedScripts.includes(script.id)}
                        onChange={() => handleSelectScript(script.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {script.title}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {script.content.substring(0, 100)}...
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          {script.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {script.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{script.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="clinic-badge">
                        {script.categoryName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {script.clinicName}
                      </div>
                      <div className="text-sm text-gray-500">
                        por {script.createdBy}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {script.usageCount} vezes
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(script.lastUsed)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        script.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {script.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => console.log('View script:', script.id)}
                          className="p-1 text-gray-600 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCloneScript(script)}
                          className="p-1 text-gray-600 hover:text-green-600 rounded hover:bg-green-50 transition-colors"
                          title="Clonar"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/admin/scripts/edit/${script.id}`}
                          className="p-1 text-gray-600 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteScript(script.id)}
                          className="p-1 text-gray-600 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminScriptsPage;

