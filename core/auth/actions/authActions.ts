import bancoApi from "@/core/api/BancoApi";
import { Alert } from "react-native";
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
    
    const response = await bancoApi.get('/auth/check-status');
    console.log('✅ authCheckStatus - Respuesta del backend:', response.data);
    
    // Verificar que la respuesta tenga la estructura correcta
    if (response.data && response.data.token && response.data.user) {
      return returnUserToken(response.data);
    } else {
      console.log('❌ authCheckStatus - Respuesta inválida:', response.data);
      return null;
    }
    
  } catch (error: any) {
    console.log('❌ authCheckStatus - Error:', error.response?.data || error.message);
    
    // Notificación de error
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
    const response = await bancoApi.post('/auth/login', { email, password });
    console.log('✅ authLogin - Respuesta del backend:', response.data);
    
    const result = returnUserToken(response.data);
    
    // ✅ NOTIFICACIÓN DE LOGIN EXITOSO
    useNotificationStore.getState().addNotification({
      type: 'success',
      title: 'Bienvenido',
      message: `Hola ${result.user.nombre}`
    });
    
    return result;
  } catch (error) {
    console.log('❌ authLogin - Error:', error);
    throw error;
  }
};

export const authRegister = async(nombre: string, email: string, password: string) => {
  email = email.toLowerCase()
  console.log('🔄 [FRONTEND 1] authRegister llamado:', email);

  try {
    console.log('🔄 [FRONTEND 2] Enviando request a /auth/register');
    const {data} = await bancoApi.post('/auth/register', {
      nombre,
      email, 
      password
    })

    console.log('✅ [FRONTEND 3] Registro EXITOSO:', data);
    const result = returnUserToken(data);
    
    // ✅ NOTIFICACIÓN DE REGISTRO EXITOSO
    useNotificationStore.getState().addNotification({
      type: 'success',
      title: '¡Cuenta creada!',
      message: 'Tu cuenta ha sido creada exitosamente'
    });
    
    return result;

  } catch (error: any) {
    console.log('❌ [FRONTEND ERROR] En registro:', error.response?.data);
    const errorMessage = error.response?.data?.message || 'Ha fallado la creación del usuario';
    
    // ✅ NOTIFICACIÓN DE ERROR EN REGISTRO
    useNotificationStore.getState().addNotification({
      type: 'error',
      title: 'Error en registro',
      message: errorMessage
    });
    
    Alert.alert('Error', errorMessage);
    return null
  }
}