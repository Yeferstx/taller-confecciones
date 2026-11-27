import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { AvisoService } from '../../core/aviso.service';
import { SesionService } from '../../core/sesion.service';
import { PedidosService } from '../../services/pedidos.service';
import { ProduccionService } from '../../services/produccion.service';
import { FilaAvance } from '../../shared/componentes/fila-avance';
import { RoleAvatar } from '../../shared/componentes/role-avatar';
import { EmpleadosService } from '../../services/empleados.service';
import { Encabezado } from '../../shared/componentes/encabezado';
import { Vacio } from '../../shared/componentes/vacio';
import { FechaPipe, PesosPipe, ProcesoPipe } from '../../shared/pipes';

// contador de un pedido: cuanto lleva cada proceso y quien lo hizo
@Component({
  selector: 'app-produccion-pedido',
  imports: [RouterLink, LucideDynamicIcon, Encabezado, FilaAvance, RoleAvatar, Vacio, FechaPipe, PesosPipe, ProcesoPipe],
  template: `
    @if (pedido(); as p) {
      <app-encabezado [titulo]="p.equipo" [subtitulo]="p.numero + ' · ' + p.cantidad + ' ' + p.tipoPrenda.toLowerCase()" volver="/produccion" />

      <div class="grid gap-4 lg:grid-cols-2">
        <div class="flex flex-col gap-4">
          @for (d of detalle(); track d.proceso) {
            <section class="tarjeta">
<app-fila-avance [proceso]="d.proceso" [hecho]="d.hecho" [total]="p.cantidad" />
              <div class="mt-2 ml-[52px] flex flex-wrap gap-x-4 text-sm">
                @if (d.hecho < p.cantidad) { <span class="text-gris">Pendientes: {{ p.cantidad - d.hecho }}</span> }
                @else if (d.hecho > p.cantidad) { <span class="text-amber-700">Sobran {{ d.hecho - p.cantidad }} (autorizado)</span> }
                @else { <span class="font-medium text-exito">Completado</span> }
                @if (d.danadas > 0) { <span class="text-error">Dañadas: {{ d.danadas }}</span> }
              </div>
              @if (d.trabajadores.length > 0) {
                <ul class="mt-3 flex flex-col gap-1 border-t border-borde pt-3">
                  @for (t of d.trabajadores; track t.nombre) {
                    <li class="flex justify-between text-[15px]"><span class="text-texto">{{ t.nombre }}</span><span class="font-semibold">{{ t.cantidad }}</span></li>
                  }
                </ul>
              }
            </section>
          }
          @if (p.estado != 'entregado' && p.estado != 'cancelado' && p.estado != 'terminado') {
            <a routerLink="/produccion/registrar" [queryParams]="{ pedido: p.id }" class="btn btn-primario w-full">
              <svg lucideIcon="plus" class="size-5"></svg> Registrar producción
            </a>
          }
        </div>

        <div>
          <h2 class="titulo-seccion">Registros</h2>
          <div class="tarjeta divide-y divide-borde p-0">
            @for (r of registros(); track r.id) {
              <div class="flex items-center gap-3 px-4 py-3">
                <app-role-avatar rol="operario" [especialidad]="empleados.especialidadDe(r.empleadoId)" [tamano]="36" [nombre]="r.empleadoNombre" />
                <div class="min-w-0 flex-1">
                  <p class="truncate text-[15px] font-medium text-texto">{{ r.empleadoNombre }} · {{ r.proceso | proceso }}</p>
                  <p class="text-sm text-gris">{{ r.fecha | fecha: 'completa' }}
                    @if (r.danadas > 0) { <span class="text-error">· {{ r.danadas }} dañadas</span> }
                    @if (!r.aprobado) { <span class="text-amber-700">· por aprobar</span> }
                  </p>
                </div>
                <div class="text-right">
                  <p class="font-semibold">{{ r.cantidad }}</p>
                  @if (sesion.esAdmin()) { <p class="text-xs text-gris">{{ r.tarifa | pesos }} c/u</p> }
                </div>
                @if (sesion.esAdmin()) {
                  <button type="button" (click)="borrar(r.id)" aria-label="Borrar registro"
                    class="flex size-11 items-center justify-center rounded-control text-gris hover:bg-error-suave hover:text-error">
                    <svg lucideIcon="trash" class="size-4"></svg>
                  </button>
                }
              </div>
            } @empty {
              <p class="px-4 py-6 text-center text-[15px] text-gris">Sin registros todavía.</p>
            }
          </div>
        </div>
      </div>
    } @else {
      <app-vacio icono="search" mensaje="No se encontró el pedido." />
    }
  `
})
export class ProduccionPedido {
  sesion = inject(SesionService);
  private pedidos = inject(PedidosService);
  private produccion = inject(ProduccionService);
  empleados = inject(EmpleadosService);
  private aviso = inject(AvisoService);

  id = input('');

  pedido = computed(() => this.pedidos.lista().find(p => p.id == Number(this.id())));

  detalle = computed(() => {
    const p = this.pedido();
    if (!p) {
      return [];
    }
    this.produccion.registros();
    return p.procesos.map(proceso => {
      return {
        proceso: proceso,
        hecho: this.produccion.avance(p.id, proceso),
        danadas: this.produccion.danadas(p.id, proceso),
        trabajadores: this.produccion.porTrabajador(p.id, proceso)
      };
    });
  });

  registros = computed(() => this.produccion.delPedido(Number(this.id())));

  borrar(id: number) {
    if (!confirm('¿Borrar este registro? Úsalo solo para corregir errores.')) {
      return;
    }
    const error = this.produccion.eliminar(id);
    if (error) {
      this.aviso.mostrar(error, 'error');
      return;
    }
    this.aviso.mostrar('Registro borrado');
  }
}
