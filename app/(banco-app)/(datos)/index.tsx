import GoBackIconButton from '@/components/GoBackIconButton';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { useTransferenciaStore } from '@/presentation/transferencias/store/useTransferenciasStore';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

const TarjetaDebitoPremium = () => {
  const { user, token } = useAuthStore();
  const { tarjetas, loading, error, obtenerTarjetas } = useTransferenciaStore();

  useEffect(() => {
    if (token) {
      obtenerTarjetas(token);
    }
  }, [token]);

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <GoBackIconButton />
        <ActivityIndicator size="large" color="#1e40af" />
        <Text className="text-gray-600 mt-4 text-lg">Cargando información de la tarjeta...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-6">
        <GoBackIconButton />
        <Text className="text-red-500 text-center text-lg mb-4">Error: {error}</Text>
        <Text className="text-gray-600 text-center mb-4">
          No se pudo cargar la información de tu tarjeta
        </Text>
      </View>
    );
  }

  if (!tarjetas || tarjetas.length === 0) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-6">
        <GoBackIconButton />
        <Text className="text-gray-400 text-6xl mb-4">💳</Text>
        <Text className="text-gray-600 text-xl font-medium mb-2 text-center">
          No tienes tarjetas
        </Text>
        <Text className="text-gray-500 text-center text-base">
          Contacta con el banco para solicitar tu tarjeta débito
        </Text>
      </View>
    );
  }

  const tarjeta = tarjetas[0];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header con botón de regreso */}
      <View className="pt-12 pl-4 bg-gray-50">
        <GoBackIconButton />
      </View>
      
      {/* Contenido principal */}
      <View className="flex-1 justify-center items-center px-4">
        {/* Tarjeta principal */}
        <View className="w-full max-w-96 h-72 bg-blue-900 rounded-2xl p-6 overflow-hidden shadow-xl relative">
          
          {/* Chip */}
          <View className="absolute top-6 left-6 w-12 h-10 bg-amber-300 rounded-md justify-center items-center">
            <View className="w-10 h-6 bg-amber-400 rounded-sm flex-row">
              <View className="flex-1 border-r border-amber-500">
                <View className="h-1 bg-amber-600 mx-1 my-1 rounded" />
                <View className="h-1 bg-amber-600 mx-1 my-1 rounded" />
              </View>
              <View className="flex-1">
                <View className="h-1 bg-amber-600 mx-1 my-1 rounded" />
                <View className="h-1 bg-amber-600 mx-1 my-1 rounded" />
              </View>
            </View>
          </View>

          {/* Logo MasterCard */}
          <View className="absolute top-6 right-6 flex-row items-center">
            <View className="w-8 h-8 bg-red-500 rounded-full -mr-2 z-10" />
            <View className="w-8 h-8 bg-yellow-500 rounded-full opacity-90" />
          </View>

          {/* Contenido de la tarjeta */}
          <View className="flex-1 justify-between pt-16">
            {/* Header */}
            <View className="flex-row justify-between items-start">
              <Text className="text-white font-bold text-lg">MASTERCARD</Text>
              <Text className="text-white text-xs font-bold bg-blue-700 px-3 py-1 rounded-full">DÉBITO</Text>
            </View>

            {/* Número de tarjeta */}
            <Text className="text-white text-2xl font-bold tracking-widest text-center mt-8 font-mono">
              {tarjeta.numero_tarjeta ? 
                tarjeta.numero_tarjeta.replace(/(\d{4})/g, '$1 ').trim() : 
                '**** **** **** ****'
              }
            </Text>

            {/* Información del titular, CVV y vencimiento */}
            <View className="flex-row justify-between items-end mt-8">
              <View className="flex-1">
                <Text className="text-blue-200 text-xs mb-1">TITULAR</Text>
                <Text className="text-white text-sm font-semibold" numberOfLines={1}>
                  {tarjeta.nombre_titular?.toUpperCase() || 'TITULAR'}
                </Text>
              </View>

              <View className="items-center mx-4">
                <Text className="text-blue-200 text-xs mb-1">CVV</Text>
                <Text className="text-white text-sm font-semibold font-mono">
                  {tarjeta.cvv || '***'}
                </Text>
              </View>
              
              <View className="items-end">
                <Text className="text-blue-200 text-xs mb-1">VENCE</Text>
                <Text className="text-white text-sm font-semibold">
                  {tarjeta.fecha_vencimiento ? 
                    `${tarjeta.fecha_vencimiento.split('/')[0]}/${tarjeta.fecha_vencimiento.split('/')[1]?.slice(-2)}` : 
                    'MM/AA'
                  }
                </Text>
              </View>
            </View>

            {/* Saldo disponible */}
            <View className="mt-4 pt-3 border-t border-blue-700">
              <View className="flex-row justify-between items-center">
                <Text className="text-blue-200 text-xs">SALDO DISPONIBLE</Text>
                <Text className="text-green-300 text-lg font-bold">
                  ${tarjeta.saldo_actual ? tarjeta.saldo_actual.toLocaleString() : '0'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Nota de seguridad */}
        <View className="bg-white rounded-xl p-4 mt-8 shadow-sm border border-gray-200 w-full">
          <Text className="text-gray-600 text-sm text-center">
            Mantén tu CVV en secreto. No lo compartas con nadie.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default TarjetaDebitoPremium;