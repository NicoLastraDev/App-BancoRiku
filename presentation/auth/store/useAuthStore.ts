import { authCheckStatus, authLogin, authRegister } from '@/core/auth/actions/authActions';
import { User } from '@/core/auth/interfaces/user';
import { Cuenta } from '@/core/banco/interfaces/cuentas';
import { SecureStorageAdapter } from '@/helpers/adapters/secure-storage-adapter';
import { create } from 'zustand';

export type authStatus = 'authenticated' | 'unauthenticathed' | 'checking'

export interface authState {
  status: authStatus,
  token?: string,
  user?: User,
  cuenta?: Cuenta, // ← Agregar cuenta al store

  login: (email: string, password: string) => Promise<Boolean>,
  register: (nombre: string, email: string, password: string) => Promise<Boolean>,
  checkStatus: () => Promise<void>,
  logout: () => Promise<void>,
  changeStatus: (token?: string, user?: User) => Promise<boolean>,
  setCuenta: (cuenta: Cuenta) => void, // ← Nueva función
  loadCuenta: () => Promise<void>, // ← Nueva función
}

export const useAuthStore = create<authState>()((set, get) => ({
  status: 'checking',
  token: undefined,
  user: undefined,
  cuenta: undefined,

  changeStatus: async(token?: string, user?: User) => {
  console.log('🔄 changeStatus llamado:', { 
    token: !!token, 
    user: user,
    userId: user?.id 
  });
  
  if(!token || !user){
    console.log('❌ Sin token o usuario, logout');
    set({ status: 'unauthenticathed', token: undefined, user: undefined, cuenta: undefined })
    await SecureStorageAdapter.deleteItem('token')
    return false
  }

  // ✅ VERIFICAR que user tiene id
  if (!user.id) {
    console.log('❌ User sin ID, no se puede autenticar');
    return false;
  }

  console.log('✅ Autenticando usuario ID:', user.id);
  set({ status: 'authenticated', token: token, user: user })
  await SecureStorageAdapter.setItem('token', token)
  
  // Cargar cuenta después de autenticar
  console.log('🔄 Llamando loadCuenta...');
  await get().loadCuenta();
  return true
},

  login: async(email: string, password: string) => {
  console.log('🔄 Store: login llamado con email:', email);
  
  const resp = await authLogin(email, password)
  
  console.log('📦 Store: respuesta de authLogin:', resp);
  console.log('👤 Store: user object:', resp?.user);
  console.log('🆔 Store: user ID:', resp?.user?.id);
  console.log('🔑 Store: token:', resp?.token);
  
  // ✅ AGREGAR ESTE CONSOLE CRÍTICO:
  console.log('🎯 ANTES de changeStatus - user tiene id?:', !!resp?.user?.id);
  console.log('🎯 user completo:', resp?.user);
  
  return get().changeStatus(resp?.token, resp?.user)
},

  checkStatus: async() => {
    const resp = await authCheckStatus()
    await get().changeStatus(resp?.token, resp?.user)
  },

  logout: async() => {
    await SecureStorageAdapter.deleteItem('token')
    set({
      status: "unauthenticathed", 
      token: undefined, 
      user: undefined,
      cuenta: undefined
    })
  },

  register: async(nombre: string, email: string, password: string) => {
    try {
      const resp = await authRegister(nombre, email, password)
      if (resp?.token) {
        return await get().changeStatus(resp.token, resp.user)
      }
      return false
    } catch (err) {
      console.log(err)
      return false
    }
  },

  setCuenta: (cuenta: Cuenta) => {
    set({ cuenta })
  },

  loadCuenta: async () => {
  try {
    const { user, token } = get();
    
    console.log('🔄 loadCuenta - Solicitando datos REALES...');
    
    if (!user || !token) {
      console.log('❌ No hay usuario o token en el store');
      return;
    }

    // ✅ URL CORRECTA - /api/cuenta/info
    const CUENTA_URL = 'http://192.168.1.6:4000/api/cuenta/info';
    
    console.log('🌐 Haciendo request a:', CUENTA_URL);
    
    const response = await fetch(CUENTA_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error del backend:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Datos REALES recibidos del backend:', data);

    if (data.success && data.data) {
      console.log('🎯 Cuenta REAL establecida:', {
        numero_cuenta: data.data.numero_cuenta,
        saldo: data.data.saldo
      });
      set({ cuenta: data.data });
    } else {
      console.log('⚠️ Respuesta inesperada:', data);
      throw new Error('Formato de respuesta inválido del backend');
    }
    
  } catch (error) {
    console.log('❌ Error cargando cuenta desde backend:', error);
  }
},

}))