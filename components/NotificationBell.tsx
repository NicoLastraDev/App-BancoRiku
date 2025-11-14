import { useNotificationStore } from "@/presentation/notificaciones/store/useNotificationStore";
import { router } from "expo-router";
import { Bell } from "lucide-react-native";
import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";

// components/Notifications/NotificationBell.tsx
export const NotificationBell: React.FC = () => {
  const { unreadCount, sincronizarNotificaciones } = useNotificationStore();
  
  // ✅ DEBUG DETALLADO
  useEffect(() => {
    console.log('🔔 [BELL DEBUG] Estado actual:', {
      unreadCount,
      timestamp: new Date().toLocaleTimeString(),
      hasUnread: unreadCount > 0
    });
  }, [unreadCount]);

  const handlePress = async () => {
    console.log('🔔 [BELL] Navegando a notificaciones, unread:', unreadCount);
    // Sincronizar antes de navegar
    await sincronizarNotificaciones();
    router.push('/(banco-app)/(notificaciones)');
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
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