import { Pipe, PipeTransform } from '@angular/core';
import { fechaCorta, horaCorta, textoEntrega } from './fechas';
import { nombreProceso } from './constantes';

const formatoPesos = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
});

// muestra un valor en pesos colombianos: $ 30.000
@Pipe({ name: 'pesos' })
export class PesosPipe implements PipeTransform {
  transform(valor: number): string {
    return formatoPesos.format(valor || 0);
  }
}

@Pipe({ name: 'fecha' })
export class FechaPipe implements PipeTransform {
  transform(valor: string, modo: string = 'corta'): string {
    if (!valor) {
      return '';
    }
    if (modo == 'hora') {
      return horaCorta(valor);
    }
    if (modo == 'completa') {
      return fechaCorta(valor) + ', ' + horaCorta(valor);
    }
    if (modo == 'entrega') {
      return textoEntrega(valor);
    }
    return fechaCorta(valor);
  }
}

@Pipe({ name: 'proceso' })
export class ProcesoPipe implements PipeTransform {
  transform(valor: string): string {
    return nombreProceso(valor);
  }
}
