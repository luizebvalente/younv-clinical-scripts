import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, AlertTriangle } from 'lucide-react';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredClinicAccess = null,
  fallbackPath = '/login'
}) => {
  const { user, userData, loading, hasPermission, canAccessClinic } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user || !userData) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check if user account is active
  if (!userData.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="medical-card p-8 text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Conta Inativa
          </h1>
          <p className="text-gray-600 mb-4">
            Sua conta foi desativada. Entre em contato com o administrador.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  // Check role-based permissions
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const userHasPermission = allowedRoles.includes(userData.role) || userData.role === 'super_admin';
    
    if (!userHasPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="medical-card p-8 text-center max-w-md">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Acesso Negado
            </h1>
            <p className="text-gray-600 mb-4">
              Você não tem permissão para acessar esta página.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>Seu nível: <span className="font-medium">{userData.role}</span></p>
              <p>Necessário: <span className="font-medium">{Array.isArray(requiredRole) ? requiredRole.join(' ou ') : requiredRole}</span></p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      );
    }
  }

  // Check clinic access permissions
  if (requiredClinicAccess && !canAccessClinic(requiredClinicAccess)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="medical-card p-8 text-center max-w-md">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Acesso Restrito
          </h1>
          <p className="text-gray-600 mb-4">
            Você não tem acesso aos dados desta clínica.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // All checks passed, render the protected content
  return children;
};

// Higher-order component for easier usage
export const withAuth = (Component, options = {}) => {
  return function AuthenticatedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

// Specific route protectors for common use cases
export const SuperAdminRoute = ({ children }) => (
  <ProtectedRoute requiredRole="super_admin">
    {children}
  </ProtectedRoute>
);

export const AdminRoute = ({ children }) => (
  <ProtectedRoute requiredRole="admin">
    {children}
  </ProtectedRoute>
);

export const ClinicRoute = ({ children, clinicId }) => (
  <ProtectedRoute requiredClinicAccess={clinicId}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;

