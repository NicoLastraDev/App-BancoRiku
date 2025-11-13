import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { useNotificationStore } from '@/presentation/notificaciones/store/useNotificationStore';
import { Redirect, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import '../global.css';

const Index = () => {
  const [isReady, setIsReady] = useState(false);
  const { sincronizarNotificaciones } = useNotificationStore();
  const { status, user, checkStatus } = useAuthStore();

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const initializeApp = async () => {
        try {
          console.log('🔍 === INICIALIZANDO APP CON useFocusEffect ===');
          
          await checkStatus();
          
          if (mounted) {
            setIsReady(true);
            console.log('🏁 Inicialización completada - Status:', status);
          }
          
        } catch (error) {
          console.log('❌ Error en inicialización:', error);
          if (mounted) setIsReady(true);
        }
      };

      initializeApp();

      return () => {
        mounted = false;
      };
    }, [])
  );

  if (!isReady) {
    console.log('⏳ App no está lista aún...');
    return null;
  }

  console.log('🚀 App lista - Status:', status, 'User:', user?.email);

  if (status === 'authenticated') {
    console.log('✅ REDIRIGIENDO A HOME');
    return <Redirect href={'/(banco-app)/(home)'} />;
  } else {
    console.log('🔐 REDIRIGIENDO A LOGIN');
    return <Redirect href={'/auth/login'} />;
  }
}

export default Index;