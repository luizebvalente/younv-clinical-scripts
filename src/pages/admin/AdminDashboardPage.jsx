import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Building2, 
  TrendingUp, 
  Activity,
  Clock,
  Plus,
  ArrowRight,
  BarChart3,
  PieChart,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { formatRelativeTime } from '../../utils';

const AdminDashboardPage = () => {
  const { userData, hasPermission } = useAuth();
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for admin dashboard
  const mockStats = {
    totalClinics: 12,
    totalUsers: 48,
    totalScripts: 156,
    activeScripts: 142,
    totalUsage: 2847,
    monthlyGrowth: 15.3,
    topCategories: [
      { name: 'Atendimento', count: 45, percentage: 28.8 },
      { name: 'Cirurgia', count: 32, percentage: 20.5 },
      { name: 'Follow-up', count: 28, percentage: 17.9 },
      { name: 'Consulta', count: 25, percentage: 16.0 },
      { name: 'Agendamento', count: 26, percentage: 16.7 }
    ]
  };

  const mockRecentActivity = [
    {
      id: '1',
      type: 'script_created',
      title: 'Novo script criado',
      description: 'Dr. Silva criou "Orientações Pós-Cirúrgicas"',
      clinic: 'Clínica São Lucas',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      icon: FileText,
      color: 'text-green-600 bg-green-100'
    },
    {
      id: '2',
      type: 'user_registered',
      title: 'Novo usuário cadastrado',
      description: 'Maria Santos foi adicionada como recepcionista',
      clinic: 'Clínica Vida Nova',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: Users,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: '3',
      type: 'clinic_created',
      title: 'Nova clínica cadastrada',
      description: 'Clínica Bem Estar foi adicionada ao sistema',
      clinic: 'Sistema',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      icon: Building2,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      id: '4',
      type: 'high_usage',
      title: 'Alto uso de script',
      description: 'Script "Primeiro Contato" usado 50+ vezes hoje',
      clinic: 'Clínica São Lucas',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      icon: TrendingUp,
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats(mockStats);
      setRecentActivity(mockRecentActivity);
      setIsLoading(false);
    }, 500);
  }, []);

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'text-blue-600 bg-blue-100' }) => (
    <div className="medical-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Painel Administrativo
            </h1>
            <p className="text-purple-100">
              Gerencie todo o sistema Younv Clinical Scripts
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center">
              <BarChart3 className="w-10 h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Clínicas"
          value={isLoading ? '...' : stats.totalClinics}
          subtitle="Cadastradas no sistema"
          icon={Building2}
          color="text-purple-600 bg-purple-100"
        />
        
        <StatCard
          title="Total de Usuários"
          value={isLoading ? '...' : stats.totalUsers}
          subtitle="Ativos no sistema"
          icon={Users}
          color="text-blue-600 bg-blue-100"
        />
        
        <StatCard
          title="Total de Scripts"
          value={isLoading ? '...' : stats.totalScripts}
          subtitle={`${stats.activeScripts} ativos`}
          icon={FileText}
          color="text-green-600 bg-green-100"
        />
        
        <StatCard
          title="Uso Total"
          value={isLoading ? '...' : stats.totalUsage?.toLocaleString()}
          subtitle="Scripts utilizados"
          icon={TrendingUp}
          trend={stats.monthlyGrowth}
          color="text-orange-600 bg-orange-100"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Categories */}
        <div className="medical-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Categorias Mais Usadas
            </h2>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {stats.topCategories?.map((category, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {category.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {category.count} scripts
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Link
              to="/admin/analytics"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              Ver relatório completo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="medical-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Atividade Recente
            </h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-start gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{activity.clinic}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Link
              to="/admin/activity"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              Ver todas as atividades
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="medical-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Ações Rápidas
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/scripts/new"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Plus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Novo Script</h3>
              <p className="text-sm text-gray-500">Criar script global</p>
            </div>
          </Link>

          <Link
            to="/admin/clinics/new"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Nova Clínica</h3>
              <p className="text-sm text-gray-500">Cadastrar clínica</p>
            </div>
          </Link>

          <Link
            to="/admin/users/new"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Novo Usuário</h3>
              <p className="text-sm text-gray-500">Cadastrar usuário</p>
            </div>
          </Link>

          <Link
            to="/admin/reports"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Relatórios</h3>
              <p className="text-sm text-gray-500">Análises detalhadas</p>
            </div>
          </Link>
        </div>
      </div>

      {/* System Alerts */}
      <div className="medical-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Alertas do Sistema
          </h2>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Scripts inativos detectados
              </p>
              <p className="text-sm text-yellow-700">
                14 scripts não foram utilizados nos últimos 30 dias. 
                <Link to="/admin/scripts?filter=inactive" className="font-medium underline ml-1">
                  Revisar scripts
                </Link>
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Backup automático agendado
              </p>
              <p className="text-sm text-blue-700">
                Próximo backup do sistema será executado em 2 dias.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

