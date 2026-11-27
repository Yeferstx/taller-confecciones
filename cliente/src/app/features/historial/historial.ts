import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { SesionService } from '../../core/sesion.service';
import { EntregasService } from '../../services/entregas.service';
import { PedidosService } from '../../services/pedidos.service';
import { ProduccionService } from '../../services/produccion.service';
import { Encabezado } from '../../shared/componentes/encabezado';
import { Icono } from '../../shared/componentes/icono';
import { Vacio } from '../../shared/componentes/vacio';
import { FechaPipe, ProcesoPipe } from '../../shared/pipes';
import { iconoProceso } from '../../shared/prendas';

interface CambioDiseno {
  pedidoId: number;
  equipo: string;
  numero: string;
  fecha: string;
  texto: string;
}

// historial personal: el operario ve lo que registro y la diseñadora los cambios de jugadores
@Component({
  selector: 'app-historial',
  imports: [RouterLink, LucideDynamicIcon, Encabezado, Icono, Vacio, FechaPipe, ProcesoPipe],
  template: `
    <app-encabezado titulo="Historial" [subtitulo]="subtitulo()" />

    @if (sesion.esDisenador()) {
      <div class="tarjeta divide-y divide-borde overflow-hidden p-0">
        @for (c of cambios(); track $index) {
          <a [routerLink]="'/disenos/' + c.pedidoId" class="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gris-claro">
            <span class="icono-caja size-10 bg-rojo-suave text-rojo-avatar"><svg lucideIcon="pen-tool" class="size-5"></svg></span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-[15px] font-semibold text-texto">{{ c.equipo }}</span>
              <span class="block text-[13px] text-texto">{{ c.texto }}</span>
              <span class="block text-xs font-normal text-gris">{{ c.numero }} · {{ c.fecha | fecha: 'completa' }}</span>
            </span>
          </a>
        } @empty {
          <app-vacio icono="history" mensaje="Todavía no hay cambios registrados." />
        }
      </div>
    } @else {
      @if (misEntregas().length > 0) {
        <h2 class="titulo-seccion">Entregas</h2>
        <div class="tarjeta mb-6 divide-y divide-borde overflow-hidden p-0">
          @for (item of misEntregas(); track item.pedido.id + '-' + item.entrega.id) {
            <div class="flex items-center gap-3 px-4 py-3">
              <span class="icono-caja size-10 bg-gris-avatar text-negro-2"><svg lucideIcon="package-check" class="size-5"></svg></span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-[15px] font-semibold text-texto">{{ item.pedido.equipo }}</span>
                <span class="block text-xs font-normal text-gris">{{ item.pedido.numero }} · {{ item.entrega.fecha | fecha: 'completa' }}</span>
              </span>
              <span class="text-lg font-bold text-texto">{{ item.entrega.cantidad }}</span>
            </div>
          }
        </div>
      }

      @if (misRegistros().length > 0 || misEntregas().length == 0) {
        <h2 class="titulo-seccion">Producción registrada</h2>
        <div class="tarjeta divide-y divide-borde overflow-hidden p-0">
          @for (r of misRegistros(); track r.id) {
            <div class="flex items-center gap-3 px-4 py-3">
              <span class="icono-caja size-10 bg-gris-avatar text-negro-2"><app-icono [nombre]="icono(r.proceso)" clase="size-5" /></span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-[15px] font-semibold text-texto">
                  @if (sesion.esAdmin()) { {{ r.empleadoNombre }} · }{{ r.proceso | proceso }}
                </span>
                <span class="block text-xs font-normal text-gris">{{ r.numeroPedido }} · {{ r.fecha | fecha: 'completa' }}</span>
              </span>
              <span class="shrink-0 text-right">
                <span class="block text-lg leading-tight font-bold text-texto">{{ r.cantidad }}</span>
                @if (r.aprobado) {
                  <span class="text-xs font-semibold text-exito">Aprobado</span>
                } @else {
                  <span class="text-xs font-semibold text-amber-700">Por aprobar</span>
                }
              </span>
            </div>
          } @empty {
            <app-vacio icono="history" mensaje="Todavía no has registrado trabajos." />
          }
        </div>
      }
    }
  `
})
export class Historial {
  sesion = inject(SesionService);
  private produccion = inject(ProduccionService);
  private pedidos = inject(PedidosService);
  private entregas = inject(EntregasService);

  subtitulo = computed(() => {
    if (this.sesion.esDisenador()) {
      return 'Cambios de tallas, nombres y números';
    }
    if (this.sesion.esAdmin()) {
      return 'Últimos registros del taller';
    }
    return 'Lo que has registrado';
  });

  misRegistros = computed(() => {
    if (this.sesion.esAdmin()) {
      return this.produccion.recientes().slice(0, 40);
    }
    const yo = this.sesion.usuario().empleadoId;
    return this.produccion.recientes().filter(r => r.empleadoId == yo);
  });

  misEntregas = computed(() => {
    if (this.sesion.esAdmin()) {
      return this.entregas.historial().slice(0, 20);
    }
    const yo = this.sesion.usuario().empleadoId;
    return this.entregas.historial().filter(item => item.entrega.empleadoId == yo);
  });

  // todos los cambios de jugadores de los pedidos, los mas nuevos primero
  cambios = computed(() => {
    const lista: CambioDiseno[] = [];
    for (const p of this.pedidos.lista()) {
      for (const c of p.historial) {
        lista.push({ pedidoId: p.id, equipo: p.equipo, numero: p.numero, fecha: c.fecha, texto: c.texto });
      }
    }
    lista.sort((a, b) => b.fecha.localeCompare(a.fecha));
    return lista;
  });

  icono(proceso: string): string {
    return iconoProceso(proceso);
  }
}
