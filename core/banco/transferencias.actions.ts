import { useNotificationStore } from "@/presentation/notificaciones/store/useNotificationStore";
import bancoApi from "../api/BancoApi";
import { CreateTransferenciaData, Cuenta, Transferencia } from "./interfaces/transferencias";

// Interface para Tarjeta (agrégala en tu archivo de interfaces)
export interface Tarjeta {
  id: number;
  numero_tarjeta: string;
  fecha_vencimiento: string;
  cvv: string;
  nombre_titular: string;
  tipo_tarjeta: 'DEBITO' | 'CREDITO';
  marca_tarjeta: 'VISA' | 'MASTERCARD' | 'AMEX';
  saldo_actual: number;
  created_at: string;
}

export const transferenciaActions = {

  // Crear transferencia
   realizarTransferencia: async(data: CreateTransferenciaData, token: string): Promise<Transferencia> => {
    try {
      const response = await bancoApi.post<Transferencia>('/transferencias', data);
      
      // ✅ NOTIFICACIÓN DE ÉXITO
      useNotificationStore.getState().addNotification({
        type: 'success',
        title: 'Transferencia exitosa',
        message: `Enviaste $${data.monto} a cuenta ${data.cuenta_destino}`,
        action: { 
          type: 'transferencia',
          data: response.data 
        }
      });
      
      return response.data;
    } catch (error: any) {
      // ✅ NOTIFICACIÓN DE ERROR
      useNotificationStore.getState().addNotification({
        type: 'error',
        title: 'Error en transferencia',
        message: error.response?.data?.message || 'No se pudo completar la transferencia'
      });
      throw error;
    }
  },

  // Obtener transferencias
  obtenerTransferencias: async(token: string): Promise<Transferencia[]> => {
    try {
      console.log('🔍 Obteniendo transferencias...');
      
      const response = await bancoApi.get<any>('/transferencias');
      
      console.log('📦 Respuesta completa:', response);
      console.log('📊 Respuesta data:', response.data);
      
      // Verificar diferentes estructuras posibles
      if (response.data.success && Array.isArray(response.data.data)) {
        console.log('✅ Estructura con success:true y data array');
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        console.log('✅ Estructura con array directo');
        return response.data;
      } else {
        console.log('❌ Estructura inesperada:', response.data);
        throw new Error('Formato de respuesta inválido del servidor');
      }

    } catch (error: any) {
      console.log('❌ Error en obtenerTransferencias:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error de conexión al obtener transferencias');
    }
  },

  // Obtener cuentas de usuario
  obtenerCuentasUsuario: async (token: string): Promise<Cuenta[]> => {
    try {
      const response = await bancoApi.get<Cuenta[]>('/cuentas');
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error de conexión al obtener cuentas');
    }
  },

  // Obtener destinatarios
  obtenerDestinatarios: async(token: string): Promise<any[]> => {
    try {
      const response = await bancoApi.get('/destinatarios');
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error de conexión al obtener destinatarios');
    }
  },

  // Verificar cuenta de destino
  verificarCuentaDestino: async (accountNumber: string, token: string): Promise<{ exists: boolean; name?: string; bank?: string }> => {
    try {
      const response = await bancoApi.post('/cuentas/verificar', { accountNumber });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { exists: false };
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error de conexión al verificar cuenta');
    }
  },

  // ========== ACCIONES PARA TARJETAS ==========

  // Obtener todas las tarjetas del usuario
  obtenerTarjetasUsuario: async (token: string): Promise<Tarjeta[]> => {
  try {
    console.log('🔍 [TARJETAS] Iniciando request...');
    console.log('🌐 [TARJETAS] URL base:', bancoApi.defaults.baseURL);
    console.log('🔑 [TARJETAS] Token presente:', !!token);
    
    const response = await bancoApi.get<any>('/tarjetas');
    
    console.log('✅ [TARJETAS] Response exitosa:', {
      status: response.status,
      data: response.data
    });
    
    if (response.data.success && Array.isArray(response.data.data)) {
      console.log('📊 [TARJETAS] Tarjetas obtenidas:', response.data.data.length);
      return response.data.data;
    } else if (Array.isArray(response.data)) {
      console.log('📊 [TARJETAS] Tarjetas obtenidas (array directo):', response.data.length);
      return response.data;
    } else {
      console.log('❌ [TARJETAS] Formato inesperado:', response.data);
      throw new Error('Formato de respuesta inválido para tarjetas');
    }
  } catch (error: any) {
    console.log('❌ [TARJETAS] Error completo:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Error de conexión al obtener tarjetas: ' + error.message);
  }
},

  // Obtener una tarjeta específica
  obtenerTarjeta: async (id: number, token: string): Promise<Tarjeta> => {
    try {
      const response = await bancoApi.get<any>(`/tarjetas/${id}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      } else {
        throw new Error('Formato de respuesta inválido para tarjeta');
      }
    } catch (error: any) {
      console.log('❌ Error obteniendo tarjeta:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error de conexión al obtener la tarjeta');
    }
  },

  // Crear nueva tarjeta
  crearTarjeta: async (data: {
    numero_tarjeta: string;
    fecha_vencimiento: string;
    cvv: string;
    nombre_titular: string;
  }, token: string): Promise<Tarjeta> => {
    try {
      const response = await bancoApi.post<any>('/tarjetas', data);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      } else {
        throw new Error('Formato de respuesta inválido al crear tarjeta');
      }
    } catch (error: any) {
      console.log('❌ Error creando tarjeta:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error de conexión al crear tarjeta');
    }
  }
};