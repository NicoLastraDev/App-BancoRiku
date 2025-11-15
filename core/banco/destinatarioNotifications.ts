import { PushNotificationService } from './pushNotifications';

export class DestinatarioNotifications {
  // Notificar destinatario agregado
  static async notificarDestinatarioAgregado(
    nombreDestinatario: string,
    numeroCuenta: string,
    tokenPush?: string
  ) {
    const title = '👥 Destinatario Agregado';
    const body = `Agregaste a ${nombreDestinatario} (${numeroCuenta}) como destinatario`;
    
    await PushNotificationService.scheduleLocalNotification(title, body, {
      type: 'destinatario_agregado',
      nombreDestinatario,
      numeroCuenta
    });
    
    if (tokenPush) {
      await PushNotificationService.sendPushNotification(
        tokenPush,
        title,
        body,
        { type: 'destinatario_agregado', nombreDestinatario, numeroCuenta }
      );
    }
  }

  // Notificar error al agregar destinatario
  static async notificarErrorAgregarDestinatario(
    error: string,
    tokenPush?: string
  ) {
    const title = '❌ Error al Agregar Destinatario';
    const body = error;
    
    await PushNotificationService.scheduleLocalNotification(title, body, {
      type: 'destinatario_error'
    });
    
    if (tokenPush) {
      await PushNotificationService.sendPushNotification(
        tokenPush,
        title,
        body,
        { type: 'destinatario_error' }
      );
    }
  }
}