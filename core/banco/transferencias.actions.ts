import { useNotificationStore } from "@/presentation/notificaciones/store/useNotificationStore";
import bancoApi from "../api/BancoApi";
import { DestinatarioNotifications } from "./destinatarioNotifications";
import { Cuenta } from "./interfaces/cuentas";
import { CreateTransferenciaData, Transferencia } from "./interfaces/transferencias";
import { PushNotificationService } from "./pushNotifications";
import { TransferenciaNotifications } from "./transferenciaNotifications";

// Interface para Tarjeta
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

  // Crear transferencia - VERSIÓN CORREGIDA
  realizarTransferencia: async(data: CreateTransferenciaData, token: string): Promise<Transferencia> => {
    try {
      console.log('🚀 Iniciando transferencia...');
      
      // ✅ PREPARAR DATOS PARA EL BACKEND (solo los campos que necesita)
      const datosParaBackend = {
        cuenta_destino: data.cuenta_destino,
        monto: data.monto,
        descripcion: data.descripcion
      };
      
      const response = await bancoApi.post<any>('/transferencias', datosParaBackend);
      
      console.log('🔍 Respuesta completa del backend:', {
        status: response.status,
        data: response.data
      });
      
      // Verificar si la transferencia fue exitosa
      if (response.data.success) {
        console.log('✅ Transferencia exitosa');
        
        // ✅ NOTIFICACIONES PUSH MEJORADAS
        try {
          // Obtener información completa del destinatario
          const infoDestinatario = await TransferenciaNotifications.obtenerInfoCuentaDestino(data.cuenta_destino.toString());
          
          if (infoDestinatario && infoDestinatario.usuario) {
            console.log('👤 Información del destinatario obtenida:', infoDestinatario.usuario);
            
            // Notificar al remitente CON NOMBRE
            await TransferenciaNotifications.notificarRemitente(
              data.fromAccountId, // ✅ Ahora esta propiedad existe
              data.monto,
              data.cuenta_destino.toString()
            );
            
            // Notificar al destinatario
            await TransferenciaNotifications.notificarDestinatario(
              infoDestinatario.usuario.id,
              data.monto,
              data.cuenta_origen || 'Cuenta origen', // ✅ Ahora esta propiedad existe
              infoDestinatario.usuario.nombre
            );
          } else {
            // Notificación de respaldo si no se pudo obtener información
            await TransferenciaNotifications.notificarRemitente(
              data.fromAccountId,
              data.monto,
              data.cuenta_destino.toString()
            );
          }
        } catch (pushError) {
          console.log('⚠️ Error en notificaciones push:', pushError);
          // Notificación básica de respaldo
          await PushNotificationService.scheduleLocalNotification(
            '✅ Transferencia Exitosa',
            `Enviaste $${data.monto} a cuenta ${data.cuenta_destino}`,
            { type: 'transferencia_exitosa' }
          );
        }
        
        // ✅ NOTIFICACIÓN LOCAL DE ÉXITO
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
      } else {
        // ❌ El backend retornó success: false
        console.log('❌ Backend reportó error:', response.data.message);
        
        // ✅ NOTIFICACIÓN DE ERROR
        await TransferenciaNotifications.notificarError(
          data.fromAccountId,
          response.data.message
        );
        
        const error = new Error(response.data.message);
        (error as any).response = { data: response.data };
        throw error;
      }
      
    } catch (error: any) {
      console.log('❌ Error en transferencia:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || 'No se pudo completar la transferencia';
      
      // ✅ NOTIFICACIÓN DE ERROR
      try {
        await TransferenciaNotifications.notificarError(
          data.fromAccountId,
          errorMessage
        );
      } catch (pushError) {
        console.log('⚠️ Error enviando notificación de error:', pushError);
      }
      
      // ✅ NOTIFICACIÓN LOCAL DE ERROR
      useNotificationStore.getState().addNotification({
        type: 'error',
        title: 'Error en transferencia',
        message: errorMessage
      });
      
      // Propagar el error con más información
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).originalError = error;
      (enhancedError as any).isInsufficientFunds = errorMessage.includes('Saldo insuficiente');
      
      throw enhancedError;
    }
  },

  // ... (el resto de las funciones se mantienen igual)
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
  },

  // ========== ACCIONES PARA NOTIFICACIONES DE DESTINATARIOS ==========

  // Agregar destinatario con notificaciones
  agregarDestinatario: async (destinatarioData: any, token: string): Promise<any> => {
    try {
      console.log('👥 Agregando destinatario...');
      
      const response = await bancoApi.post('/destinatarios', destinatarioData);
      
      if (response.data.success) {
        console.log('✅ Destinatario agregado exitosamente');
        
        // ✅ NOTIFICACIONES PUSH PARA DESTINATARIO AGREGADO
        try {
          await DestinatarioNotifications.notificarDestinatarioAgregado(
            destinatarioData.nombre,
            destinatarioData.numero_cuenta
          );
        } catch (pushError) {
          console.log('⚠️ Error en notificaciones push:', pushError);
        }
        
        // ✅ NOTIFICACIÓN LOCAL
        useNotificationStore.getState().addNotification({
          type: 'success',
          title: 'Destinatario agregado',
          message: `Agregaste a ${destinatarioData.nombre} como destinatario`,
          action: {
            type: 'destinatario',
            data: response.data
          }
        });
        
        return response.data;
      } else {
        throw new Error(response.data.message || 'Error al agregar destinatario');
      }
    } catch (error: any) {
      console.log('❌ Error agregando destinatario:', error);
      
      const errorMessage = error.response?.data?.message || 'No se pudo agregar el destinatario';
      
      // ✅ NOTIFICACIÓN DE ERROR
      try {
        await DestinatarioNotifications.notificarErrorAgregarDestinatario(errorMessage);
      } catch (pushError) {
        console.log('⚠️ Error enviando notificación de error:', pushError);
      }
      
      // ✅ NOTIFICACIÓN LOCAL DE ERROR
      useNotificationStore.getState().addNotification({
        type: 'error',
        title: 'Error al agregar destinatario',
        message: errorMessage
      });
      
      throw new Error(errorMessage);
    }
  },

  // Buscar cuenta para destinatario con notificaciones
  buscarCuentaParaDestinatario: async (numeroCuenta: string, token: string): Promise<any> => {
    try {
      console.log('🔍 Buscando cuenta para destinatario:', numeroCuenta);
      
      const response = await bancoApi.post('/beneficiarios/search', { numero_cuenta: numeroCuenta });
      
      if (response.data.success && response.data.data) {
        console.log('✅ Cuenta encontrada para destinatario');
        
        // ✅ NOTIFICACIÓN DE BÚSQUEDA EXITOSA
        try {
          await PushNotificationService.scheduleLocalNotification(
            '✅ Cuenta Encontrada',
            `Se encontró la cuenta ${numeroCuenta} para agregar como destinatario`
          );
        } catch (pushError) {
          console.log('⚠️ Error en notificación push:', pushError);
        }
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Cuenta no encontrada');
      }
    } catch (error: any) {
      console.log('❌ Error buscando cuenta:', error);
      
      const errorMessage = error.response?.data?.message || 'No se pudo encontrar la cuenta';
      
      // ✅ NOTIFICACIÓN DE ERROR EN BÚSQUEDA
      try {
        await PushNotificationService.scheduleLocalNotification(
          '❌ Cuenta No Encontrada',
          errorMessage
        );
      } catch (pushError) {
        console.log('⚠️ Error enviando notificación de error:', pushError);
      }
      
      throw new Error(errorMessage);
    }
  }
};