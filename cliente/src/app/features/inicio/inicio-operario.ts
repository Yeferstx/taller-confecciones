import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { SesionService } from '../../core/sesion.service';
import { EntregasService } from '../../services/entregas.service';
import { ProduccionService } from '../../services/produccion.service';
import { TrabajosService } from '../../services/trabajos.service';
import { Icono } from '../../shared/componentes/icono';
import { SelectorEspecialidad } from '../../shared/componentes/selector-especialidad';
import { TarjetaTrabajo } from '../trabajos/tarjeta-trabajo';
import { TarjetaEntrega } from '../trabajos/tarjeta-entrega';

// inicio del operario: se arma segun la especialidad activa (corte, impresion, sublimacion, costura o entregas)
@Component({
  selector: 'app-inicio-operario',
  imports: [RouterLink, LucideDynamicIcon, Icono, SelectorEspecialidad, TarjetaTrabajo, TarjetaEntrega],
  template: `
    @if (variasEspecialidades()) {
      <div class="relative z-10 -mt-12 lg:mt-0">
        <app-selector-especialidad />
      </div>
    }

    @if (!sesion.especialidadActiva()) {
      <div class="tarjeta relative z-10 -mt-12 text-center lg:mt-0">
        <p class="text-[15px] text-gris">Todavía no tienes especialidades asignadas. Pídele al administrador que las configure.</p>
      </div>
    } @else {
      <section class="relative z-10 mb-6 grid grid-cols-3 gap-2.5 sm:gap-3 lg:gap-4" [class.-mt-12]="!variasEspecialidades()"
        [class.lg:mt-0]="!variasEspecialidades()" aria-label="Resumen de tu trabajo">
        <div class="tarjeta-resumen animar-entrada">
          <span class="icono-caja size-10 rounded-full bg-rojo-suave text-rojo lg:size-12">
            <app-icono [nombre]="oficio().icono" clase="size-5 lg:size-6" />
          </span>
          <span class="flex flex-col items-center gap-1 lg:items-start">
            <span class="numero-resumen">{{ disponibles() }}</span>
            <span class="text-xs font-medium text-gris sm:text-sm">{{ oficio().textoDisponibles }}</span>
          </span>
        </div>
        <div class="tarjeta-resumen animar-entrada">
          <span class="icono-caja size-10 rounded-full bg-alerta-suave text-amber-600 lg:size-12"><svg lucideIcon="clock" class="size-5 lg:size-6"></svg></span>
          <span class="flex flex-col items-center gap-1 lg:items-start">
            <span class="numero-resumen">{{ pendientes() }}</span>
            <span class="text-xs font-medium text-gris sm:text-sm">{{ textoPendientes() }}</span>
          </span>
        </div>
        <div class="tarjeta-resumen animar-entrada">
          <span class="icono-caja size-10 rounded-full bg-exito-suave text-exito lg:size-12"><svg lucideIcon="circle-check" class="size-5 lg:size-6"></svg></span>
          <span class="flex flex-col items-center gap-1 lg:items-start">
            <span class="numero-resumen">{{ hechas() }}</span>
            <span class="text-xs font-medium text-gris sm:text-sm">{{ oficio().textoHechas }}</span>
          </span>
        </div>
      </section>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
        <div class="flex flex-col gap-4">
          <a [routerLink]="enlaceAccion()" class="btn btn-primario min-h-[62px] justify-start px-5 text-base">
            <app-icono [nombre]="oficio().icono" clase="size-6" />
            <span class="flex-1">{{ oficio().accion }}</span>
            <svg lucideIcon="chevron-right" class="size-5"></svg>
          </a>
          @if (!esEntregas() && trabajos.asignados().length > 0) {
            <div class="flex items-center gap-3 rounded-tarjeta bg-negro p-4 text-white shadow-card">
              <span class="icono-caja size-10 bg-white/10"><svg lucideIcon="clipboard-check" class="size-5"></svg></span>
              <p class="text-[15px]">Tienes <b>{{ trabajos.asignados().length }}</b> trabajo(s) asignado(s) por el administrador.</p>
            </div>
          }
        </div>

        <section>
          <div class="mb-2.5 flex items-center justify-between">
            <h2 class="titulo-seccion mb-0">
              @if (esEntregas()) { Listos para entregar } @else { Trabajos disponibles }
            </h2>
            <a routerLink="/mis-trabajos" class="flex min-h-11 items-center text-sm font-semibold text-rojo">Ver todos</a>
          </div>
          <div class="flex flex-col gap-3">
            @if (esEntregas()) {
              @for (p of entregas.listos().slice(0, 4); track p.id) {
                <app-tarjeta-entrega [pedido]="p" />
              } @empty {
                <p class="tarjeta text-center text-[15px] text-gris">No hay pedidos listos para entregar.</p>
              }
            } @else {
              @for (t of trabajos.trabajos().slice(0, 4); track t.pedido.id) {
                <app-tarjeta-trabajo [trabajo]="t" />
              } @empty {
                <p class="tarjeta text-center text-[15px] text-gris">No tienes trabajo de {{ oficio().actividad.toLowerCase() }} por ahora.</p>
              }
            }
          </div>
        </section>
      </div>
    }
  `
})
export class InicioOperario {
  sesion = inject(SesionService);
  trabajos = inject(TrabajosService);
  entregas = inject(EntregasService);
  private produccion = inject(ProduccionService);

  oficio = computed(() => this.trabajos.oficioActivo());
  esEntregas = computed(() => this.oficio().clave == 'entregas');
  variasEspecialidades = computed(() => this.sesion.misEspecialidades().length > 1);

  disponibles = computed(() => {
    if (this.esEntregas()) {
      return this.trabajos.totalPorEntregar();
    }
    return this.trabajos.totalDisponibles();
  });

  pendientes = computed(() => {
    if (this.esEntregas()) {
      return this.entregas.listos().length;
    }
    return this.trabajos.totalPendientes();
  });

  textoPendientes = computed(() => {
    if (this.esEntregas()) {
      return 'Pedidos listos';
    }
    return 'Pendientes';
  });

  hechas = computed(() => {
    if (this.esEntregas()) {
      return this.trabajos.misEntregadas();
    }
    return this.trabajos.misHechas();
  });

  enlaceAccion = computed(() => {
    if (this.esEntregas()) {
      return '/entregas/registrar';
    }
    return '/produccion/registrar';
  });
}
