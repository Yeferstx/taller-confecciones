import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PedidosService } from '../../services/pedidos.service';
import { Encabezado } from '../../shared/componentes/encabezado';
import { Vacio } from '../../shared/componentes/vacio';
import { FechaPipe, PesosPipe } from '../../shared/pipes';

// lo que los clientes deben de sus pedidos
@Component({
  selector: 'app-saldos',
  imports: [RouterLink, Encabezado, Vacio, FechaPipe, PesosPipe],
  template: `
    <app-encabezado titulo="Anticipos y saldos" subtitulo="Lo que deben los clientes" />

    <div class="tarjeta mb-5 grid grid-cols-2 divide-x divide-borde p-0">
      <div class="p-4">
        <p class="text-xl font-bold text-exito">{{ totalRecibido() | pesos }}</p>
        <p class="text-sm text-gris">Recibido</p>
      </div>
      <div class="p-4">
        <p class="text-xl font-bold text-texto">{{ totalPendiente() | pesos }}</p>
        <p class="text-sm text-gris">Por cobrar</p>
      </div>
    </div>

    <div class="tarjeta divide-y divide-borde p-0">
      @for (p of conSaldo(); track p.id) {
        <a [routerLink]="'/pedidos/' + p.id" class="flex items-center gap-3 px-4 py-3 active:bg-slate-50">
          <div class="min-w-0 flex-1">
            <p class="truncate text-[15px] font-semibold text-texto">{{ p.equipo }}</p>
            <p class="text-sm text-gris">{{ p.numero }} · Entrega {{ p.fechaEntrega | fecha }}</p>
            <p class="text-sm text-gris">Pagó {{ p.anticipo + p.abonos | pesos }} de {{ p.precioTotal | pesos }}</p>
          </div>
          <p class="shrink-0 font-bold text-texto">{{ pedidos.saldo(p) | pesos }}</p>
        </a>
      } @empty {
        <app-vacio icono="hand-coins" mensaje="Ningún cliente tiene saldo pendiente." />
      }
    </div>
    <p class="mt-3 text-sm text-gris">Para registrar un abono, abre el pedido.</p>
  `
})
export class Saldos {
  pedidos = inject(PedidosService);

  conSaldo = computed(() => this.pedidos.lista().filter(p => p.estado != 'cancelado' && this.pedidos.saldo(p) > 0));

  totalPendiente = computed(() => {
    let suma = 0;
    for (const p of this.conSaldo()) {
      suma = suma + this.pedidos.saldo(p);
    }
    return suma;
  });

  totalRecibido = computed(() => {
    let suma = 0;
    for (const p of this.pedidos.lista()) {
      if (p.estado != 'cancelado') {
        suma = suma + p.anticipo + p.abonos;
      }
    }
    return suma;
  });
}
