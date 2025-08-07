/**
 * Serviço de inicialização do sistema
 * 
 * Este serviço é responsável por:
 * - Verificar se o sistema já foi inicializado
 * - Criar dados básicos necessários (categorias, configurações)
 * - Configurar o Firebase adequadamente
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  collection,
  getDocs,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Categorias padrão do sistema
const defaultCategories = [
  {
    id: 'recepcao',
    name: 'Recepção',
    description: 'Scripts para atendimento na recepção',
    icon: 'phone',
    color: '#3B82F6',
    order: 1,
    isActive: true
  },
  {
    id: 'agendamento',
    name: 'Agendamento',
    description: 'Scripts para agendamento de consultas',
    icon: 'calendar',
    color: '#10B981',
    order: 2,
    isActive: true
  },
  {
    id: 'confirmacao',
    name: 'Confirmação',
    description: 'Scripts para confirmação de consultas',
    icon: 'check-circle',
    color: '#F59E0B',
    order: 3,
    isActive: true
  },
  {
    id: 'cancelamento',
    name: 'Cancelamento',
    description: 'Scripts para cancelamento de consultas',
    icon: 'x-circle',
    color: '#EF4444',
    order: 4,
    isActive: true
  },
  {
    id: 'pos-consulta',
    name: 'Pós-consulta',
    description: 'Scripts para atendimento pós-consulta',
    icon: 'clipboard-check',
    color: '#8B5CF6',
    order: 5,
    isActive: true
  },
  {
    id: 'emergencia',
    name: 'Emergência',
    description: 'Scripts para situações de emergência',
    icon: 'alert-triangle',
    color: '#DC2626',
    order: 6,
    isActive: true
  },
  {
    id: 'financeiro',
    name: 'Financeiro',
    description: 'Scripts para questões financeiras',
    icon: 'dollar-sign',
    color: '#059669',
    order: 7,
    isActive: true
  },
  {
    id: 'geral',
    name: 'Geral',
    description: 'Scripts gerais e diversos',
    icon: 'message-circle',
    color: '#6B7280',
    order: 8,
    isActive: true
  }
];

class InitializationService {
  constructor() {
    this.isInitialized = false;
    this.initializationPromise = null;
  }

  // Verificar se o sistema já foi inicializado
  async checkSystemInitialization() {
    try {
      console.log('🔍 Verificando inicialização do sistema...');
      
      const systemDoc = await getDoc(doc(db, 'system', 'initialized'));
      const isInitialized = systemDoc.exists() && systemDoc.data()?.initialized === true;
      
      console.log('📊 Sistema inicializado:', isInitialized);
      return isInitialized;
    } catch (error) {
      console.error('❌ Erro ao verificar inicialização:', error);
      return false;
    }
  }

  // Verificar se as categorias existem
  async checkCategoriesExist() {
    try {
      console.log('🔍 Verificando categorias...');
      
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const hasCategories = !categoriesSnapshot.empty;
      
      console.log('📊 Categorias existem:', hasCategories, 'Total:', categoriesSnapshot.size);
      return hasCategories;
    } catch (error) {
      console.error('❌ Erro ao verificar categorias:', error);
      return false;
    }
  }

  // Criar categorias padrão
  async createDefaultCategories() {
    try {
      console.log('📝 Criando categorias padrão...');
      
      const batch = writeBatch(db);
      
      for (const category of defaultCategories) {
        const categoryRef = doc(db, 'categories', category.id);
        batch.set(categoryRef, {
          ...category,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      await batch.commit();
      console.log('✅ Categorias padrão criadas com sucesso');
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao criar categorias padrão:', error);
      throw error;
    }
  }

  // Marcar sistema como inicializado
  async markSystemAsInitialized() {
    try {
      console.log('✅ Marcando sistema como inicializado...');
      
      await setDoc(doc(db, 'system', 'initialized'), {
        initialized: true,
        initializedAt: serverTimestamp(),
        version: '1.0.0'
      });
      
      console.log('✅ Sistema marcado como inicializado');
      return true;
    } catch (error) {
      console.error('❌ Erro ao marcar sistema como inicializado:', error);
      throw error;
    }
  }

  // Criar configurações padrão do sistema
  async createSystemSettings() {
    try {
      console.log('⚙️ Criando configurações do sistema...');
      
      const settings = {
        appName: 'YouNV Clinical Scripts',
        version: '1.0.0',
        maxScriptsPerClinic: 1000,
        maxUsersPerClinic: 50,
        features: {
          scriptTemplates: true,
          analytics: true,
          multiClinic: true,
          userManagement: true
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'system', 'settings'), settings);
      console.log('✅ Configurações do sistema criadas');
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao criar configurações:', error);
      throw error;
    }
  }

  // Inicialização completa do sistema
  async initialize() {
    // Evitar múltiplas inicializações simultâneas
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._performInitialization();
    return this.initializationPromise;
  }

  async _performInitialization() {
    try {
      console.log('🚀 Iniciando inicialização do sistema...');
      
      // Verificar se já foi inicializado
      const isAlreadyInitialized = await this.checkSystemInitialization();
      
      if (isAlreadyInitialized) {
        console.log('✅ Sistema já foi inicializado anteriormente');
        this.isInitialized = true;
        return { success: true, message: 'Sistema já inicializado' };
      }

      // Verificar e criar categorias se necessário
      const categoriesExist = await this.checkCategoriesExist();
      
      if (!categoriesExist) {
        console.log('📝 Criando dados básicos do sistema...');
        await this.createDefaultCategories();
      } else {
        console.log('✅ Categorias já existem');
      }

      // Criar configurações do sistema
      await this.createSystemSettings();

      // Marcar como inicializado
      await this.markSystemAsInitialized();

      this.isInitialized = true;
      console.log('🎉 Sistema inicializado com sucesso!');
      
      return { 
        success: true, 
        message: 'Sistema inicializado com sucesso',
        categoriesCreated: !categoriesExist
      };
      
    } catch (error) {
      console.error('❌ Erro na inicialização do sistema:', error);
      this.isInitialized = false;
      throw new Error(`Falha na inicialização: ${error.message}`);
    } finally {
      this.initializationPromise = null;
    }
  }

  // Verificar se precisa de setup inicial (primeira clínica)
  async needsInitialSetup() {
    try {
      console.log('🔍 Verificando se precisa de setup inicial...');
      
      // Verificar se existe pelo menos uma clínica
      const clinicsSnapshot = await getDocs(collection(db, 'clinics'));
      const hasClinics = !clinicsSnapshot.empty;
      
      // Verificar se existe pelo menos um usuário
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const hasUsers = !usersSnapshot.empty;
      
      const needsSetup = !hasClinics || !hasUsers;
      
      console.log('📊 Precisa de setup:', needsSetup, { hasClinics, hasUsers });
      return needsSetup;
      
    } catch (error) {
      console.error('❌ Erro ao verificar setup inicial:', error);
      return true; // Em caso de erro, assumir que precisa de setup
    }
  }

  // Reset do sistema (apenas para desenvolvimento)
  async resetSystem() {
    try {
      console.log('🔄 Resetando sistema...');
      
      // Remover marcador de inicialização
      await setDoc(doc(db, 'system', 'initialized'), {
        initialized: false,
        resetAt: serverTimestamp()
      });
      
      this.isInitialized = false;
      console.log('✅ Sistema resetado');
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao resetar sistema:', error);
      throw error;
    }
  }

  // Obter status do sistema
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isInitializing: !!this.initializationPromise
    };
  }
}

export default new InitializationService();

