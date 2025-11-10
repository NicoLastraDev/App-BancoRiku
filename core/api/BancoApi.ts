import { SecureStorageAdapter } from '@/helpers/adapters/secure-storage-adapter';
import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// DEBUG
console.log('🔧 === INICIANDO BANCO API ===');

const config = Constants.expoConfig?.extra || {};

const STAGE = config.EXPO_PUBLIC_STAGE || 'dev';
const API_URL_BASE = config.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';
const API_URL_IOS = config.EXPO_PUBLIC_API_URL_IOS || 'http://192.168.1.6:4000/api';
const API_URL_ANDROID = config.EXPO_PUBLIC_API_URL_ANDROID || 'http://192.168.1.6:4000/api';

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
    baseURL: 'http://192.168.1.6:4000/api',
    timeout: 10000,
  });
}

// Interceptors
bancoApi.interceptors.request.use(async (config) => {
  console.log('🚀 Request a:', config.url);
  const token = await SecureStorageAdapter.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
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