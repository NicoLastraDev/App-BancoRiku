import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { Link, router } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

const RegisterScreen = () => {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false)
  const navigationAttempted = useRef(false); // 🔒 Previene múltiples navegaciones

  const { register } = useAuthStore()

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    return regex.test(password);
  }

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleSuccessfulRegistration = () => {
    if (navigationAttempted.current) {
      console.log('⚠️ Navegación ya intentada, evitando duplicado');
      return;
    }
    
    navigationAttempted.current = true;
    
    console.log('✅ Registro exitoso, preparando navegación...');
    
    // Estrategia multi-capas para navegación robusta
    if (Platform.OS === 'web') {
      // ✅ Estrategia para Web
      const navigateToHome = () => {
        console.log('🌐 Navegando en web...');
        router.replace('/(banco-app)/(home)');
      };
      
      // Intentar navegación inmediata
      navigateToHome();
      
      // Backup: intentar nuevamente después de un delay
      setTimeout(navigateToHome, 100);
      
    } else {
      // ✅ Estrategia para Mobile
      Alert.alert('Éxito', 'Cuenta creada correctamente', [
        { 
          text: 'OK', 
          onPress: () => {
            console.log('📱 Navegando en mobile...');
            router.replace('/(banco-app)/(home)');
          }
        }
      ]);
    }
  }

  const onRegister = async () => {
    // Reset flag al iniciar nuevo intento
    navigationAttempted.current = false;

    // Validaciones
    if (!nombre || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Todos los campos son obligatorios')
      return
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Correo electrónico no válido')
      return
    }

    if (!validatePassword(password)) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres, una letra mayúscula, una minúscula y un número');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true)

    try {
      console.log('🔄 Iniciando proceso de registro...');
      const wasSuccessful = await register(nombre, email, password)

      if (wasSuccessful) {
        console.log('✅ Registro exitoso en store');
        
        // Pequeño delay para asegurar que el estado de auth se actualice completamente
        setTimeout(() => {
          handleSuccessfulRegistration();
        }, 50);
        
        return;
      }

      console.log('❌ Registro falló en store');
      Alert.alert('Error', 'No se pudo registrar. El usuario puede que ya exista.');
      
    } catch (error: any) {
      console.error('💥 Error en registro:', error);
      Alert.alert('Error', error.message || 'No se pudo registrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-gray-50 justify-center items-center">
      <View className="w-full max-w-md px-6">
        
        <View className="mb-10 items-center">
          <Text className="text-3xl font-bold text-blue-600 mb-2">Banco Riku</Text>
          <Text className="text-gray-500">Registrate para continuar</Text>
        </View>

        <View className="w-full">

          <View className="mb-4">
            <Text className="text-gray-700 mb-1">Nombre Completo</Text>
            <TextInput
              className="bg-white p-4 rounded-lg border border-gray-200 w-full"
              placeholder="Cesar Esteban Lastra Vargas"
              autoCapitalize="words"
              value={nombre}
              onChangeText={setNombre}
            />
          </View>
          
          <View className="mb-4">
            <Text className="text-gray-700 mb-1">Email</Text>
            <TextInput
              className="bg-white p-4 rounded-lg border border-gray-200 w-full"
              placeholder="usuario@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 mb-1">Contraseña</Text>
            <TextInput
              className="bg-white p-4 rounded-lg border border-gray-200 w-full"
              placeholder='******'
              secureTextEntry={true}
              autoCapitalize='none'
              value={password}
              onChangeText={setPassword}
            />
            <Text className="text-xs text-gray-500 mt-1">
              Mínimo 6 caracteres, con al menos una mayúscula, una minúscula y un número
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 mb-1">Repita la contraseña</Text>
            <TextInput
              className="bg-white p-4 rounded-lg border border-gray-200 w-full"
              placeholder='******'
              secureTextEntry={true}
              autoCapitalize='none'
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <TouchableOpacity 
            className="bg-blue-600 p-4 rounded-lg mt-6 w-full mb-4 items-center justify-center"
            onPress={onRegister}
            disabled={loading}
          >
            <Text className="text-white font-medium">
              {loading ? 'Registrando...' : 'Registrar'}
            </Text>
          </TouchableOpacity>

          <Link href="/auth/login" asChild>
            <TouchableOpacity>
              <Text className="text-blue-600 text-center">
                ¿Ya tienes cuenta? ¡Inicia sesión!
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  )
}

export default RegisterScreen;