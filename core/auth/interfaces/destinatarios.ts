export interface Destinatario {
  id: number,
  usuario_id: number,
  nombre: string,
  nombre_cuenta: string,
  numero_cuenta: string,
  tipo_cuenta: 'Ahorro' |'Corriente' | 'Vista',
  banco_destino: string,
}

export interface CreateDestinatarioData {
  nombre: string,
  nombre_cuenta: string,
  numero_cuenta: string,
  tipo_cuenta: 'Ahorro' |'Corriente' | 'Vista',
  banco_destino: string,
}