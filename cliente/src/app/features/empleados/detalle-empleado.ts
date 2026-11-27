import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { AvisoService } from '../../core/aviso.service';
import { EmpleadosService } from '../../services/empleados.service';
import { PagosService } from '../../services/pagos.service';
import { ProduccionService } from '../../services/produccion.service';
import { Encabezado } from '../../shared/componentes/encabezado';
import { Icono } from '../../shared/componentes/icono';
import { RoleAvatar } from '../../shared/componentes/role-avatar';
import { SesionService, nombreRol } from '../../core/sesion.service';
import { oficio } from '../../shared/oficios';
import { Vacio } from '../../shared/componentes/vacio';
import { FechaPipe, PesosPipe, ProcesoPipe } from '../../shared/pipes';

@Component({
  selector: 'app-detalle-empleado',
  imports: [RouterLink, LucideDynamicIcon, Encabezado, Icono, RoleAvatar, Vacio, FechaPipe, PesosPipe, ProcesoPipe],
  template: `
    @if (empleado(); as e) {
      <app-encabezado titulo="Empleado" volver="/empleados">
        <a [routerLink]="'/empleados/' + e.id + '/editar'" class="btn btn-secundario px-3" aria-label="Editar">
          <svg lucideIcon="pencil" class="size-5"></svg>
        </a>
      </app-encabezado>

      <div class="grid gap-4 lg:grid-cols-2">
        <div class="flex flex-col gap-4">
          <section class="tarjeta flex items-center gap-4">
            <app-role-avatar [rol]="e.rol" [especialidad]="e.especialidadPrincipal" [tamano]="80" [nombre]="e.nombre" />
            <div class="min-w-0 flex-1">
              <h2 class="text-[22px] leading-tight font-bold tracking-[-0.02em] text-texto">{{ e.nombre }}</h2>
              <p class="text-[15px] text-gris">{{ cargo() }}</p>
              <span class="chip mt-1.5" [class]="{ 'bg-exito-suave text-exito': e.activo, 'bg-gris-claro text-gris ring-1 ring-borde': !(e.activo) }">
                @if (e.activo) { Activo } @else { Inactivo }
              </span>
            </div>
          </section>

          @if (e.especialidades.length > 0) {
            <section class="tarjeta">
              <h2 class="mb-3 text-sm font-semibold text-gris">Especialidades</h2>
              <div class="flex flex-wrap gap-2">
                @for (clave of e.especialidades; track clave) {
                  <span class="inline-flex min-h-10 items-center gap-2 rounded-control border px-3 text-sm font-semibold"
                    [class]="{ 'border-rojo bg-rojo-suave text-texto': clave == e.especialidadPrincipal, 'border-borde bg-white text-texto': !(clave == e.especialidadPrincipal) }">
                    <app-icono [nombre]="oficioDe(clave).icono" clase="size-4" />
                    {{ oficioDe(clave).nombre }}
                    @if (clave == e.especialidadPrincipal) { <span class="text-xs font-bold text-rojo">· Principal</span> }
                  </span>
                }
              </div>
            </section>
          }

          <div class="tarjeta grid grid-cols-2 divide-x divide-borde p-0">
            <div class="p-4">
              <p class="text-xl font-bold text-texto">{{ pagos.totalPendiente(e.id) | pesos }}</p>
              <p class="text-sm text-gris">Pendiente de pago</p>
            </div>
            <div class="p-4">
              <p class="text-xl font-bold text-exito">{{ pagos.totalPagado(e.id) | pesos }}</p>
              <p class="text-sm text-gris">Pagado</p>
            </div>
          </div>

          @if (pagos.totalPendiente(e.id) > 0) {
            <a routerLink="/pagos" [queryParams]="{ empleado: e.id }" class="btn btn-primario w-full">
              <svg lucideIcon="wallet" class="size-5"></svg> Pagar a {{ e.nombre.split(' ')[0] }}
            </a>
          }

          <section class="tarjeta">
            @if (e.telefono) {
              <a [href]="'tel:' + e.telefono" class="mb-3 flex min-h-11 items-center gap-2 text-[15px] font-medium text-rojo">
                <svg lucideIcon="phone" class="size-4"></svg> {{ e.telefono }}
              </a>
            }
            <h2 class="mb-2 text-sm font-semibold text-gris">Tarifas</h2>
            <div class="divide-y divide-borde">
              @for (t of e.tarifas; track $index) {
                <div class="flex justify-between py-2 text-[15px]">
                  <span>{{ t.tipoPrenda }} · <span class="text-gris">{{ t.proceso | proceso }}</span></span>
                  <span class="font-semibold">{{ t.valor | pesos }}</span>
                </div>
              } @empty {
                <p class="py-2 text-sm text-gris">Sin tarifas registradas.</p>
              }
            </div>
          </section>

          @if (e.historialTarifas.length > 0) {
            <details class="tarjeta group">
              <summary class="flex min-h-8 cursor-pointer list-none items-center gap-2 font-semibold text-texto">
                <svg lucideIcon="history" class="size-5 text-gris"></svg>
                <span class="flex-1">Historial de tarifas</span>
                <svg lucideIcon="chevron-down" class="size-5 text-gris transition-transform group-open:rotate-180"></svg>
              </summary>
              <ul class="mt-3 flex flex-col gap-2">
                @for (c of e.historialTarifas.slice().reverse(); track $index) {
                  <li class="border-l-2 border-borde pl-3 text-sm">
                    <p class="text-texto">{{ c.tipoPrenda }} · {{ c.proceso | proceso }}: {{ c.anterior | pesos }} → <b>{{ c.nuevo | pesos }}</b></p>
                    <p class="text-xs text-gris">{{ c.fecha | fecha: 'completa' }}</p>
                  </li>
                }
              </ul>
              <p class="mt-3 text-xs text-gris">Los trabajos ya registrados conservan la tarifa con la que se guardaron.</p>
            </details>
          }

          <button type="button" (click)="cambiarEstado()" class="btn w-full" [class]="{ 'btn-peligro': e.activo, 'btn-secundario': !(e.activo) }">
            @if (e.activo) { Desactivar empleado } @else { Activar empleado }
          </button>
        </div>

        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-2 gap-1 rounded-xl bg-white p-1 ring-1 ring-borde">
            <button type="button" (click)="pestana.set('trabajos')" class="min-h-11 rounded-lg text-sm font-semibold"
              [class]="{ 'bg-negro text-white': pestana() == 'trabajos', 'text-gris': !(pestana() == 'trabajos') }">Trabajos</button>
            <button type="button" (click)="pestana.set('pagos')" class="min-h-11 rounded-lg text-sm font-semibold"
              [class]="{ 'bg-negro text-white': pestana() == 'pagos', 'text-gris': !(pestana() == 'pagos') }">Pagos</button>
          </div>

          @if (pestana() == 'trabajos') {
            <div class="tarjeta divide-y divide-borde p-0">
              @for (r of trabajos(); track r.id) {
                <div class="flex items-center gap-3 px-4 py-3">
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-[15px] font-medium">{{ r.numeroPedido }} · {{ r.proceso | proceso }}</p>
                    <p class="text-sm text-gris">{{ r.cantidad }} × {{ r.tarifa | pesos }} · {{ r.fecha | fecha }}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold">{{ r.total | pesos }}</p>
                    @if (!r.aprobado) { <p class="text-xs text-amber-700">Por aprobar</p> }
                    @else if (r.abonado >= r.total) { <p class="text-xs text-exito">Pagado</p> }
                    @else if (r.abonado > 0) { <p class="text-xs text-amber-700">Abonado {{ r.abonado | pesos }}</p> }
                    @else { <p class="text-xs text-gris">Pendiente</p> }
                  </div>
                </div>
              } @empty {
                <app-vacio icono="scissors" mensaje="Sin trabajos registrados." />
              }
            </div>
          } @else {
            <div class="tarjeta divide-y divide-borde p-0">
              @for (p of pagosEmpleado(); track p.id) {
                <div class="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p class="text-[15px] font-medium">{{ p.fecha | fecha: 'completa' }}</p>
                    <p class="text-sm text-gris">Pago {{ p.tipo }}@if (p.nota) { · {{ p.nota }} }</p>
                  </div>
                  <p class="font-semibold text-exito">{{ p.valor | pesos }}</p>
                </div>
              } @empty {
                <app-vacio icono="wallet" mensaje="Sin pagos registrados." />
              }
            </div>
          }
        </div>
      </div>
    } @else {
      <app-vacio icono="search" mensaje="No se encontró el empleado." />
    }
  `
})
export class DetalleEmpleado {
  private empleados = inject(EmpleadosService);
  private produccion = inject(ProduccionService);
  private aviso = inject(AvisoService);
  pagos = inject(PagosService);

  id = input('');
  pestana = signal('trabajos');

  empleado = computed(() => this.empleados.lista().find(e => e.id == Number(this.id())));

  trabajos = computed(() => this.produccion.delEmpleado(Number(this.id())));

  pagosEmpleado = computed(() => {
    this.pagos.lista();
    return this.pagos.delEmpleado(Number(this.id()));
  });

  private sesion = inject(SesionService);

  cargo = computed(() => {
    const e = this.empleado();
    if (!e) {
      return '';
    }
    if (e.rol != 'operario' || e.especialidades.length == 0) {
      return nombreRol(e.rol);
    }
    return this.sesion.cargoDe(e);
  });

  oficioDe(clave: string) {
    return oficio(clave);
  }

  cambiarEstado() {
    const e = this.empleado();
    if (!e) {
      return;
    }
    this.empleados.cambiarEstado(e.id);
    if (e.activo) {
      this.aviso.mostrar('Empleado desactivado');
    } else {
      this.aviso.mostrar('Empleado activado');
    }
  }
}
