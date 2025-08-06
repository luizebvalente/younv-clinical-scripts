import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  writeBatch 
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { sampleClinics, sampleUsers, sampleScripts } from '../data/seedData';
import { DEFAULT_CATEGORIES } from '../types';

class InitializationService {
  constructor() {
    this.isInitialized = false;
    this.initializationPromise = null;
  }

  // Main initialization method
  async initialize() {
    if (this.isInitialized) {
      return true;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._performInitialization();
    return this.initializationPromise;
  }

  async _performInitialization() {
    try {
      console.log('🚀 Iniciando configuração do Firebase...');

      // Check if already initialized
      const initDoc = await getDoc(doc(db, 'system', 'initialization'));
      if (initDoc.exists() && initDoc.data().completed) {
        console.log('✅ Sistema já inicializado');
        this.isInitialized = true;
        return true;
      }

      // Initialize in order
      await this._createCategories();
      await this._createClinics();
      await this._createUsers();
      await this._createScripts();
      await this._createSystemSettings();

      // Mark as initialized
      await setDoc(doc(db, 'system', 'initialization'), {
        completed: true,
        timestamp: new Date(),
        version: '1.0.0'
      });

      console.log('✅ Inicialização concluída com sucesso!');
      this.isInitialized = true;
      return true;

    } catch (error) {
      console.error('❌ Erro na inicialização:', error);
      this.initializationPromise = null;
      throw error;
    }
  }

  // Create default categories
  async _createCategories() {
    console.log('📁 Criando categorias padrão...');
    
    const batch = writeBatch(db);
    
    for (const category of DEFAULT_CATEGORIES) {
      const categoryRef = doc(db, 'categories', category.id);
      batch.set(categoryRef, {
        ...category,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await batch.commit();
    console.log('✅ Categorias criadas');
  }

  // Create sample clinics
  async _createClinics() {
    console.log('🏥 Criando clínicas de exemplo...');
    
    const batch = writeBatch(db);
    
    for (const clinic of sampleClinics) {
      const clinicRef = doc(db, 'clinics', clinic.id);
      batch.set(clinicRef, {
        ...clinic,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await batch.commit();
    console.log('✅ Clínicas criadas');
  }

  // Create sample users (without authentication)
  async _createUsers() {
    console.log('👥 Criando usuários de exemplo...');
    
    const batch = writeBatch(db);
    
    for (const user of sampleUsers) {
      const userRef = doc(db, 'users', user.id);
      batch.set(userRef, {
        ...user,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null,
        // Default password will be: 123456
        // Users should change on first login
        needsPasswordChange: true
      });
    }

    await batch.commit();
    console.log('✅ Usuários criados');
  }

  // Create sample scripts
  async _createScripts() {
    console.log('📝 Criando scripts de exemplo...');
    
    const batch = writeBatch(db);
    
    for (const script of sampleScripts) {
      const scriptRef = doc(db, 'scripts', script.id);
      batch.set(scriptRef, {
        ...script,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        version: 1,
        usage: {
          totalViews: 0,
          totalUses: 0,
          lastUsed: null
        }
      });
    }

    await batch.commit();
    console.log('✅ Scripts criados');
  }

  // Create system settings
  async _createSystemSettings() {
    console.log('⚙️ Criando configurações do sistema...');
    
    const systemSettings = {
      version: '1.0.0',
      features: {
        analytics: true,
        notifications: true,
        multiClinic: true,
        scriptTemplates: true
      },
      security: {
        passwordMinLength: 6,
        sessionTimeout: 24, // hours
        maxLoginAttempts: 5
      },
      defaults: {
        theme: 'blue',
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo'
      },
      maintenance: {
        isActive: false,
        message: '',
        scheduledFor: null
      }
    };

    await setDoc(doc(db, 'system', 'settings'), {
      ...systemSettings,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Configurações do sistema criadas');
  }

  // Check if system is initialized
  async isSystemInitialized() {
    try {
      const initDoc = await getDoc(doc(db, 'system', 'initialization'));
      return initDoc.exists() && initDoc.data().completed;
    } catch (error) {
      console.error('Erro ao verificar inicialização:', error);
      return false;
    }
  }

  // Reset system (for development only)
  async resetSystem() {
    if (import.meta.env.PROD) {
      throw new Error('Reset não permitido em produção');
    }

    console.log('🔄 Resetando sistema...');
    
    try {
      // Delete initialization marker
      await setDoc(doc(db, 'system', 'initialization'), {
        completed: false,
        timestamp: new Date()
      });

      this.isInitialized = false;
      this.initializationPromise = null;

      console.log('✅ Sistema resetado');
      return true;
    } catch (error) {
      console.error('Erro ao resetar sistema:', error);
      throw error;
    }
  }

  // Get initialization status
  getInitializationStatus() {
    return {
      isInitialized: this.isInitialized,
      isInitializing: !!this.initializationPromise
    };
  }

  // Create authentication users (separate method for security)
  async createAuthUsers() {
    console.log('🔐 Criando usuários de autenticação...');
    
    const defaultPassword = '123456';
    const usersToCreate = [
      {
        email: 'admin@younv.com.br',
        name: 'Super Administrador',
        uid: 'user-super-admin'
      },
      {
        email: 'admin@clinicasaolucas.com.br',
        name: 'Maria Silva',
        uid: 'user-admin-1'
      },
      {
        email: 'recep1@clinicasaolucas.com.br',
        name: 'Ana Santos',
        uid: 'user-1'
      }
    ];

    for (const userData of usersToCreate) {
      try {
        // Check if user already exists in Firestore
        const userDoc = await getDoc(doc(db, 'users', userData.uid));
        if (userDoc.exists()) {
          console.log(`✅ Usuário ${userData.email} já existe`);
          continue;
        }

        console.log(`Criando usuário: ${userData.email}`);
        // Note: In production, you would handle user creation differently
        // This is just for demo purposes
        
      } catch (error) {
        console.error(`Erro ao criar usuário ${userData.email}:`, error);
      }
    }
  }
}

export default new InitializationService();

