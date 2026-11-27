import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { Pedido } from '../../models/pedido';
import { ProduccionService } from '../../services/produccion.service';
import { MiniaturaPrenda } from '../../shared/componentes/miniatura-prenda';
import { FechaPipe } from '../../shared/pipes';
import { imagenPrenda } from '../../shared/prendas';

// pedido con prendas listas para empacar y entregar, con los datos del cliente
@Component({
  selector: 'app-tarjeta-entrega',
  imports: [RouterLink, LucideDynamicIcon, MiniaturaPrenda, FechaPipe],
  template: `
    <div class="tarjeta animar-entrada">
      <div class="flex items-center gap-3">
        <app-miniatura-prenda [imagen]="imagen()" [texto]="pedido().tipoPrenda" tamano="size-14" />
        <div class="min-w-0 flex-1">
          <p class="text-xs font-bold text-gris">{{ pedido().numero }} · Entrega {{ pedido().fechaEntrega | fecha: 'entrega' }}</p>
          <p class="truncate font-bold text-texto">{{ pedido().equipo }}</p>
          <p class="truncate text-[13px] font-normal text-gris">{{ pedido().cliente }}</p>
        </div>
        <div class="shrink-0 text-right">
          <p class="text-2xl leading-none font-bold tracking-[-0.03em] text-texto">{{ porEntregar() }}</p>
          <p class="mt-1 text-xs font-medium text-gris">por entregar</p>
        </div>
      </div>
      <p class="mt-2 text-[13px] text-gris">Entregadas {{ pedido().entregadas }} de {{ pedido().cantidad }} {{ pedido().tipoPrenda.toLowerCase() }}</p>
      <div class="mt-3 grid grid-cols-2 gap-2">
        @if (pedido().telefono) {
          <a [href]="'tel:' + pedido().telefono" class="btn btn-gris min-h-11 text-sm">
            <svg lucideIcon="phone" class="size-4"></svg> Llamar
          </a>
        } @else {
          <span></span>
        }
        <a routerLink="/entregas/registrar" [queryParams]="{ pedido: pedido().id }" class="btn btn-oscuro min-h-11 text-sm">
          <svg lucideIcon="package-check" class="size-4"></svg> Entregar
        </a>
      </div>
    </div>
  `
})
export class TarjetaEntrega {
  private produccion = inject(ProduccionService);

  pedido = input.required<Pedido>();

  imagen = computed(() => imagenPrenda(this.pedido()));
  porEntregar = computed(() => {
    this.produccion.registros();
    return this.produccion.porEntregar(this.pedido());
  });
}
