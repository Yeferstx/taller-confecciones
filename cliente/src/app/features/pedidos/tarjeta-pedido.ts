import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Pedido } from '../../models/pedido';
import { BarraProgreso } from '../../shared/componentes/barra-progreso';
import { EstadoPedidoChip } from '../../shared/componentes/estado-pedido';
import { diasHasta } from '../../shared/fechas';
import { FechaPipe } from '../../shared/pipes';
import { ProduccionService } from '../../services/produccion.service';
import { MiniaturaPrenda } from '../../shared/componentes/miniatura-prenda';
import { imagenPrenda } from '../../shared/prendas';

// tarjeta sencilla de un pedido: equipo, avance y fecha de entrega
@Component({
  selector: 'app-tarjeta-pedido',
  imports: [RouterLink, BarraProgreso, EstadoPedidoChip, FechaPipe, MiniaturaPrenda],
  template: `
    <a [routerLink]="enlace()" class="tarjeta block transition-shadow hover:shadow-elevated active:bg-gris-claro">
      <div class="flex gap-3">
        <app-miniatura-prenda [imagen]="imagen()" [texto]="pedido().tipoPrenda" tamano="size-[72px]" />
        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-2">
            <p class="text-xs font-bold tracking-wide text-gris">{{ pedido().numero }}</p>
            <app-estado-pedido [estado]="pedido().estado" [atrasado]="atrasado()" />
          </div>
          <p class="truncate text-base font-bold text-texto">{{ pedido().equipo }}</p>
          <p class="truncate text-sm text-gris">{{ pedido().cantidad }} · {{ pedido().tipoPrenda }}</p>
        </div>
      </div>
      @if (pedido().estado != 'cancelado' && pedido().estado != 'entregado') {
        <div class="mt-3 flex items-center gap-3">
          <div class="flex-1"><app-barra-progreso [valor]="porcentaje()" [total]="100" /></div>
          <span class="w-10 text-right text-sm font-bold text-texto">{{ porcentaje() }}%</span>
        </div>
      }
      <p class="mt-2 text-sm" [class]="{ 'font-semibold text-error': atrasado(), 'text-gris': !(atrasado()) }">
        Entrega: {{ pedido().fechaEntrega | fecha: 'entrega' }}
      </p>
    </a>
  `
})
export class TarjetaPedido {
  private produccion = inject(ProduccionService);

  pedido = input.required<Pedido>();
  enlace = input('');

  porcentaje = computed(() => this.produccion.porcentaje(this.pedido()));
  imagen = computed(() => imagenPrenda(this.pedido()));

  atrasado = computed(() => {
    const p = this.pedido();
    if (p.estado == 'entregado' || p.estado == 'cancelado') {
      return false;
    }
    return diasHasta(p.fechaEntrega) < 0;
  });
}
