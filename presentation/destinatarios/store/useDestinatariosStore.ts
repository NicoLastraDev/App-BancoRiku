import { CreateDestinatarioData, Destinatario } from "@/core/auth/interfaces/destinatarios";
import { destinatarioActions } from "@/core/banco/destinatarioActions"; // ← Import CORREGIDO
import { useNotificationStore } from "@/presentation/notificaciones/store/useNotificationStore";
import { create } from "zustand";

interface DestinatariosState {
  destinatarios: Destinatario[],
  loading: boolean,
  error: string | null
}

interface DestinatariosActions {
  crearDestinatario: (data: CreateDestinatarioData) => Promise<void> // ← Quitar token de parámetros
  obtenerDestinatarios: () => Promise<void> // ← Quitar token de parámetros
  actualizarDestinatario: (id: number, data: Partial<CreateDestinatarioData>) => Promise<void> // ← Quitar token
  eliminarDestinatario: (id: number) => Promise<void> // ← Quitar token
  clearError: () => void
}

export const useDestinatariosStore = create<DestinatariosState & DestinatariosActions>((set) => ({
  // Estado inicial
  destinatarios: [],
  loading: false,
  error: null,

  // Acciones
crearDestinatario: async (data) => {
  set({ loading: true, error: null });
  try {
    const nuevoDestinatario = await destinatarioActions.crearDestinatario(data);
    set(state => ({
      destinatarios: [...state.destinatarios, nuevoDestinatario],
      loading: false
    }));

    // ✅ NOTIFICACIÓN DE DESTINATARIO CREADO
    useNotificationStore.getState().addNotification({
      type: 'success',
      title: 'Destinatario agregado',
      message: `Agregaste a ${data.nombre} como destinatario`,
      action: { type: 'destinatario' }
    });
    
  } catch (error: any) {
    set({ error: error.message, loading: false });
    
    // ✅ NOTIFICACIÓN DE ERROR
    useNotificationStore.getState().addNotification({
      type: 'error',
      title: 'Error al agregar destinatario',
      message: error.message
    });
    
    throw error;
  }
},

  obtenerDestinatarios: async () => { // ← Quitar token parameter
    set({ loading: true });
    try {
      const destinatarios = await destinatarioActions.obtenerDestinatarios();
      set({ destinatarios, loading: false, error: null });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  actualizarDestinatario: async (id, data) => { // ← Quitar token parameter
    set({ loading: true });
    try {
      const destinatarioActualizado = await destinatarioActions.actualizarDestinatario(id, data);
      set(state => ({
        destinatarios: state.destinatarios.map(dest => 
          dest.id === id ? destinatarioActualizado : dest
        ),
        loading: false,
        error: null
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  eliminarDestinatario: async (id) => { // ← Quitar token parameter
    set({ loading: true });
    try {
      const success = await destinatarioActions.eliminarDestinatario(id);
      if (success) {
        set(state => ({
          destinatarios: state.destinatarios.filter(dest => dest.id !== id),
          loading: false,
          error: null
        }));
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));