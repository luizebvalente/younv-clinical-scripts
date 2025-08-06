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
import Toast from '../../components/ui/Toast';

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
  const [toast, setToast] = useState(null);

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
    setEditingClinic(null);
    setShowModal(true);
  };

  const handleEditClinic = (clinic) => {
    setEditingClinic(clinic);
    setShowModal(true);
  };

  const handleToggleStatus = async (clinic) => {
    try {
      if (clinic.isActive) {
        await deactivateClinic(clinic.id);
        setToast({
          type: 'success',
          message: `Clínica ${clinic.name} desativada com sucesso!`
        });
      } else {
        await activateClinic(clinic.id);
        setToast({
          type: 'success',
          message: `Clínica ${clinic.name} ativada com sucesso!`
        });
      }
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
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Telefone:</span>
                        {clinic.phone}
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Endereço:</span>
                        {clinic.address}
                      </p>
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
          clinic={editingClinic}
          onClose={() => setShowModal(false)}
          onSave={async (clinicData) => {
            try {
              if (editingClinic) {
                await updateClinic(editingClinic.id, clinicData);
                showToast('success', 'Clínica atualizada com sucesso!');
              } else {
                await createClinic(clinicData);
                showToast('success', 'Clínica criada com sucesso!');
              }
              setShowModal(false);
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

// Modal component for creating/editing clinics
const ClinicModal = ({ clinic, onClose, onSave }) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
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
  };

  return (
    <Modal onClose={onClose} title={clinic ? 'Editar Clínica' : 'Nova Clínica'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome da Clínica *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Clínica São Lucas"
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
            placeholder="contato@clinica.com.br"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefone *
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="(11) 3456-7890"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Endereço *
          </label>
          <textarea
            required
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Rua das Flores, 123 - São Paulo, SP"
          />
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
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : (clinic ? 'Atualizar' : 'Criar')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AdminClinicsPage;

