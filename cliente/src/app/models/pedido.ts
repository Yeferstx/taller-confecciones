// procesos que puede tener una prenda
export type Proceso = 'corte' | 'impresion' | 'sublimacion' | 'costura';

export type EstadoPedido = 'pendiente' | 'en_produccion' | 'terminado' | 'entregado' | 'cancelado';

export type EstadoDiseno = 'pendiente' | 'en_proceso' | 'terminado';

export interface Jugador {
  id: number;
  nombre: string;
  numero: string;
  talla: string;
}

// cada cambio que se hace a los jugadores queda guardado
export interface CambioJugador {
  fecha: string;
  texto: string;
}

// entrega completa o parcial de un pedido
export interface Entrega {
  id: number;
  fecha: string;
  cantidad: number;
  empleadoId: number;
  nombre: string;
  nota: string;
}

// trabajador al que el administrador le asigno un proceso del pedido
export interface Asignacion {
  proceso: Proceso;
  empleadoId: number;
}

export interface Pedido {
  id: number;
  numero: string;
  clienteId: number;
  cliente: string;
  telefono: string;
  equipo: string;
  tipoPrenda: string;
  cantidad: number;
  fechaRegistro: string;
  fechaEntrega: string;
  precioTotal: number;
  anticipo: number;
  abonos: number;
  imagen: string;
  observaciones: string;
  procesos: Proceso[];
  estado: EstadoPedido;
  personalizado: boolean;
  jugadores: Jugador[];
  historial: CambioJugador[];
  estadoDiseno: EstadoDiseno;
  disenoRevisar: boolean;
  entregadas: number;
  entregas: Entrega[];
  asignaciones: Asignacion[];
}
