# Guia de Deploy - Firebase + Vercel

## 🔥 Configuração do Firebase

### 1. Configuração Atual
O sistema já está configurado com suas credenciais do Firebase:

```
Project ID: younv-clinical-scripts
Auth Domain: younv-clinical-scripts.firebaseapp.com
```

### 2. Variáveis de Ambiente
As seguintes variáveis já estão configuradas no arquivo `.env`:

```env
VITE_FIREBASE_API_KEY=AIzaSyBl7XWGFY_72GAHDtmnae0ZRqN4IbPK2ss
VITE_FIREBASE_AUTH_DOMAIN=younv-clinical-scripts.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=younv-clinical-scripts
VITE_FIREBASE_STORAGE_BUCKET=younv-clinical-scripts.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1049919552395
VITE_FIREBASE_APP_ID=1:1049919552395:web:f22732f2a5fc1d0de58d8e
VITE_FIREBASE_MEASUREMENT_ID=G-YDN6LMHTTM
```

## 🚀 Deploy no Vercel

### 1. Configurar Variáveis de Ambiente no Vercel
No painel do Vercel, adicione as seguintes variáveis de ambiente:

```
VITE_FIREBASE_API_KEY=AIzaSyBl7XWGFY_72GAHDtmnae0ZRqN4IbPK2ss
VITE_FIREBASE_AUTH_DOMAIN=younv-clinical-scripts.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=younv-clinical-scripts
VITE_FIREBASE_STORAGE_BUCKET=younv-clinical-scripts.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1049919552395
VITE_FIREBASE_APP_ID=1:1049919552395:web:f22732f2a5fc1d0de58d8e
VITE_FIREBASE_MEASUREMENT_ID=G-YDN6LMHTTM
```

### 2. Comandos de Build
O Vercel detectará automaticamente que é um projeto Vite. Configurações:

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install --legacy-peer-deps`

## 🔐 Configuração do Firestore

### 1. Regras de Segurança
Configure as seguintes regras no Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // System collections (read-only for authenticated users)
    match /system/{document} {
      allow read: if request.auth != null;
      allow write: if false; // Only through admin SDK
    }
    
    // Categories (read for authenticated users)
    match /categories/{categoryId} {
      allow read: if request.auth != null;
      allow write: if false; // Only through admin SDK
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && 
        (request.auth.uid == userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super_admin']);
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super_admin'];
    }
    
    // Clinics collection
    match /clinics/{clinicId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super_admin'];
    }
    
    // Scripts collection
    match /scripts/{scriptId} {
      allow read: if request.auth != null && 
        (resource.data.clinicId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.clinicId ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin');
      allow write: if request.auth != null && 
        (resource.data.clinicId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.clinicId ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin') &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super_admin'];
    }
  }
}
```

### 2. Autenticação
Configure os seguintes métodos de autenticação no Firebase Console:

- ✅ **Email/Password**: Habilitado
- ✅ **Anonymous**: Habilitado (para demo)

## 📊 Inicialização Automática

### 1. Dados Padrão
O sistema criará automaticamente:

- **3 Clínicas de exemplo**
- **6 Usuários padrão**
- **7 Scripts de exemplo**
- **6 Categorias padrão**
- **Configurações do sistema**

### 2. Usuários Demo
Após o deploy, você pode fazer login com:

| Email | Senha | Tipo |
|-------|-------|------|
| admin@younv.com.br | 123456 | Super Admin |
| admin@clinicasaolucas.com.br | 123456 | Admin da Clínica |
| recep1@clinicasaolucas.com.br | 123456 | Usuário |

## 🔧 Comandos Úteis

### Desenvolvimento Local
```bash
# Instalar dependências
npm install --legacy-peer-deps

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

### Verificar Configuração
```bash
# Verificar variáveis de ambiente
echo $VITE_FIREBASE_PROJECT_ID

# Testar conexão com Firebase
npm run dev
# Abrir http://localhost:5173 e verificar console do navegador
```

## 🚨 Troubleshooting

### Erro de Autenticação
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o domínio está autorizado no Firebase Console
- Verifique as regras do Firestore

### Erro de Inicialização
- Abra o console do navegador para ver logs detalhados
- Verifique se o projeto Firebase existe e está ativo
- Confirme se o Firestore está habilitado

### Erro de Permissões
- Verifique as regras de segurança do Firestore
- Confirme se o usuário tem as permissões corretas
- Verifique se a clínica do usuário está ativa

## 📱 Funcionalidades Implementadas

### ✅ Autenticação
- Login com email/senha
- Login demo (anônimo)
- Controle de sessão
- Diferentes níveis de acesso

### ✅ Gestão de Scripts
- Criar, editar, visualizar scripts
- Categorização automática
- Busca e filtros
- Templates reutilizáveis

### ✅ Multi-clínica
- Isolamento de dados por clínica
- Gestão de usuários por clínica
- Configurações personalizadas

### ✅ Dashboard
- Estatísticas em tempo real
- Scripts mais utilizados
- Atividade recente
- Métricas de uso

## 🔄 Próximos Passos

1. **Deploy no Vercel**: Configure as variáveis de ambiente e faça o deploy
2. **Teste de Funcionalidades**: Acesse com os usuários demo e teste todas as funcionalidades
3. **Configuração de Produção**: Altere senhas padrão e configure usuários reais
4. **Monitoramento**: Configure alertas e monitoramento no Firebase

---

**Sistema pronto para produção com Firebase integrado! 🎉**

