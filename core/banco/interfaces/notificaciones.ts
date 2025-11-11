export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    type: 'transferencia' | 'login' | 'register' | 'destinatario';
    data?: any;
  };
}

export interface CreateNotificationData {
  type: AppNotification['type'];
  title: string;
  message: string;
  action?: AppNotification['action'];
}