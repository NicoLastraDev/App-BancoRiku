import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

const LoginScreen = () => {

  const { login } = useAuthStore();
  const [isPosting, setIsPosting] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const onLogin = async () => {
    const { email, password } = form;

    console.log({ email, password });

    if (email.length === 0 || password.length === 0) {
      return;
    }

    setIsPosting(true);
    const wasSuccessful = await login(email, password);
    setIsPosting(false);

    if (wasSuccessful) {
      router.replace('/(banco-app)/(home)');
      return;
    }

    Alert.alert('Error', 'Usuario o contraseña no son correctos');
  }

  return (
    <View className="flex-1 bg-gray-50 px-6 justify-center">
      {/* Contenedor principal con ancho completo */}
      <View className="w-full max-w-md mx-auto"> {/* Limita el ancho máximo pero se expande en pantallas pequeñas */}
        
        {/* Encabezado */}
        <View className="mb-10">
          <Text className="text-3xl font-bold text-blue-600 mb-2 text-center">Banco Riku</Text>
          <Text className="text-gray-500 text-center">Inicia sesión para continuar</Text>
        </View>

        {/* Formulario - Ocupa todo el ancho */}
        <View className="w-full mb-6">
          {/* Campo Email */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-1">Email</Text>
            <TextInput
              className="bg-white p-4 rounded-lg border border-gray-200 w-full"
              placeholder="Correo electrónico"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(value) => setForm({ ...form, email: value })}
            />
          </View>

          {/* Campo Contraseña */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-1">Contraseña</Text>
            <View className="relative">
              <TextInput
                className="bg-white p-4 rounded-lg border border-gray-200 w-full pr-12"
                secureTextEntry
                value={form.password}
                onChangeText={(value) => setForm({ ...form, password: value })}
              />
            </View>
          </View>
        </View>

        {/* Botón de Login - Ancho completo */}
        <TouchableOpacity
          className={`bg-blue-600 p-4 rounded-lg w-full ${isPosting ? 'opacity-70' : ''}`}
          onPress={onLogin}
          disabled={isPosting}
        >
          {isPosting ? (
            <Text className="text-white text-center">Cargando...</Text>
          ) : (
            <Text className="text-white text-center font-medium">Iniciar sesión</Text>
          )}
        </TouchableOpacity>
        {/* Enlaces - Centrados pero con ancho completo */}
        <View className="w-full mt-4">
          <TouchableOpacity className="w-full"
          onPress={onLogin}
          disabled={isPosting}>
            <Text className="text-blue-500 text-center">¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
          <View className="w-full mt-2 justify-center">
            <Link 
              href="/auth/register">
              <Text className="text-blue-600 text-center">¿No tienes cuenta? ¡Regístrate!</Text>
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
}

export default LoginScreen;