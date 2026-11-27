import { EstadoDiseno, EstadoPedido, Proceso } from '../models/pedido';

export const PROCESOS: Proceso[] = ['corte', 'impresion', 'sublimacion', 'costura'];

export const TALLAS_PRINCIPALES = ['S', 'M', 'L', 'XL'];
export const OTRAS_TALLAS = ['XS', 'XXL', '3XL', '4', '6', '8', '10', '12', '14', '16'];

// orden para mostrar el resumen de tallas
export const ORDEN_TALLAS = ['4', '6', '8', '10', '12', '14', '16', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

export function nombreProceso(proceso: string): string {
  if (proceso == 'corte') {
    return 'Corte';
  }
  if (proceso == 'impresion') {
    return 'Impresión';
  }
  if (proceso == 'sublimacion') {
    return 'Sublimación';
  }
  if (proceso == 'costura') {
    return 'Costura';
  }
  return proceso;
}

export function nombreEstado(estado: EstadoPedido): string {
  if (estado == 'pendiente') {
    return 'Pendiente';
  }
  if (estado == 'en_produccion') {
    return 'En producción';
  }
  if (estado == 'terminado') {
    return 'Listo para entregar';
  }
  if (estado == 'entregado') {
    return 'Entregado';
  }
  return 'Cancelado';
}

export function nombreEstadoDiseno(estado: EstadoDiseno): string {
  if (estado == 'pendiente') {
    return 'Pendiente';
  }
  if (estado == 'en_proceso') {
    return 'En proceso';
  }
  return 'Terminado';
}

// busca el siguiente id de una lista
export function nuevoId(lista: { id: number }[]): number {
  let mayor = 0;
  for (const item of lista) {
    if (item.id > mayor) {
      mayor = item.id;
    }
  }
  return mayor + 1;
}

// quita tildes y pasa a minuscula para buscar
export function normalizar(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
