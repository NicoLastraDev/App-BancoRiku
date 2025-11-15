import bancoApi from "../api/BancoApi";
import { PushNotificationService } from "./pushNotifications";


// Interface para Tarjeta
export interface Tarjeta {
  id: number;
  numero_tarjeta: string;
  fecha_vencimiento: string;
  cvv: string;
  nombre_titular: string;
  tipo_tarjeta: 'DEBITO' | 'CREDITO';
  marca_tarjeta: 'VISA' | 'MASTERCARD' | 'AMEX';
  saldo_actual: number;
  created_at: string;
}

export class TransferenciaNotifications {
  // Notificar al remitente
  static async notificarRemitente(
    usuarioId: number, 
    monto: number, 
    cuentaDestino: string
  ) {
    try {
      // Obtener nombre del destinatario
      let nombreDestinatario = await this.obtenerNombreDestinatario(cuentaDestino);
      
      const destinatarioDisplay = nombreDestinatario || `cuenta ${cuentaDestino}`;
      const title = '✅ Transferencia Exitosa';
      const body = `Enviaste $${monto} a ${destinatarioDisplay}`;
      
      console.log('📱 Notificando remitente:', body);
      
      // Notificación local
      await PushNotificationService.scheduleLocalNotification(title, body, {
        type: 'transferencia_exitosa',
        monto,
        cuentaDestino,
        nombreDestinatario
      });
    } catch (error) {
      console.log('❌ Error notificando remitente:', error);
      // Notificación de respaldo
      await PushNotificationService.scheduleLocalNotification(
        '✅ Transferencia Exitosa',
        `Enviaste $${monto} a cuenta ${cuentaDestino}`,
        { type: 'transferencia_exitosa', monto, cuentaDestino }
      );
    }
  }

  // Notificar al destinatario
  static async notificarDestinatario(
    usuarioDestinoId: number,
    monto: number,
    cuentaRemitente: string,
    nombreRemitente: string
  ) {
    try {
      const title = '💰 Transferencia Recibida';
      const body = `Recibiste $${monto} de ${nombreRemitente}`;
      
      console.log('📱 Notificando destinatario:', body);
      
      // Notificación local
      await PushNotificationService.scheduleLocalNotification(title, body, {
        type: 'transferencia_recibida', 
        monto, 
        cuentaRemitente,
        nombreRemitente 
      });

    } catch (error) {
      console.log('❌ Error notificando destinatario:', error);
    }
  }

  // Notificar error en transferencia
  static async notificarError(
    usuarioId: number,
    error: string
  ) {
    const title = '❌ Error en Transferencia';
    const body = error;
    
    await PushNotificationService.scheduleLocalNotification(title, body, {
      type: 'transferencia_error'
    });
  }

  // Obtener nombre del destinatario
  static async obtenerNombreDestinatario(cuentaDestino: string): Promise<string | null> {
    try {
      console.log('🔍 Obteniendo nombre del destinatario para cuenta:', cuentaDestino);
      
      const response = await bancoApi.get(`/cuenta/${cuentaDestino}/usuario`);
      
      if (response.data.success && response.data.data) {
        const nombre = response.data.data.nombre;
        console.log('✅ Nombre del destinatario obtenido:', nombre);
        return nombre;
      }
      
      return null;
    } catch (error) {
      console.log('❌ Error obteniendo nombre del destinatario:', error);
      return null;
    }
  }

  // Obtener información completa de la cuenta destino
  static async obtenerInfoCuentaDestino(cuentaDestino: string): Promise<any> {
    try {
      console.log('🔍 Obteniendo información completa de cuenta:', cuentaDestino);
      
      const response = await bancoApi.get(`/cuenta/${cuentaDestino}/info`);
      
      if (response.data.success && response.data.data) {
        console.log('✅ Información de cuenta obtenida:', response.data.data);
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.log('❌ Error obteniendo información de cuenta:', error);
      return null;
    }
  }
}