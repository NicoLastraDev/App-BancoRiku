// components/Notifications/NotificationBell.tsx

import { useNotificationStore } from '@/presentation/notificaciones/store/useNotificationStore';
import { useRouter } from 'expo-router'; // ← Importar useRouter
import { Bell } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export const NotificationBell: React.FC = () => {
  const { unreadCount } = useNotificationStore();
  const router = useRouter(); // ← Usar router de Expo
  
  return (
    <TouchableOpacity 
      onPress={() => router.push('/(banco-app)/Notificaciones')} // ← Navegar a notificaciones
      className="relative p-2"
    >
      <Bell size={24} color="#000" />
      
      {unreadCount > 0 && (
        <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-5 h-5 justify-center items-center">
          <Text className="text-white text-xs font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};