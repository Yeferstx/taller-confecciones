import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { PagosService } from '../../services/pagos.service';
import { PedidosService } from '../../services/pedidos.service';
import { ProduccionService } from '../../services/produccion.service';
import { EmpleadosService } from '../../services/empleados.service';
import { PesosPipe } from '../../shared/pipes';
import { FilaPedido } from '../pedidos/fila-pedido';

// inicio del administrador: resumen, acciones rapidas, pendientes y entregas
@Component({
  selector: 'app-inicio-admin',
  imports: [RouterLink, LucideDynamicIcon, FilaPedido, PesosPipe],
  template: `
    <section class="relative z-10 -mt-12 mb-6 grid grid-cols-3 gap-2.5 sm:gap-3 lg:mt-0 lg:gap-4" aria-label="Resumen del día">
      <a routerLink="/pedidos" class="tarjeta-resumen animar-entrada">
        <span class="icono-caja size-10 rounded-full bg-exito-suave text-exito lg:size-12"><svg lucideIcon="clipboard-list" class="size-5 lg:size-6"></svg></span>
        <span class="flex flex-col items-center gap-1 lg:items-start">
          <span class="numero-resumen">{{ pedidos.activos().length }}</span>
          <span class="text-xs font-medium text-gris sm:text-sm">Pedidos<span class="hidden sm:inline"> activos</span></span>
        </span>
      </a>
      <a routerLink="/agenda" class="tarjeta-resumen animar-entrada">
        <span class="icono-caja size-10 rounded-full bg-rojo-suave text-rojo lg:size-12"><svg lucideIcon="truck" class="size-5 lg:size-6"></svg></span>
        <span class="flex flex-col items-center gap-1 lg:items-start">
          <span class="numero-resumen">{{ pedidos.entregasHoy().length }}</span>
          <span class="text-xs font-medium text-gris sm:text-sm">Entregas hoy</span>
        </span>
      </a>
      <a routerLink="/agenda" class="tarjeta-resumen animar-entrada">
        <span class="icono-caja size-10 rounded-full bg-alerta-suave text-amber-600 lg:size-12"><svg lucideIcon="triangle-alert" class="size-5 lg:size-6"></svg></span>
        <span class="flex flex-col items-center gap-1 lg:items-start">
          <span class="numero-resumen" [class.!text-rojo]="pedidos.atrasados().length > 0">{{ pedidos.atrasados().length }}</span>
          <span class="text-xs font-medium text-gris sm:text-sm">Atrasados</span>
        </span>
      </a>
    </section>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
      <div class="flex flex-col gap-6">
        <section>
          <h2 class="titulo-seccion mb-2.5">Acciones rápidas</h2>
          <div class="flex flex-col gap-2.5">
            <a routerLink="/pedidos/nuevo" class="btn btn-primario min-h-[62px] justify-start px-5">
              <svg lucideIcon="plus" class="size-6"></svg>
              <span class="flex-1">Nuevo pedido</span>
              <svg lucideIcon="chevron-right" class="size-5"></svg>
            </a>
            <a routerLink="/produccion/registrar" class="btn btn-accion-clara min-h-[62px] justify-start px-5">
              <svg lucideIcon="layers" class="size-6"></svg>
              <span class="flex-1">Registrar producción</span>
              <svg lucideIcon="chevron-right" class="size-5"></svg>
            </a>
            <a routerLink="/pagos" class="btn btn-accion-clara min-h-[62px] justify-start px-5">
              <svg lucideIcon="wallet" class="size-6"></svg>
              <span class="flex-1">Registrar pago</span>
              <svg lucideIcon="chevron-right" class="size-5"></svg>
            </a>
          </div>
        </section>

        <section>
          <h2 class="titulo-seccion mb-2.5">Pendientes</h2>
          <div class="tarjeta divide-y divide-borde overflow-hidden p-0">
            <a routerLink="/produccion" class="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-gris-claro">
              <span class="icono-caja size-10 bg-alerta-suave text-amber-600"><svg lucideIcon="shield-check" class="size-5"></svg></span>
              <span class="min-w-0 flex-1">
                <span class="block text-[15px] font-semibold text-texto">Producción por aprobar</span>
                <span class="block text-[13px] font-normal text-gris">Registros de los operarios</span>
              </span>
              <span class="text-lg font-bold text-texto">{{ produccion.porAprobar().length }}</span>
              <svg lucideIcon="chevron-right" class="size-5 text-gray-400"></svg>
            </a>
            <a routerLink="/pagos" class="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-gris-claro">
              <span class="icono-caja size-10 bg-exito-suave text-exito"><svg lucideIcon="wallet" class="size-5"></svg></span>
              <span class="min-w-0 flex-1">
                <span class="block text-[15px] font-semibold text-texto">Pagos pendientes</span>
                <span class="block text-[13px] font-normal text-gris">{{ conPagoPendiente() }} trabajador(es)</span>
              </span>
              <span class="text-base font-bold text-texto">{{ totalPagos() | pesos }}</span>
              <svg lucideIcon="chevron-right" class="size-5 text-gray-400"></svg>
            </a>
          </div>
        </section>
      </div>

      <div class="flex flex-col gap-6">
        <section>
          <div class="mb-2.5 flex items-center justify-between">
            <h2 class="titulo-seccion mb-0">Próximas entregas</h2>
            <a routerLink="/agenda" class="flex min-h-11 items-center text-sm font-semibold text-rojo">Ver agenda</a>
          </div>
          <div class="tarjeta divide-y divide-borde overflow-hidden p-0">
            @for (pedido of proximas(); track pedido.id) {
              <app-fila-pedido [pedido]="pedido" [enlace]="'/pedidos/' + pedido.id" />
            } @empty {
              <p class="px-4 py-6 text-center text-[15px] text-gris">No hay entregas programadas.</p>
            }
          </div>
        </section>

        <section>
          <div class="mb-2.5 flex items-center justify-between">
            <h2 class="titulo-seccion mb-0">Pedidos recientes</h2>
            <a routerLink="/pedidos" class="flex min-h-11 items-center text-sm font-semibold text-rojo">Ver todos</a>
          </div>
          <div class="tarjeta divide-y divide-borde overflow-hidden p-0">
            @for (pedido of recientes(); track pedido.id) {
              <app-fila-pedido [pedido]="pedido" [enlace]="'/pedidos/' + pedido.id" />
            }
          </div>
        </section>
      </div>
    </div>
  `
})
export class InicioAdmin {
  pedidos = inject(PedidosService);
  produccion = inject(ProduccionService);
  private pagos = inject(PagosService);
  private empleados = inject(EmpleadosService);

  // atrasados primero, luego hoy y los siguientes
  proximas = computed(() => this.pedidos.activos().slice(0, 4));

  recientes = computed(() => {
    const lista = this.pedidos.lista().filter(p => p.estado != 'cancelado');
    lista.sort((a, b) => b.id - a.id);
    return lista.slice(0, 3);
  });

  totalPagos = computed(() => {
    this.pagos.lista();
    this.produccion.registros();
    let total = 0;
    for (const e of this.empleados.lista()) {
      total = total + this.pagos.totalPendiente(e.id);
    }
    return total;
  });

  conPagoPendiente = computed(() => {
    this.pagos.lista();
    this.produccion.registros();
    return this.empleados.lista().filter(e => this.pagos.totalPendiente(e.id) > 0).length;
  });
}
