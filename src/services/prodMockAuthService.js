/**
 * Serviço de autenticação simulada para produção
 * 
 * Este serviço simula a autenticação Firebase para ambientes de produção
 * onde não é possível configurar o Firebase Auth.
 */

import { USER_ROLES } from '../types';

// Usuários simulados
const mockUsers = [
  {
    id: 'mock-user-1',
    email: 'luizebvalente@gmail.com',
    password: '123456',
    name: 'Luiz Valente',
    role: USER_ROLES.ADMIN,
    clinicId: 'clinica-sao-lucas',
    isActive: true,
    lastLogin: new Date()
  },
  {
    id: 'mock-user-2',
    email: 'admin@younv.com.br',
    password: '123456',
    name: 'Super Administrador',
    role: USER_ROLES.SUPER_ADMIN,
    clinicId: null,
    isActive: true,
    lastLogin: new Date()
  },
  {
    id: 'mock-user-3',
    email: 'user@clinica.com.br',
    password: '123456',
    name: 'Usuário Regular',
    role: USER_ROLES.USER,
    clinicId: 'clinica-sao-lucas',
    isActive: true,
    lastLogin: new Date()
  }
];

class ProdMockAuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
    this.isInitialized = false;
    console.log('🔄 Usando autenticação simulada para produção');
  }

  // Inicializar o serviço
  async initialize() {
    if (this.isInitialized) return;
    
    console.log('🚀 Inicializando autenticação simulada para produção');
    
    // Verificar se há um usuário salvo no localStorage
    const savedUser = localStorage.getItem('mock_auth_user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        // Notificar listeners
        this._notifyListeners();
      } catch (error) {
        console.error('Erro ao recuperar usuário do localStorage:', error);
        localStorage.removeItem('mock_auth_user');
      }
    }
    
    this.isInitialized = true;
    console.log('✅ Autenticação simulada inicializada');
  }

  // Registrar listener para mudanças de estado de autenticação
  onAuthStateChange(callback) {
    this.listeners.push(callback);
    
    // Notificar imediatamente com o estado atual
    if (this.currentUser) {
      callback({
        user: {
          uid: this.currentUser.id,
          email: this.currentUser.email,
          displayName: this.currentUser.name
        },
        userData: this.currentUser
      });
    } else {
      callback(null);
    }
    
    // Retornar função para remover o listener
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notificar todos os listeners
  _notifyListeners() {
    const authData = this.currentUser ? {
      user: {
        uid: this.currentUser.id,
        email: this.currentUser.email,
        displayName: this.currentUser.name
      },
      userData: this.currentUser
    } : null;
    
    this.listeners.forEach(listener => listener(authData));
  }

  // Login com email e senha
  async login(email, password) {
    console.log(`🔑 Tentando login com ${email}`);
    
    const user = mockUsers.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === password
    );
    
    if (!user) {
      throw new Error('Credenciais inválidas');
    }
    
    if (!user.isActive) {
      throw new Error('Usuário inativo ou não encontrado');
    }
    
    // Atualizar último login
    user.lastLogin = new Date();
    
    // Salvar usuário atual
    this.currentUser = { ...user };
    
    // Salvar no localStorage para persistência
    localStorage.setItem('mock_auth_user', JSON.stringify(this.currentUser));
    
    // Notificar listeners
    this._notifyListeners();
    
    console.log(`✅ Login bem-sucedido: ${user.name} (${user.role})`);
    
    return {
      user: {
        uid: user.id,
        email: user.email,
        displayName: user.name
      },
      userData: user
    };
  }

  // Logout
  async logout() {
    console.log('🚪 Fazendo logout');
    
    this.currentUser = null;
    localStorage.removeItem('mock_auth_user');
    
    // Notificar listeners
    this._notifyListeners();
    
    console.log('✅ Logout concluído');
  }

  // Registrar novo usuário
  async register(userData) {
    console.log('👤 Registrando novo usuário:', userData.email);
    
    // Verificar se o email já está em uso
    if (mockUsers.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('Este email já está em uso');
    }
    
    const newUser = {
      id: `mock-user-${Date.now()}`,
      email: userData.email,
      password: userData.password,
      name: userData.name,
      role: userData.role || USER_ROLES.USER,
      clinicId: userData.clinicId,
      isActive: true,
      lastLogin: new Date()
    };
    
    // Adicionar à lista de usuários
    mockUsers.push(newUser);
    
    console.log(`✅ Usuário registrado: ${newUser.name}`);
    
    return {
      user: {
        uid: newUser.id,
        email: newUser.email,
        displayName: newUser.name
      },
      userData: newUser
    };
  }

  // Resetar senha
  async resetPassword(email) {
    console.log(`🔄 Solicitação de reset de senha para ${email}`);
    
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error('Email não encontrado');
    }
    
    console.log(`✅ Link de reset de senha enviado para ${email} (simulado)`);
    
    return true;
  }

  // Verificar se o usuário está autenticado
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Obter usuário atual
  getCurrentUser() {
    if (!this.currentUser) return null;
    
    return {
      user: {
        uid: this.currentUser.id,
        email: this.currentUser.email,
        displayName: this.currentUser.name
      },
      userData: this.currentUser
    };
  }

  // Verificar se o usuário tem permissão
  hasPermission(requiredRole) {
    if (!this.currentUser) return false;
    
    // Se requiredRole for um array, verificar se o usuário tem alguma das roles
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(this.currentUser.role);
    }
    
    // Super admin tem acesso a tudo
    if (this.currentUser.role === USER_ROLES.SUPER_ADMIN) {
      return true;
    }
    
    // Admin tem acesso a admin e user
    if (this.currentUser.role === USER_ROLES.ADMIN) {
      return requiredRole === USER_ROLES.ADMIN || requiredRole === USER_ROLES.USER;
    }
    
    // User só tem acesso a user
    return requiredRole === USER_ROLES.USER && this.currentUser.role === USER_ROLES.USER;
  }

  // Verificar se o usuário pode acessar uma clínica
  canAccessClinic(clinicId) {
    if (!this.currentUser) return false;
    
    // Super admin pode acessar qualquer clínica
    if (this.currentUser.role === USER_ROLES.SUPER_ADMIN) {
      return true;
    }
    
    // Outros usuários só podem acessar sua própria clínica
    return this.currentUser.clinicId === clinicId;
  }
}

export default new ProdMockAuthService();

