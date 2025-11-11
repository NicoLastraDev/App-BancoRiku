// components/NuevoDestinatarioModal.tsx
import { useAuthStore } from '@/presentation/auth/store/useAuthStore'
import { useDestinatariosStore } from '@/presentation/destinatarios/store/useDestinatariosStore'
import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'

interface NuevoDestinatarioModalProps {
  visible: boolean
  onClose: () => void
  onDestinatarioAgregado: () => void
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

const NuevoDestinatarioModal = ({ visible, onClose, onDestinatarioAgregado }: NuevoDestinatarioModalProps) => {
  const [numeroCuenta, setNumeroCuenta] = useState('')
  const [cuentaEncontrada, setCuentaEncontrada] = useState<any>(null)
  const [buscando, setBuscando] = useState(false)
  
  const { crearDestinatario, loading } = useDestinatariosStore()
  const { token } = useAuthStore()

  const buscarCuenta = async () => {
    if (!numeroCuenta.trim()) {
      Alert.alert('Error', 'Por favor ingresa un número de cuenta')
      return
    }

    if (!token) {
      Alert.alert('Error', 'No hay sesión activa')
      return
    }

    setBuscando(true)
    setCuentaEncontrada(null)

    try {
      console.log('🌐 Buscando cuenta:', numeroCuenta)
      
      const response = await fetch('http://192.168.1.6:4000/api/beneficiarios/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numero_cuenta: numeroCuenta
        })
      })

      console.log('📡 Response status:', response.status)
      
      const responseText = await response.text()
      console.log('📄 Response completo:', responseText)

      if (responseText.includes('<!DOCTYPE') || responseText.includes('<html') || responseText.trim().startsWith('<')) {
        console.log('❌ El servidor devolvió HTML en lugar de JSON')
        Alert.alert('Error del Servidor', 'El endpoint /api/beneficiarios/search no está funcionando. Verifica el backend.')
        return
      }

      let data
      try {
        data = JSON.parse(responseText)
        console.log('✅ JSON parseado:', data)
      } catch (parseError) {
        console.log('❌ No se pudo parsear JSON:', parseError)
        Alert.alert('Error', 'El servidor respondió con un formato inválido')
        return
      }

      if (response.ok && data.success) {
        console.log('✅ Cuenta encontrada:', data.data)
        setCuentaEncontrada({
          nombre: data.data.nombre,
          tipoCuenta: data.data.tipo_cuenta,
          banco: 'Banco Riku',
          numeroCuenta: data.data.numero_cuenta,
          usuarioId: data.data.usuario_id
        })
      } else {
        Alert.alert('Error', data.message || 'Cuenta no encontrada')
      }

    } catch (error: any) {
      console.log('❌ Error de red:', error)
      Alert.alert('Error', 'No se pudo conectar con el servidor: ' + error.message)
    } finally {
      setBuscando(false)
    }
  }

  const agregarDestinatario = async () => {
    if (!cuentaEncontrada) return

    try {
      const datosDestinatario = {
        nombre: cuentaEncontrada.nombre,
        numero_cuenta: cuentaEncontrada.numeroCuenta,
        tipo_cuenta: cuentaEncontrada.tipoCuenta,
        banco_destino: cuentaEncontrada.banco,
        nombre_cuenta: cuentaEncontrada.nombre
      }

      await crearDestinatario(datosDestinatario)
      
      Alert.alert('Éxito', 'Destinatario agregado correctamente')
      
      // Limpiar y cerrar
      setNumeroCuenta('')
      setCuentaEncontrada(null)
      onDestinatarioAgregado()
      onClose()
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo agregar el destinatario')
    }
  }

  const handleClose = () => {
    Keyboard.dismiss()
    setNumeroCuenta('')
    setCuentaEncontrada(null)
    setBuscando(false)
    onClose()
  }

  const dismissKeyboard = () => {
    Keyboard.dismiss()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -50 : 0}
      >
        {/* Overlay que cierra teclado al tocar */}
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View className="flex-1 bg-black/50">
            <TouchableOpacity 
              className="flex-1"
              activeOpacity={1}
              onPress={handleClose}
            />
          </View>
        </TouchableWithoutFeedback>
        
        {/* Hoja Inferior - Más alta para mejor visibilidad */}
        <View 
          className="bg-white rounded-t-3xl absolute bottom-0 left-0 right-0"
          style={{
            height: SCREEN_HEIGHT * 0.75, // Más alto para mejor visibilidad
            maxHeight: SCREEN_HEIGHT * 0.85,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          {/* Indicador de arrastre */}
          <View className="items-center py-2">
            <View className="w-12 h-1 bg-gray-300 rounded-full" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-lg font-bold text-gray-800">Agregar Destinatario</Text>
            <TouchableOpacity onPress={handleClose} className="p-1">
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Contenido con scroll - Más compacto */}
          <ScrollView 
            className="flex-1 p-4"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Campo de búsqueda - Más prominente */}
            <View className="mb-6">
              <Text className="text-gray-700 mb-3 font-semibold text-base">Número de Cuenta</Text>
              <View className="flex-row">
                <TextInput
                  className="flex-1 border border-gray-300 rounded-l-lg p-4 bg-white text-base border-r-0"
                  placeholder="Ej: 6185-2835-4550-1725"
                  value={numeroCuenta}
                  onChangeText={setNumeroCuenta}
                  keyboardType="number-pad"
                  editable={!buscando && !loading}
                  returnKeyType="search"
                  onSubmitEditing={buscarCuenta}
                  autoFocus={true}
                />
                <TouchableOpacity
                  className="bg-blue-500 px-6 rounded-r-lg items-center justify-center min-w-20"
                  onPress={buscarCuenta}
                  disabled={buscando || loading}
                >
                  {buscando ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white font-bold text-base">Buscar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Resultados de la búsqueda */}
            {cuentaEncontrada && (
              <View className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <Text className="text-base font-semibold text-gray-800 mb-3">Información de la Cuenta</Text>
                
                <View className="space-y-2">
                  <View>
                    <Text className="text-gray-600 text-sm">Nombre</Text>
                    <Text className="text-gray-800 font-medium">{cuentaEncontrada.nombre}</Text>
                  </View>
                  
                  <View>
                    <Text className="text-gray-600 text-sm">Tipo de Cuenta</Text>
                    <Text className="text-gray-800 font-medium">{cuentaEncontrada.tipoCuenta}</Text>
                  </View>
                  
                  <View>
                    <Text className="text-gray-600 text-sm">Banco</Text>
                    <Text className="text-gray-800 font-medium">{cuentaEncontrada.banco}</Text>
                  </View>
                  
                  <View>
                    <Text className="text-gray-600 text-sm">Número de Cuenta</Text>
                    <Text className="text-gray-800 font-medium">{cuentaEncontrada.numeroCuenta}</Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  className="mt-4 bg-green-500 py-4 rounded-lg items-center"
                  onPress={agregarDestinatario}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white font-medium text-base">Agregar Destinatario</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Mensaje de instrucciones */}
            {!cuentaEncontrada && !buscando && (
              <View className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-2">
                <Text className="text-blue-800 text-center text-sm">
                  Ingresa el número de cuenta del destinatario y presiona "Buscar"
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

export default NuevoDestinatarioModal