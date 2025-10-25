# 🚀 Guia de Instalação - Younv Clinical Scripts

Este guia fornece instruções detalhadas para instalar e configurar o sistema Younv Clinical Scripts em diferentes ambientes.

---

## 📋 Pré-requisitos

### **Requisitos do Sistema**
- **Sistema Operacional**: Windows 10+, macOS 10.15+, ou Linux Ubuntu 18+
- **Node.js**: Versão 18.0 ou superior
- **Gerenciador de Pacotes**: npm 8+ ou pnpm 7+ (recomendado)
- **Navegador**: Chrome 90+, Firefox 88+, Safari 14+, ou Edge 90+
- **Memória RAM**: Mínimo 4GB (8GB recomendado)
- **Espaço em Disco**: 500MB para o projeto + dependências

### **Contas Necessárias**
- **Conta Google**: Para acessar o Firebase Console
- **Projeto Firebase**: Será criado durante a instalação

---

## 🔧 Instalação Passo a Passo

### **Etapa 1: Preparação do Ambiente**

#### **1.1. Instalar Node.js**

**Windows:**
1. Acesse [nodejs.org](https://nodejs.org/)
2. Baixe a versão LTS
3. Execute o instalador e siga as instruções
4. Verifique a instalação:
```cmd
node --version
npm --version
```

**macOS:**
```bash
# Usando Homebrew (recomendado)
brew install node

# Ou baixe diretamente do site oficial
```

**Linux (Ubuntu/Debian):**
```bash
# Usando NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

#### **1.2. Instalar pnpm (Opcional, mas Recomendado)**
```bash
npm install -g pnpm
```

### **Etapa 2: Obter o Código Fonte**

#### **2.1. Clonar o Repositório**
```bash
# Via HTTPS
git clone https://github.com/younv/clinical-scripts.git

# Via SSH (se configurado)
git clone git@github.com:younv/clinical-scripts.git

# Entrar no diretório
cd clinical-scripts
```

#### **2.2. Verificar a Estrutura**
```bash
ls -la
# Deve mostrar: src/, public/, package.json, etc.
```

### **Etapa 3: Instalar Dependências**

#### **3.1. Usando pnpm (Recomendado)**
```bash
pnpm install
```

#### **3.2. Usando npm**
```bash
npm install
```

**Tempo estimado**: 2-5 minutos dependendo da conexão

### **Etapa 4: Configuração do Firebase**

#### **4.1. Criar Projeto no Firebase**

1. **Acesse o Firebase Console**
   - Vá para [console.firebase.google.com](https://console.firebase.google.com/)
   - Faça login com sua conta Google

2. **Criar Novo Projeto**
   - Clique em "Adicionar projeto"
   - Nome do projeto: `younv-clinical-scripts` (ou nome de sua escolha)
   - Aceite os termos e continue
   - **Google Analytics**: Pode ser desabilitado para este projeto
   - Clique em "Criar projeto"

3. **Aguardar Criação**
   - O processo leva 1-2 minutos
   - Clique em "Continuar" quando concluído

#### **4.2. Configurar Authentication**

1. **Acessar Authentication**
   - No menu lateral, clique em "Authentication"
   - Clique em "Vamos começar"

2. **Configurar Provedor Email/Senha**
   - Vá para a aba "Sign-in method"
   - Clique em "Email/senha"
   - Ative "Email/senha"
   - **NÃO** ative "Link de email (login sem senha)"
   - Clique em "Salvar"

3. **Configurar Domínios Autorizados**
   - Na aba "Settings"
   - Em "Authorized domains", adicione:
     - `localhost` (para desenvolvimento)
     - Seu domínio de produção (se aplicável)

#### **4.3. Configurar Firestore Database**

1. **Criar Database**
   - No menu lateral, clique em "Firestore Database"
   - Clique em "Criar banco de dados"

2. **Configurar Regras de Segurança**
   - Selecione "Começar no modo de teste"
   - Clique em "Avançar"

3. **Escolher Localização**
   - Selecione uma região próxima (ex: `southamerica-east1` para Brasil)
   - Clique em "Concluído"

4. **Configurar Regras (Importante)**
   - Vá para a aba "Regras"
   - Substitua o conteúdo por:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
   - Clique em "Publicar"

#### **4.4. Obter Configurações do Firebase**

1. **Acessar Configurações**
   - Clique no ícone de engrenagem ao lado de "Visão geral do projeto"
   - Selecione "Configurações do projeto"

2. **Adicionar App Web**
   - Role até "Seus apps"
   - Clique no ícone `</>`
   - Nome do app: `Younv Clinical Scripts`
   - **NÃO** marque "Configurar Firebase Hosting"
   - Clique em "Registrar app"

3. **Copiar Configuração**
   - Copie o objeto de configuração mostrado
   - Exemplo:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyC...",
     authDomain: "younv-clinical-scripts.firebaseapp.com",
     projectId: "younv-clinical-scripts",
     storageBucket: "younv-clinical-scripts.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef123456"
   };
   ```

### **Etapa 5: Configurar Variáveis de Ambiente**

#### **5.1. Criar Arquivo .env.local**
```bash
# Na raiz do projeto
touch .env.local
```

#### **5.2. Adicionar Configurações**
Edite o arquivo `.env.local` e adicione:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Development Settings
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0
```

**⚠️ Importante**: Substitua os valores pelos obtidos no Firebase Console.

### **Etapa 6: Inicializar Dados de Exemplo**

#### **6.1. Executar Script de Inicialização**
```bash
# Usando pnpm
pnpm run seed

# Usando npm
npm run seed
```

Este script criará:
- Usuários de exemplo
- Clínicas de demonstração
- Scripts organizados por categoria
- Dados de atividade recente

### **Etapa 7: Executar o Sistema**

#### **7.1. Modo Desenvolvimento**
```bash
# Usando pnpm
pnpm dev

# Usando npm
npm run dev
```

#### **7.2. Verificar Funcionamento**
1. **Abrir Navegador**
   - Acesse `http://localhost:5173`
   - A página de login deve aparecer

2. **Testar Login**
   - Use as credenciais de demonstração:
   - **Email**: `admin@younv.com.br`
   - **Senha**: `123456`

3. **Verificar Dashboard**
   - Após login, você deve ver o dashboard principal
   - Estatísticas devem estar visíveis
   - Menu lateral deve estar funcional

---

## 🔍 Verificação da Instalação

### **Checklist de Verificação**

- [ ] **Node.js instalado** (versão 18+)
- [ ] **Dependências instaladas** sem erros
- [ ] **Firebase projeto criado** e configurado
- [ ] **Authentication habilitado** (Email/senha)
- [ ] **Firestore criado** com regras configuradas
- [ ] **Variáveis de ambiente** configuradas corretamente
- [ ] **Servidor de desenvolvimento** executando
- [ ] **Login funcionando** com credenciais de teste
- [ ] **Dashboard carregando** com dados
- [ ] **Navegação funcionando** entre páginas

### **Comandos de Diagnóstico**

```bash
# Verificar versões
node --version
npm --version
pnpm --version

# Verificar dependências
pnpm list
# ou
npm list

# Verificar build
pnpm build
# ou
npm run build

# Verificar linting
pnpm lint
# ou
npm run lint
```

---

## 🚨 Solução de Problemas Comuns

### **Erro: "Module not found"**
```bash
# Limpar cache e reinstalar
rm -rf node_modules
rm pnpm-lock.yaml  # ou package-lock.json
pnpm install  # ou npm install
```

### **Erro: "Firebase configuration"**
1. Verifique se todas as variáveis de ambiente estão definidas
2. Confirme se os valores estão corretos (sem espaços extras)
3. Reinicie o servidor de desenvolvimento

### **Erro: "Permission denied" (Firestore)**
1. Verifique se as regras do Firestore estão configuradas
2. Confirme se o usuário está autenticado
3. Teste com regras mais permissivas temporariamente

### **Erro: "Port 5173 already in use"**
```bash
# Matar processo na porta
lsof -ti:5173 | xargs kill -9

# Ou usar porta diferente
pnpm dev --port 3000
```

### **Performance Lenta**
1. **Verificar recursos do sistema**
   ```bash
   # Verificar uso de memória
   free -h  # Linux
   top      # macOS/Linux
   ```

2. **Otimizar desenvolvimento**
   ```bash
   # Usar modo de desenvolvimento otimizado
   pnpm dev --host
   ```

---

## 🌐 Deploy para Produção

### **Preparação para Deploy**

#### **1. Build de Produção**
```bash
pnpm build
# ou
npm run build
```

#### **2. Testar Build Local**
```bash
pnpm preview
# ou
npm run preview
```

### **Deploy no Firebase Hosting**

#### **1. Instalar Firebase CLI**
```bash
npm install -g firebase-tools
```

#### **2. Login no Firebase**
```bash
firebase login
```

#### **3. Inicializar Hosting**
```bash
firebase init hosting
```

Configurações:
- **Public directory**: `dist`
- **Single-page app**: `Yes`
- **Overwrite index.html**: `No`

#### **4. Deploy**
```bash
firebase deploy
```

### **Deploy em Outros Provedores**

#### **Vercel**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### **Netlify**
1. Conecte seu repositório GitHub
2. Configure build command: `pnpm build`
3. Configure publish directory: `dist`

---

## 📊 Monitoramento e Logs

### **Logs de Desenvolvimento**
```bash
# Ver logs detalhados
pnpm dev --debug

# Ver logs do Firebase
firebase serve --debug
```

### **Monitoramento de Performance**
1. **Firebase Performance Monitoring**
   - Ative no console do Firebase
   - Monitore métricas de carregamento

2. **Google Analytics**
   - Configure se necessário
   - Acompanhe uso do sistema

---

## 🔐 Configurações de Segurança

### **Regras de Firestore Detalhadas**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever apenas seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Scripts podem ser lidos por usuários autenticados da mesma clínica
    match /scripts/{scriptId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource.data.clinicId == request.auth.token.clinicId || 
         request.auth.token.role == 'super_admin');
    }
    
    // Clínicas podem ser gerenciadas apenas por admins
    match /clinics/{clinicId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.clinicId == clinicId || 
         request.auth.token.role == 'super_admin');
    }
  }
}
```

### **Configurações de Authentication**
```javascript
// Custom claims para roles
{
  "role": "admin",
  "clinicId": "clinic_123",
  "permissions": ["read_scripts", "write_scripts", "manage_users"]
}
```

---

## 📞 Suporte Técnico

### **Canais de Suporte**
- **Email**: suporte@younv.com.br
- **GitHub Issues**: [Reportar problemas](https://github.com/younv/clinical-scripts/issues)
- **Documentação**: [docs.younv.com.br](https://docs.younv.com.br)

### **Informações para Suporte**
Ao solicitar ajuda, inclua:
1. **Sistema operacional** e versão
2. **Versão do Node.js** (`node --version`)
3. **Mensagem de erro completa**
4. **Passos para reproduzir** o problema
5. **Screenshots** se aplicável

---

## ✅ Próximos Passos

Após a instalação bem-sucedida:

1. **Explore o Sistema**
   - Teste todas as funcionalidades
   - Familiarize-se com a interface

2. **Customize para sua Clínica**
   - Adicione seus próprios scripts
   - Configure categorias específicas
   - Personalize cores e branding

3. **Treine sua Equipe**
   - Crie contas para usuários
   - Demonstre funcionalidades principais
   - Estabeleça fluxos de trabalho

4. **Configure Backup**
   - Implemente rotinas de backup
   - Configure monitoramento
   - Estabeleça procedimentos de recuperação

---

*Instalação concluída com sucesso! 🎉*

*Para dúvidas ou problemas, consulte nossa documentação completa ou entre em contato com o suporte técnico.*

