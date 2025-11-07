import GoBackIconButton from '@/components/GoBackIconButton'
import { useAuthStore } from '@/presentation/auth/store/useAuthStore'
import { useDestinatariosStore } from '@/presentation/destinatarios/store/useDestinatariosStore'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native'

const NuevoDestinatarioScreen = () => {
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
      
      // Obtener el texto completo de la respuesta
      const responseText = await response.text()
      console.log('📄 Response completo:', responseText)

      // Verificar si es HTML (error del servidor)
      if (responseText.includes('<!DOCTYPE') || responseText.includes('<html') || responseText.trim().startsWith('<')) {
        console.log('❌ El servidor devolvió HTML en lugar de JSON')
        Alert.alert('Error del Servidor', 'El endpoint /api/beneficiarios/search no está funcionando. Verifica el backend.')
        return
      }

      // Intentar parsear como JSON
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

    } catch (error) {
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
      
      // Limpiar formulario
      setNumeroCuenta('')
      setCuentaEncontrada(null)
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo agregar el destinatario')
    }
  }

  return (
    <View className="flex-1 p-4 bg-gray-50 mt-10">
      <GoBackIconButton/>
      <Text className="text-xl font-bold text-gray-800 mb-6 text-center">Agregar Nuevo Destinatario</Text>
      
      {/* Campo de búsqueda */}
      <View className="mb-6">
        <Text className="text-gray-700 mb-2">Número de Cuenta</Text>
        <View className="flex-row">
          <TextInput
            className="flex-1 border border-gray-300 rounded-l-lg p-3 bg-white"
            placeholder="Ej: 6185-2835-4550-1725"
            value={numeroCuenta}
            onChangeText={setNumeroCuenta}
            keyboardType="number-pad"
            editable={!buscando && !loading}
          />
          <TouchableOpacity
            className="bg-blue-500 px-6 rounded-r-lg items-center justify-center"
            onPress={buscarCuenta}
            disabled={buscando || loading}
          >
            {buscando ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-bold">Buscar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Resultados de la búsqueda */}
      {cuentaEncontrada && (
        <View className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Información de la Cuenta</Text>
          
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Nombre:</Text>
              <Text className="text-gray-800 font-medium">{cuentaEncontrada.nombre}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Tipo de Cuenta:</Text>
              <Text className="text-gray-800 font-medium">{cuentaEncontrada.tipoCuenta}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Banco:</Text>
              <Text className="text-gray-800 font-medium">{cuentaEncontrada.banco}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Número de Cuenta:</Text>
              <Text className="text-gray-800 font-medium">{cuentaEncontrada.numeroCuenta}</Text>
            </View>
          </View>
          
          <TouchableOpacity
            className="mt-4 bg-green-500 py-3 rounded-lg items-center"
            onPress={agregarDestinatario}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-medium text-lg">Agregar Destinatario</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Mensaje de instrucciones */}
      {!cuentaEncontrada && !buscando && (
        <View className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <Text className="text-blue-800 text-center">
            Ingresa el número de cuenta del destinatario y presiona "Buscar"
          </Text>
        </View>
      )}
    </View>
  )
}

export default NuevoDestinatarioScreen