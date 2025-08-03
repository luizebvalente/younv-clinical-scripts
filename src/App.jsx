import React from 'react';
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
import './App.css';

function App() {
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
                    <Route path="clinics" element={
                      <div className="p-8 text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                          Gerenciar Clínicas
                        </h1>
                        <p className="text-gray-600">
                          Esta página será implementada na próxima fase
                        </p>
                      </div>
                    } />
                    <Route path="users" element={
                      <div className="p-8 text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                          Gerenciar Usuários
                        </h1>
                        <p className="text-gray-600">
                          Esta página será implementada na próxima fase
                        </p>
                      </div>
                    } />
                    <Route path="reports" element={
                      <div className="p-8 text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                          Relatórios
                        </h1>
                        <p className="text-gray-600">
                          Esta página será implementada na próxima fase
                        </p>
                      </div>
                    } />
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

