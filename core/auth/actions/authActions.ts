import bancoApi from "@/core/api/BancoApi";
import { User } from "../interfaces/user";

export interface AuthResponse {
  token: string;
  user: User;
}

const returnUserToken = (data: AuthResponse) => {
  console.log('🔄 returnUserToken - data recibida:', data);
  console.log('🔍 data.user:', data.user);
  console.log('🔍 data.user.id:', data.user?.id);
  
  return {
    user: data.user,
    token: data.token
  };
}

import { useNotificationStore } from '@/presentation/notificaciones/store/useNotificationStore';

// ✅ AGREGAR: Función authCheckStatus que falta
export const authCheckStatus = async () => {
  try {
    console.log('🔍 authCheckStatus - Verificando token con backend...');
    
    // ✅ CAMBIAR: Agregar /api/
    const response = await bancoApi.get('/auth/check-status');
    console.log('✅ authCheckStatus - Respuesta del backend:', response.data);
    
    if (response.data && response.data.token && response.data.user) {
      return returnUserToken(response.data);
    } else {
      console.log('❌ authCheckStatus - Respuesta inválida:', response.data);
      return null;
    }
    
  } catch (error: any) {
    console.log('❌ authCheckStatus - Error:', error.response?.data || error.message);
    useNotificationStore.getState().addNotification({
      type: 'error',
      title: 'Error de sesión',
      message: 'Tu sesión ha expirado'
    });
    return null;
  }
};

export const authLogin = async (email: string, password: string) => {
  try {
    console.log('🚀 authLogin - Haciendo request...');
    
    // ✅ LIMPIAR Y VALIDAR EMAIL
    email = email.toLowerCase().trim();
    
    const response = await bancoApi.post('/auth/login', { 
      email, 
      password 
    });
    
    console.log('✅ authLogin - Respuesta del backend:', response.data);
    
    const result = returnUserToken(response.data);
    
    useNotificationStore.getState().addNotification({
      type: 'success',
      title: 'Bienvenido',
      message: `Hola ${result.user.nombre}`
    });
    
    return result;
    
  } catch (error: any) {
    console.log('❌ authLogin - Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // ✅ PROPAGAR EL ERROR PARA QUE EL STORE LO MANEJE
    throw error;
  }
};

export const authRegister = async (nombre: string, email: string, password: string) => {
  try {
    console.log('📤 Enviando registro al backend...');
    
    const response = await bancoApi.post('/auth/register', {
      nombre: nombre,  // ← Usar "name" en lugar de "nombre"
      email: email,
      password: password
    });

    console.log('✅ Respuesta del servidor (register):', response.data);
    return response.data;

  } catch (error: any) {
    console.log('🔴 Error en authRegister:', error);
    console.log('🔴 Data del error:', error.response?.data);
    console.log('🔴 Status:', error.response?.status);
    
    throw error;
  }
};