/**
 * Serviço de autenticação
 * 
 * Este serviço gerencia a autenticação de usuários usando Firebase Auth
 * com criação automática de usuários de demonstração.
 */

import autoSetupAuthService from './autoSetupAuthService';

// Usar o serviço de autenticação com setup automático
const authService = autoSetupAuthService;

export default authService;

