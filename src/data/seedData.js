// Seed data for development and testing

import { DEFAULT_CATEGORIES } from '../types';

// Sample clinics
export const sampleClinics = [
  {
    id: 'clinic-1',
    name: 'Clínica São Lucas',
    email: 'contato@clinicasaolucas.com.br',
    phone: '(11) 3456-7890',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    isActive: true,
    settings: {
      theme: 'blue',
      logo: null
    }
  },
  {
    id: 'clinic-2',
    name: 'Centro Médico Vida Nova',
    email: 'admin@vidanova.med.br',
    phone: '(21) 2345-6789',
    address: 'Av. Atlântica, 456 - Rio de Janeiro, RJ',
    isActive: true,
    settings: {
      theme: 'green',
      logo: null
    }
  },
  {
    id: 'clinic-3',
    name: 'Clínica Esperança',
    email: 'info@esperanca.com.br',
    phone: '(31) 3234-5678',
    address: 'Rua da Esperança, 789 - Belo Horizonte, MG',
    isActive: false,
    settings: {
      theme: 'blue',
      logo: null
    }
  }
];

// Sample users
export const sampleUsers = [
  {
    id: 'user-super-admin',
    email: 'admin@younv.com.br',
    name: 'Super Administrador',
    clinicId: null,
    role: 'super_admin',
    isActive: true
  },
  {
    id: 'user-admin-1',
    email: 'admin@clinicasaolucas.com.br',
    name: 'Maria Silva',
    clinicId: 'clinic-1',
    role: 'admin',
    isActive: true
  },
  {
    id: 'user-1',
    email: 'recep1@clinicasaolucas.com.br',
    name: 'Ana Santos',
    clinicId: 'clinic-1',
    role: 'user',
    isActive: true
  },
  {
    id: 'user-2',
    email: 'recep2@clinicasaolucas.com.br',
    name: 'João Oliveira',
    clinicId: 'clinic-1',
    role: 'user',
    isActive: true
  },
  {
    id: 'user-admin-2',
    email: 'admin@vidanova.med.br',
    name: 'Dr. Carlos Mendes',
    clinicId: 'clinic-2',
    role: 'admin',
    isActive: true
  },
  {
    id: 'user-3',
    email: 'atendimento@vidanova.med.br',
    name: 'Fernanda Costa',
    clinicId: 'clinic-2',
    role: 'user',
    isActive: true
  }
];

// Sample scripts
export const sampleScripts = [
  // Clínica São Lucas - Atendimento
  {
    id: 'script-1',
    title: 'Primeiro Contato - Telefone',
    content: `Olá! Bom dia/Boa tarde! Aqui é [SEU NOME] da Clínica São Lucas.

Como posso ajudá-lo(a) hoje?

[AGUARDAR RESPOSTA]

Perfeito! Vou verificar nossa agenda para encontrar o melhor horário para você.

Poderia me informar seu nome completo e telefone para contato?

[ANOTAR DADOS]

Temos disponibilidade para [DATA] às [HORÁRIO]. Seria conveniente para você?

[CONFIRMAR AGENDAMENTO]

Ótimo! Sua consulta está agendada para [DATA] às [HORÁRIO] com [MÉDICO].

Por favor, chegue com 15 minutos de antecedência e traga um documento com foto.

Tem alguma dúvida? Posso ajudar em mais alguma coisa?`,
    categoryId: 'atendimento',
    clinicId: 'clinic-1',
    tags: ['telefone', 'primeiro-contato', 'agendamento'],
    isTemplate: false,
    steps: [
      {
        id: 'step-1',
        title: 'Saudação inicial',
        content: 'Cumprimente o paciente e se identifique',
        order: 1,
        type: 'text'
      },
      {
        id: 'step-2',
        title: 'Identificar necessidade',
        content: 'Pergunte como pode ajudar',
        order: 2,
        type: 'text'
      },
      {
        id: 'step-3',
        title: 'Coletar dados',
        content: 'Nome completo e telefone',
        order: 3,
        type: 'checklist'
      },
      {
        id: 'step-4',
        title: 'Verificar agenda',
        content: 'Consultar disponibilidade',
        order: 4,
        type: 'text'
      },
      {
        id: 'step-5',
        title: 'Confirmar agendamento',
        content: 'Confirmar data, horário e orientações',
        order: 5,
        type: 'text'
      }
    ],
    isActive: true
  },
  {
    id: 'script-2',
    title: 'Reagendamento de Consulta',
    content: `Olá [NOME DO PACIENTE]! Aqui é [SEU NOME] da Clínica São Lucas.

Estou entrando em contato sobre sua consulta marcada para [DATA ORIGINAL] às [HORÁRIO ORIGINAL].

Infelizmente precisamos reagendar devido a [MOTIVO - se necessário].

Podemos remarcar para:
- [OPÇÃO 1]
- [OPÇÃO 2]
- [OPÇÃO 3]

Qual dessas opções seria melhor para você?

[AGUARDAR ESCOLHA]

Perfeito! Sua consulta foi reagendada para [NOVA DATA] às [NOVO HORÁRIO].

Você receberá uma confirmação por WhatsApp/SMS.

Peço desculpas pelo transtorno e agradeço a compreensão!`,
    categoryId: 'agendamento',
    clinicId: 'clinic-1',
    tags: ['reagendamento', 'confirmacao'],
    isTemplate: false,
    steps: [],
    isActive: true
  },
  {
    id: 'script-3',
    title: 'Orientações Pré-Cirurgia',
    content: `Olá [NOME DO PACIENTE]!

Sua cirurgia está agendada para [DATA] às [HORÁRIO].

ORIENTAÇÕES IMPORTANTES:

🚫 JEJUM:
- Não comer nem beber nada por 8 horas antes da cirurgia
- Última refeição às [HORÁRIO]

💊 MEDICAÇÕES:
- Suspender [MEDICAÇÕES ESPECÍFICAS] conforme orientação médica
- Continuar apenas [MEDICAÇÕES PERMITIDAS]

🧼 HIGIENE:
- Tomar banho na noite anterior e na manhã da cirurgia
- Não usar cremes, perfumes ou maquiagem

👕 ROUPAS:
- Usar roupas confortáveis e fáceis de vestir
- Evitar joias e acessórios

🚗 ACOMPANHANTE:
- Obrigatório ter acompanhante maior de idade
- Não poderá dirigir após o procedimento

📋 DOCUMENTOS:
- RG, CPF e carteirinha do convênio
- Exames pré-operatórios

Alguma dúvida? Estamos aqui para ajudar!`,
    categoryId: 'cirurgia',
    clinicId: 'clinic-1',
    tags: ['pre-operatorio', 'orientacoes', 'jejum'],
    isTemplate: true,
    steps: [],
    isActive: true
  },
  {
    id: 'script-4',
    title: 'Resposta - Preço Alto',
    content: `Entendo sua preocupação com o valor, [NOME DO PACIENTE].

É natural que o investimento em saúde seja uma decisão importante.

Deixe-me explicar o que está incluído no valor:

✅ Consulta completa com especialista experiente
✅ Exames necessários para diagnóstico preciso  
✅ Acompanhamento pós-consulta
✅ Estrutura moderna e equipamentos de última geração
✅ Equipe altamente qualificada

Nosso foco é oferecer o melhor cuidado possível para sua saúde.

Temos algumas opções de pagamento que podem ajudar:
- Parcelamento no cartão
- Desconto para pagamento à vista
- Convênios aceitos

Sua saúde não tem preço, mas nosso atendimento tem valor justo.

Que tal agendarmos uma consulta para você conhecer nossa estrutura?`,
    categoryId: 'objecoes',
    clinicId: 'clinic-1',
    tags: ['preco', 'valor', 'pagamento'],
    isTemplate: false,
    steps: [],
    isActive: true
  },
  {
    id: 'script-5',
    title: 'Follow-up Pós-Consulta',
    content: `Olá [NOME DO PACIENTE]!

Espero que esteja bem!

Estou entrando em contato para saber como você está se sentindo após a consulta de [DATA].

Como está seguindo o tratamento prescrito pelo Dr. [NOME DO MÉDICO]?

Tem alguma dúvida sobre:
- Os medicamentos prescritos?
- Os exames solicitados?
- As orientações dadas?

Se precisar esclarecer alguma coisa, estou aqui para ajudar.

Lembre-se do seu retorno agendado para [DATA DO RETORNO].

Cuidando bem da sua saúde! 💙`,
    categoryId: 'follow_up',
    clinicId: 'clinic-1',
    tags: ['pos-consulta', 'acompanhamento', 'medicamentos'],
    isTemplate: false,
    steps: [],
    isActive: true
  },
  // Centro Médico Vida Nova
  {
    id: 'script-6',
    title: 'Atendimento WhatsApp',
    content: `Olá! 👋

Seja bem-vindo(a) ao Centro Médico Vida Nova!

Sou [SEU NOME] e estou aqui para ajudá-lo(a).

Como posso ajudar hoje?

📅 Agendar consulta
🔄 Reagendar/cancelar
📋 Informações sobre exames
💊 Dúvidas sobre tratamento
📞 Outros assuntos

Digite o número da opção ou me conte o que precisa!`,
    categoryId: 'atendimento',
    clinicId: 'clinic-2',
    tags: ['whatsapp', 'menu', 'opcoes'],
    isTemplate: false,
    steps: [],
    isActive: true
  },
  {
    id: 'script-7',
    title: 'Confirmação de Consulta',
    content: `Olá [NOME DO PACIENTE]! 

Estou confirmando sua consulta:

📅 Data: [DATA]
🕐 Horário: [HORÁRIO]
👨‍⚕️ Médico: [NOME DO MÉDICO]
📍 Local: Centro Médico Vida Nova

IMPORTANTE:
- Chegue 15 minutos antes
- Traga documento com foto
- Traga carteirinha do convênio
- [ORIENTAÇÕES ESPECÍFICAS]

Para confirmar, responda:
✅ CONFIRMO
❌ PRECISO REAGENDAR

Aguardo sua confirmação! 😊`,
    categoryId: 'agendamento',
    clinicId: 'clinic-2',
    tags: ['confirmacao', 'lembrete'],
    isTemplate: false,
    steps: [],
    isActive: true
  }
];

// Function to get sample data by clinic
export const getSampleDataByClinic = (clinicId) => {
  return {
    clinic: sampleClinics.find(c => c.id === clinicId),
    users: sampleUsers.filter(u => u.clinicId === clinicId),
    scripts: sampleScripts.filter(s => s.clinicId === clinicId)
  };
};

// Function to get all sample data
export const getAllSampleData = () => {
  return {
    clinics: sampleClinics,
    users: sampleUsers,
    scripts: sampleScripts,
    categories: DEFAULT_CATEGORIES
  };
};

// Mock authentication for development
export const mockAuth = {
  superAdmin: {
    user: { uid: 'user-super-admin', email: 'admin@younv.com.br' },
    userData: sampleUsers.find(u => u.id === 'user-super-admin')
  },
  clinicAdmin: {
    user: { uid: 'user-admin-1', email: 'admin@clinicasaolucas.com.br' },
    userData: sampleUsers.find(u => u.id === 'user-admin-1')
  },
  regularUser: {
    user: { uid: 'user-1', email: 'recep1@clinicasaolucas.com.br' },
    userData: sampleUsers.find(u => u.id === 'user-1')
  }
};

