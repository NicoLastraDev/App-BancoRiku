import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

const LoginScreen = () => {
  const { login } = useAuthStore();
  const [isPosting, setIsPosting] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const onLogin = async () => {
    const { email, password } = form;

    console.log('🔐 Intentando login con:', { email });

    // Validaciones básicas
    if (email.length === 0 || password.length === 0) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    setIsPosting(true);
    
    try {
      const wasSuccessful = await login(email, password);
      
      if (wasSuccessful) {
        console.log('✅ Login exitoso, navegando a home...');
        router.replace('/(banco-app)/(home)');
        return;
      } else {
        // ❌ Login falló (credenciales incorrectas)
        Alert.alert(
          'Error de acceso', 
          'El correo electrónico o la contraseña son incorrectos. Por favor verifica tus credenciales.'
        );
      }
      
    } catch (error: any) {
      // ✅ CAPTURAR CUALQUIER ERROR INESPERADO
      console.log('💥 Error inesperado en onLogin:', error);
      Alert.alert(
        'Error de conexión', 
        'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
      );
    } finally {
      setIsPosting(false);
    }
  }

  return (
    <View className="flex-1 bg-gray-50 px-6 justify-center">
      <View className="w-full max-w-md mx-auto">
        
        {/* Encabezado */}
        <View className="mb-10">
          <Text className="text-3xl font-bold text-blue-600 mb-2 text-center">Banco Riku</Text>
          <Text className="text-gray-500 text-center">Inicia sesión para continuar</Text>
        </View>

        {/* Formulario */}
        <View className="w-full mb-6">
          {/* Campo Email */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-1">Email</Text>
            <TextInput
              className="bg-white p-4 rounded-lg border border-gray-200 w-full"
              placeholder="usuario@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={form.email}
              onChangeText={(value) => setForm({ ...form, email: value })}
              editable={!isPosting}
            />
          </View>

          {/* Campo Contraseña */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-1">Contraseña</Text>
            <TextInput
              className="bg-white p-4 rounded-lg border border-gray-200 w-full"
              placeholder="Tu contraseña"
              secureTextEntry
              autoComplete="password"
              value={form.password}
              onChangeText={(value) => setForm({ ...form, password: value })}
              editable={!isPosting}
              onSubmitEditing={onLogin}
            />
          </View>
        </View>

        {/* Botón de Login */}
        <TouchableOpacity
          className={`bg-blue-600 p-4 rounded-lg w-full flex-row justify-center items-center ${
            isPosting ? 'opacity-70' : ''
          }`}
          onPress={onLogin}
          disabled={isPosting}
        >
          {isPosting ? (
            <>
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white ml-2">Verificando...</Text>
            </>
          ) : (
            <Text className="text-white font-medium">Iniciar sesión</Text>
          )}
        </TouchableOpacity>

        {/* Enlaces */}
        <View className="w-full mt-4">
          <TouchableOpacity className="w-full mb-2">
            <Text className="text-blue-500 text-center">¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
          
          <View className="w-full justify-center">
            <Link href="/auth/register" asChild>
              <TouchableOpacity>
                <Text className="text-blue-600 text-center">
                  ¿No tienes cuenta? ¡Regístrate!
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Datos de prueba (solo para desarrollo) */}
        {__DEV__ && (
          <View className="mt-6 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <Text className="text-yellow-800 text-xs text-center">
              💡 Para pruebas: usa un email registrado en la base de datos
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default LoginScreen;