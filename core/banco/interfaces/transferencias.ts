// interfaces/transferencias.ts

export interface Transferencia {
  id: number;
  fecha: string;
  tipo_transaccion: 'TRANSFERENCIA_ENVIADA' | 'TRANSFERENCIA_RECIBIDA';
  monto: number;
  descripcion?: string;
  cuenta_destino?: string;
  numero_cuenta?: string;
  nombre_destinatario?: string; // Nuevo campo
  nombre_remitente?: string;    // Nuevo campo
  created_at?: string;
}

export interface CreateTransferenciaData {
  fromAccountId: number;
  toAccountNumber: string;
  amount: number;
  description?: string;
}

export interface Cuenta {
  id: number;
  numero_cuenta: string;
  saldo: number;
  tipo_cuenta: string;
  usuario_id: number;
  accountName?: string;
}