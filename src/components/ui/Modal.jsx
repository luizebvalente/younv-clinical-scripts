import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true 
}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement;
      
      // Focus the modal
      modalRef.current?.focus();
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
      
      // Restore focus to previously focused element
      previousFocusRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      case 'full':
        return 'max-w-full mx-4';
      default:
        return 'max-w-lg';
    }
  };

  const handleOverlayClick = (event) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div 
        ref={modalRef}
        className={`
          relative w-full ${getSizeClasses()} bg-white rounded-xl shadow-2xl 
          transform transition-all duration-300 ease-out
          animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2
        `}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && (
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Fechar modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Modal específico para visualização de scripts
export const ScriptViewModal = ({ isOpen, onClose, script }) => {
  if (!script) return null;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(script.content);
      // Aqui você pode adicionar um toast de sucesso
      console.log('Script copiado para a área de transferência!');
    } catch (err) {
      console.error('Erro ao copiar script:', err);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={script.title}
      size="lg"
    >
      <div className="space-y-6">
        {/* Metadados */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-medium">Categoria:</span>
            <span className="clinic-badge">{script.categoryName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Criado em:</span>
            <span>{new Date(script.createdAt).toLocaleDateString('pt-BR')}</span>
          </div>
          {script.lastUsed && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Último uso:</span>
              <span>{new Date(script.lastUsed).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </div>

        {/* Conteúdo do script */}
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Conteúdo do Script:</h3>
          <div className="text-gray-900 whitespace-pre-wrap leading-relaxed">
            {script.content}
          </div>
        </div>

        {/* Etapas (se existir) */}
        {script.steps && script.steps.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Etapas do Script:</h3>
            <div className="space-y-2">
              {script.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {script.tags && script.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {script.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={copyToClipboard}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Copiar Script
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default Modal;

