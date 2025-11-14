import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

export const MovimientosRecientes = () => {
  const [movimientos, setMovimientos] = useState<any[]>([]);


  if (movimientos.length === 0) {
    return (
      <View className="items-center py-8">
        <MaterialIcons name="receipt" size={40} color="#9CA3AF" />
        <Text className="text-gray-500 mt-2">No hay movimientos recientes</Text>
      </View>
    );
  }

  return (
    <ScrollView className="max-h-96">
      {movimientos.map((mov) => (
        <View key={mov.id} className="bg-white p-4 mb-2 rounded-lg border border-gray-100">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="font-bold text-blue-600">{mov.tipo}</Text>
            <Text className="text-green-600 font-bold text-lg">
              +${mov.monto.toLocaleString('es-CO')}M
            </Text>
          </View>
          
          <View className="mb-1">
            <Text className="text-gray-800">
              <Text className="font-semibold">De:</Text> {mov.nombreOrigen}
            </Text>
          </View>
          
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-600">
              <Text className="font-semibold">Banco:</Text> {mov.bancoOrigen}
            </Text>
            <Text className="text-gray-600">
              <Text className="font-semibold">Cuenta:</Text> {mov.cuentaOrigen}
            </Text>
          </View>
          
          <View className="flex-row justify-between border-t border-gray-100 pt-2 mt-2">
            <Text className="text-gray-500 text-xs">
              <Text className="font-semibold">Ref:</Text> {mov.referencia}
            </Text>
            <Text className="text-gray-500 text-xs">
              {}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};