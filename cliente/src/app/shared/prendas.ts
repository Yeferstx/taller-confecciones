import { Pedido, Proceso } from '../models/pedido';

// imagen de referencia del pedido, o una de ejemplo segun el tipo de prenda
export function imagenPrenda(pedido: Pedido): string {
  if (pedido.imagen) {
    return pedido.imagen;
  }
  return imagenPorTipo(pedido.tipoPrenda);
}

export function imagenPorTipo(tipoPrenda: string): string {
  if (tipoPrenda == 'Camiseta') {
    return 'ideal-sport/camiseta-negra-roja-frente.webp';
  }
  if (tipoPrenda == 'Uniforme completo') {
    return 'ideal-sport/uniforme-completo.webp';
  }
  if (tipoPrenda == 'Pantaloneta') {
    return 'ideal-sport/pantaloneta-negra.webp';
  }
  return '';
}

// icono de cada proceso
export function iconoProceso(proceso: Proceso | string): string {
  if (proceso == 'corte') {
    return 'scissors';
  }
  if (proceso == 'impresion') {
    return 'printer';
  }
  if (proceso == 'sublimacion') {
    return 'plancha-termica';
  }
  return 'maquina-coser';
}
