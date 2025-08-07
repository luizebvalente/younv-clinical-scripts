/**
 * Script para configurar usuários no Firebase Auth
 * 
 * Este script deve ser executado uma única vez para criar os usuários
 * de demonstração no Firebase Auth.
 * 
 * Uso:
 * node src/scripts/setupFirebaseUsers.js
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  collection, 
  getDocs,
  query,
  where
} from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBmNSjnw_-DnXmGIy0qQJUJBG9-0ZfJbXE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "younv-clinical-scripts.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "younv-clinical-scripts",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "younv-clinical-scripts.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef1234567890"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Usuários de demonstração
const demoUsers = [
  {
    email: 'luizebvalente@gmail.com',
    password: '123456',
    userData: {
      name: 'Luiz Valente',
      role: 'admin',
      clinicId: 'clinica-sao-lucas',
      isActive: true
    }
  },
  {
    email: 'admin@younv.com.br',
    password: '123456',
    userData: {
      name: 'Super Administrador',
      role: 'super_admin',
      clinicId: null,
      isActive: true
    }
  },
  {
    email: 'user@clinica.com.br',
    password: '123456',
    userData: {
      name: 'Usuário Regular',
      role: 'user',
      clinicId: 'clinica-sao-lucas',
      isActive: true
    }
  }
];

// Função para criar um usuário no Firebase Auth e Firestore
async function createUser(email, password, userData) {
  try {
    // Verificar se o usuário já existe no Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      console.log(`Usuário ${email} já existe no Firestore. Pulando...`);
      return;
    }

    // Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Adicionar dados do usuário ao Firestore
    await setDoc(doc(db, 'users', user.uid), {
      id: user.uid,
      email,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log(`✅ Usuário ${email} criado com sucesso!`);
    return user;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`Usuário ${email} já existe no Firebase Auth. Tentando fazer login...`);
      
      try {
        // Se o usuário já existe, fazer login e atualizar dados no Firestore
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Atualizar dados do usuário no Firestore
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          email,
          ...userData,
          updatedAt: new Date()
        }, { merge: true });
        
        console.log(`✅ Dados do usuário ${email} atualizados com sucesso!`);
        return user;
      } catch (loginError) {
        console.error(`❌ Erro ao fazer login com ${email}:`, loginError);
        return null;
      }
    } else {
      console.error(`❌ Erro ao criar usuário ${email}:`, error);
      return null;
    }
  }
}

// Função principal
async function setupUsers() {
  console.log('🚀 Iniciando configuração de usuários...');
  
  try {
    for (const demoUser of demoUsers) {
      await createUser(demoUser.email, demoUser.password, demoUser.userData);
    }
    
    console.log('✅ Configuração de usuários concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante a configuração de usuários:', error);
  } finally {
    // Encerrar o processo
    process.exit(0);
  }
}

// Executar a função principal
setupUsers();

