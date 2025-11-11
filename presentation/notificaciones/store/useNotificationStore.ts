// core/notifications/store/useNotificationStore.ts
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

  // Marcar como leída
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
  }
}));