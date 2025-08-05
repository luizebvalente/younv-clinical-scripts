import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  TrendingUp, 
  Users, 
  Clock,
  Plus,
  Search,
  ArrowRight,
  Phone,
  Scissors,
  Stethoscope,
  MessageCircle,
  UserCheck,
  Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_CATEGORIES } from '../types';
import { formatRelativeTime } from '../utils';
import scriptService from '../services/scriptService';

const DashboardPage = () => {
  const { user, userData, hasPermission } = useAuth();
  const [stats, setStats] = useState({
    totalScripts: 0,
    recentlyUsed: 0,
    totalCategories: 6,
    lastActivity: null
  });
  const [recentScripts, setRecentScripts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load dashboard data from Firebase
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const clinicId = userData?.clinicId;
      if (!clinicId) {
        setIsLoading(false);
        return;
      }

      // Get scripts statistics
      const scriptStats = await scriptService.getScriptStats(clinicId);
      
      // Get recent scripts (last 10)
      const scriptsResult = await scriptService.getScriptsByClinic(clinicId, { 
        limitCount: 10,
        isActive: true 
      });

      // Update stats
      setStats({
        totalScripts: scriptStats.total,
        recentlyUsed: scriptsResult.scripts.length,
        totalCategories: Object.keys(scriptStats.byCategory).length || 6,
        lastActivity: scriptsResult.scripts.length > 0 ? 
          scriptsResult.scripts[0].updatedAt?.toDate?.() || scriptsResult.scripts[0].updatedAt : 
          null
      });

      // Format recent scripts with category names
      const formattedRecentScripts = scriptsResult.scripts.slice(0, 3).map(script => {
        const category = DEFAULT_CATEGORIES.find(cat => cat.id === script.categoryId);
        return {
          id: script.id,
          title: script.title,
          category: category?.name || 'Sem categoria',
          lastUsed: script.updatedAt?.toDate?.() || script.updatedAt || new Date()
        };
      });

      setRecentScripts(formattedRecentScripts);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError('Erro ao carregar dados: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userData?.clinicId) {
      loadDashboardData();
    }
  }, [userData]);

  const getIconComponent = (iconName) => {
    const icons = {
      Phone,
      Scissors,
      Stethoscope,
      MessageCircle,
      UserCheck,
      Calendar
    };
    return icons[iconName] || FileText;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              Bem-vindo, {userData?.name || 'Usuário'}!
            </h1>
            <p className="text-blue-100">
              Acesse seus scripts de atendimento de forma rápida e organizada
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
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
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Carregando dados...</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Scripts</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalScripts}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usados Recentemente</p>
              <p className="text-3xl font-bold text-gray-900">{stats.recentlyUsed}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categorias</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCategories}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Última Atividade</p>
              <p className="text-3xl font-bold text-gray-900">agora mesmo</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Categorias de Scripts</h3>
            <Link to="/search" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {DEFAULT_CATEGORIES.slice(0, 4).map((category) => {
              const IconComponent = getIconComponent(category.icon);
              return (
                <Link
                  key={category.id}
                  to={`/scripts/${category.id}`}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 group-hover:bg-blue-100 rounded-lg transition-colors">
                      <IconComponent className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{category.name}</h4>
                      <p className="text-sm text-gray-500 truncate">{category.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Scripts */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Scripts Recentes</h3>
            <Link to="/search" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {recentScripts.map((script) => (
              <div key={script.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{script.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {script.category}
                    </span>
                    <span>•</span>
                    <span>há {formatRelativeTime(script.lastUsed)}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/search"
            className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Search className="w-5 h-5" />
            <span className="font-medium">Buscar Scripts</span>
          </Link>
          
          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <Link
              to="/scripts/create"
              className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Novo Script</span>
            </Link>
          )}
          
          <Link
            to="/scripts/atendimento"
            className="flex items-center gap-3 p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium">Scripts de Atendimento</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

