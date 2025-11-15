// app/(banco-app)/_layout.tsx

import { allRoutes } from '@/constants/Routes';
import { ToastProvider } from '@/providers/ToastProviders';


import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import * as Notifications from 'expo-notifications';
import { PushNotificationService } from '../core/banco/pushNotifications';

export default function BancoAppLayout() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#000' : '#fff';


  useEffect(() => {
    // Configurar listeners de notificaciones
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Notificación recibida:', notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Usuario tocó notificación:', response);
      // Manejar navegación cuando el usuario toca la notificación
      // Ejemplo: navegar a la pantalla de transferencias si es una notificación de transferencia
    });

    // Configurar canal Android y solicitar permisos
    const initializeNotifications = async () => {
      await PushNotificationService.configureAndroidChannel();
      await PushNotificationService.requestPermissions();
      
      // Obtener token push (opcional - si quieres guardarlo en el backend)
      const token = await PushNotificationService.getPushToken();
      if (token) {
        console.log('🔔 Token push del dispositivo:', token);
        // Aquí podrías enviar el token a tu backend
      }
    };

    initializeNotifications();

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);



  return (
    <GestureHandlerRootView style={{ backgroundColor: backgroundColor, flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <ToastProvider>
        <Stack
          screenOptions={{ 
            headerShadowVisible: false,
            contentStyle: { backgroundColor: backgroundColor },
            headerStyle: { backgroundColor: 'transparent' },
            headerTitle: '',
            headerShown: false,
          }}
        >
          {/* RUTAS MANUALES */}
          <Stack.Screen name="index" />
          
          {allRoutes.map(route => (
            <Stack.Screen
              key={route.name}
              name={route.name as any} // ← 'notificaciones' está incluido
              options={{
                title: route.title,
                headerShown: !route.title.includes('Slides'),
              }}
            />
          ))}
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ToastProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}