// core/banco/actions/cuentaActions.ts
import { Cuenta } from "@/core/banco/interfaces/cuentas";
import { Alert } from "react-native";
import bancoApi from "../api/BancoApi";

export const cuentaActions = {

  // Obtener cuenta del usuario autenticado (sin token en parámetros)
  obtenerCuenta: async (): Promise<Cuenta | null> => {
    try {
      console.log('📊 Obteniendo cuenta del usuario...');
      const { data } = await bancoApi.get<{ success: boolean; data: Cuenta }>('/cuenta/info');
      
      if (data.success && data.data) {
        console.log('✅ Cuenta obtenida exitosamente:', data.data.numero_cuenta);
        return data.data;
      } else {
        console.log('⚠️ Respuesta sin datos válidos');
        Alert.alert('Error', 'No se pudieron obtener los datos de la cuenta');
        return null;
      }
    } catch (error: any) {
      console.log('❌ Error obteniendo cuenta:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Error al cargar la cuenta';
      Alert.alert('Error', errorMessage);
      return null;
    }
  },

  // Obtener historial de transacciones de la cuenta
  obtenerHistorial: async (cuentaId: number): Promise<any[]> => {
    try {
      console.log('📋 Obteniendo historial para cuenta ID:', cuentaId);
      const { data } = await bancoApi.get<any[]>(`/cuenta/${cuentaId}/transacciones`);
      console.log('✅ Historial obtenido:', data.length, 'transacciones');
      return data;
    } catch (error: any) {
      console.log('❌ Error obteniendo historial:', error.response?.data);
      Alert.alert('Error', 'No se pudo cargar el historial de transacciones');
      return [];
    }
  },

  // Realizar transferencia
  realizarTransferencia: async (transferenciaData: {
    cuenta_destino: string;
    monto: number;
    descripcion?: string;
  }): Promise<boolean> => {
    try {
      console.log('💸 Realizando transferencia:', transferenciaData);
      const { data } = await bancoApi.post<{ success: boolean; message: string }>(
        '/cuenta/transferir', 
        transferenciaData
      );
      
      if (data.success) {
        console.log('✅ Transferencia realizada exitosamente');
        Alert.alert('Éxito', data.message || 'Transferencia realizada');
        return true;
      } else {
        throw new Error(data.message || 'Error en la transferencia');
      }
    } catch (error: any) {
      console.log('❌ Error realizando transferencia:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Error al realizar la transferencia';
      Alert.alert('Error', errorMessage);
      return false;
    }
  },

  // Actualizar datos de la cuenta
  actualizarCuenta: async (cuentaData: Partial<Cuenta>): Promise<Cuenta | null> => {
    try {
      console.log('✏️ Actualizando datos de cuenta...');
      const { data } = await bancoApi.put<{ success: boolean; data: Cuenta }>(
        '/cuenta/actualizar', 
        cuentaData
      );
      
      if (data.success && data.data) {
        console.log('✅ Cuenta actualizada exitosamente');
        return data.data;
      } else {
        throw new Error('Error al actualizar la cuenta');
      }
    } catch (error: any) {
      console.log('❌ Error actualizando cuenta:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Error al actualizar la cuenta';
      Alert.alert('Error', errorMessage);
      return null;
    }
  }
};