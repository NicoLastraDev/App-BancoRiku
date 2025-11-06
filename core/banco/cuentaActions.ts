import { Cuenta } from '../banco/interfaces/cuentas';

export const obtenerCuenta = async (token: string): Promise<Cuenta | null> => {
  try {
    const response = await fetch('http://tu-backend.com/api/cuenta', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener cuenta');
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error en obtenerCuenta:', error);
    return null;
  }
};