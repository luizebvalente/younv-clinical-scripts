import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  Plus,
  FolderPlus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_CATEGORIES } from '../types';
import categoryService from '../services/categoryService';

const Sidebar = ({ isOpen, onClose }) => {
  const { userData, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Carregar categorias
  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const allCategories = await categoryService.getAllCategoriesForUser();
      setCategories(allCategories);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (userData) {
      loadCategories();
    } else {
      setCategories(DEFAULT_CATEGORIES);
      setLoadingCategories(false);
    }
  }, [userData]);

  // Event listener para atualizar categorias quando uma nova for criada
  useEffect(() => {
    const handleCategoryCreated = () => {
      console.log('🔄 Categoria criada/atualizada, recarregando sidebar...');
      loadCategories();
    };

    // Escutar evento customizado de categoria criada/atualizada
    window.addEventListener('categoryUpdated', handleCategoryCreated);

    return () => {
      window.removeEventListener('categoryUpdated', handleCategoryCreated);
    };
  }, [userData]);

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
      name: 'Categorias',
      href: '/categories/manage',
      icon: FolderPlus,
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

  const handleCreateScript = () => {
    console.log('➕ Navegando para criar novo script');
    navigate('/scripts/create');
    if (onClose) onClose();
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header - Fixo no topo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
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

        {/* Navigation - Área com scroll */}
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

          {/* Script Categories - COM SCROLL */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Categorias
              </h3>
              {hasPermission && (hasPermission('admin') || hasPermission('super_admin')) && (
                <button 
                  onClick={handleCreateScript}
                  className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Criar novo script"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {loadingCategories ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-10 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              // Container com altura máxima e scroll
              <div className="max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                <ul className="space-y-1">
                  {categories.map((category) => {
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
                          <div 
                            className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                            style={{ 
                              backgroundColor: category.color ? `${category.color}20` : '#3B82F620' 
                            }}
                          >
                            <Icon 
                              className="h-4 w-4" 
                              style={{ color: category.color || '#3B82F6' }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {category.name}
                              {category.isCustom && (
                                <span className="ml-1 text-xs opacity-70">★</span>
                              )}
                            </div>
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
            )}
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

        {/* Footer - Fixo no bottom */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
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

      {/* Estilo customizado para scrollbar */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f1f1;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
