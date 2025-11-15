import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { Link, router } from 'expo-router';
import { Check, Eye, EyeOff, X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Alert, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

const RegisterScreen = () => {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false)
  const navigationAttempted = useRef(false);

  const { register } = useAuthStore()

  // Función para mostrar alerts compatibles con web
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.alert) {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    return regex.test(password);
  }

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  // Verificar si las contraseñas coinciden
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const passwordsDontMatch = password !== confirmPassword && confirmPassword.length > 0;

  // Verificar fortaleza de contraseña
  const passwordStrength = {
    hasMinLength: password.length >= 6,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    isValid: validatePassword(password)
  };

  const handleSuccessfulRegistration = () => {
    if (navigationAttempted.current) {
      console.log('⚠️ Navegación ya intentada, evitando duplicado');
      return;
    }
    
    navigationAttempted.current = true;
    
    console.log('✅ Registro exitoso, navegando a home...');
    router.replace('/(banco-app)/(home)');
  }

  const onRegister = async () => {
    // Reset flag al iniciar nuevo intento
    navigationAttempted.current = false;

    // Validaciones
    if (!nombre || !email || !password || !confirmPassword) {
      showAlert('Error', 'Todos los campos son obligatorios')
      return
    }

    if (!validateEmail(email)) {
      showAlert('Error', 'Correo electrónico no válido')
      return
    }

    if (!validatePassword(password)) {
      showAlert('Error', 'La contraseña debe tener al menos 6 caracteres, una letra mayúscula, una minúscula y un número');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true)

    try {
      console.log('🔄 Iniciando proceso de registro...');
      const wasSuccessful = await register(nombre, email, password)

      if (wasSuccessful) {
        console.log('✅ Registro exitoso en store');
        // Navegación inmediata sin delays
        handleSuccessfulRegistration();
        return;
      }

      console.log('❌ Registro falló en store');
      showAlert('Error', 'No se pudo registrar. El usuario puede que ya exista.');
      
    } catch (error: any) {
      console.error('💥 Error en registro:', error);
      
      // Manejo específico de errores
      if (error.message === 'CREDENCIALES_INCORRECTAS' || error.message === 'USER_ALREADY_EXISTS') {
        showAlert('Error', 'El correo electrónico ya está registrado.');
      } else if (error.message.includes('Network') || error.message.includes('CONEXION')) {
        showAlert('Error de conexión', 'No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      } else {
        showAlert('Error', error.message || 'No se pudo completar el registro');
      }
    } finally {
      setLoading(false);
    }
  }

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <View className="flex-row items-center mb-1">
      {met ? (
        <Check size={14} color="#10B981" />
      ) : (
        <X size={14} color="#EF4444" />
      )}
      <Text className={`text-xs ml-2 ${met ? 'text-green-600' : 'text-red-600'}`}>
        {text}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 justify-center items-center">
      <View className="w-full max-w-md px-6">
        
        <View className="mb-10 items-center">
          <Text className="text-3xl font-bold text-blue-600 mb-2">Banco Riku</Text>
          <Text className="text-gray-500">Registrate para continuar</Text>
        </View>

        <View className="w-full">

          {/* Campo Nombre */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-1">Nombre Completo</Text>
            <TextInput
              className="bg-white p-4 rounded-lg border border-gray-200 w-full"
              placeholder="Cesar Esteban Lastra Vargas"
              autoCapitalize="words"
              value={nombre}
              onChangeText={setNombre}
              editable={!loading}
            />
          </View>
          
          {/* Campo Email */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-1">Email</Text>
            <TextInput
              className="bg-white p-4 rounded-lg border border-gray-200 w-full"
              placeholder="usuario@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
          </View>

          {/* Campo Contraseña */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-1">Contraseña</Text>
            <View className="relative">
              <TextInput
                className="bg-white p-4 rounded-lg border border-gray-200 w-full pr-12"
                placeholder='******'
                secureTextEntry={!showPassword}
                autoCapitalize='none'
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
              <TouchableOpacity 
                className="absolute right-3 top-3"
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>
            
            {/* Indicadores de fortaleza de contraseña */}
            {password.length > 0 && (
              <View className="mt-2 p-3 bg-gray-50 rounded-lg">
                <Text className="text-sm font-medium text-gray-700 mb-2">Requisitos de contraseña:</Text>
                <PasswordRequirement 
                  met={passwordStrength.hasMinLength} 
                  text="Mínimo 6 caracteres" 
                />
                <PasswordRequirement 
                  met={passwordStrength.hasUpperCase} 
                  text="Al menos una mayúscula" 
                />
                <PasswordRequirement 
                  met={passwordStrength.hasLowerCase} 
                  text="Al menos una minúscula" 
                />
                <PasswordRequirement 
                  met={passwordStrength.hasNumber} 
                  text="Al menos un número" 
                />
              </View>
            )}
          </View>

          {/* Campo Confirmar Contraseña */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-1">Repita la contraseña</Text>
            <View className="relative">
              <TextInput
                className={`bg-white p-4 rounded-lg border w-full pr-12 ${
                  passwordsDontMatch ? 'border-red-500 bg-red-50' : 
                  passwordsMatch ? 'border-green-500 bg-green-50' : 
                  'border-gray-200'
                }`}
                placeholder='******'
                secureTextEntry={!showConfirmPassword}
                autoCapitalize='none'
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading}
                onSubmitEditing={onRegister}
              />
              <TouchableOpacity 
                className="absolute right-3 top-3"
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
              
              {/* Icono de verificación */}
              {confirmPassword.length > 0 && (
                <View className="absolute right-12 top-3">
                  {passwordsMatch ? (
                    <Check size={20} color="#10B981" />
                  ) : (
                    <X size={20} color="#EF4444" />
                  )}
                </View>
              )}
            </View>
            
            {/* Mensaje de confirmación */}
            {confirmPassword.length > 0 && (
              <Text className={`text-xs mt-1 ${
                passwordsMatch ? 'text-green-600' : 'text-red-600'
              }`}>
                {passwordsMatch ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
              </Text>
            )}
          </View>

          {/* Botón de Registro */}
          <TouchableOpacity 
            className={`bg-blue-600 p-4 rounded-lg mt-6 w-full mb-4 items-center justify-center ${
              loading ? 'opacity-70' : ''
            }`}
            onPress={onRegister}
            disabled={loading || !passwordStrength.isValid || !passwordsMatch}
          >
            <Text className="text-white font-medium">
              {loading ? 'Creando cuenta...' : 'Registrar'}
            </Text>
          </TouchableOpacity>

          {/* Enlace a Login */}
          <Link href="/auth/login" asChild>
            <TouchableOpacity disabled={loading}>
              <Text className={`text-blue-600 text-center ${
                loading ? 'opacity-50' : ''
              }`}>
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