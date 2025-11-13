// components/Toast.tsx
import {
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle,
  Info,
  X,
  XCircle
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'transfer';

export interface ToastProps {
  visible: boolean;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onHide: () => void;
  monto?: number;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  type,
  title,
  message,
  duration = 4000,
  onHide,
  monto
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Animación de entrada
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-ocultar después de la duración
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'error':
        return 'bg-red-50 border-l-4 border-red-500';
      case 'warning':
        return 'bg-yellow-50 border-l-4 border-yellow-500';
      case 'info':
        return 'bg-blue-50 border-l-4 border-blue-500';
      case 'transfer':
        return 'bg-purple-50 border-l-4 border-purple-500';
      default:
        return 'bg-gray-50 border-l-4 border-gray-500';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} color="#10B981" />;
      case 'error':
        return <XCircle size={24} color="#EF4444" />;
      case 'warning':
        return <AlertTriangle size={24} color="#F59E0B" />;
      case 'info':
        return <Info size={24} color="#3B82F6" />;
      case 'transfer':
        return <ArrowRightLeft size={24} color="#8B5CF6" />;
      default:
        return <Info size={24} color="#6B7280" />;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      case 'transfer':
        return 'text-purple-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <Animated.View 
      style={{ opacity: fadeAnim }}
      className="absolute top-16 left-4 right-4 z-50"
    >
      <View className={`${getToastStyle()} rounded-lg shadow-lg`}>
        <View className="flex-row items-start p-4">
          <View className="mr-3 mt-0.5">
            {getIcon()}
          </View>
          <View className="flex-1">
            <Text className={`${getTextColor()} font-bold text-base`}>
              {title}
            </Text>
            {message && (
              <Text className={`${getTextColor()} text-sm mt-1 opacity-80`}>
                {message}
              </Text>
            )}
            {monto && (
              <Text className="text-purple-700 font-semibold text-lg mt-2">
                ${monto.toLocaleString()}
              </Text>
            )}
          </View>
          <TouchableOpacity 
            onPress={hideToast}
            className="ml-2 p-1"
          >
            <X size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};