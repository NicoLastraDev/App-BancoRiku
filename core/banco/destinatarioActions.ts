import { useNotificationStore } from "@/presentation/notificaciones/store/useNotificationStore";
import { Alert } from "react-native";
import bancoApi from "../api/BancoApi"; // ← Usar tu bancoApi
import { CreateDestinatarioData, Destinatario } from "../auth/interfaces/destinatarios";

export const destinatarioActions = {

  // Crear nuevo destinatario
  crearDestinatario: async (destinatarioData: CreateDestinatarioData): Promise<Destinatario> => {
    try {
      console.log('📨 Creando destinatario:', destinatarioData);
      
      const { data } = await bancoApi.post<{ success: boolean; message: string }>(
        '/beneficiarios/add', 
        destinatarioData
      );

      if (data.success) {
        console.log('✅ Destinatario creado exitosamente');
        
        // ✅ NOTIFICACIÓN DE DESTINATARIO CREADO
        useNotificationStore.getState().addNotification({
          type: 'success',
          title: 'Destinatario agregado',
          message: `Agregaste a ${destinatarioData.nombre} como destinatario`
        });
        
        return {
          id: Date.now(),
          ...destinatarioData
        };
      } else {
        throw new Error(data.message || 'Error al crear destinatario');
      }
    } catch (error: any) {
      console.log('❌ Error creando destinatario', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Error al crear destinatario';
      
      // ✅ NOTIFICACIÓN DE ERROR
      useNotificationStore.getState().addNotification({
        type: 'error',
        title: 'Error al agregar destinatario',
        message: errorMessage
      });
      
      Alert.alert('Error', errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Obtener todos los destinatarios del usuario
  obtenerDestinatarios: async (): Promise<Destinatario[]> => {
    try {
      console.log('📋 Obteniendo destinatarios...');
      
      const { data } = await bancoApi.get<{ success: boolean; data: Destinatario[] }>('/beneficiarios/list');

      if (data.success) {
        console.log('✅ Destinatarios obtenidos:', data.data?.length || 0);
        return data.data || [];
      } else {
        throw new Error(data.message || 'Error al obtener destinatarios');
      }
    } catch (error: any) {
      console.log('❌ Error obteniendo destinatarios:', error.response?.data);
      Alert.alert('Error', 'No se pudieron cargar los destinatarios');
      return [];
    }
  },

  // Actualizar destinatario
  actualizarDestinatario: async (id: number, destinatarioData: Partial<CreateDestinatarioData>): Promise<Destinatario> => {
    try {
      console.log('✏️ Actualizando destinatario ID:', id);
      
      const { data } = await bancoApi.put<{ success: boolean; data: Destinatario }>(
        `/beneficiarios/update/${id}`, 
        destinatarioData
      );

      if (data.success && data.data) {
        console.log('✅ Destinatario actualizado');
        return data.data;
      } else {
        throw new Error(data.message || 'Error al actualizar el destinatario');
      }
    } catch (error: any) {
      console.log('❌ Error actualizando destinatario:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Error al actualizar el destinatario';
      Alert.alert('Error', errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Eliminar destinatario
  eliminarDestinatario: async (id: number): Promise<boolean> => {
    try {
      console.log('🗑️ Eliminando destinatario ID:', id);
      
      const { data } = await bancoApi.delete<{ success: boolean; message: string }>(`/beneficiarios/delete/${id}`);

      if (data.success) {
        console.log('✅ Destinatario eliminado');
        return true;
      } else {
        throw new Error(data.message || 'Error al eliminar el destinatario');
      }
    } catch (error: any) {
      console.log('❌ Error eliminando destinatario:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Error al eliminar el destinatario';
      Alert.alert('Error', errorMessage);
      return false;
    }
  }
};