import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { useTransferenciaStore } from '@/presentation/transferencias/store/useTransferenciasStore';
import { Ionicons } from '@expo/vector-icons'; // Asegúrate de tener expo/vector-icons instalado
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export const MovimientosScreen = () => {
  const { transferencias, loading, error, obtenerTransferencias } = useTransferenciaStore();
  const { token, user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (token) {
      obtenerTransferencias(token);
    }
  }, [token]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (token) {
      await obtenerTransferencias(token);
    }
    setRefreshing(false);
  };

  // Formatear fecha completa con hora
  const formatFechaCompleta = (fecha: string) => {
    const date = new Date(fecha);
    return {
      fecha: date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      hora: date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      diaSemana: date.toLocaleDateString('es-ES', { weekday: 'short' })
    };
  };

  // Formatear monto - SOLO ENTEROS
  const formatMonto = (monto: number) => {
    return `$${monto.toLocaleString('es-ES', { maximumFractionDigits: 0 })}`;
  };

  // Obtener color según tipo de transacción
  const getColorMonto = (tipo: string) => {
    switch (tipo) {
      case 'TRANSFERENCIA_RECIBIDA':
        return 'text-green-600';
      case 'TRANSFERENCIA_ENVIADA':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Obtener color de fondo para el icono
  const getBgColor = (tipo: string) => {
    switch (tipo) {
      case 'TRANSFERENCIA_RECIBIDA':
        return 'bg-green-50 border border-green-200';
      case 'TRANSFERENCIA_ENVIADA':
        return 'bg-red-50 border border-red-200';
      default:
        return 'bg-gray-50 border border-gray-200';
    }
  };

  // Obtener icono según tipo de transacción (más minimalista)
  const getIcono = (tipo: string) => {
    switch (tipo) {
      case 'TRANSFERENCIA_RECIBIDA':
        return '↓';
      case 'TRANSFERENCIA_ENVIADA':
        return '↑';
      default:
        return '•';
    }
  };

  // Obtener color del icono
  const getIconColor = (tipo: string) => {
    switch (tipo) {
      case 'TRANSFERENCIA_RECIBIDA':
        return 'text-green-600';
      case 'TRANSFERENCIA_ENVIADA':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Obtener signo del monto
  const getSignOMonto = (tipo: string) => {
    switch (tipo) {
      case 'TRANSFERENCIA_RECIBIDA':
        return '+';
      case 'TRANSFERENCIA_ENVIADA':
        return '-';
      default:
        return '';
    }
  };

  // Obtener display del tipo de transacción
  const getTipDisplay = (tipo: string) => {
    const tipos: { [key: string]: string } = {
      'TRANSFERENCIA_ENVIADA': 'TRANSFERENCIA ENVIADA',
      'TRANSFERENCIA_RECIBIDA': 'TRANSFERENCIA RECIBIDA'
    };
    return tipos[tipo] || tipo;
  };

  // Obtener nombre para mostrar
  const getNombreDisplay = (transaccion: any) => {
    const formatNumeroCuenta = (cuenta: string) => {
      if (!cuenta) return '';
      const soloNumeros = cuenta.replace(/[\s-]/g, '');
      return soloNumeros.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1-$2-$3-$4');
    };

    const nombre = transaccion.nombre_destinatario || transaccion.nombre_remitente;
    const cuentaFormateada = formatNumeroCuenta(transaccion.cuenta_destino);
    const prefijo = transaccion.tipo_transaccion === 'TRANSFERENCIA_ENVIADA' ? 'Para: ' : 'De: ';

    if (nombre && cuentaFormateada) {
      return `${prefijo}${nombre}\n${cuentaFormateada}`;
    } else if (nombre) {
      return `${prefijo}${nombre}`;
    } else if (cuentaFormateada) {
      return `${prefijo}${cuentaFormateada}`;
    }
    
    return transaccion.tipo_transaccion === 'TRANSFERENCIA_ENVIADA' ? 'Transferencia enviada' : 'Transferencia recibida';
  };

  // Estados de carga
  if (loading && !refreshing && transferencias.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-gray-600 mt-4 text-lg font-medium">Cargando movimientos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-gray-50">
        <Text className="text-red-600 text-center text-lg font-medium mb-4">
          Error al cargar movimientos
        </Text>
        <Text className="text-gray-600 text-center mb-6">{error}</Text>
        <Text 
          className="text-blue-500 font-semibold text-lg py-3 px-6 bg-blue-50 rounded-lg" 
          onPress={() => token && obtenerTransferencias(token)}
        >
          Reintentar
        </Text>
      </View>
    );
  }

  if (transferencias.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-gray-50">
        <View className="flex-row items-center absolute top-14 left-4">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="p-2"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
        <Text className="text-gray-400 text-6xl mb-4">💸</Text>
        <Text className="text-gray-600 text-xl font-medium mb-2 text-center">
          No hay movimientos
        </Text>
        <Text className="text-gray-500 text-center text-base">
          Realiza tu primera transferencia para ver tu historial aquí
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header con botón de retroceso */}
      <View className="bg-white pt-12 pb-4 px-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="p-2 -ml-2 mr-2"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">Movimientos</Text>
            <Text className="text-gray-600 mt-1">
              {user?.nombre ? `Hola, ${user.nombre}` : 'Tus transacciones recientes'}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Lista de transacciones */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
          />
        }
      >
        <View className="p-4">
          {transferencias.map((transaction) => {
            const { fecha, hora, diaSemana } = formatFechaCompleta(transaction.fecha);
            
            return (
              <View 
                key={transaction.id} 
                className="bg-white rounded-lg p-4 mb-3 border border-gray-200"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-row items-center flex-1">
                    {/* Icono minimalista */}
                    <View className={`w-10 h-10 rounded-full ${getBgColor(transaction.tipo_transaccion)} items-center justify-center mr-3`}>
                      <Text className={`text-sm font-bold ${getIconColor(transaction.tipo_transaccion)}`}>
                        {getIcono(transaction.tipo_transaccion)}
                      </Text>
                    </View>
                    
                    <View className="flex-1">
                      <Text className="text-gray-900 font-semibold text-base mb-1">
                        {getTipDisplay(transaction.tipo_transaccion)}
                      </Text>
                      <Text className="text-gray-600 text-sm" numberOfLines={2}>
                        {getNombreDisplay(transaction)}
                      </Text>
                    </View>
                  </View>

                  {/* Monto alineado a la derecha - SIN DECIMALES */}
                  <View className="items-end ml-2">
                    <Text className={`font-bold text-lg ${getColorMonto(transaction.tipo_transaccion)}`}>
                      {getSignOMonto(transaction.tipo_transaccion)}{formatMonto(transaction.monto)}
                    </Text>
                  </View>
                </View>

                {/* Descripción */}
                {transaction.descripcion && (
                  <Text className="text-gray-500 text-sm mb-3">
                    {transaction.descripcion}
                  </Text>
                )}

                {/* Fecha y hora - más compacta */}
                <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
                  <Text className="text-gray-500 text-xs font-medium">
                    {diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {fecha} • {hora}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {loading && (
          <ActivityIndicator size="small" color="#4F46E5" className="my-4" />
        )}

        <View className="py-4">
          <Text className="text-center text-gray-500 text-sm">
            {transferencias.length} movimientos mostrados
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default MovimientosScreen;