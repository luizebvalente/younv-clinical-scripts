import React from 'react';
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

const DashboardPage = () => {
  const { user, userData, hasPermission } = useAuth();

  // Mock data for demonstration
  const stats = {
    totalScripts: 24,
    recentlyUsed: 8,
    totalCategories: 6,
    lastActivity: new Date()
  };

  const recentScripts = [
    {
      id: '1',
      title: 'Primeiro Contato - Telefone',
      category: 'Atendimento',
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      id: '2',
      title: 'Orientações Pré-Cirurgia',
      category: 'Cirurgia',
      lastUsed: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
    },
    {
      id: '3',
      title: 'Follow-up Pós-Consulta',
      category: 'Follow-up',
      lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    }
  ];

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

