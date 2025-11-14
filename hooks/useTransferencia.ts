import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { useDestinatariosStore } from '@/presentation/destinatarios/store/useDestinatariosStore';
import { useTransferenciaStore } from '@/presentation/transferencias/store/useTransferenciasStore';
import { useEffect } from 'react';


export const useTransferencia = () => {
  const { token } = useAuthStore();
  
  // Stores
  const { 
    cuentas, 
    loading, 
    error, 
    success, 
    verificandoCuenta, 
    infoCuentaDestino,
    obtenerCuentas, 
    realizarTransferencia,
    verificarCuentaDestino,
    clearError,
    clearInfoCuenta
  } = useTransferenciaStore();
  
  const { destinatarios, obtenerDestinatarios } = useDestinatariosStore();

  // Cargar datos al inicializar
  useEffect(() => {
    if (token) {
      obtenerCuentas(token);
      obtenerDestinatarios(token);
    }
  }, [token]);

  // Preparar opciones para los selects
  const cuentasOptions = cuentas.map(cuenta => ({
    value: cuenta.id,
    label: `${cuenta.accountName} - $${cuenta.balance.toFixed(2)}`,
    balance: cuenta.balance
  }));

  const destinatariosOptions = destinatarios.map(dest => ({
    value: dest.numero_cuenta,
    label: `${dest.nombre} - ${dest.numero_cuenta}`,
    bank: dest.banco_destino
  }));

  // Función para realizar transferencia
  const handleRealizarTransferencia = async (data: {
    fromAccountId: number;
    toAccountNumber: string;
    amount: number;
    description?: string;
  }) => {
    if (!token) {
      throw new Error('No autenticado');
    }
    return realizarTransferencia(data, token);
  };

  // Función para verificar cuenta (sin debounce)
  const handleVerificarCuenta = (accountNumber: string) => {
    clearInfoCuenta();
    if (accountNumber.length >= 10 && token) {
      verificarCuentaDestino(accountNumber, token);
    }
  };

  // Función para obtener saldo disponible
  const obtenerSaldoDisponible = (accountId: number): number => {
    const cuenta = cuentas.find(c => c.id === accountId);
    return cuenta ? cuenta.balance : 0;
  };

  return {
    // Estados
    cuentas,
    destinatarios,
    loading,
    error,
    success,
    verificandoCuenta,
    infoCuentaDestino,

    // Opciones para selects
    cuentasOptions,
    destinatariosOptions,

    // Acciones
    realizarTransferencia: handleRealizarTransferencia,
    verificarCuenta: handleVerificarCuenta,
    clearError,

    // Utilidades
    obtenerSaldoDisponible,
    token // Exponer token por si acaso
  };
};