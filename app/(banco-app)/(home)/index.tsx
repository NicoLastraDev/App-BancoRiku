import { FAB } from '@/components/FAB';
import GoBackIconButton from '@/components/GoBackIconButton';
import LogoutIconButton from '@/components/LogoutIconButton';
import { ThemedText } from '@/components/ThemedText';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { Link, router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const index = () => {
  const {user, cuenta, status, loadCuenta} = useAuthStore()

  const formatChileanPeso = (amount: number | string): string => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericAmount);
  };

  useEffect(() => {
    if (status === 'authenticated' && user && !cuenta) {
      console.log('🔄 Cargando cuenta...');
      loadCuenta()
    }
  }, [status, user, cuenta])

  if(status === 'checking') {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-600 mt-4">Verificando usuario...</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="mb-6">
        <GoBackIconButton/>
        <Text className="text-2xl font-bold text-gray-800 text-center">Banco Riku</Text>
        <Text className="text-gray-500 text-center">¡Hola {user?.nombre}!</Text>
        <LogoutIconButton/>
      </View>
      
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
          <View>
            <Text className="text-gray-500 text-sm">Disponible</Text>
            <Text className="text-2xl font-bold text-gray-800">
              {cuenta ? formatChileanPeso(cuenta.saldo) : 'Cargando...'}
            </Text>
          </View>
          
          <View className="border-t border-gray-100 pt-3">
            <Text className="text-gray-500 text-sm">N° Cuenta</Text>
            <Text className="text-gray-800">{cuenta?.numero_cuenta}</Text>
          </View>
        </View>
      </View>
      
      <View className="flex-row justify-around mb-6">
        <FAB
          iconSource={require('../../../assets/images/agregar-usuario.png')}
          onPress={() => router.push('/(banco-app)/(nuevo_destinatario)')}>
          <ThemedText>Agregar destinatario</ThemedText>
        </FAB>
        <FAB
          iconSource={require('../../../assets/images/icon-transferencia.png')}
          onPress={() => router.push('/(banco-app)/(transferir)')}>
            <ThemedText>Transferir</ThemedText>
        </FAB>
        <FAB
          iconSource={require('../../../assets/images/icon-movimientos.png')}
          onPress={() => router.push('/(banco-app)/(movimientos)')}>
          <ThemedText>Movimientos</ThemedText>
        </FAB>
      </View>

      <View className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
        <Text className="text-lg font-bold text-gray-800 mb-4">Movimientos recientes</Text>
        <Text className="text-gray-400 text-center py-4">No hay movimientos recientes</Text>
      </View>
    </ScrollView>
  );
}

export default index;