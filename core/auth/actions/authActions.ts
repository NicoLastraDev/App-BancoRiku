import bancoApi from "@/core/api/BancoApi";
import { Alert } from "react-native";
import { User } from "../interfaces/user";


export interface AuthResponse {
  token: string;
  user: User;
}



const returnUserToken = (data: AuthResponse) => {
  console.log('🔄 returnUserToken - data recibida:', data);
  
  // ✅ VERIFICAR que data.user existe y tiene id
  console.log('🔍 data.user:', data.user);
  console.log('🔍 data.user.id:', data.user?.id);
  
  return {
    user: data.user,
    token: data.token
  };
}

export const authLogin = async (email: string, password: string) => {
  try {
    console.log('🚀 authLogin - Haciendo request...');
    const response = await bancoApi.post('/auth/login', { email, password });
    console.log('✅ authLogin - Respuesta del backend:', response.data);
    
    const result = returnUserToken(response.data);
    console.log('🔄 authLogin - Después de returnUserToken:', result);
    
    return result;
  } catch (error) {
    console.log('❌ authLogin - Error:', error);
    throw error;
  }
};

export const authCheckStatus = async() => {
  try {
    const { data } = await bancoApi.get('/auth/check-status')
    return returnUserToken(data)
  } catch (error) {
    return null
  }
}

// REGISTER actualizado
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
    return returnUserToken(data)

  } catch (error: any) {
    console.log('❌ [FRONTEND ERROR] En registro:', error.response?.data);
    const errorMessage = error.response?.data?.message || 'Ha fallado la creación del usuario';
    Alert.alert('Error', errorMessage);
    return null
  }
}