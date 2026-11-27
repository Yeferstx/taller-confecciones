export interface Pago {
  id: number;
  empleadoId: number;
  empleadoNombre: string;
  fecha: string;
  valor: number;
  tipo: 'completo' | 'parcial';
  registros: number[];
  nota: string;
}
