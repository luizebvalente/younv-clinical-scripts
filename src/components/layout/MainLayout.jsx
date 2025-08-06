import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  LogOut, 
  User, 
  Settings, 
  Bell,
  Search,
  ChevronDown,
  Building2,
  Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import { getInitials, generateAvatarColor } from '../../utils';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      'super_admin': 'Super Admin',
      'admin': 'Administrador',
      'user': 'Usuário'
    };
    return labels[role] || role;
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/admin')) return 'Painel Administrativo';
    if (path.includes('/scripts')) return 'Scripts';
    if (path.includes('/categories')) return 'Categorias';
    if (path.includes('/settings')) return 'Configurações';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="medical-header sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                type="button"
                className="lg:hidden p-2 rounded-md text-white hover:bg-blue-700 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Page title */}
              <div>
                <h1 className="text-xl font-semibold text-white">
                  {getPageTitle()}
                </h1>
                {userData?.clinicId && (
                  <p className="text-blue-100 text-sm">
                    {userData.clinicName || 'Clínica'}
                  </p>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Search button (mobile) */}
              <button className="lg:hidden p-2 rounded-md text-white hover:bg-blue-700 transition-colors">
                <Search className="h-5 w-5" />
              </button>

              {/* Notifications */}
              <button className="p-2 rounded-md text-white hover:bg-blue-700 transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  className="flex items-center gap-3 p-2 rounded-md text-white hover:bg-blue-700 transition-colors"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  {/* Avatar */}
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white"
                    style={{ backgroundColor: generateAvatarColor(userData?.name) }}
                  >
                    {getInitials(userData?.name)}
                  </div>
                  
                  {/* User info (hidden on mobile) */}
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium">{userData?.name}</p>
                    <p className="text-xs text-blue-100">{getRoleLabel(userData?.role)}</p>
                  </div>
                  
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{userData?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getRoleLabel(userData?.role)}
                        </span>
                        {userData?.role === 'super_admin' && (
                          <Shield className="h-3 w-3 text-blue-600" />
                        )}
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <button
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setUserMenuOpen(false);
                          navigate('/profile');
                        }}
                      >
                        <User className="h-4 w-4" />
                        Meu Perfil
                      </button>

                      {userData?.clinicId && (
                        <button
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            setUserMenuOpen(false);
                            navigate('/clinic');
                          }}
                        >
                          <Building2 className="h-4 w-4" />
                          Minha Clínica
                        </button>
                      )}

                      <button
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setUserMenuOpen(false);
                          navigate('/settings');
                        }}
                      >
                        <Settings className="h-4 w-4" />
                        Configurações
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 py-1">
                      <button
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;

