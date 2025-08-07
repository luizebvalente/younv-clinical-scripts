import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { USER_ROLES } from '../types';

const SetupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dados da clínica
  const [clinicData, setClinicData] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });
  
  // Dados do usuário administrador
  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleClinicSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Validações básicas
    if (!clinicData.name.trim()) {
      setError('Nome da clínica é obrigatório');
      return;
    }
    
    if (!clinicData.email.trim()) {
      setError('Email da clínica é obrigatório');
      return;
    }
    
    setStep(2);
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Validações
      if (!adminData.name.trim()) {
        throw new Error('Nome do administrador é obrigatório');
      }
      
      if (!adminData.email.trim()) {
        throw new Error('Email do administrador é obrigatório');
      }
      
      if (adminData.password.length < 6) {
        throw new Error('Senha deve ter pelo menos 6 caracteres');
      }
      
      if (adminData.password !== adminData.confirmPassword) {
        throw new Error('Senhas não coincidem');
      }

      console.log('🚀 Iniciando setup do sistema...');

      // 1. Criar usuário no Firebase Auth
      console.log('👤 Criando usuário administrador...');
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        adminData.email, 
        adminData.password
      );
      
      const user = userCredential.user;

      // 2. Atualizar perfil do usuário
      await updateProfile(user, {
        displayName: adminData.name
      });

      // 3. Criar clínica no Firestore
      console.log('🏥 Criando clínica...');
      const clinicId = `clinic-${Date.now()}`;
      
      await setDoc(doc(db, 'clinics', clinicId), {
        id: clinicId,
        name: clinicData.name,
        address: clinicData.address || '',
        phone: clinicData.phone || '',
        email: clinicData.email,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 4. Criar usuário administrador no Firestore
      console.log('👨‍💼 Criando dados do administrador...');
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: adminData.email,
        name: adminData.name,
        clinicId: clinicId,
        role: USER_ROLES.ADMIN,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: null,
        needsPasswordChange: false
      });

      // 5. Marcar setup como concluído
      console.log('✅ Marcando setup como concluído...');
      await setDoc(doc(db, 'system', 'setup'), {
        completed: true,
        completedAt: serverTimestamp(),
        firstClinicId: clinicId,
        firstAdminId: user.uid
      });

      console.log('🎉 Setup concluído com sucesso!');
      
      // Redirecionar para dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('❌ Erro no setup:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Configuração Inicial
          </h1>
          <p className="text-gray-600">
            Configure sua clínica e crie o primeiro usuário administrador
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Step 1: Clinic Information */}
        {step === 1 && (
          <form onSubmit={handleClinicSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Informações da Clínica
              </h2>
              <p className="text-gray-600 text-sm">
                Preencha os dados básicos da sua clínica
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Clínica *
              </label>
              <input
                type="text"
                required
                value={clinicData.name}
                onChange={(e) => setClinicData({ ...clinicData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Clínica São Lucas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email da Clínica *
              </label>
              <input
                type="email"
                required
                value={clinicData.email}
                onChange={(e) => setClinicData({ ...clinicData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="contato@clinica.com.br"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                value={clinicData.phone}
                onChange={(e) => setClinicData({ ...clinicData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(11) 1234-5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço
              </label>
              <textarea
                value={clinicData.address}
                onChange={(e) => setClinicData({ ...clinicData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Endereço completo da clínica"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Próximo
            </button>
          </form>
        )}

        {/* Step 2: Admin User */}
        {step === 2 && (
          <form onSubmit={handleAdminSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Usuário Administrador
              </h2>
              <p className="text-gray-600 text-sm">
                Crie o primeiro usuário administrador da clínica
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={adminData.name}
                onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={adminData.email}
                onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha *
              </label>
              <input
                type="password"
                required
                value={adminData.password}
                onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
                minLength="6"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha *
              </label>
              <input
                type="password"
                required
                value={adminData.confirmPassword}
                onChange={(e) => setAdminData({ ...adminData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite a senha novamente"
                minLength="6"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                disabled={loading}
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Configurando...' : 'Finalizar Setup'}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            YouNV Clinical Scripts v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;

