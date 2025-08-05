import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Building2,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import userService from '../../services/userService';
import scriptService from '../../services/scriptService';
import clinicService from '../../services/clinicService';

const AdminReportsPage = () => {
  const { hasPermission, userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: null,
    scripts: null,
    clinics: null
  });
  const [dateRange, setDateRange] = useState('30'); // days

  // Check permissions
  if (!hasPermission(['admin', 'super_admin'])) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">
          <BarChart3 className="w-16 h-16 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Acesso Negado
        </h1>
        <p className="text-gray-600">
          Apenas administradores podem visualizar relatórios.
        </p>
      </div>
    );
  }

  useEffect(() => {
    loadStats();
  }, [dateRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      const userStats = await userService.getUserStats(
        hasPermission('super_admin') ? null : userData.clinicId
      );
      
      const scriptStats = await scriptService.getScriptStats(
        hasPermission('super_admin') ? null : userData.clinicId
      );

      let clinicStats = null;
      if (hasPermission('super_admin')) {
        // Get clinic stats for super admin
        clinicStats = {
          total: 0,
          active: 0,
          inactive: 0
        };
      }

      setStats({
        users: userStats,
        scripts: scriptStats,
        clinics: clinicStats
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Simple CSV export
    const csvData = [
      ['Métrica', 'Valor'],
      ['Total de Usuários', stats.users?.total || 0],
      ['Usuários Ativos', stats.users?.active || 0],
      ['Usuários Inativos', stats.users?.inactive || 0],
      ['Total de Scripts', stats.scripts?.total || 0],
      ['Scripts por Categoria', ''],
      ...Object.entries(stats.scripts?.byCategory || {}).map(([category, count]) => [
        `  ${category}`, count
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              Relatórios
            </h1>
            <p className="text-gray-600 mt-2">
              {hasPermission('super_admin') 
                ? 'Relatórios gerais do sistema'
                : 'Relatórios da sua clínica'
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="365">Último ano</option>
            </select>
            <button
              onClick={exportReport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="w-5 h-5" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900">{stats.users?.total || 0}</p>
              <p className="text-sm text-green-600 mt-1">
                {stats.users?.active || 0} ativos
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Scripts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.scripts?.total || 0}</p>
              <p className="text-sm text-blue-600 mt-1">
                {Object.keys(stats.scripts?.byCategory || {}).length} categorias
              </p>
            </div>
            <FileText className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {hasPermission('super_admin') && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Clínicas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.clinics?.total || 0}</p>
                <p className="text-sm text-green-600 mt-1">
                  {stats.clinics?.active || 0} ativas
                </p>
              </div>
              <Building2 className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Período</p>
              <p className="text-2xl font-bold text-gray-900">{dateRange}</p>
              <p className="text-sm text-gray-600 mt-1">dias</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users by Role */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Usuários por Função
          </h3>
          <div className="space-y-4">
            {Object.entries(stats.users?.byRole || {}).map(([role, count]) => {
              const total = stats.users?.total || 1;
              const percentage = Math.round((count / total) * 100);
              
              const roleLabels = {
                'user': 'Usuários',
                'admin': 'Administradores',
                'super_admin': 'Super Admins'
              };

              const roleColors = {
                'user': 'bg-blue-500',
                'admin': 'bg-green-500',
                'super_admin': 'bg-purple-500'
              };

              return (
                <div key={role}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {roleLabels[role] || role}
                    </span>
                    <span className="text-sm text-gray-600">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${roleColors[role] || 'bg-gray-500'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scripts by Category */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Scripts por Categoria
          </h3>
          <div className="space-y-4">
            {Object.entries(stats.scripts?.byCategory || {}).map(([category, count]) => {
              const total = stats.scripts?.total || 1;
              const percentage = Math.round((count / total) * 100);
              
              return (
                <div key={category}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {category}
                    </span>
                    <span className="text-sm text-gray-600">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Atividade Recente
          </h3>
          <div className="space-y-4">
            {stats.users?.recentlyCreated?.slice(0, 5).map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-600">Usuário criado</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {user.createdAt?.toDate ? 
                    new Date(user.createdAt.toDate()).toLocaleDateString() : 
                    'Data não disponível'
                  }
                </span>
              </div>
            ))}
            
            {(!stats.users?.recentlyCreated || stats.users.recentlyCreated.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhuma atividade recente encontrada</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Resumo do Período
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-blue-700 font-medium">Usuários</p>
            <p className="text-blue-600">
              {stats.users?.total || 0} total, {stats.users?.active || 0} ativos
            </p>
          </div>
          <div>
            <p className="text-blue-700 font-medium">Scripts</p>
            <p className="text-blue-600">
              {stats.scripts?.total || 0} total em {Object.keys(stats.scripts?.byCategory || {}).length} categorias
            </p>
          </div>
          {hasPermission('super_admin') && (
            <div>
              <p className="text-blue-700 font-medium">Clínicas</p>
              <p className="text-blue-600">
                {stats.clinics?.total || 0} total, {stats.clinics?.active || 0} ativas
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;

