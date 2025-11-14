import { CreateTransferenciaData, Cuenta, Transferencia } from "@/core/banco/interfaces/transferencias";
import { Tarjeta, transferenciaActions } from "@/core/banco/transferencias.actions"; // Importar Tarjeta desde las actions
import { useNotificationStore } from "@/presentation/notificaciones/store/useNotificationStore";
import { create } from "zustand";

interface TransferenciaState {
  cuentas: Cuenta[];
  transferencias: Transferencia[];
  tarjetas: Tarjeta[]; // ✅ Ya está definido
  loading: boolean;
  error: string | null;
  success: boolean;
  verificandoCuenta: boolean;
  infoCuentaDestino: { name?: string; bank?: string } | null;
}

interface TransferenciaActions {
  // Datos
  obtenerCuentas: (token: string) => Promise<void>;
  obtenerTransferencias: (token: string) => Promise<void>;
  obtenerTarjetas: (token: string) => Promise<void>; // ✅ Agregar esta acción
  
  // Transferencia
  realizarTransferencia: (data: CreateTransferenciaData, token: string) => Promise<boolean>;
  
  // Verificación de cuenta
  verificarCuentaDestino: (accountNumber: string, token: string) => Promise<void>;
  
  // Validación
  validarTransferencia: (fromAccountId: number, amount: number, toAccountNumber: string) => { isValid: boolean; errors: string[] };
  
  // Utilidades
  obtenerCuentaPorId: (accountId: number) => Cuenta | undefined;
  obtenerSaldoDisponible: (accountId: number) => number;
  obtenerTarjetaPorId: (id: number) => Tarjeta | undefined; // ✅ Agregar esta utilidad
  
  // Estado
  clearError: () => void;
  clearSuccess: () => void;
  clearInfoCuenta: () => void;
}

export const useTransferenciaStore = create<TransferenciaState & TransferenciaActions>((set, get) => ({
  // Estado inicial
  cuentas: [],
  transferencias: [],
  tarjetas: [], // ✅ Inicializar tarjetas vacío
  loading: false,
  error: null,
  success: false,
  verificandoCuenta: false,
  infoCuentaDestino: null,

  // Obtener cuentas del usuario
  obtenerCuentas: async (token: string) => {
    set({ loading: true, error: null });
    try {
      const cuentas = await transferenciaActions.obtenerCuentasUsuario(token);
      set({ cuentas, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // Obtener historial de transferencias
  obtenerTransferencias: async (token: string) => {
    set({ loading: true, error: null });
    try {
      const transferencias = await transferenciaActions.obtenerTransferencias(token);
      set({ transferencias, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // ✅ Obtener tarjetas del usuario (NUEVA ACCIÓN)
  obtenerTarjetas: async (token: string) => {
    set({ loading: true, error: null });
    try {
      const tarjetas = await transferenciaActions.obtenerTarjetasUsuario(token);
      set({ tarjetas, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // Realizar transferencia
 realizarTransferencia: async (data: CreateTransferenciaData, token: string): Promise<boolean> => {
  set({ loading: true, error: null, success: false });
  
  try {
    const validation = get().validarTransferencia(data.fromAccountId, data.amount, data.toAccountNumber);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const transferencia = await transferenciaActions.realizarTransferencia(data, token);
    
    // Actualizar estado
    set(state => ({
      cuentas: state.cuentas.map(cuenta =>
        cuenta.id === data.fromAccountId
          ? { ...cuenta, saldo: cuenta.saldo - data.amount }
          : cuenta
      ),
      transferencias: [transferencia, ...state.transferencias],
      loading: false,
      success: true,
      infoCuentaDestino: null
    }));

    // ✅ NOTIFICACIÓN DE TRANSFERENCIA EXITOSA
    useNotificationStore.getState().addNotification({
      type: 'success',
      title: 'Transferencia realizada',
      message: `Enviaste $${data.amount} a cuenta ${data.toAccountNumber}`,
      action: { 
        type: 'transferencia',
        data: transferencia 
      }
    });

    return true;
  } catch (error: any) {
    set({ error: error.message, loading: false });
    
    // ✅ NOTIFICACIÓN DE ERROR EN TRANSFERENCIA
    useNotificationStore.getState().addNotification({
      type: 'error',
      title: 'Error en transferencia',
      message: error.message
    });
    
    return false;
  }
},

  // Verificar cuenta destino
  verificarCuentaDestino: async (accountNumber: string, token: string) => {
    if (!accountNumber || accountNumber.length < 5) {
      set({ infoCuentaDestino: null });
      return;
    }

    set({ verificandoCuenta: true });
    try {
      const resultado = await transferenciaActions.verificarCuentaDestino(accountNumber, token);
      
      if (resultado.exists) {
        set({ 
          infoCuentaDestino: {
            name: resultado.name,
            bank: resultado.bank
          },
          verificandoCuenta: false
        });
      } else {
        set({ 
          infoCuentaDestino: null,
          verificandoCuenta: false,
          error: 'La cuenta destino no existe o es inválida'
        });
      }
    } catch (error: any) {
      set({ 
        verificandoCuenta: false,
        infoCuentaDestino: null,
        error: error.message
      });
    }
  },

  // Validar transferencia
  validarTransferencia: (fromAccountId: number, amount: number, toAccountNumber: string) => {
    const { cuentas } = get();
    const errors: string[] = [];

    if (!fromAccountId) {
      errors.push('Selecciona una cuenta de origen');
    }

    if (!toAccountNumber || toAccountNumber.length < 10) {
      errors.push('El número de cuenta destino debe tener al menos 10 dígitos');
    }

    if (!amount || amount <= 0) {
      errors.push('Ingresa un monto válido');
    } else if (amount > 10000) {
      errors.push('El monto no puede superar los $10,000');
    }

    // Validar saldo
    if (fromAccountId) {
      const cuenta = cuentas.find(c => c.id === fromAccountId);
      if (cuenta && amount > cuenta.saldo) {
        errors.push(`El monto supera tu saldo disponible ($${cuenta.saldo.toFixed(2)})`);
      }
    }

    // Validar que no sea la misma cuenta
    if (fromAccountId && toAccountNumber) {
      const cuentaOrigen = cuentas.find(c => c.id === fromAccountId);
      if (cuentaOrigen && cuentaOrigen.numero_cuenta === toAccountNumber) {
        errors.push('No puedes transferir a la misma cuenta de origen');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Utilidades
  obtenerCuentaPorId: (accountId: number) => {
    return get().cuentas.find(cuenta => cuenta.id === accountId);
  },

  obtenerSaldoDisponible: (accountId: number) => {
    const cuenta = get().cuentas.find(c => c.id === accountId);
    return cuenta ? cuenta.saldo : 0;
  },

  // ✅ Obtener tarjeta por ID (NUEVA UTILIDAD)
  obtenerTarjetaPorId: (id: number) => {
    return get().tarjetas.find(tarjeta => tarjeta.id === id);
  },

  // Limpiar estados
  clearError: () => set({ error: null }),
  clearSuccess: () => set({ success: false }),
  clearInfoCuenta: () => set({ infoCuentaDestino: null })
}));