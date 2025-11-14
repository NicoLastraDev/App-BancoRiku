// providers/ToastProvider.tsx

import { Toast } from '@/components/Toasts';
import { useToast } from '@/hooks/useToasts';
import React from 'react';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts, hideToast } = useToast();

  return (
    <>
      {children}
      
      {/* Renderizar todos los toasts activos */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          visible={true}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          monto={toast.monto}
          onHide={() => hideToast(toast.id)}
        />
      ))}
    </>
  );
};