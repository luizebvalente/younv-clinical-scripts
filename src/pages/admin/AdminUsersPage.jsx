import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Users,
  Shield,
  Building2,
  Mail,
  Phone
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Toast from '../../components/ui/Toast';
import userService from '../../services/userService';
import { useClinics } from '../../hooks/useClinics';
import { USER_ROLES } from '../../types';

const AdminUsersPage = () => {
  const { hasPermission, userData } = useAuth();
  const { clinics } = useClinics();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [toast, setToast] = useState(null);

  // Check permissions
  if (!hasPermission(['admin', 'super_admin'])) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">
          <Users className="w-16 h-16 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Acesso Negado
        </h1>
        <p className="text-gray-600">
          Apenas administradores podem gerenciar usuários.
        </p>
      </div>
    );
  }

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let result;
      if (hasPermission('super_admin')) {
        result = await userService.getAllUsers();
      } else {
        result = await userService.getUsersByClinic(userData.clinicId);
      }
      
      setUsers(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleToggleStatus = async (user) => {
    try {
      if (user.isActive) {
        await userService.deactivateUser(user.id);
        setToast({
          type: 'success',
          message: `Usuário ${user.name} desativado com sucesso!`
        });
      } else {
        await userService.activateUser(user.id);
        setToast({
          type: 'success',
          message: `Usuário ${user.name} ativado com sucesso!`
        });
      }
      await loadUsers();
    } catch (error) {
      setToast({
        type: 'error',
        message: error.message
      });
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
      return;
    }

    try {
      await userService.deleteUser(user.id);
      setToast({
        type: 'success',
        message: `Usuário ${user.name} excluído com sucesso!`
      });
      await loadUsers();
    } catch (error) {
      setToast({
        type: 'error',
        message: error.message
      });
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const getRoleLabel = (role) => {
    const labels = {
      [USER_ROLES.USER]: 'Usuário',
      [USER_ROLES.ADMIN]: 'Administrador',
      [USER_ROLES.SUPER_ADMIN]: 'Super Admin'
    };
    return labels[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      [USER_ROLES.USER]: 'bg-blue-100 text-blue-800',
      [USER_ROLES.ADMIN]: 'bg-green-100 text-green-800',
      [USER_ROLES.SUPER_ADMIN]: 'bg-purple-100 text-purple-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getClinicName = (clinicId) => {
    const clinic = clinics.find(c => c.id === clinicId);
    return clinic ? clinic.name : 'N/A';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
              <Users className="w-8 h-8 text-blue-600" />
              Gerenciar Usuários
            </h1>
            <p className="text-gray-600 mt-2">
              {hasPermission('super_admin') 
                ? 'Gerencie todos os usuários do sistema'
                : 'Gerencie os usuários da sua clínica'
              }
            </p>
          </div>
          <button
            onClick={handleCreateUser}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Novo Usuário
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar usuários por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
              <p className="text-2xl font-bold text-green-600">
                {users.filter(u => u.isActive).length}
              </p>
            </div>
            <Eye className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Administradores</p>
              <p className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.role === USER_ROLES.ADMIN || u.role === USER_ROLES.SUPER_ADMIN).length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resultados</p>
              <p className="text-2xl font-bold text-gray-900">{filteredUsers.length}</p>
            </div>
            <Search className="w-8 h-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Lista de Usuários ({filteredUsers.length})
          </h2>
        </div>
        
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Tente ajustar os termos de busca'
                : 'Comece criando seu primeiro usuário'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreateUser}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
              >
                <Plus className="w-5 h-5" />
                Criar Primeiro Usuário
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </p>
                      {hasPermission('super_admin') && (
                        <p className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          {getClinicName(user.clinicId)}
                        </p>
                      )}
                      {user.lastLogin && (
                        <p className="text-xs text-gray-500">
                          Último login: {new Date(user.lastLogin.toDate()).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar usuário"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`p-2 rounded-lg transition-colors ${
                        user.isActive
                          ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                          : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                      }`}
                      title={user.isActive ? 'Desativar usuário' : 'Ativar usuário'}
                    >
                      {user.isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    {hasPermission('super_admin') && (
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir usuário"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <UserModal
          user={editingUser}
          clinics={clinics}
          currentUserRole={userData.role}
          onClose={() => setShowModal(false)}
          onSave={async (userData) => {
            try {
              if (editingUser) {
                await userService.updateUser(editingUser.id, userData);
                showToast('success', 'Usuário atualizado com sucesso!');
              } else {
                await userService.createUser(userData);
                showToast('success', 'Usuário criado com sucesso!');
              }
              setShowModal(false);
              await loadUsers();
            } catch (error) {
              showToast('error', error.message);
            }
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

// Modal component for creating/editing users
const UserModal = ({ user, clinics, currentUserRole, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || USER_ROLES.USER,
    clinicId: user?.clinicId || '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user && formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    if (!user && formData.password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const userData = { ...formData };
      delete userData.confirmPassword;
      
      if (user) {
        // Don't send password if editing and it's empty
        if (!userData.password) {
          delete userData.password;
        }
      }
      
      await onSave(userData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const canEditRole = currentUserRole === USER_ROLES.SUPER_ADMIN;
  const canSelectClinic = currentUserRole === USER_ROLES.SUPER_ADMIN;

  return (
    <Modal onClose={onClose} title={user ? 'Editar Usuário' : 'Novo Usuário'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: João Silva"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="joao@clinica.com.br"
          />
        </div>

        {canEditRole && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Função
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={USER_ROLES.USER}>Usuário</option>
              <option value={USER_ROLES.ADMIN}>Administrador</option>
              <option value={USER_ROLES.SUPER_ADMIN}>Super Administrador</option>
            </select>
          </div>
        )}

        {canSelectClinic && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clínica *
            </label>
            <select
              required
              value={formData.clinicId}
              onChange={(e) => handleChange('clinicId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione uma clínica</option>
              {clinics.map(clinic => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {user ? 'Nova Senha (deixe em branco para manter a atual)' : 'Senha *'}
          </label>
          <input
            type="password"
            required={!user}
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        {(!user || formData.password) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Senha *
            </label>
            <input
              type="password"
              required={!user || formData.password}
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite a senha novamente"
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : (user ? 'Atualizar' : 'Criar')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AdminUsersPage;

