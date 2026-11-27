import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EntregasService } from '../../services/entregas.service';
import { TrabajosService } from '../../services/trabajos.service';
import { Encabezado } from '../../shared/componentes/encabezado';
import { Icono } from '../../shared/componentes/icono';
import { SelectorEspecialidad } from '../../shared/componentes/selector-especialidad';
import { Vacio } from '../../shared/componentes/vacio';
import { TarjetaEntrega } from './tarjeta-entrega';
import { TarjetaTrabajo } from './tarjeta-trabajo';

// todos los trabajos del operario para su especialidad activa
@Component({
  selector: 'app-mis-trabajos',
  imports: [RouterLink, Encabezado, Icono, SelectorEspecialidad, Vacio, TarjetaTrabajo, TarjetaEntrega],
  template: `
    <app-encabezado titulo="Mis trabajos" [subtitulo]="oficio().actividad" />
    <app-selector-especialidad />

    @if (!esEntregas()) {
      <div class="segmentos mb-4 grid-cols-2" role="tablist">
        <button type="button" role="tab" (click)="filtro.set('todos')" class="segmento"
          [class.segmento-activo]="filtro() == 'todos'">Todos ({{ trabajos.trabajos().length }})</button>
        <button type="button" role="tab" (click)="filtro.set('asignados')" class="segmento"
          [class.segmento-activo]="filtro() == 'asignados'">Asignados ({{ trabajos.asignados().length }})</button>
      </div>
    }

    <div class="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
      @if (esEntregas()) {
        @for (p of entregas.listos(); track p.id) {
          <app-tarjeta-entrega [pedido]="p" />
        }
      } @else {
        @for (t of lista(); track t.pedido.id) {
          <app-tarjeta-trabajo [trabajo]="t" />
        }
      }
    </div>
    @if (vacio()) {
      <app-vacio icono="clipboard-check" mensaje="No tienes trabajos en esta lista por ahora." />
    }

    <a [routerLink]="enlaceAccion()" class="btn btn-primario mt-6 min-h-14 w-full md:w-auto md:px-8">
      <app-icono [nombre]="oficio().icono" clase="size-5" /> {{ oficio().accion }}
    </a>
  `
})
export class MisTrabajos {
  trabajos = inject(TrabajosService);
  entregas = inject(EntregasService);

  filtro = signal('todos');

  oficio = computed(() => this.trabajos.oficioActivo());
  esEntregas = computed(() => this.oficio().clave == 'entregas');

  enlaceAccion = computed(() => {
    if (this.esEntregas()) {
      return '/entregas/registrar';
    }
    return '/produccion/registrar';
  });

  lista = computed(() => {
    if (this.filtro() == 'asignados') {
      return this.trabajos.asignados();
    }
    return this.trabajos.trabajos();
  });

  vacio = computed(() => {
    if (this.esEntregas()) {
      return this.entregas.listos().length == 0;
    }
    return this.lista().length == 0;
  });
}
