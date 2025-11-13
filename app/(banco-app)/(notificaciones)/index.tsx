import { NotificationItem } from '@/components/NotificationItem';
import { AppNotification } from '@/core/banco/interfaces/notificaciones';
import { useNotificationStore } from '@/presentation/notificaciones/store/useNotificationStore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';

export default function NotificacionesScreen() {
  const { 
    notifications, 
    unreadCount, 
    sincronizarNotificaciones, 
    loading 
  } = useNotificationStore();

  const [refreshing, setRefreshing] = useState(false);

  // Sincronizar al cargar la pantalla
  useEffect(() => {
    console.log('📱 [SCREEN] Cargando pantalla de notificaciones...');
    sincronizarNotificaciones();
  }, [sincronizarNotificaciones]); // ← Agregar dependencia

  const handleRefresh = async () => {
    console.log('🔄 [SCREEN] Recargando manualmente...');
    setRefreshing(true);
    await sincronizarNotificaciones();
    setRefreshing(false);
  };

  console.log('📊 [SCREEN] Estado actual:', {
    notificacionesCount: notifications.length,
    unreadCount,
    loading
  });

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
          
          <TouchableOpacity 
            onPress={handleRefresh}
            disabled={loading}
            className="bg-blue-500 px-3 py-2 rounded-lg flex-row items-center"
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-semibold">Recargar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Estado de carga */}
      {loading && (
        <View className="p-4 items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-2">Cargando notificaciones...</Text>
        </View>
      )}

      {/* Lista de notificaciones */}
      <FlatList
        data={notifications}
        keyExtractor={(item: AppNotification) => item.id}
        renderItem={({ item }: { item: AppNotification }) => (
          <NotificationItem notification={item} />
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center p-8 mt-10">
            {loading ? (
              <Text className="text-gray-400 text-lg">Cargando...</Text>
            ) : (
              <>
                <Text className="text-gray-400 text-lg font-semibold">
                  No hay notificaciones
                </Text>
                <Text className="text-gray-400 text-center mt-2">
                  Las notificaciones importantes aparecerán aquí
                </Text>
                <TouchableOpacity 
                  onPress={handleRefresh}
                  className="bg-blue-500 px-4 py-2 rounded-lg mt-4"
                >
                  <Text className="text-white font-semibold">Reintentar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        }
        contentContainerStyle={notifications.length === 0 ? { flex: 1 } : {}}
      />
    </View>
  );
}