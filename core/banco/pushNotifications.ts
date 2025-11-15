// core/notifications/pushNotifications.ts
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

// Configurar el manejo de notificaciones CORREGIDO
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true, // ✅ AGREGAR ESTO
    shouldShowList: true,   // ✅ AGREGAR ESTO
  }),
});

export class PushNotificationService {
  // Solicitar permisos
  static async requestPermissions() {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert('Error', 'Se necesitan permisos para recibir notificaciones');
        return false;
      }
      
      return true;
    } else {
      Alert.alert('Error', 'Las notificaciones push no funcionan en emuladores');
      return false;
    }
  }

  // Obtener token de notificación
  static async getPushToken() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const projectId = "tu-project-id"; // Reemplaza con tu Project ID de Expo
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      
      console.log('🔔 Token de notificación:', token);
      return token;
    } catch (error) {
      console.log('❌ Error obteniendo token:', error);
      return null;
    }
  }

  // Programar notificación local CORREGIDO
  static async scheduleLocalNotification(title: string, body: string, data: any = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: { 
          type: 'timeInterval', // ✅ AGREGAR TYPE
          seconds: 1 
        } as Notifications.TimeIntervalTriggerInput,
      });
      console.log('📱 Notificación local programada:', title);
    } catch (error) {
      console.log('❌ Error programando notificación local:', error);
    }
  }

  // Enviar notificación push a otro usuario
  static async sendPushNotification(to: string, title: string, body: string, data: any = {}) {
    try {
      const message = {
        to,
        sound: 'default',
        title,
        body,
        data,
      };

      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      
      console.log('✅ Notificación push enviada a:', to);
    } catch (error) {
      console.log('❌ Error enviando notificación push:', error);
    }
  }

  // ✅ NUEVO: Configurar canal de notificaciones (Android)
  static async configureAndroidChannel() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }

  // ✅ NUEVO: Obtener permisos detallados
  static async getDetailedPermissions() {
    return await Notifications.getPermissionsAsync();
  }

  // ✅ NUEVO: Cancelar todas las notificaciones
  static async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.dismissAllNotificationsAsync();
  }

  // ✅ NUEVO: Obtener notificaciones entregadas
  static async getDeliveredNotifications() {
    return await Notifications.getPresentedNotificationsAsync();
  }
}