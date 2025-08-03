# Younv Clinical Scripts

## 🏥 Guia Interativo de Scripts de Atendimento para Clínicas Médicas

O **Younv Clinical Scripts** é um sistema web moderno e intuitivo projetado para auxiliar clínicas médicas no gerenciamento e utilização de scripts padronizados de atendimento. Com uma interface profissional e funcionalidades avançadas, o sistema permite que equipes médicas acessem rapidamente scripts organizados por categoria, facilitando o atendimento ao paciente e garantindo consistência na comunicação.

---

## ✨ Principais Funcionalidades

### 🔐 **Sistema de Autenticação Multi-tenant**
- **Controle de acesso por clínica**: Cada clínica possui seu ambiente isolado
- **Níveis de permissão**: Super Admin, Admin de Clínica, e Usuário
- **Login seguro** com credenciais personalizadas por função

### 📊 **Dashboard Interativo**
- **Estatísticas em tempo real**: Total de scripts, categorias, e atividade recente
- **Métricas de uso**: Acompanhe quais scripts são mais utilizados
- **Visão geral da atividade**: Timeline com ações recentes do sistema

### 🔍 **Sistema de Busca Avançado**
- **Busca inteligente**: Por palavras-chave, título, conteúdo ou tags
- **Filtros por categoria**: Atendimento, Cirurgia, Consulta, Objeções, Follow-up, Agendamento
- **Destaque de termos**: Palavras encontradas são destacadas nos resultados
- **Ordenação flexível**: Por relevância, data, ou alfabética

### 📝 **Gerenciamento de Scripts**
- **Organização por categorias**: Scripts organizados de forma intuitiva
- **Scripts com etapas guiadas**: Instruções passo-a-paso para procedimentos
- **Cópia com um clique**: Botão para copiar scripts diretamente para WhatsApp
- **Sistema de tags**: Organização adicional com palavras-chave

### ⚙️ **Painel Administrativo Completo**
- **Dashboard administrativo**: Métricas globais e análises detalhadas
- **Gerenciamento de scripts**: CRUD completo com filtros avançados
- **Ações em lote**: Ativar, desativar ou excluir múltiplos scripts
- **Sistema de alertas**: Notificações sobre scripts inativos e backups
- **Atividade do sistema**: Log completo de ações realizadas

### 🎨 **Interface Moderna e Responsiva**
- **Design profissional**: Tema médico com cores azuis e layout limpo
- **Totalmente responsivo**: Funciona perfeitamente em desktop e mobile
- **Micro-interações**: Animações suaves e feedback visual
- **Componentes avançados**: Modais, toasts, tooltips e loading states
- **Acessibilidade**: Suporte a leitores de tela e navegação por teclado

---

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **React 18** - Framework JavaScript moderno
- **React Router** - Navegação SPA
- **Tailwind CSS** - Framework CSS utilitário
- **Lucide React** - Ícones modernos e consistentes
- **React Hook Form** - Gerenciamento de formulários

### **Backend & Infraestrutura**
- **Firebase Authentication** - Autenticação segura
- **Firebase Firestore** - Banco de dados NoSQL
- **Firebase Hosting** - Hospedagem estática
- **Vite** - Build tool moderna e rápida

### **Desenvolvimento**
- **ESLint** - Linting de código
- **Prettier** - Formatação automática
- **Git** - Controle de versão

---

## 🚀 Instalação e Configuração

### **Pré-requisitos**
- Node.js 18+ 
- npm ou pnpm
- Conta no Firebase

### **1. Clone o Repositório**
```bash
git clone https://github.com/younv/clinical-scripts.git
cd clinical-scripts
```

### **2. Instale as Dependências**
```bash
# Usando npm
npm install

# Usando pnpm (recomendado)
pnpm install
```

### **3. Configuração do Firebase**

#### **3.1. Crie um Projeto no Firebase**
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Criar projeto"
3. Siga as instruções para configurar o projeto

#### **3.2. Configure Authentication**
1. No console do Firebase, vá para "Authentication"
2. Ative o provedor "Email/senha"
3. Configure domínios autorizados se necessário

#### **3.3. Configure Firestore**
1. Vá para "Firestore Database"
2. Crie o banco de dados em modo de teste
3. Configure as regras de segurança conforme necessário

#### **3.4. Obtenha as Credenciais**
1. Vá para "Configurações do projeto" > "Geral"
2. Na seção "Seus apps", clique em "Web"
3. Copie a configuração do Firebase

### **4. Configure as Variáveis de Ambiente**
Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### **5. Execute o Projeto**
```bash
# Desenvolvimento
npm run dev
# ou
pnpm dev

# Build para produção
npm run build
# ou
pnpm build
```

O sistema estará disponível em `http://localhost:5173`

---

## 👥 Credenciais de Demonstração

Para facilitar os testes, o sistema inclui credenciais de demonstração:

### **Super Administrador**
- **Email**: admin@younv.com.br
- **Senha**: 123456
- **Acesso**: Todas as funcionalidades do sistema

### **Admin de Clínica**
- **Email**: admin@clinicasaolucas.com.br
- **Senha**: 123456
- **Acesso**: Gerenciamento da clínica específica

### **Usuário Padrão**
- **Email**: recep1@clinicasaolucas.com.br
- **Senha**: 123456
- **Acesso**: Visualização e uso de scripts

---

## 📱 Como Usar o Sistema

### **1. Login**
1. Acesse a página inicial
2. Insira suas credenciais
3. Clique em "Entrar"

### **2. Navegação Principal**
- **Dashboard**: Visão geral e estatísticas
- **Buscar Scripts**: Ferramenta de busca avançada
- **Categorias**: Navegação por tipo de script
- **Painel Admin**: Gerenciamento (apenas admins)

### **3. Usando Scripts**
1. Navegue até a categoria desejada ou use a busca
2. Encontre o script apropriado
3. Clique em "Copiar" para copiar o texto
4. Cole no WhatsApp ou sistema de mensagens

### **4. Gerenciamento (Admins)**
1. Acesse o "Painel Admin"
2. Use "Gerenciar Scripts" para CRUD completo
3. Aplique filtros e busca para encontrar scripts
4. Use ações em lote para operações múltiplas

---

## 🏗️ Estrutura do Projeto

```
younv-clinical-scripts/
├── public/                 # Arquivos públicos
├── src/
│   ├── components/        # Componentes React
│   │   ├── forms/        # Formulários
│   │   ├── layout/       # Layout e navegação
│   │   └── ui/           # Componentes de interface
│   ├── contexts/         # Contextos React
│   ├── data/            # Dados de exemplo
│   ├── hooks/           # Hooks customizados
│   ├── lib/             # Configurações (Firebase)
│   ├── pages/           # Páginas da aplicação
│   │   └── admin/       # Páginas administrativas
│   ├── services/        # Serviços e APIs
│   ├── types/           # Definições de tipos
│   └── utils/           # Utilitários
├── .env.local           # Variáveis de ambiente
├── package.json         # Dependências
└── README.md           # Este arquivo
```

---

## 🔧 Configurações Avançadas

### **Personalização de Tema**
O sistema usa Tailwind CSS com tema customizado. Para personalizar cores:

1. Edite `src/App.css`
2. Modifique as variáveis CSS customizadas
3. Ajuste as classes Tailwind conforme necessário

### **Adicionando Novas Categorias**
1. Edite `src/types/index.js`
2. Adicione a nova categoria em `DEFAULT_CATEGORIES`
3. Atualize os ícones em `src/utils/index.js`

### **Configurando Regras do Firestore**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para clínicas
    match /clinics/{clinicId} {
      allow read, write: if request.auth != null;
    }
    
    // Regras para scripts
    match /scripts/{scriptId} {
      allow read, write: if request.auth != null;
    }
    
    // Regras para usuários
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🐛 Solução de Problemas

### **Erro de Autenticação**
- Verifique se as credenciais do Firebase estão corretas
- Confirme se o domínio está autorizado no Firebase Auth
- Verifique se o provedor Email/senha está ativado

### **Scripts Não Carregam**
- Verifique a conexão com o Firestore
- Confirme se as regras de segurança permitem leitura
- Verifique se os dados de exemplo foram importados

### **Problemas de Build**
- Execute `npm run build` para verificar erros
- Verifique se todas as variáveis de ambiente estão definidas
- Confirme se não há imports circulares

### **Problemas de Performance**
- Use React DevTools para identificar re-renders desnecessários
- Considere implementar lazy loading para rotas
- Otimize consultas ao Firestore com índices

---

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. Abra um **Pull Request**

### **Padrões de Código**
- Use ESLint e Prettier para formatação
- Siga as convenções de nomenclatura React
- Documente componentes complexos
- Escreva testes para novas funcionalidades

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 📞 Suporte

Para suporte técnico ou dúvidas:

- **Email**: suporte@younv.com.br
- **Documentação**: [docs.younv.com.br](https://docs.younv.com.br)
- **Issues**: [GitHub Issues](https://github.com/younv/clinical-scripts/issues)

---

## 🎯 Roadmap

### **Versão 2.0 (Planejada)**
- [ ] Integração com WhatsApp Business API
- [ ] Sistema de templates personalizáveis
- [ ] Relatórios avançados com gráficos
- [ ] Backup automático de dados
- [ ] Integração com sistemas de gestão hospitalar

### **Versão 2.1 (Futura)**
- [ ] App mobile nativo
- [ ] Reconhecimento de voz para busca
- [ ] IA para sugestão de scripts
- [ ] Sistema de aprovação de scripts
- [ ] Auditoria completa de ações

---

## 🏆 Créditos

Desenvolvido com ❤️ pela equipe **Younv**

**Tecnologias e Bibliotecas Utilizadas:**
- React Team - Framework React
- Tailwind Labs - Tailwind CSS
- Google - Firebase Platform
- Lucide - Ícones
- Vite Team - Build Tool

---

*Younv Clinical Scripts - Transformando o atendimento médico através da tecnologia* 🏥✨

