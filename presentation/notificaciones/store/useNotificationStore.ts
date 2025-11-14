import bancoApi from "@/core/api/BancoApi";
import { AppNotification, CreateNotificationData } from "@/core/banco/interfaces/notificaciones";
import { notificationActions } from "@/core/banco/notificacionesActions";
import { create } from "zustand";

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
}

interface NotificationActions {
  // Basic actions
  addNotification: (data: CreateNotificationData) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  
  // Utility functions
  getUnreadCount: () => number;
  getNotificationsByType: (type: AppNotification['type']) => AppNotification[];
  
  // Sincronización con backend
  sincronizarNotificaciones: () => Promise<void>;
  
  // ✅ NUEVO: Marcar como leída en backend
  marcarComoLeidaBackend: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState & NotificationActions>((set, get) => ({
  // Estado inicial
  notifications: [],
  unreadCount: 0,
  loading: false,

  // Agregar notificación
  addNotification: (data: CreateNotificationData) => {
    const newNotification = notificationActions.createLocalNotification(data);
    
    set(state => {
      const updatedNotifications = [newNotification, ...state.notifications];
      const newUnreadCount = updatedNotifications.filter(n => !n.read).length;
      
      return {
        notifications: updatedNotifications,
        unreadCount: newUnreadCount
      };
    });
  },

  // Marcar como leída (solo local)
  markAsRead: (id: string) => {
    const updatedId = notificationActions.markAsRead(id);
    
    set(state => {
      const updatedNotifications = state.notifications.map(notification =>
        notification.id === updatedId 
          ? { ...notification, read: true }
          : notification
      );
      
      const newUnreadCount = updatedNotifications.filter(n => !n.read).length;
      
      return {
        notifications: updatedNotifications,
        unreadCount: newUnreadCount
      };
    });
  },

  // ✅ NUEVO: Marcar como leída en backend
  marcarComoLeidaBackend: async (id: string) => {
    try {
      console.log('📌 [STORE] Marcando notificación como leída en backend:', id);
      
      // Llamar al backend
      await bancoApi.patch(`/notificaciones/${id}/leer`);
      
      // Actualizar estado local
      set(state => {
        const updatedNotifications = state.notifications.map(notification =>
          notification.id === id 
            ? { ...notification, read: true }
            : notification
        );
        
        const newUnreadCount = updatedNotifications.filter(n => !n.read).length;
        
        console.log('✅ [STORE] Notificación marcada como leída. Nuevo unreadCount:', newUnreadCount);
        
        return {
          notifications: updatedNotifications,
          unreadCount: newUnreadCount
        };
      });
      
    } catch (error: any) {
      console.error('❌ [STORE] Error marcando notificación como leída:', error);
      console.error('❌ [STORE] Error response:', error.response?.data);
      throw error;
    }
  },

  // Marcar todas como leídas
  markAllAsRead: () => {
    notificationActions.markAllAsRead();
    
    set(state => ({
      notifications: state.notifications.map(notification => ({
        ...notification,
        read: true
      })),
      unreadCount: 0
    }));
  },

  // Eliminar notificación
  deleteNotification: (id: string) => {
    const deletedId = notificationActions.deleteNotification(id);
    
    set(state => {
      const updatedNotifications = state.notifications.filter(
        notification => notification.id !== deletedId
      );
      
      const newUnreadCount = updatedNotifications.filter(n => !n.read).length;
      
      return {
        notifications: updatedNotifications,
        unreadCount: newUnreadCount
      };
    });
  },

  // Limpiar todas
  clearAll: () => {
    notificationActions.clearAllNotifications();
    
    set({
      notifications: [],
      unreadCount: 0
    });
  },

  // Utilidades
  getUnreadCount: () => {
    return get().unreadCount;
  },

  getNotificationsByType: (type: AppNotification['type']) => {
    return get().notifications.filter(notification => notification.type === type);
  },

  // Sincronizar con notificaciones del backend
  sincronizarNotificaciones: async () => {
  try {
    console.log('🔄 [SYNC] Iniciando sincronización de notificaciones...');
    set({ loading: true });
    
    const response = await bancoApi.get('/notificaciones');
    console.log('📥 [SYNC] Respuesta completa del backend:', response);
    console.log('📊 [SYNC] Response data:', response.data);
    
    const notificacionesBackend = response.data.data || [];
    console.log('🔢 [SYNC] Número de notificaciones del backend:', notificacionesBackend.length);
    
    // Convertir notificaciones del backend al formato local
    const notificacionesLocales: AppNotification[] = notificacionesBackend.map((notif: any) => ({
      id: notif.id.toString(),
      type: notif.tipo,
      title: notif.titulo,
      message: notif.mensaje,
      timestamp: new Date(notif.created_at),
      read: notif.leida,
      action: undefined
    }));

    // ✅ DEBUG DETALLADO DEL UNREAD COUNT
    const nuevoUnreadCount = notificacionesLocales.filter(n => !n.read).length;
    console.log('🔍 [SYNC DEBUG] Calculando unreadCount:', {
      totalNotificaciones: notificacionesLocales.length,
      leidas: notificacionesLocales.filter(n => n.read).length,
      noLeidas: nuevoUnreadCount,
      notificaciones: notificacionesLocales.map(n => ({ 
        id: n.id, 
        title: n.title, 
        read: n.read 
      }))
    });
    
    set({
      notifications: notificacionesLocales,
      unreadCount: nuevoUnreadCount,
      loading: false
    });
    
    console.log('🎉 [SYNC] Sincronización completada. UnreadCount actualizado a:', nuevoUnreadCount);
    
  } catch (error: any) {
    console.error('❌ [SYNC ERROR] Error sincronizando notificaciones:', error);
    console.error('❌ [SYNC ERROR] Mensaje:', error.message);
    console.error('❌ [SYNC ERROR] Response:', error.response?.data);
    set({ loading: false });
  }
}
}));