import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useClinics } from '../../hooks/useClinics';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Building2,
  Users,
  FileText,
  Calendar
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';

const AdminClinicsPage = () => {
  const { hasPermission } = useAuth();
  const { 
    clinics, 
    loading, 
    error, 
    createClinic, 
    updateClinic, 
    deactivateClinic, 
    activateClinic 
  } = useClinics();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClinic, setEditingClinic] = useState(null);
  
  // Using the existing toast hook
  const { showSuccess, showError } = useToast();

  // Check permissions
  if (!hasPermission('super_admin')) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">
          <Building2 className="w-16 h-16 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Acesso Negado
        </h1>
        <p className="text-gray-600">
          Apenas super administradores podem gerenciar clínicas.
        </p>
      </div>
    );
  }

  // Filter clinics based on search
  const filteredClinics = clinics.filter(clinic =>
    clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinic.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateClinic = () => {
    console.log('🏥 Abrindo modal para criar nova clínica');
    setEditingClinic(null);
    setShowModal(true);
  };

  const handleEditClinic = (clinic) => {
    console.log('✏️ Abrindo modal para editar clínica:', clinic.name);
    setEditingClinic(clinic);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    console.log('❌ Fechando modal');
    setShowModal(false);
    setEditingClinic(null);
  };

  const handleSaveClinic = async (clinicData) => {
    try {
      console.log('💾 Salvando clínica:', clinicData);
      
      if (editingClinic) {
        await updateClinic(editingClinic.id, clinicData);
        showSuccess(`Clínica "${clinicData.name}" atualizada com sucesso!`);
      } else {
        await createClinic(clinicData);
        showSuccess(`Clínica "${clinicData.name}" criada com sucesso!`);
      }
      
      setShowModal(false);
      setEditingClinic(null);
    } catch (error) {
      console.error('❌ Erro ao salvar clínica:', error);
      showError(error.message);
    }
  };

  const handleToggleStatus = async (clinic) => {
    try {
      if (clinic.isActive) {
        await deactivateClinic(clinic.id);
        showSuccess(`Clínica "${clinic.name}" desativada com sucesso!`);
      } else {
        await activateClinic(clinic.id);
        showSuccess(`Clínica "${clinic.name}" ativada com sucesso!`);
      }
    } catch (error) {
      showError(error.message);
    }
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
              <Building2 className="w-8 h-8 text-blue-600" />
              Gerenciar Clínicas
            </h1>
            <p className="text-gray-600 mt-2">
              Gerencie todas as clínicas do sistema
            </p>
          </div>
          <button
            onClick={handleCreateClinic}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nova Clínica
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar clínicas por nome ou email..."
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
              <p className="text-sm font-medium text-gray-600">Total de Clínicas</p>
              <p className="text-2xl font-bold text-gray-900">{clinics.length}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clínicas Ativas</p>
              <p className="text-2xl font-bold text-green-600">
                {clinics.filter(c => c.isActive).length}
              </p>
            </div>
            <Eye className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clínicas Inativas</p>
              <p className="text-2xl font-bold text-red-600">
                {clinics.filter(c => !c.isActive).length}
              </p>
            </div>
            <EyeOff className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resultados</p>
              <p className="text-2xl font-bold text-gray-900">{filteredClinics.length}</p>
            </div>
            <Search className="w-8 h-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Clinics List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Lista de Clínicas ({filteredClinics.length})
          </h2>
        </div>
        
        {filteredClinics.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhuma clínica encontrada' : 'Nenhuma clínica cadastrada'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Tente ajustar os termos de busca'
                : 'Comece criando sua primeira clínica'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreateClinic}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
              >
                <Plus className="w-5 h-5" />
                Criar Primeira Clínica
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredClinics.map((clinic) => (
              <div key={clinic.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {clinic.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        clinic.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {clinic.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Email:</span>
                        {clinic.email}
                      </p>
                      {clinic.phone && (
                        <p className="flex items-center gap-2">
                          <span className="font-medium">Telefone:</span>
                          {clinic.phone}
                        </p>
                      )}
                      {clinic.address && (
                        <p className="flex items-center gap-2">
                          <span className="font-medium">Endereço:</span>
                          {clinic.address}
                        </p>
                      )}
                      {clinic.createdAt && (
                        <p className="text-xs text-gray-500">
                          Criada em: {clinic.createdAt.toDate ? 
                            clinic.createdAt.toDate().toLocaleDateString('pt-BR') : 
                            new Date(clinic.createdAt).toLocaleDateString('pt-BR')
                          }
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClinic(clinic)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar clínica"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(clinic)}
                      className={`p-2 rounded-lg transition-colors ${
                        clinic.isActive
                          ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                          : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                      }`}
                      title={clinic.isActive ? 'Desativar clínica' : 'Ativar clínica'}
                    >
                      {clinic.isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <ClinicModal
          isOpen={showModal}
          clinic={editingClinic}
          onClose={handleCloseModal}
          onSave={handleSaveClinic}
        />
      )}
    </div>
  );
};

// Modal component for creating/editing clinics
const ClinicModal = ({ isOpen, clinic, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: clinic?.name || '',
    email: clinic?.email || '',
    phone: clinic?.phone || '',
    address: clinic?.address || '',
    settings: {
      theme: clinic?.settings?.theme || 'blue',
      logo: clinic?.settings?.logo || null
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when clinic changes
  React.useEffect(() => {
    if (clinic) {
      setFormData({
        name: clinic.name || '',
        email: clinic.email || '',
        phone: clinic.phone || '',
        address: clinic.address || '',
        settings: {
          theme: clinic.settings?.theme || 'blue',
          logo: clinic.settings?.logo || null
        }
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        settings: {
          theme: 'blue',
          logo: null
        }
      });
    }
    setErrors({});
  }, [clinic]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da clínica é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email deve ter um formato válido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Erro ao salvar clínica:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <Modal 
      isOpen={isOpen}
      onClose={onClose} 
      title={clinic ? 'Editar Clínica' : 'Nova Clínica'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome da Clínica *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Clínica São Lucas"
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
            placeholder="contato@clinica.com.br"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefone *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="(11) 3456-7890"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Endereço *
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Rua das Flores, 123 - São Paulo, SP"
          />
          {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tema
          </label>
          <select
            value={formData.settings.theme}
            onChange={(e) => handleChange('settings.theme', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="blue">Azul</option>
            <option value="green">Verde</option>
            <option value="purple">Roxo</option>
            <option value="red">Vermelho</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {isSubmitting ? 'Salvando...' : (clinic ? 'Atualizar' : 'Criar')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AdminClinicsPage;
