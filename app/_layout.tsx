// app/(banco-app)/_layout.tsx

import { allRoutes } from '@/constants/Routes';
import { ToastProvider } from '@/providers/ToastProviders';


import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function BancoAppLayout() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#000' : '#fff';

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