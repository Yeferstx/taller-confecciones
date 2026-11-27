import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { Trabajo } from '../../services/trabajos.service';
import { BarraProgreso } from '../../shared/componentes/barra-progreso';
import { MiniaturaPrenda } from '../../shared/componentes/miniatura-prenda';
import { FechaPipe } from '../../shared/pipes';

// un trabajo del operario: disponibles, pendientes y lo que ya se hizo del proceso
@Component({
  selector: 'app-tarjeta-trabajo',
  imports: [RouterLink, LucideDynamicIcon, BarraProgreso, MiniaturaPrenda, FechaPipe],
  template: `
    <a routerLink="/produccion/registrar" [queryParams]="{ pedido: trabajo().pedido.id, proceso: trabajo().proceso }"
      class="tarjeta animar-entrada block transition-shadow hover:shadow-elevated active:scale-[0.99]">
      <div class="flex items-center gap-3">
        <app-miniatura-prenda [imagen]="trabajo().imagen" [texto]="trabajo().pedido.tipoPrenda" tamano="size-14" />
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <p class="text-xs font-bold text-gris">{{ trabajo().pedido.numero }}</p>
            @if (trabajo().asignadoAMi) { <span class="chip bg-negro py-0.5 text-[11px] text-white">Asignado a ti</span> }
          </div>
          <p class="truncate font-bold text-texto">{{ trabajo().pedido.equipo }}</p>
          <p class="truncate text-[13px] font-normal text-gris">{{ trabajo().pedido.tipoPrenda }} · Entrega {{ trabajo().pedido.fechaEntrega | fecha: 'entrega' }}</p>
        </div>
        <div class="shrink-0 text-right">
          <p class="text-2xl leading-none font-bold tracking-[-0.03em]" [class]="{ 'text-texto': trabajo().disponibles > 0, 'text-gray-400': !(trabajo().disponibles > 0) }">{{ trabajo().disponibles }}</p>
          <p class="mt-1 text-xs font-medium text-gris">disponibles</p>
        </div>
      </div>
      <div class="mt-3 flex items-center gap-3">
        <div class="flex-1"><app-barra-progreso [valor]="trabajo().hechas" [total]="trabajo().pedido.cantidad" /></div>
        <span class="shrink-0 text-xs font-semibold text-gris">{{ trabajo().hechas }} de {{ trabajo().pedido.cantidad }} · faltan {{ trabajo().pendientes }}</span>
      </div>
      @if (trabajo().disponibles == 0) {
        <p class="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-700">
          <svg lucideIcon="clock" class="size-3.5"></svg> Esperando el proceso anterior
        </p>
      }
    </a>
  `
})
export class TarjetaTrabajo {
  trabajo = input.required<Trabajo>();
}
