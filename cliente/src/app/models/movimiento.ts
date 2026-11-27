export interface Movimiento {
  id: number;
  fecha: string;
  tipo: 'ingreso' | 'gasto';
  concepto: string;
  valor: number;
}
