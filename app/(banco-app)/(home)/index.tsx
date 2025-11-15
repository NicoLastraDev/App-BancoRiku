import { FAB } from '@/components/FAB';
import { ThemedText } from '@/components/ThemedText';
import { universalStorage } from '@/helpers/adapters/universalStorageAdapter';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { useNotificationStore } from '@/presentation/notificaciones/store/useNotificationStore';
import { useTransferenciaStore } from '@/presentation/transferencias/store/useTransferenciasStore';
import { useFocusEffect } from '@react-navigation/native';
import { Link, router } from 'expo-router';
import { Bell, LogOut } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import NuevoDestinatarioModal from '../(nuevo_destinatario)/NuevoDestinatarioModal';

const HomeScreen = () => {
  const { user, cuenta, status, loadCuenta, token, logout } = useAuthStore();
  const { transferencias, loading, obtenerTransferencias } = useTransferenciaStore();
  const { unreadCount, sincronizarNotificaciones } = useNotificationStore();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalDestinatarioVisible, setModalDestinatarioVisible] = useState(false);

  const formatChileanPeso = (amount: number | string): string => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericAmount);
  };

  // 🔄 CARGAR DATOS INICIALES INCLUYENDO NOTIFICACIONES
  useEffect(() => {
    if (status === 'authenticated' && token) {
      console.log('🏠 Cargando datos iniciales del home...');
      const cargarDatosIniciales = async () => {
        try {
          await loadCuenta();
          await obtenerTransferencias(token);
          await sincronizarNotificaciones();
        } catch (error) {
          console.log('❌ Error cargando datos iniciales:', error);
        }
      };
      cargarDatosIniciales();
    }
  }, [status, token]);

  // 🔄 ACTUALIZAR EN TIEMPO REAL CADA VEZ QUE LA PANTALLA SE ENFOQUE
  useFocusEffect(
    useCallback(() => {
      console.log('🏠 HomeScreen enfocada - Actualizando en tiempo real...');
      
      const actualizarDatos = async () => {
        try {
          await loadCuenta();
          if (token) {
            await obtenerTransferencias(token);
            await sincronizarNotificaciones();
          }
        } catch (error) {
          console.log('❌ Error actualizando datos:', error);
        }
      };

      actualizarDatos();

      // 🕐 OPCIONAL: Actualizar cada 30 segundos mientras está en foco
      const interval = setInterval(actualizarDatos, 30000);

      return () => clearInterval(interval);
    }, [token])
  );

  // 🔄 PULL TO REFRESH MEJORADO
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    console.log('🔄 Pull to refresh - Actualizando todo...');
    
    try {
      await Promise.all([
        loadCuenta(),
        token ? obtenerTransferencias(token) : Promise.resolve(),
        sincronizarNotificaciones()
      ]);
    } catch (error) {
      console.log('❌ Error en refresh:', error);
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  // 🔄 ACTUALIZAR AL VOLVER DE TRANSFERENCIA
  const handleTransferPress = () => {
    setIsLoading(true);
    router.push('/(banco-app)/(transferir)');
  };

  // QUITAR LOADING CUANDO LA CUENTA SE CARGA
  useEffect(() => {
    if (cuenta) {
      setIsLoading(false);
    }
  }, [cuenta]);

  // 🔍 DEBUG: Verificar estado de notificaciones
  useEffect(() => {
    console.log('📊 Estado de notificaciones en Home:', {
      unreadCount,
      hasUnread: unreadCount > 0,
      timestamp: new Date().toLocaleTimeString()
    });
  }, [unreadCount]);

  // OBTENER ÚLTIMAS 3 TRANSFERENCIAS
  const ultimasTransferencias = transferencias
    ?.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    ?.slice(0, 3) || [];

  // FUNCIÓN SIMPLIFICADA - SOLO EL NOMBRE
  const getNombreDisplay = (transaccion: any) => {
    const nombre = transaccion.nombre_destinatario || transaccion.nombre_remitente;
    
    if (nombre) {
      return nombre;
    }
    
    return transaccion.tipo_transaccion === 'TRANSFERENCIA_ENVIADA' ? 'Destinatario' : 'Remitente';
  };

  // MANEJAR LOGOUT
  const handleLogout = () => {
  console.log('🎯 Botón logout presionado');
  
  if (Platform.OS === 'web') {
    // ✅ EN WEB USAR confirm NATIVO
    const confirmar = window.confirm('¿Estás seguro de que quieres cerrar sesión?');
    if (confirmar) {
      console.log('✅ Usuario confirmó en web');
      ejecutarLogout();
    } else {
      console.log('❌ Usuario canceló en web');
    }
  } else {
    // ✅ EN MOBILE USAR Alert NORMAL
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: ejecutarLogout }
      ]
    );
  }
};

// ✅ FUNCIÓN SEPARADA PARA EL LOGOUT
const ejecutarLogout = async () => {
  try {
    console.log('🔄 Ejecutando proceso de logout...');
    
    // 1. Limpiar storage
    await universalStorage.deleteItem('userToken');
    console.log('🗑️ Token eliminado del storage');
    
    // 2. Limpiar estado del store
    useAuthStore.setState({
      status: "unauthenticathed",
      token: undefined, 
      user: undefined,
      cuenta: undefined
    });
    console.log('🔄 Estado del store limpiado');
    
    // 3. Navegar al login
    console.log('🧭 Navegando a login...');
    router.replace('/auth/login');
    
    console.log('✅ Logout completado exitosamente');
    
  } catch (error) {
    console.log('💥 Error durante logout:', error);
    // ✅ NAVEGAR DE TODAS FORMAS AUNQUE HAYA ERROR
    router.replace('/auth/login');
  }
};
  // FUNCIÓN PARA DETERMINAR EL ESTILO DE LA TRANSFERENCIA
  const getTransferenciaStyle = (transferencia: any) => {
    const esEnvio = transferencia.tipo_transaccion === 'TRANSFERENCIA_ENVIADA';
    
    return {
      texto: esEnvio ? 'text-red-600' : 'text-green-600',
      signo: esEnvio ? '-' : '+',
      icono: esEnvio ? '📤' : '📥'
    };
  };

  if(status === 'checking') {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-600 mt-4">Verificando usuario...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* ✅ HEADER CORREGIDO - CIERRE DE TAGS ARREGLADO */}
      <View className="pt-12 px-4 pb-4 bg-gray-50">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-blue-600 ">Banco Riku</Text>
            <Text className="text-gray-600 mt-1">¡Hola {user?.nombre}!</Text>
          </View>
          
          <View className="flex-row items-center">
            {/* ✅ BOTÓN DE LOGOUT */}
            <TouchableOpacity 
              onPress={handleLogout}
              className="p-2 mr-2 bg-red-50 rounded-full border border-red-200"
            >
              <LogOut size={20} color="#dc2626" />
            </TouchableOpacity>

            {/* CAMPANITA DE NOTIFICACIONES MEJORADA */}
            <TouchableOpacity 
              onPress={async () => {
                console.log('🔔 Navegando a notificaciones...');
                await sincronizarNotificaciones();
                router.push('/(banco-app)/(notificaciones)');
              }}
              className="relative p-2"
            >
              <Bell size={24} color="#374151" />
              {unreadCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-5 h-5 justify-center items-center">
                  <Text className="text-white text-xs font-bold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* TARJETA DE SALDO CON LOADING */}
        <View className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-200">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-800">Cuenta {cuenta?.tipo_cuenta}</Text>
            <Link href="/(banco-app)/(datos)" asChild>
              <TouchableOpacity>
                <Text className="text-blue-600 font-medium">Ver datos</Text>
              </TouchableOpacity>
            </Link>
          </View>
          
          <View className="space-y-3">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-gray-500 text-sm">Disponible</Text>
                <Text className="text-2xl font-bold text-gray-800">
                  {cuenta ? formatChileanPeso(cuenta.saldo) : 'Cargando...'}
                </Text>
              </View>
              {(isLoading || refreshing) && (
                <ActivityIndicator size="small" color="#2563eb" />
              )}
            </View>
            
            <View className="border-t border-gray-100 pt-3">
              <Text className="text-gray-500 text-sm">N° Cuenta</Text>
              <Text className="text-gray-800">{cuenta?.numero_cuenta}</Text>
            </View>
          </View>

          {/* INDICADOR DE ACTUALIZACIÓN RECIENTE */}
          {!isLoading && !refreshing && cuenta && (
            <View className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
              <Text className="text-green-700 text-xs text-center">
                ✅ Actualizado {new Date().toLocaleTimeString('es-CL', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
          )}
        </View>
        
        {/* BOTONES DE ACCIÓN */}
        <View className="flex-row justify-around mb-6">
          <FAB
            iconSource={require('../../../assets/images/agregar-usuario.png')}
            onPress={() => setModalDestinatarioVisible(true)}>
            <ThemedText>Agregar destinatario</ThemedText>
          </FAB>
          
          <FAB
            iconSource={require('../../../assets/images/icon-transferencia.png')}
            onPress={handleTransferPress}>
            <View className="flex-row items-center">
              <ThemedText>Transferir</ThemedText>
              {isLoading && (
                <ActivityIndicator size="small" color="white" className="ml-2" />
              )}
            </View>
          </FAB>
          
          <FAB
            iconSource={require('../../../assets/images/icon-movimientos.png')}
            onPress={() => router.push('/(banco-app)/(movimientos)')}>
            <ThemedText>Movimientos</ThemedText>
          </FAB>
        </View>

        {/* MOVIMIENTOS RECIENTES */}
        <View className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-800">Movimientos recientes</Text>
            {refreshing && (
              <ActivityIndicator size="small" color="#2563eb" />
            )}
          </View>

          {loading && !refreshing ? (
            <View className="py-4">
              <ActivityIndicator size="small" color="#2563eb" />
              <Text className="text-gray-500 text-center mt-2">Cargando movimientos...</Text>
            </View>
          ) : ultimasTransferencias.length > 0 ? (
            <View className="space-y-3">
              {ultimasTransferencias.map((transferencia) => {
                const estilo = getTransferenciaStyle(transferencia);
                
                return (
                  <View 
                    key={transferencia.id} 
                    className="flex-row justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <View className="flex-row items-center flex-1">
                      <Text className="text-xl mr-3">{estilo.icono}</Text>
                      <View className="flex-1">
                        <Text className="text-gray-800 font-medium text-base">
                          {getNombreDisplay(transferencia)}
                        </Text>
                        {transferencia.descripcion && (
                          <Text className="text-gray-500 text-xs mt-1">
                            {transferencia.descripcion}
                          </Text>
                        )}
                      </View>
                    </View>
                    
                    <View className="items-end">
                      <Text className={`font-bold text-lg ${estilo.texto}`}>
                        {estilo.signo} {formatChileanPeso(transferencia.monto)}
                      </Text>
                    </View>
                  </View>
                );
              })}
              
              {/* Botón para ver más movimientos */}
              {transferencias.length > 3 && (
                <TouchableOpacity 
                  onPress={() => router.push('/(banco-app)/(movimientos)')}
                  className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <Text className="text-blue-600 text-center font-medium">
                    Ver todos los movimientos ({transferencias.length})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View className="py-4">
              <Text className="text-gray-400 text-4xl text-center mb-3">💸</Text>
              <Text className="text-gray-500 text-center mb-2">
                No hay movimientos recientes
              </Text>
              <Text className="text-gray-400 text-sm text-center">
                Realiza tu primera transferencia para ver movimientos aquí
              </Text>
            </View>
          )}
          
          {/* MENSAJE DE ACTUALIZACIÓN AUTOMÁTICA */}
          <View className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Text className="text-blue-700 text-xs text-center">
              💡 El saldo se actualiza automáticamente cada 5 minutos
            </Text>
          </View>
        </View>
      </ScrollView>

      <NuevoDestinatarioModal
        visible={modalDestinatarioVisible}
        onClose={() => setModalDestinatarioVisible(false)}
        onDestinatarioAgregado={() => {
          console.log('Destinatario agregado exitosamente');
        }}
      />
    </View>
  );
};

export default HomeScreen;