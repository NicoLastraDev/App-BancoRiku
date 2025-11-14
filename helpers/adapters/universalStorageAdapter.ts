import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from "react-native";
import { SecureStorageAdapter } from "./secure-storage-adapter";

class UniversalStorage {
  async setItem(key: string, value: string): Promise<void> {
    console.log(`💾 Guardando en ${Platform.OS}:`, key);
    
    if (Platform.OS === 'web') {
      // Para web usar AsyncStorage
      await AsyncStorage.setItem(key, value);
    } else {
      // Para móvil usar SecureStorage
      await SecureStorageAdapter.setItem(key, value);
    }
  }

  async getItem(key: string): Promise<string | null> {
    console.log(`💾 Leyendo de ${Platform.OS}:`, key);
    
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(key);
    } else {
      return await SecureStorageAdapter.getItem(key);
    }
  }

  async deleteItem(key: string): Promise<void> {
    console.log(`💾 Eliminando de ${Platform.OS}:`, key);
    
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
    } else {
      await SecureStorageAdapter.deleteItem(key);
    }
  }
}

export const universalStorage = new UniversalStorage();