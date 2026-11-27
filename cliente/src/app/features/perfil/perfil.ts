import { Component, computed, inject } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { SesionService } from '../../core/sesion.service';
import { Especialidad } from '../../models/especialidad';
import { Encabezado } from '../../shared/componentes/encabezado';
import { Icono } from '../../shared/componentes/icono';
import { RoleAvatar } from '../../shared/componentes/role-avatar';
import { SelectorUsuario } from '../../shared/componentes/selector-usuario';
import { oficio } from '../../shared/oficios';

// perfil del usuario: avatar automatico, cargo, especialidades y actividad activa
@Component({
  selector: 'app-perfil',
  imports: [LucideDynamicIcon, Encabezado, Icono, RoleAvatar, SelectorUsuario],
  template: `
    <app-encabezado titulo="Perfil" />

    <div class="grid gap-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-start">
      <div class="flex flex-col gap-5">
        <section class="tarjeta flex flex-col items-center px-6 py-7 text-center">
          <app-role-avatar [rol]="sesion.usuario().rol" [especialidad]="sesion.especialidadAvatar()" [tamano]="80" [nombre]="sesion.usuario().nombre" />
          <h2 class="mt-3 text-[22px] font-bold tracking-[-0.02em] text-texto">{{ sesion.usuario().nombre }}</h2>
          <p class="text-[15px] font-medium text-gris">{{ sesion.cargo() }}</p>
          @if (sesion.empleado(); as e) {
            @if (e.telefono) {
              <p class="mt-2 inline-flex items-center gap-1.5 text-sm text-gris"><svg lucideIcon="phone" class="size-4"></svg> {{ e.telefono }}</p>
            }
          }
        </section>

        @if (especialidades().length > 0) {
          <section class="tarjeta">
            <h2 class="titulo-seccion">Mis especialidades</h2>
            @if (especialidades().length > 1) {
              <p class="mb-3 text-[13px] text-gris">Toca una para trabajar en esa actividad.</p>
            }
            <div class="grid gap-2 sm:grid-cols-2">
              @for (o of especialidades(); track o.clave) {
                <button type="button" (click)="elegir(o.clave)"
                  class="flex min-h-16 items-center gap-3 rounded-control border px-3 text-left transition-colors"
                  [class]="{ 'border-rojo bg-rojo-suave': sesion.especialidadActiva() == o.clave, 'border-borde hover:bg-gris-claro': !(sesion.especialidadActiva() == o.clave) }">
                  <span class="icono-caja size-10 bg-gris-avatar text-negro-2"><app-icono [nombre]="o.icono" clase="size-5" /></span>
                  <span class="min-w-0 flex-1 leading-tight">
                    <span class="block font-semibold text-texto">{{ o.nombre }}</span>
                    <span class="block text-xs font-normal text-gris">
                      @if (esPrincipal(o.clave)) { Principal } @else { Secundaria }
                      @if (sesion.especialidadActiva() == o.clave) { · Activa }
                    </span>
                  </span>
                  @if (sesion.especialidadActiva() == o.clave) { <svg lucideIcon="circle-check" class="size-5 text-rojo"></svg> }
                </button>
              }
            </div>
          </section>
        }
      </div>

      <section class="tarjeta">
        <app-selector-usuario />
      </section>
    </div>
  `
})
export class Perfil {
  sesion = inject(SesionService);

  especialidades = computed(() => this.sesion.misEspecialidades().map(e => oficio(e)));

  esPrincipal(clave: string): boolean {
    const e = this.sesion.empleado();
    if (!e) {
      return false;
    }
    return e.especialidadPrincipal == clave;
  }

  elegir(clave: Especialidad) {
    this.sesion.elegirEspecialidad(clave);
  }
}
