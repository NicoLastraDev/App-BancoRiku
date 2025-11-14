import GoBackIconButton from "@/components/GoBackIconButton";
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { transferenciaActions } from "@/core/banco/transferencias.actions";

import { useToast } from "@/hooks/useToasts";
import { useDestinatariosStore } from '@/presentation/destinatarios/store/useDestinatariosStore';
import { useTransferenciaStore } from "@/presentation/transferencias/store/useTransferenciasStore";

const TransferirScreen = ({ onClose }: { onClose?: () => void }) => {
  const [amount, setAmount] = useState('');
  const [recipientSearch, setRecipientSearch] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedDestinatario, setSelectedDestinatario] = useState<any>(null);
  const [transferenciaCompletada, setTransferenciaCompletada] = useState(false);

  const { token, cuenta: cuentaUsuario, loadCuenta } = useAuthStore();
  const { error, clearError } = useTransferenciaStore();
  const { destinatarios, obtenerDestinatarios, loading: loadingDestinatarios } = useDestinatariosStore();
  
  const { toast } = useToast();

  useEffect(() => {
    loadCuenta();
    obtenerDestinatarios();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  const filteredDestinatarios = destinatarios.filter(destinatario =>
    destinatario.nombre.toLowerCase().includes(recipientSearch.toLowerCase()) ||
    destinatario.numero_cuenta.includes(recipientSearch)
  );

  const seleccionarDestinatario = (destinatario: any) => {
    setSelectedDestinatario(destinatario);
    setRecipientSearch(destinatario.nombre);
    setShowSuggestions(false);
  };

  const handleTransfer = async () => {
    // Validaciones
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Error', 'El monto debe ser un número válido y mayor a 0');
      return;
    }

    if (!cuentaUsuario) {
      toast.error('Error', 'No se pudo obtener la información de tu cuenta');
      return;
    }

    // Validación de saldo en frontend (preventiva)
    if (Number(amount) > cuentaUsuario.saldo) {
      toast.error('Saldo Insuficiente', 'No tienes suficiente saldo para realizar esta transferencia');
      return;
    }

    if (!amount || !selectedDestinatario) {
      toast.error('Datos Incompletos', 'Por favor selecciona un destinatario e ingresa el monto');
      return;
    }

    setIsSubmitting(true);
    setTransferenciaCompletada(false);

    try {
      console.log('🔄 Iniciando transferencia...', {
        monto: amount,
        destinatario: selectedDestinatario.nombre,
        cuenta_destino: selectedDestinatario.numero_cuenta
      });

      const datosTransferencia = {
        cuenta_destino: selectedDestinatario.numero_cuenta,
        monto: Number(amount),
        descripcion: description || `Transferencia a ${selectedDestinatario.nombre}`
      };

      await transferenciaActions.realizarTransferencia(datosTransferencia, token || '');

      // Éxito
      await loadCuenta();
      setTransferenciaCompletada(true);
      
      toast.transfer(
        '✅ Transferencia Exitosa', 
        `Enviado a ${selectedDestinatario.nombre}`,
        Number(amount)
      );

      // Limpiar formulario después de un delay
      setTimeout(() => {
        setAmount('');
        setDescription('');
        setSelectedDestinatario(null);
        setRecipientSearch('');
        setTransferenciaCompletada(false);
        if (onClose) onClose();
      }, 2000);

    } catch (error: any) {
      console.log('❌ Error capturado en screen:', {
        message: error.message,
        isInsufficientFunds: error.isInsufficientFunds
      });
      
      setTransferenciaCompletada(false);
      
      // Manejar error específico de saldo insuficiente
      if (error.message.includes('Saldo insuficiente') || error.isInsufficientFunds) {
        toast.error(
          '❌ Saldo Insuficiente',
          'No tienes suficiente saldo para realizar esta transferencia'
        );
      } else if (error.message.includes('Cuenta destino no encontrada')) {
        toast.error(
          '❌ Cuenta No Encontrada',
          'La cuenta destino no existe o es inválida'
        );
      } else {
        // Error genérico
        toast.error(
          '❌ Transferencia Fallida',
          error.message || 'No se pudo completar la transferencia'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const saldoDisponible = cuentaUsuario?.saldo || 0;
  const montoNumerico = Number(amount) || 0;
  
  // Condiciones mejoradas para evitar estilos rojos después de transferencia
  const mostrarValidaciones = !transferenciaCompletada && amount !== '';
  const saldoInsuficiente = mostrarValidaciones && montoNumerico > saldoDisponible;
  const botonDeshabilitado = isSubmitting || !selectedDestinatario || 
                            (mostrarValidaciones && (saldoInsuficiente || montoNumerico <= 0));

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header con gradiente */}
        <View className="bg-blue-600 pt-12 pb-6 px-6 rounded-b-3xl">
          <View className="flex-row items-center mb-4">
            <GoBackIconButton />
            <Text className="text-2xl font-bold text-white text-center flex-1 mr-8">
              Transferir
            </Text>
          </View>
          
          {/* Saldo disponible REAL */}
          <View className="bg-blue-500 rounded-2xl p-4 mt-2">
            <Text className="text-blue-100 text-sm font-medium">Saldo disponible</Text>
            <Text className="text-white text-2xl font-bold mt-1">
              ${saldoDisponible.toLocaleString()}
            </Text>
            <Text className="text-blue-200 text-xs mt-1">
              Cuenta: {cuentaUsuario?.numero_cuenta || 'Cargando...'}
            </Text>
          </View>
        </View>

        {/* Formulario */}
        <View className="px-6 mt-6">
          {/* Tarjeta del formulario */}
          <View className="bg-white rounded-3xl shadow-lg p-6 mb-6 border border-gray-100">
            {/* Búsqueda de destinatario */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-4">Destinatario</Text>
              
              <View className="mb-4">
                <Text className="text-gray-700 mb-2 font-medium">Buscar por nombre o cuenta *</Text>
                <View className="relative">
                  <TextInput
                    className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-900 pr-12"
                    placeholder="Ej: Juan Pérez o 6185-2835-4550-1725"
                    placeholderTextColor="#9CA3AF"
                    value={recipientSearch}
                    onChangeText={(text) => {
                      setRecipientSearch(text);
                      setShowSuggestions(true);
                      if (!text) {
                        setSelectedDestinatario(null);
                      }
                      // Resetear estado de completado cuando el usuario empiece a escribir
                      if (transferenciaCompletada) {
                        setTransferenciaCompletada(false);
                      }
                    }}
                    onFocus={() => setShowSuggestions(true)}
                  />
                  {loadingDestinatarios && (
                    <View className="absolute right-3 top-3">
                      <ActivityIndicator size="small" color="#3B82F6" />
                    </View>
                  )}
                </View>

                {/* Lista de sugerencias */}
                {showSuggestions && recipientSearch && filteredDestinatarios.length > 0 && (
                  <View className="bg-white border border-gray-200 rounded-xl mt-2 max-h-40">
                    <FlatList
                      data={filteredDestinatarios}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          className="p-3 border-b border-gray-100"
                          onPress={() => seleccionarDestinatario(item)}
                        >
                          <Text className="text-gray-900 font-medium">{item.nombre}</Text>
                          <Text className="text-gray-500 text-sm">
                            {item.numero_cuenta} • {item.banco_destino || 'Banco Riku'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}

                {showSuggestions && recipientSearch && filteredDestinatarios.length === 0 && (
                  <View className="bg-gray-50 p-3 rounded-xl mt-2">
                    <Text className="text-gray-500 text-center">No se encontraron destinatarios</Text>
                  </View>
                )}
              </View>

              {/* Información del destinatario seleccionado */}
              {selectedDestinatario && (
                <View className="mb-4 p-4 bg-green-50 rounded-xl border border-green-200">
                  <Text className="text-green-800 font-bold mb-2">✅ Destinatario seleccionado:</Text>
                  <View className="space-y-1">
                    <Text className="text-green-700">
                      <Text className="font-medium">Nombre:</Text> {selectedDestinatario.nombre}
                    </Text>
                    <Text className="text-green-700">
                      <Text className="font-medium">Cuenta:</Text> {selectedDestinatario.numero_cuenta}
                    </Text>
                    <Text className="text-green-700">
                      <Text className="font-medium">Banco:</Text> {selectedDestinatario.banco_destino || 'Banco Riku'}
                    </Text>
                    <Text className="text-green-700">
                      <Text className="font-medium">Tipo:</Text> {selectedDestinatario.tipo_cuenta}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Monto */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-4">Monto</Text>
              <View className="relative">
                <TextInput
                  className={`bg-gray-50 p-4 rounded-xl border text-gray-900 text-2xl font-bold pl-12 ${
                    // Solo mostrar rojo si NO es después de transferencia exitosa y hay saldo insuficiente
                    saldoInsuficiente ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={(text) => {
                    setAmount(text);
                    // Resetear estado de completado cuando el usuario empiece a escribir
                    if (transferenciaCompletada) {
                      setTransferenciaCompletada(false);
                    }
                  }}
                />
                <Text className="absolute left-4 top-4 text-2xl font-bold text-gray-500">$</Text>
              </View>
              
              {/* Mostrar información de saldo solo cuando sea relevante */}
              {mostrarValidaciones && (
                <View className="flex-row justify-between mt-2">
                  <Text className="text-gray-600 text-sm">
                    {montoNumerico.toLocaleString()} pesos
                  </Text>
                  <Text className={`text-sm font-medium ${
                    saldoInsuficiente ? 'text-red-500' : 'text-green-600'
                  }`}>
                    {saldoInsuficiente 
                      ? '❌ Saldo insuficiente' 
                      : `Saldo después: $${(saldoDisponible - montoNumerico).toLocaleString()}`
                    }
                  </Text>
                </View>
              )}
            </View>

            {/* Descripción */}
            <View className="mb-6">
              <Text className="text-gray-700 mb-2 font-medium">Descripción (opcional)</Text>
              <TextInput
                className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-900"
                placeholder={`Ej: Pago a ${selectedDestinatario?.nombre || 'destinatario'}`}
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={(text) => {
                  setDescription(text);
                  // Resetear estado de completado cuando el usuario empiece a escribir
                  if (transferenciaCompletada) {
                    setTransferenciaCompletada(false);
                  }
                }}
              />
            </View>

            {/* Mostrar advertencia solo si hay saldo insuficiente y NO es después de transferencia */}
            {saldoInsuficiente && (
              <View className="mb-4 p-3 bg-red-50 rounded-xl border border-red-200">
                <Text className="text-red-800 font-bold mb-1">❌ Saldo insuficiente</Text>
                <Text className="text-red-700 text-sm">
                  Necesitas ${montoNumerico.toLocaleString()} pero solo tienes ${saldoDisponible.toLocaleString()} disponible.
                </Text>
              </View>
            )}

            {/* Mensaje de éxito después de transferencia */}
            {transferenciaCompletada && (
              <View className="mb-4 p-3 bg-green-50 rounded-xl border border-green-200">
                <Text className="text-green-800 font-bold mb-1">✅ Transferencia exitosa</Text>
                <Text className="text-green-700 text-sm">
                  Se envió ${montoNumerico.toLocaleString()} a {selectedDestinatario?.nombre}. El formulario se limpiará automáticamente.
                </Text>
              </View>
            )}

            {/* Botón de transferencia */}
            <TouchableOpacity
              className={`p-5 rounded-2xl shadow-lg mt-4 ${
                botonDeshabilitado 
                  ? 'bg-gray-400 opacity-50' 
                  : transferenciaCompletada 
                    ? 'bg-green-600' 
                    : 'bg-blue-600'
              }`}
              onPress={handleTransfer}
              disabled={botonDeshabilitado}
            >
              <View className="flex-row items-center justify-center">
                {isSubmitting ? (
                  <>
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-bold text-lg ml-2">Procesando...</Text>
                  </>
                ) : transferenciaCompletada ? (
                  <>
                    <Text className="text-white font-bold text-lg">✅ Transferencia completada</Text>
                  </>
                ) : (
                  <>
                    <Text className="text-white font-bold text-lg">
                      {saldoInsuficiente 
                        ? 'Saldo insuficiente' 
                        : `Transferir $${montoNumerico > 0 ? montoNumerico.toLocaleString() : ''} a ${selectedDestinatario?.nombre || 'destinatario'}`
                      }
                    </Text>
                    {!saldoInsuficiente && montoNumerico > 0 && <Text className="text-white ml-2">➔</Text>}
                  </>
                )}
              </View>
            </TouchableOpacity>

            {/* Información adicional */}
            <View className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <Text className="text-blue-800 text-sm font-medium text-center">
                💡 La transferencia se procesará instantáneamente
              </Text>
            </View>
          </View>

          {/* Consejos de seguridad */}
          <View className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200 mb-6">
            <Text className="text-yellow-800 font-bold mb-2">🔒 Transferencia Segura</Text>
            <Text className="text-yellow-700 text-sm">• Verifica el nombre del destinatario</Text>
            <Text className="text-yellow-700 text-sm">• Confirma el número de cuenta</Text>
            <Text className="text-yellow-700 text-sm">• Revisa el monto antes de enviar</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default TransferirScreen;