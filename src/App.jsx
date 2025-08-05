import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SearchPage from './pages/SearchPage';
import CategoryScriptsPage from './pages/CategoryScriptsPage';
import CreateScriptPage from './pages/CreateScriptPage';
import EditScriptPage from './pages/EditScriptPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminScriptsPage from './pages/admin/AdminScriptsPage';
import AdminClinicsPage from './pages/admin/AdminClinicsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import initializationService from './services/initializationService';
import './App.css';

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Inicializando Sistema
      </h2>
      <p className="text-gray-600">
        Configurando Firebase e dados iniciais...
      </p>
    </div>
  </div>
);

// Error component
const ErrorScreen = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
    <div className="text-center max-w-md mx-auto p-6">
      <div className="text-red-600 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Erro na Inicialização
      </h2>
      <p className="text-gray-600 mb-4">
        {error?.message || 'Ocorreu um erro ao inicializar o sistema'}
      </p>
      <button
        onClick={onRetry}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Tentar Novamente
      </button>
    </div>
  </div>
);

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState(null);

  const initializeSystem = async () => {
    try {
      setIsInitializing(true);
      setInitError(null);
      
      console.log('🚀 Iniciando aplicação...');
      
      // Initialize Firebase and create default data
      await initializationService.initialize();
      
      console.log('✅ Sistema inicializado com sucesso');
      setIsInitializing(false);
      
    } catch (error) {
      console.error('❌ Erro na inicialização:', error);
      setInitError(error);
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    initializeSystem();
  }, []);

  // Show loading screen during initialization
  if (isInitializing) {
    return <LoadingScreen />;
  }

  // Show error screen if initialization failed
  if (initError) {
    return <ErrorScreen error={initError} onRetry={initializeSystem} />;
  }

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              {/* Dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              
              {/* Scripts routes */}
              <Route path="scripts/:categoryId" element={<CategoryScriptsPage />} />
              <Route path="scripts/create" element={
                <ProtectedRoute requiredRole={['admin', 'super_admin']}>
                  <CreateScriptPage />
                </ProtectedRoute>
              } />
              <Route path="scripts/edit/:scriptId" element={
                <ProtectedRoute requiredRole={['admin', 'super_admin']}>
                  <EditScriptPage />
                </ProtectedRoute>
              } />
              
              <Route path="search" element={<SearchPage />} />
              
              {/* Admin routes */}
              <Route path="admin/*" element={
                <ProtectedRoute requiredRole={['admin', 'super_admin']}>
                  <Routes>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                    <Route path="scripts" element={<AdminScriptsPage />} />
                    <Route path="clinics" element={<AdminClinicsPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="reports" element={<AdminReportsPage />} />
                  </Routes>
                </ProtectedRoute>
              } />
              
              {/* Settings */}
              <Route path="settings" element={
                <div className="p-8 text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Configurações
                  </h1>
                  <p className="text-gray-600">
                    Esta página será implementada na próxima fase
                  </p>
                </div>
              } />
              
              {/* Profile */}
              <Route path="profile" element={
                <div className="p-8 text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Meu Perfil
                  </h1>
                  <p className="text-gray-600">
                    Esta página será implementada na próxima fase
                  </p>
                </div>
              } />
            </Route>
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

