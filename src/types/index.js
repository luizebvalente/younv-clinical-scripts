// Types for Younv Clinical Scripts

// User roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user'
};

// Script categories
export const SCRIPT_CATEGORIES = {
  ATENDIMENTO: 'atendimento',
  CIRURGIA: 'cirurgia',
  CONSULTA: 'consulta',
  OBJECOES: 'objecoes',
  FOLLOW_UP: 'follow_up',
  AGENDAMENTO: 'agendamento'
};

// Step types for guided scripts
export const STEP_TYPES = {
  TEXT: 'text',
  CHECKLIST: 'checklist',
  DECISION: 'decision'
};

// Default categories with icons and descriptions
export const DEFAULT_CATEGORIES = [
  {
    id: 'atendimento',
    name: 'Atendimento',
    description: 'Scripts para recepção e primeiro contato',
    icon: 'Phone',
    order: 1
  },
  {
    id: 'cirurgia',
    name: 'Cirurgia',
    description: 'Protocolos pré e pós-cirúrgicos',
    icon: 'Scissors',
    order: 2
  },
  {
    id: 'consulta',
    name: 'Consulta',
    description: 'Roteiros para diferentes tipos de consulta',
    icon: 'Stethoscope',
    order: 3
  },
  {
    id: 'objecoes',
    name: 'Objeções',
    description: 'Respostas para objeções comuns',
    icon: 'MessageCircle',
    order: 4
  },
  {
    id: 'follow_up',
    name: 'Follow-up',
    description: 'Scripts de acompanhamento pós-consulta',
    icon: 'Calendar',
    order: 5
  },
  {
    id: 'agendamento',
    name: 'Agendamento',
    description: 'Protocolos de agendamento e reagendamento',
    icon: 'Clock',
    order: 6
  }
];

// Validation helpers
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

