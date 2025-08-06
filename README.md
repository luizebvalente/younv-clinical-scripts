# Younv Clinical Scripts - Sistema de Gerenciamento de Scripts Médicos

Sistema completo para gerenciamento de scripts clínicos, permitindo que clínicas médicas organizem e acessem facilmente seus protocolos de atendimento, consultas e procedimentos.

## 🚀 Funcionalidades

- **Autenticação Completa**: Login seguro com Firebase Auth
- **Gerenciamento de Clínicas**: Cadastro e administração de múltiplas clínicas
- **Gerenciamento de Usuários**: Controle de acesso com diferentes níveis de permissão
- **Scripts Clínicos**: Criação e organização de scripts por categorias
- **Relatórios**: Estatísticas e análises de uso do sistema
- **Interface Responsiva**: Design adaptável para desktop e dispositivos móveis

## 📋 Pré-requisitos

- Node.js 16+ instalado
- NPM ou Yarn
- Projeto Firebase (configurado no arquivo .env ou usando as configurações padrão)

## 🔧 Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/younv-clinical-scripts.git
   cd younv-clinical-scripts
   ```

2. **Instale as dependências**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure o Firebase (opcional)**
   
   Crie um arquivo `.env` na raiz do projeto com suas credenciais Firebase:
   ```
   VITE_FIREBASE_API_KEY=seu-api-key
   VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=seu-projeto
   VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=seu-messaging-id
   VITE_FIREBASE_APP_ID=seu-app-id
   ```

4. **Configure os usuários iniciais**
   ```bash
   node src/scripts/setupFirebaseUsers.js
   ```

5. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

6. **Acesse o sistema**
   
   Abra seu navegador e acesse: http://localhost:5173

## 👥 Usuários de Demonstração

### Administrador de Clínica
- **Email:** luizebvalente@gmail.com
- **Senha:** 123456
- **Permissões:** Gerenciar scripts e usuários da Clínica São Lucas

### Super Administrador
- **Email:** admin@younv.com.br
- **Senha:** 123456
- **Permissões:** Acesso completo ao sistema, incluindo todas as clínicas

### Usuário Regular
- **Email:** user@clinica.com.br
- **Senha:** 123456
- **Permissões:** Visualizar e usar scripts da Clínica São Lucas

## 🔍 Estrutura do Projeto

```
younv-clinical-scripts/
├── public/              # Arquivos estáticos
├── src/
│   ├── components/      # Componentes React reutilizáveis
│   ├── contexts/        # Contextos React (AuthContext, etc.)
│   ├── data/            # Dados de seed e configurações
│   ├── hooks/           # Custom hooks React
│   ├── lib/             # Bibliotecas e configurações
│   ├── pages/           # Páginas da aplicação
│   ├── scripts/         # Scripts utilitários
│   ├── services/        # Serviços (Firebase, etc.)
│   └── types/           # Definições de tipos
├── .env                 # Variáveis de ambiente (criar manualmente)
└── package.json         # Dependências e scripts
```

## 📱 Páginas Principais

- **`/`**: Página inicial com categorias de scripts
- **`/login`**: Página de login
- **`/scripts/:id`**: Visualização detalhada de um script
- **`/category/:id`**: Scripts filtrados por categoria
- **`/search`**: Busca de scripts
- **`/admin/dashboard`**: Painel administrativo
- **`/admin/clinics`**: Gerenciamento de clínicas
- **`/admin/users`**: Gerenciamento de usuários
- **`/admin/scripts`**: Gerenciamento de scripts
- **`/admin/reports`**: Relatórios e estatísticas

## 🛠️ Desenvolvimento

### Scripts Disponíveis

- **`npm run dev`**: Inicia o servidor de desenvolvimento
- **`npm run build`**: Compila o projeto para produção
- **`npm run preview`**: Visualiza a versão de produção localmente

### Tecnologias Utilizadas

- **React**: Biblioteca JavaScript para construção de interfaces
- **Vite**: Build tool e dev server
- **Firebase**: Autenticação e banco de dados
- **TailwindCSS**: Framework CSS utilitário
- **Lucide Icons**: Biblioteca de ícones
- **React Router**: Roteamento da aplicação

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## ✨ Agradecimentos

- Equipe Younv pelo suporte e direcionamento
- Todos os contribuidores que ajudaram a melhorar este sistema

