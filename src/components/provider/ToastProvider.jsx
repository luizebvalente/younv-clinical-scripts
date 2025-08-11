// src/components/providers/ToastProvider.jsx
import React from 'react';
import { useToast, ToastContainer } from '../ui/Toast';

// Provider para ser usado no App.jsx
export const ToastProvider = ({ children }) => {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

// Ou se preferir, adicione diretamente no seu App.jsx:
/*
import { useToast, ToastContainer } from './components/ui/Toast';

function App() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="App">
      {/* Seu conteúdo da aplicação */}
      <Routes>
        {/* suas rotas */}
      </Routes>
      
      {/* Container de Toasts */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
*/
