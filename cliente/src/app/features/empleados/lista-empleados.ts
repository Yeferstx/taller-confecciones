import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { EmpleadosService } from '../../services/empleados.service';
import { PagosService } from '../../services/pagos.service';
import { Encabezado } from '../../shared/componentes/encabezado';
import { Vacio } from '../../shared/componentes/vacio';
import { PesosPipe } from '../../shared/pipes';
import { RoleAvatar } from '../../shared/componentes/role-avatar';
import { SesionService, nombreRol } from '../../core/sesion.service';
import { Empleado } from '../../models/empleado';

@Component({
  selector: 'app-lista-empleados',
  imports: [RouterLink, LucideDynamicIcon, Encabezado, Vacio, PesosPipe, RoleAvatar],
  template: `
    <app-encabezado titulo="Empleados" [subtitulo]="empleados.activos().length + ' activos'">
      <a routerLink="/empleados/nuevo" class="btn btn-primario">
        <svg lucideIcon="plus" class="size-5"></svg> Nuevo
      </a>
    </app-encabezado>

    <div class="segmentos mb-4 grid-cols-2 sm:max-w-xs">
      <button type="button" (click)="verActivos.set(true)" class="min-h-11 rounded-lg text-sm font-semibold"
        [class]="{ 'bg-negro text-white': verActivos(), 'text-gris': !(verActivos()) }">Activos</button>
      <button type="button" (click)="verActivos.set(false)" class="min-h-11 rounded-lg text-sm font-semibold"
        [class]="{ 'bg-negro text-white': !verActivos(), 'text-gris': !(!verActivos()) }">Inactivos</button>
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      @for (e of lista(); track e.id) {
        <a [routerLink]="'/empleados/' + e.id" class="tarjeta flex items-center gap-3 active:bg-slate-50">
          <app-role-avatar [rol]="e.rol" [especialidad]="e.especialidadPrincipal" [tamano]="56" [nombre]="e.nombre" />
          <div class="min-w-0 flex-1">
            <p class="truncate font-semibold text-texto">{{ e.nombre }}</p>
            <div class="mt-1 flex flex-wrap gap-1">
              <span class="text-[13px] font-medium text-gris">{{ cargo(e) }}</span>
            </div>
          </div>
          <div class="shrink-0 text-right">
            <p class="font-semibold" [class]="{ 'text-texto': pagos.totalPendiente(e.id) > 0, 'text-gris': !(pagos.totalPendiente(e.id) > 0) }">{{ pagos.totalPendiente(e.id) | pesos }}</p>
            <p class="text-xs text-gris">por pagar</p>
          </div>
        </a>
      }
    </div>
    @if (lista().length == 0) {
      <app-vacio icono="users" mensaje="No hay empleados en esta lista." />
    }
  `
})
export class ListaEmpleados {
  empleados = inject(EmpleadosService);
  pagos = inject(PagosService);

  private sesion = inject(SesionService);

  verActivos = signal(true);

  cargo(e: Empleado): string {
    if (e.rol != 'operario' || e.especialidades.length == 0) {
      return nombreRol(e.rol);
    }
    return this.sesion.cargoDe(e);
  }

  lista = computed(() => this.empleados.lista().filter(e => e.activo == this.verActivos()));
}
