// screens/NotificationsScreen.tsx

import { NotificationItem } from '@/components/NotificationItem';
import { AppNotification } from '@/core/banco/interfaces/notificaciones';
import { useNotificationStore } from '@/presentation/notificaciones/store/useNotificationStore';
import React from 'react';
import { FlatList, Text, View } from 'react-native';

export const NotificationsScreen: React.FC = () => {
  const { notifications, unreadCount, markAllAsRead, clearAll } = useNotificationStore();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Notificaciones</Text>
            <Text className="text-gray-500 mt-1">
              {unreadCount > 0 
                ? `${unreadCount} sin leer` 
                : 'Todas leídas'
              }
            </Text>
          </View>
          
          {/* <View className="flex-row space-x-3">
            {unreadCount > 0 && (
              <TouchableOpacity 
                onPress={markAllAsRead}
                className="bg-blue-500 px-3 py-2 rounded-lg"
              >
                <Text className="text-white font-semibold">Marcar todas</Text>
              </TouchableOpacity>
            )}
            
            {notifications.length > 0 && (
              <TouchableOpacity 
                onPress={clearAll}
                className="bg-gray-200 px-3 py-2 rounded-lg"
              >
                <Text className="text-gray-700 font-semibold">Limpiar</Text>
              </TouchableOpacity>
            )}
          </View> */}
        </View>
      </View>

      {/* Lista de notificaciones */}
      <FlatList
        data={notifications}
        keyExtractor={(item: AppNotification) => item.id} // ← Especificar tipo
        renderItem={({ item }: { item: AppNotification }) => ( // ← Especificar tipo
          <NotificationItem notification={item} />
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center p-8 mt-10">
            <Text className="text-gray-400 text-lg font-semibold">
              No hay notificaciones
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Las notificaciones importantes aparecerán aquí
            </Text>
          </View>
        }
        contentContainerStyle={notifications.length === 0 ? { flex: 1 } : {}}
      />
    </View>
  );
};


export { NotificationsScreen as default } from "@/app/(banco-app)/(notificaciones)/index";

