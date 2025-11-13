import { authCheckStatus, authLogin, authRegister } from '@/core/auth/actions/authActions';
import { User } from '@/core/auth/interfaces/user';
import { cuentaActions } from '@/core/banco/cuentaActions';
import { Cuenta } from '@/core/banco/interfaces/cuentas';

import { universalStorage } from '@/helpers/adapters/universalStorageAdapter';
import { Platform } from 'react-native'; // ← AGREGAR IMPORT
import { create } from 'zustand';

export type authStatus = 'authenticated' | 'unauthenticathed' | 'checking'

export interface authState {
  status: authStatus,
  token?: string,
  user?: User,
  cuenta?: Cuenta,

  login: (email: string, password: string) => Promise<Boolean>,
  register: (nombre: string, email: string, password: string) => Promise<Boolean>,
  checkStatus: () => Promise<void>,
  logout: () => Promise<void>,
  changeStatus: (token?: string, user?: User) => Promise<boolean>,
  setCuenta: (cuenta: Cuenta) => void,
  loadCuenta: () => Promise<void>,
}

export const useAuthStore = create<authState>()((set, get) => ({
  status: 'checking',
  token: undefined,
  user: undefined,
  cuenta: undefined,

  changeStatus: async(token?: string, user?: User) => {
  console.log('🔄 changeStatus llamado - Plataforma:', Platform.OS, { 
    token: !!token, 
    user: user,
    userId: user?.id 
  });
  
  if(!token || !user){
    console.log('❌ Sin token o usuario, logout');
    set({ status: 'unauthenticathed', token: undefined, user: undefined, cuenta: undefined })
    await universalStorage.deleteItem('token') // ← CAMBIADO
    return false
  }

  // ✅ VERIFICAR que user tiene id
  if (!user.id) {
    console.log('❌ User sin ID, no se puede autenticar');
    return false;
  }

  console.log('✅ Autenticando usuario ID:', user.id);
  set({ status: 'authenticated', token: token, user: user })
  await universalStorage.setItem('token', token) // ← CAMBIADO
  
  // Cargar cuenta después de autenticar
  console.log('🔄 Llamando loadCuenta...');
  await get().loadCuenta();
  return true
},

  login: async(email: string, password: string) => {
  console.log('🔄 Store: login llamado con email:', email, 'Plataforma:', Platform.OS);
  
  const resp = await authLogin(email, password)
  
  console.log('📦 Store: respuesta de authLogin:', resp);
  console.log('👤 Store: user object:', resp?.user);
  console.log('🆔 Store: user ID:', resp?.user?.id);
  console.log('🔑 Store: token:', resp?.token);
  
  console.log('🎯 ANTES de changeStatus - user tiene id?:', !!resp?.user?.id);
  console.log('🎯 user completo:', resp?.user);
  
  return get().changeStatus(resp?.token, resp?.user)
},

  checkStatus: async() => {
    console.log('🔍 checkStatus - Plataforma:', Platform.OS);
    try {
      const storedToken = await universalStorage.getItem('token'); // ← CAMBIADO
      console.log('🔍 Token en storage:', storedToken ? 'SÍ' : 'NO');
      
      if (storedToken) {
        const resp = await authCheckStatus()
        if (resp?.token && resp?.user) {
          await get().changeStatus(resp.token, resp.user)
        } else {
          // Token inválido, hacer logout
          console.log('❌ Token inválido, haciendo logout');
          await get().logout()
        }
      } else {
        console.log('🔍 No hay token guardado');
        set({ status: 'unauthenticathed', token: undefined, user: undefined })
      }
    } catch (error) {
      console.log('❌ Error en checkStatus:', error);
      set({ status: 'unauthenticathed', token: undefined, user: undefined })
    }
  },

  logout: async() => {
    console.log('🚪 logout - Plataforma:', Platform.OS);
    await universalStorage.deleteItem('token') // ← CAMBIADO
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
    console.log('🔄 Store: loadCuenta llamado - Plataforma:', Platform.OS);
    
    const resp = await cuentaActions.obtenerCuenta();
    
    console.log('📦 Store: respuesta de obtenerCuenta:', resp);
    
    if (resp) {
      console.log('✅ Cuenta obtenida exitosamente:', resp.numero_cuenta);
      set({ cuenta: resp });
    } else {
      console.log('❌ loadCuenta: No se pudieron obtener los datos de la cuenta');
    }
    
  } catch (error) {
    console.log('❌ Error en loadCuenta:', error);
  }
},

}))