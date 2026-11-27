import { Component, computed, input } from '@angular/core';
import { EstadoPedido } from '../../models/pedido';
import { nombreEstado } from '../constantes';

@Component({
  selector: 'app-estado-pedido',
  template: `<span class="chip" [class]="clases()">{{ texto() }}</span>`
})
export class EstadoPedidoChip {
  estado = input<EstadoPedido>('pendiente');
  atrasado = input(false);

  texto = computed(() => {
    if (this.atrasado()) {
      return 'Atrasado';
    }
    return nombreEstado(this.estado());
  });

  clases = computed(() => {
    if (this.atrasado()) {
      return 'bg-error-suave text-error';
    }
    const estado = this.estado();
    if (estado == 'en_produccion') {
      return 'bg-exito-suave text-exito';
    }
    if (estado == 'terminado') {
      return 'bg-negro text-white';
    }
    if (estado == 'entregado') {
      return 'bg-gris-claro text-gris ring-1 ring-borde';
    }
    if (estado == 'cancelado') {
      return 'bg-gris-claro text-gris line-through';
    }
    return 'bg-alerta-suave text-amber-700';
  });
}
