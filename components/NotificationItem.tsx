// components/Notifications/NotificationItem.tsx
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { AppNotification } from '@/core/banco/interfaces/notificaciones';
import { useNotificationStore } from '@/presentation/notificaciones/store/useNotificationStore';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle
} from 'lucide-react-native';

interface NotificationItemProps {
  notification: AppNotification; // ← Cambiado a AppNotification
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { markAsRead, deleteNotification } = useNotificationStore();

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle size={20} color="#10B981" />;
      case 'error':
        return <XCircle size={20} color="#EF4444" />;
      case 'warning':
        return <AlertTriangle size={20} color="#F59E0B" />;
      case 'info':
        return <Info size={20} color="#3B82F6" />;
      default:
        return <Info size={20} color="#3B82F6" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handlePress = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleDelete = () => {
    deleteNotification(notification.id);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `Hace ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} h`;
    } else {
      return date.toLocaleDateString('es-ES');
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      className={`p-4 border-b ${getBackgroundColor()} ${notification.read ? 'opacity-70' : ''}`}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-start flex-1">
          <View className="mr-3 mt-1">
            {getIcon()}
          </View>
          
          <View className="flex-1">
            <Text className={`text-base font-semibold ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
              {notification.title}
            </Text>
            
            <Text className="text-gray-600 text-sm mt-1">
              {notification.message}
            </Text>
            
            <Text className="text-gray-400 text-xs mt-2">
              {formatTime(notification.timestamp)}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center space-x-2">
          {!notification.read && (
            <View className="w-2 h-2 bg-blue-500 rounded-full" />
          )}
          
          {/* <TouchableOpacity 
            onPress={handleDelete}
            className="p-1"
          >
            <Text className="text-gray-400 text-xs">Eliminar</Text>
          </TouchableOpacity> */}
        </View>
      </View>

      {notification.action && (
        <View className="mt-2 bg-white rounded-lg p-2 border border-gray-200">
          <Text className="text-gray-500 text-xs">
            Acción: {notification.action.type}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};