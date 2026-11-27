import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { Pedido } from '../../models/pedido';
import { ProduccionService } from '../../services/produccion.service';
import { MiniaturaPrenda } from '../../shared/componentes/miniatura-prenda';
import { diasHasta } from '../../shared/fechas';
import { FechaPipe } from '../../shared/pipes';
import { imagenPrenda } from '../../shared/prendas';

// fila compacta de un pedido con su foto, para listas cortas
@Component({
  selector: 'app-fila-pedido',
  imports: [RouterLink, LucideDynamicIcon, MiniaturaPrenda, FechaPipe],
  template: `
    <a [routerLink]="enlace()" class="flex min-h-[72px] items-center gap-3 px-4 py-3 transition-colors hover:bg-gris-claro active:bg-gris-claro">
      <app-miniatura-prenda [imagen]="imagen()" [texto]="pedido().tipoPrenda" tamano="size-12" />
      <div class="min-w-0 flex-1">
        <p class="truncate text-[15px] font-semibold text-texto">{{ pedido().equipo }}</p>
        <p class="truncate text-sm text-gris">{{ pedido().numero }} · {{ pedido().cantidad }} {{ pedido().tipoPrenda.toLowerCase() }}</p>
      </div>
      <div class="shrink-0 text-right">
        <p class="text-sm font-semibold" [class]="{ 'text-error': atrasado(), 'text-texto': !(atrasado()) }">{{ pedido().fechaEntrega | fecha: 'entrega' }}</p>
        <p class="text-xs text-gris">{{ porcentaje() }}% listo</p>
      </div>
      <svg lucideIcon="chevron-right" class="size-5 shrink-0 text-gray-400"></svg>
    </a>
  `
})
export class FilaPedido {
  private produccion = inject(ProduccionService);

  pedido = input.required<Pedido>();
  enlace = input('');

  imagen = computed(() => imagenPrenda(this.pedido()));
  porcentaje = computed(() => this.produccion.porcentaje(this.pedido()));
  atrasado = computed(() => diasHasta(this.pedido().fechaEntrega) < 0);
}
