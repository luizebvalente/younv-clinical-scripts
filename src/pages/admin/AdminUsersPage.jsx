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
  Phone,
  Save,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import userService from '../../services/userService';
import { useClinics } from '../../hooks/useClinics';
import { USER_ROLES } from '../../types';

const AdminUsersPage = () => {
  const { hasPermission, userData } = useAuth();
  const { clinics, loading: clinicsLoading } = useClinics();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClinic, setSelectedClinic] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
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
      
      // Enriquecer usuários com nome da clínica
      const enrichedUsers = result.map(user => ({
        ...user,
        clinicName: clinics.find(c => c.id === user.clinicId)?.name || 'Clínica não encontrada'
      }));
      
      setUsers(enrichedUsers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClinic = !selectedClinic || user.clinicId === selectedClinic;
    const matchesRole = !selectedRole || user.role === selectedRole;
    
    return matchesSearch && matchesClinic && matchesRole;
  });

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
        showToast('success', `Usuário ${user.name} desativado com sucesso!`);
      } else {
        await userService.activateUser(user.id);
        showToast('success', `Usuário ${user.name} ativado com sucesso!`);
      }
      await loadUsers();
    } catch (error) {
      showToast('error', error.message);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
      return;
    }

    try {
      await userService.deleteUser(user.id);
      showToast('success', `Usuário ${user.name} excluído com sucesso!`);
      await loadUsers();
    } catch (error) {
      showToast('error', error.message);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
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

  const getClinicStats = () => {
    const stats = {};
    
    // Se for super admin, mostrar stats de todas as clínicas
    if (hasPermission('super_admin')) {
      clinics.forEach(clinic => {
        const clinicUsers = users.filter(u => u.clinicId === clinic.id);
        stats[clinic.id] = {
          total: clinicUsers.length,
          active: clinicUsers.filter(u => u.isActive).length,
          admins: clinicUsers.filter(u => u.role === USER_ROLES.ADMIN).length,
          users: clinicUsers.filter(u => u.role === USER_ROLES.USER).length
        };
      });
    } else {
      // Se for admin comum, mostrar apenas da sua clínica
      const clinic = clinics.find(c => c.id === userData.clinicId);
      if (clinic) {
        const clinicUsers = users.filter(u => u.clinicId === clinic.id);
        stats[clinic.id] = {
          total: clinicUsers.length,
          active: clinicUsers.filter(u => u.isActive).length,
          admins: clinicUsers.filter(u => u.role === USER_ROLES.ADMIN).length,
          users: clinicUsers.filter(u => u.role === USER_ROLES.USER).length
        };
      }
    }
    
    return stats;
  };

  const clinicStats = getClinicStats();
  const displayClinics = hasPermission('super_admin') ? clinics : clinics.filter(c => c.id === userData.clinicId);

  if (loading || clinicsLoading) {
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
                ? 'Gerencie todos os usuários do sistema por clínica'
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

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {hasPermission('super_admin') && (
            <select
              value={selectedClinic}
              onChange={(e) => setSelectedClinic(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as clínicas</option>
              {clinics.map(clinic => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as funções</option>
            <option value={USER_ROLES.USER}>Usuários</option>
            <option value={USER_ROLES.ADMIN}>Administradores</option>
            {hasPermission('super_admin') && (
              <option value={USER_ROLES.SUPER_ADMIN}>Super Admins</option>
            )}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          toast.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Estatísticas por Clínica */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {displayClinics.map(clinic => {
          const stats = clinicStats[clinic.id] || { total: 0, active: 0, admins: 0, users: 0 };
          return (
            <div key={clinic.id} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  {clinic.name}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <div>
                  <p className="text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div>
                  <p className="text-gray-600">Admins</p>
                  <p className="text-lg font-semibold text-purple-600">{stats.admins}</p>
                </div>
                <div>
                  <p className="text-gray-600">Usuários</p>
                  <p className="text-lg font-semibold text-blue-600">{stats.users}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lista de Usuários */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Usuários Cadastrados ({filteredUsers.length})
          </h2>
        </div>
        
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedClinic || selectedRole ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedClinic || selectedRole 
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando o primeiro usuário'
              }
            </p>
            {!searchTerm && !selectedClinic && !selectedRole && (
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
                          {user.clinicName}
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

      {/* Modal para Criar/Editar */}
      {showModal && (
        <UserModal
          user={editingUser}
          clinics={clinics}
          currentUserRole={userData.role}
          currentUserClinicId={userData.clinicId}
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
    </div>
  );
};

// Modal component for creating/editing users
const UserModal = ({ user, clinics, currentUserRole, currentUserClinicId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || USER_ROLES.USER,
    clinicId: user?.clinicId || (currentUserRole === USER_ROLES.ADMIN ? currentUserClinicId : ''),
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email deve ter um formato válido';
    }

    if (!formData.clinicId) {
      newErrors.clinicId = 'Clínica é obrigatória';
    }

    // Validação de senha para novos usuários
    if (!user) {
      if (!formData.password) {
        newErrors.password = 'Senha é obrigatória';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Senhas não coincidem';
      }
    } else if (formData.password) {
      // Validação de senha para usuários existentes (opcional)
      if (formData.password.length < 6) {
        newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Senhas não coincidem';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const userData = { ...formData };
      delete userData.confirmPassword;
      
      // Se editando e senha vazia, não incluir senha
      if (user && !userData.password) {
        delete userData.password;
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

    // Limpar erro quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const canEditRole = currentUserRole === USER_ROLES.SUPER_ADMIN;
  const canSelectClinic = currentUserRole === USER_ROLES.SUPER_ADMIN;
  const availableClinics = canSelectClinic ? clinics : clinics.filter(c => c.id === currentUserClinicId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Dr. João Silva"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="joao@clinica.com.br"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clínica *
            </label>
            <select
              value={formData.clinicId}
              onChange={(e) => handleChange('clinicId', e.target.value)}
              disabled={!canSelectClinic}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.clinicId ? 'border-red-500' : 'border-gray-300'
              } ${!canSelectClinic ? 'bg-gray-100' : ''}`}
            >
              <option value="">Selecione uma clínica</option>
              {availableClinics.map(clinic => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </select>
            {errors.clinicId && <p className="mt-1 text-sm text-red-600">{errors.clinicId}</p>}
            {!canSelectClinic && (
              <p className="mt-1 text-sm text-gray-500">
                Como administrador, você só pode criar usuários para sua clínica
              </p>
            )}
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
                <option value={USER_ROLES.ADMIN}>Administrador da Clínica</option>
                <option value={USER_ROLES.SUPER_ADMIN}>Super Administrador</option>
              </select>
              <div className="mt-1 text-sm text-gray-500">
                {formData.role === USER_ROLES.USER && 'Acesso apenas aos scripts da clínica selecionada'}
                {formData.role === USER_ROLES.ADMIN && 'Controle total da clínica selecionada (criar/editar scripts e usuários)'}
                {formData.role === USER_ROLES.SUPER_ADMIN && 'Acesso total ao sistema, incluindo todas as clínicas'}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {user ? 'Nova Senha (deixe em branco para manter a atual)' : 'Senha *'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Mínimo 6 caracteres"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          {(!user || formData.password) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha *
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Digite a senha novamente"
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Salvando...' : (user ? 'Atualizar' : 'Criar')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
