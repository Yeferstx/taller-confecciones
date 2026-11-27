import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { Pedido } from '../../models/pedido';
import { PedidosService } from '../../services/pedidos.service';
import { MiniaturaPrenda } from '../../shared/componentes/miniatura-prenda';
import { nombreEstadoDiseno } from '../../shared/constantes';
import { FechaPipe } from '../../shared/pipes';
import { imagenPrenda } from '../../shared/prendas';

// inicio de la diseñadora: estados de diseño, cambios por revisar y pedidos asignados (sin dinero)
@Component({
  selector: 'app-inicio-disenador',
  imports: [RouterLink, LucideDynamicIcon, MiniaturaPrenda, FechaPipe],
  template: `
    <section class="relative z-10 -mt-12 mb-6 grid grid-cols-3 gap-2.5 sm:gap-3 lg:mt-0 lg:gap-4" aria-label="Estado de los diseños">
      <a routerLink="/disenos" class="tarjeta-resumen animar-entrada">
        <span class="icono-caja size-10 rounded-full bg-alerta-suave text-amber-600 lg:size-12"><svg lucideIcon="clock" class="size-5 lg:size-6"></svg></span>
        <span class="flex flex-col items-center gap-1 lg:items-start">
          <span class="numero-resumen">{{ contar('pendiente') }}</span>
          <span class="text-xs font-medium text-gris sm:text-sm">Pendientes</span>
        </span>
      </a>
      <a routerLink="/disenos" class="tarjeta-resumen animar-entrada">
        <span class="icono-caja size-10 rounded-full bg-rojo-suave text-rojo-avatar lg:size-12"><svg lucideIcon="pen-tool" class="size-5 lg:size-6"></svg></span>
        <span class="flex flex-col items-center gap-1 lg:items-start">
          <span class="numero-resumen">{{ contar('en_proceso') }}</span>
          <span class="text-xs font-medium text-gris sm:text-sm">En proceso</span>
        </span>
      </a>
      <a routerLink="/disenos" class="tarjeta-resumen animar-entrada">
        <span class="icono-caja size-10 rounded-full bg-exito-suave text-exito lg:size-12"><svg lucideIcon="circle-check" class="size-5 lg:size-6"></svg></span>
        <span class="flex flex-col items-center gap-1 lg:items-start">
          <span class="numero-resumen">{{ contar('terminado') }}</span>
          <span class="text-xs font-medium text-gris sm:text-sm">Terminados</span>
        </span>
      </a>
    </section>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
      <section>
        <h2 class="titulo-seccion mb-2.5">Cambios por revisar</h2>
        @if (porRevisar().length > 0) {
          <div class="flex flex-col gap-2.5">
            @for (p of porRevisar(); track p.id) {
              <a [routerLink]="'/disenos/' + p.id" class="tarjeta flex items-center gap-3 ring-1 ring-amber-300 transition-shadow hover:shadow-elevated">
                <span class="icono-caja size-11 bg-alerta-suave text-amber-600"><svg lucideIcon="triangle-alert" class="size-5"></svg></span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate font-bold text-texto">{{ p.equipo }}</span>
                  <span class="block truncate text-[13px] font-normal text-gris">{{ ultimoCambio(p) }}</span>
                </span>
                <svg lucideIcon="chevron-right" class="size-5 text-gray-400"></svg>
              </a>
            }
          </div>
        } @else {
          <div class="tarjeta flex items-center gap-3">
            <span class="icono-caja size-11 bg-exito-suave text-exito"><svg lucideIcon="circle-check" class="size-5"></svg></span>
            <p class="text-[15px] text-gris">No hay cambios de tallas, nombres ni números por revisar.</p>
          </div>
        }
      </section>

      <section>
        <div class="mb-2.5 flex items-center justify-between">
          <h2 class="titulo-seccion mb-0">Pedidos asignados</h2>
          <a routerLink="/disenos" class="flex min-h-11 items-center text-sm font-semibold text-rojo">Ver diseños</a>
        </div>
        <div class="tarjeta divide-y divide-borde overflow-hidden p-0">
          @for (p of asignados(); track p.id) {
            <a [routerLink]="'/disenos/' + p.id" class="flex min-h-[76px] items-center gap-3 px-4 py-3 transition-colors hover:bg-gris-claro">
              <app-miniatura-prenda [imagen]="imagen(p)" [texto]="p.tipoPrenda" tamano="size-14" />
              <span class="min-w-0 flex-1">
                <span class="block truncate text-[15px] font-semibold text-texto">{{ p.equipo }}</span>
                <span class="block truncate text-[13px] font-normal text-gris">
                  {{ p.numero }} · {{ p.cantidad }} {{ p.tipoPrenda.toLowerCase() }}@if (p.personalizado) { · {{ p.jugadores.length }} jugadores }
                </span>
              </span>
              <span class="shrink-0 text-right">
                <span class="chip" [class]="{ 'bg-alerta-suave text-amber-700': p.estadoDiseno == 'pendiente', 'bg-rojo-suave text-rojo-avatar': !(p.estadoDiseno == 'pendiente') }">{{ textoEstado(p) }}</span>
                <span class="mt-1 block text-xs text-gris">{{ p.fechaEntrega | fecha: 'entrega' }}</span>
              </span>
            </a>
          } @empty {
            <p class="px-4 py-6 text-center text-[15px] text-gris">No tienes diseños pendientes.</p>
          }
        </div>
      </section>
    </div>
  `
})
export class InicioDisenador {
  private pedidos = inject(PedidosService);

  porRevisar = computed(() => this.pedidos.activos().filter(p => p.disenoRevisar));

  asignados = computed(() => this.pedidos.activos().filter(p => p.estadoDiseno != 'terminado'));

  contar(estado: string): number {
    return this.pedidos.activos().filter(p => p.estadoDiseno == estado).length;
  }

  imagen(p: Pedido): string {
    return imagenPrenda(p);
  }

  textoEstado(p: Pedido): string {
    return nombreEstadoDiseno(p.estadoDiseno);
  }

  ultimoCambio(p: Pedido): string {
    if (p.historial.length == 0) {
      return 'Se modificaron datos de jugadores';
    }
    return p.historial[p.historial.length - 1].texto;
  }
}
