import { authCheckStatus, authLogin, authRegister } from '@/core/auth/actions/authActions';
import { User } from '@/core/auth/interfaces/user';
import { cuentaActions } from '@/core/banco/cuentaActions';
import { Cuenta } from '@/core/banco/interfaces/cuentas';
import { universalStorage } from '@/helpers/adapters/universalStorageAdapter';
import { Platform } from 'react-native';
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
      await universalStorage.deleteItem('userToken') // ✅ CAMBIADO
      return false
    }

    // ✅ VERIFICAR que user tiene id
    if (!user.id) {
      console.log('❌ User sin ID, no se puede autenticar');
      return false;
    }

    console.log('✅ Autenticando usuario ID:', user.id);
    set({ status: 'authenticated', token: token, user: user })
    await universalStorage.setItem('userToken', token) // ✅ CAMBIADO
    
    // Cargar cuenta después de autenticar
    console.log('🔄 Llamando loadCuenta...');
    await get().loadCuenta();
    return true
  },

  login: async(email: string, password: string) => {
  console.log('🔄 Store: login llamado con email:', email);
  
  try {
    const resp = await authLogin(email, password)
    
    console.log('📦 Store: respuesta de authLogin:', resp);
    
    if (resp?.token && resp?.user) {
      return await get().changeStatus(resp.token, resp.user)
    } else {
      // ❌ Login falló pero no hubo error de excepción
      console.log('❌ Login falló - respuesta inválida:', resp);
      return false;
    }
    
  } catch (error: any) {
    console.log('❌ ERROR en store login:', error);
    
    // ✅ MANEJAR ERROR 401 ESPECÍFICAMENTE
    if (error.response?.status === 401) {
      console.log('🔐 Error 401 - Credenciales inválidas');
      // No necesitamos hacer set de estado aquí, solo retornar false
      return false;
    }
    
    // Para otros errores, también retornar false
    console.log('🌐 Otro tipo de error:', error.message);
    return false;
  }
},

  checkStatus: async() => {
  console.log('🔍 checkStatus - INICIANDO');
  try {
    const storedToken = await universalStorage.getItem('userToken');
    console.log('🔍 Token en storage:', storedToken);
    
    if (storedToken) {
      console.log('🔍 Llamando authCheckStatus...');
      const resp = await authCheckStatus()
      console.log('🔍 Respuesta de authCheckStatus:', resp);
      
      if (resp?.token && resp?.user) {
        console.log('✅ Token válido, llamando changeStatus');
        await get().changeStatus(resp.token, resp.user)
        console.log('✅ changeStatus completado');
      } else {
        console.log('❌ Token inválido o respuesta incompleta');
        await get().logout()
      }
    } else {
      console.log('🔍 No hay token guardado');
      set({ status: 'unauthenticathed', token: undefined, user: undefined })
    }
  } catch (error) {
    console.log('❌ Error en checkStatus:', error);
    set({ status: 'unauthenticathed', token: undefined, user: undefined })
  } finally {
    console.log('🔍 checkStatus - FINALIZADO');
  }
},

  logout: async() => {
  console.log('🚪 [LOGOUT] Iniciando proceso de logout...');
  
  try {
    // 1. Limpiar storage primero
    console.log('🗑️ Eliminando token del storage...');
    await universalStorage.deleteItem('userToken');
    
    // 2. Limpiar estado de Zustand
    console.log('🔄 Limpiando estado del store...');
    set({
      status: "unauthenticathed", 
      token: undefined, 
      user: undefined,
      cuenta: undefined
    });
    
    console.log('✅ [LOGOUT] Proceso completado exitosamente');
    
  } catch (error) {
    console.log('❌ [LOGOUT] Error durante el logout:', error);
    // Forzar limpieza incluso si hay error
    set({
      status: "unauthenticathed", 
      token: undefined, 
      user: undefined,
      cuenta: undefined
    });
  }
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
      set({ isLoading: true });
      console.log('🔄 Cargando datos de cuenta...');
      
      const cuentaData = await cuentaActions.obtenerCuenta();
      
      if (cuentaData) {
        set({ cuenta: cuentaData, isLoading: false });
        console.log('✅ Cuenta cargada:', cuentaData.saldo);
      } else {
        set({ isLoading: false });
        console.log('❌ No se pudo cargar la cuenta');
      }
    } catch (error) {
      console.error('❌ Error cargando cuenta:', error);
      set({ isLoading: false });
    }
  },
}))