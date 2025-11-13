// hooks/useToast.ts
import { useCallback, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'transfer';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  monto?: number;
}

export const useToast
 = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-remover después de la duración
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 4000);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Métodos helper específicos
  const toast = {
    success: (title: string, message?: string) => 
      showToast({ type: 'success', title, message }),
    
    error: (title: string, message?: string) => 
      showToast({ type: 'error', title, message, duration: 5000 }),
    
    warning: (title: string, message?: string) => 
      showToast({ type: 'warning', title, message }),
    
    info: (title: string, message?: string) => 
      showToast({ type: 'info', title, message, duration: 3000 }),
    
    transfer: (title: string, message?: string, monto?: number) => 
      showToast({ type: 'transfer', title, message, monto, duration: 5000 }),
    
    welcome: (nombre: string) => 
      showToast({ 
        type: 'success', 
        title: '¡Bienvenido! 🎉', 
        message: `Hola ${nombre}, es un placer verte de nuevo` 
      })
  };

  return {
    toasts,
    showToast,
    hideToast,
    clearAllToasts,
    toast
  };
};