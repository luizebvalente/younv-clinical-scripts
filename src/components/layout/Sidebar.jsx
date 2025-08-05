import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  X, 
  Home, 
  FileText, 
  Phone, 
  Scissors, 
  Stethoscope, 
  MessageCircle, 
  Calendar, 
  Clock,
  Settings,
  Users,
  Building2,
  Shield,
  BarChart3,
  Search,
  Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DEFAULT_CATEGORIES } from '../../types';

const Sidebar = ({ isOpen, onClose }) => {
  const { userData, hasPermission } = useAuth();
  const location = useLocation();

  const getIconComponent = (iconName) => {
    const icons = {
      Phone,
      Scissors,
      Stethoscope,
      MessageCircle,
      Calendar,
      Clock,
      FileText
    };
    return icons[iconName] || FileText;
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      show: true
    },
    {
      name: 'Buscar Scripts',
      href: '/search',
      icon: Search,
      show: true
    }
  ];

  const adminItems = [
    {
      name: 'Painel Admin',
      href: '/admin',
      icon: Shield,
      show: hasPermission('super_admin')
    },
    {
      name: 'Gerenciar Clínicas',
      href: '/admin/clinics',
      icon: Building2,
      show: hasPermission('super_admin')
    },
    {
      name: 'Usuários',
      href: '/admin/users',
      icon: Users,
      show: hasPermission('admin')
    },
    {
      name: 'Relatórios',
      href: '/admin/reports',
      icon: BarChart3,
      show: hasPermission('admin')
    },
    {
      name: 'Configurações',
      href: '/settings',
      icon: Settings,
      show: true
    }
  ];

  const isActiveLink = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Younv</h2>
              <p className="text-xs text-gray-500">Clinical Scripts</p>
            </div>
          </div>
          
          {/* Close button (mobile only) */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Main Navigation */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Navegação
            </h3>
            <ul className="space-y-1">
              {navigationItems.filter(item => item.show).map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive || isActiveLink(item.href)
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`
                      }
                      onClick={onClose}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Script Categories */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Categorias
              </h3>
              {hasPermission('admin') && (
                <button className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>
            <ul className="space-y-1">
              {DEFAULT_CATEGORIES.map((category) => {
                const Icon = getIconComponent(category.icon);
                const href = `/scripts/${category.id}`;
                return (
                  <li key={category.id}>
                    <NavLink
                      to={href}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive || isActiveLink(href)
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`
                      }
                      onClick={onClose}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {category.description}
                        </div>
                      </div>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Admin Section */}
          {adminItems.some(item => item.show) && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Administração
              </h3>
              <ul className="space-y-1">
                {adminItems.filter(item => item.show).map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive || isActiveLink(item.href)
                              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`
                        }
                        onClick={onClose}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        {item.name}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              © 2024 Younv Clinical Scripts
            </p>
            <p className="text-xs text-gray-400 mt-1">
              v1.0.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

