import { Proceso } from './pedido';

// un registro es lo que hizo un trabajador en un proceso de un pedido
export interface RegistroProduccion {
  id: number;
  pedidoId: number;
  numeroPedido: string;
  tipoPrenda: string;
  proceso: Proceso;
  empleadoId: number;
  empleadoNombre: string;
  cantidad: number;
  danadas: number;
  fecha: string;
  // la tarifa se copia para que un cambio futuro no modifique pagos viejos
  tarifa: number;
  total: number;
  aprobado: boolean;
  autorizadoExceso: boolean;
  abonado: number;
}
