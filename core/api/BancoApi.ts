
import { universalStorage } from '@/helpers/adapters/universalStorageAdapter';
import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// DEBUG
console.log('🔧 === INICIANDO BANCO API ===');

const config = Constants.expoConfig?.extra || {};

const STAGE = config.EXPO_PUBLIC_STAGE || 'prod';
const API_URL_BASE = config.EXPO_PUBLIC_API_URL || 'https://banco-riku-backend-express-js.onrender.com/api';
const API_URL_IOS = config.EXPO_PUBLIC_API_URL_IOS || 'https://banco-riku-backend-express-js.onrender.com/api';
const API_URL_ANDROID = config.EXPO_PUBLIC_API_URL_ANDROID || 'https://banco-riku-backend-express-js.onrender.com/api';

console.log('🏷️ STAGE:', STAGE);
console.log('📡 API_URL_BASE:', API_URL_BASE);

export const API_URL = STAGE === 'prod' 
  ? API_URL_BASE
  : Platform.OS === 'ios'
  ? API_URL_IOS
  : API_URL_ANDROID;

console.log('🎯 URL FINAL (API_URL):', API_URL);

// ✅ Asegúrate de que bancoApi esté definido incluso si hay error
let bancoApi;

try {
  bancoApi = axios.create({
    baseURL: API_URL,
    timeout: 10000,
  });
  
  console.log('✅ Axios instance creada correctamente');
  
} catch (error) {
  console.log('❌ Error creando axios instance:', error);
  // Fallback a una URL base
  bancoApi = axios.create({
    baseURL: 'https://banco-riku-backend-express-js.onrender.com/api',
    timeout: 10000,
  });
}

// Interceptors - USAR universalStorage
bancoApi.interceptors.request.use(async (config) => {
  console.log('🚀 Request a:', config.url);
  
  try {
    const token = await universalStorage.getItem('userToken'); // ✅ CLAVE UNIFICADA
    console.log('🔑 Token de universalStorage:', token ? 'ENCONTRADO' : 'NO ENCONTRADO');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Header Authorization agregado');
    } else {
      console.warn('⚠️ No se encontró token en universalStorage');
    }
  } catch (error) {
    console.error('💥 Error obteniendo token:', error);
  }
  
  console.log('🔑 Headers finales:', config.headers);
  return config;
});

bancoApi.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status);
    return response;
  },
  (error) => {
    console.log('❌ Error:', error.message);
    return Promise.reject(error);
  }
);

// ✅ Exportación por defecto
export default bancoApi;