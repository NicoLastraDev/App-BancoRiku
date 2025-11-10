import { FAB } from '@/components/FAB';
import LogoutIconButton from '@/components/LogoutIconButton';
import { ThemedText } from '@/components/ThemedText';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { useFocusEffect } from '@react-navigation/native';
import { Link, router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const index = () => {
  const {user, cuenta, status, loadCuenta} = useAuthStore()
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formatChileanPeso = (amount: number | string): string => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericAmount);
  };

  // 🔄 ACTUALIZAR SALDO CADA VEZ QUE LA PANTALLA SE ENFOQUE
  useFocusEffect(
    useCallback(() => {
      console.log('🏠 HomeScreen enfocada - Actualizando saldo...');
      loadCuenta();
    }, [])
  );

  // 🔄 PULL TO REFRESH
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    console.log('🔄 Pull to refresh - Actualizando datos...');
    await loadCuenta();
    setRefreshing(false);
  }, []);

  // 🔄 ACTUALIZAR AL VOLVER DE TRANSFERENCIA
  const handleTransferPress = () => {
    setIsLoading(true);
    router.push('/(banco-app)/(transferir)');
    // El saldo se actualizará automáticamente cuando vuelva por useFocusEffect
  };

  // ACTUALIZAR CUANDO EL COMPONENTE SE MONTA
  React.useEffect(() => {
    if (status === 'authenticated' && user) {
      console.log('🔄 Cargando cuenta inicial...');
      loadCuenta();
    }
  }, [status, user]);

  // QUITAR LOADING CUANDO LA CUENTA SE CARGA
  React.useEffect(() => {
    if (cuenta) {
      setIsLoading(false);
    }
  }, [cuenta]);

  if(status === 'checking') {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-600 mt-4">Verificando usuario...</Text>
      </View>
    )
  }

  return (
    <ScrollView 
      className="flex-1 bg-gray-50 p-4"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#2563eb']}
          tintColor="#2563eb"
        />
      }
    >
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-800 text-center">Banco Riku</Text>
        <Text className="text-gray-500 text-center">¡Hola {user?.nombre}!</Text>
        <LogoutIconButton/>
      </View>
      
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
          onPress={() => router.push('/(banco-app)/(nuevo_destinatario)')}>
          <ThemedText>Agregar destinatario</ThemedText>
        </FAB>
        
        <FAB
          iconSource={require('../../../assets/images/icon-transferencia.png')}
          onPress={handleTransferPress}
          disabled={isLoading}>
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
      <View className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-800">Movimientos recientes</Text>
          {refreshing && (
            <ActivityIndicator size="small" color="#2563eb" />
          )}
        </View>
        <Text className="text-gray-400 text-center py-4">No hay movimientos recientes</Text>
        
        {/* MENSAJE DE ACTUALIZACIÓN AUTOMÁTICA */}
        <View className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Text className="text-blue-700 text-xs text-center">
            💡 El saldo se actualiza automáticamente cada 5 minutos
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

export default index;