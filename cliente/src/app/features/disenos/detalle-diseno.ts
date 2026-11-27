import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { AvisoService } from '../../core/aviso.service';
import { EstadoDiseno } from '../../models/pedido';
import { PedidosService } from '../../services/pedidos.service';
import { Encabezado } from '../../shared/componentes/encabezado';
import { Vacio } from '../../shared/componentes/vacio';
import { nombreEstadoDiseno } from '../../shared/constantes';
import { FechaPipe } from '../../shared/pipes';
import { Jugadores } from '../pedidos/jugadores';

@Component({
  selector: 'app-detalle-diseno',
  imports: [RouterLink, LucideDynamicIcon, Encabezado, Vacio, Jugadores, FechaPipe],
  template: `
    @if (pedido(); as p) {
      <app-encabezado [titulo]="p.equipo" [subtitulo]="p.numero + ' · ' + p.cantidad + ' ' + p.tipoPrenda.toLowerCase()" volver="/disenos" />

      @if (p.disenoRevisar) {
        <div class="mb-4 rounded-2xl bg-alerta-suave p-4 text-amber-900">
          <p class="mb-2 flex items-center gap-2 font-semibold">
            <svg lucideIcon="triangle-alert" class="size-5"></svg> Hubo cambios después de terminar el diseño
          </p>
          @for (cambio of ultimosCambios(); track $index) {
            <p class="text-sm">· {{ cambio.texto }} <span class="text-amber-700">({{ cambio.fecha | fecha: 'completa' }})</span></p>
          }
          <button type="button" (click)="revisado()" class="btn btn-oscuro mt-3 w-full sm:w-auto">
            <svg lucideIcon="check-check" class="size-5"></svg> Ya revisé y corregí
          </button>
        </div>
      }

      <div class="grid gap-4 lg:grid-cols-2">
        <div class="flex flex-col gap-4">
          <section class="tarjeta">
            @if (p.imagen) {
              <img [src]="p.imagen" alt="Imagen de referencia" class="mb-4 max-h-80 w-full rounded-xl border border-borde bg-fondo object-contain" />
            }
            <div class="mb-3 flex items-center justify-between">
              <span class="text-sm text-gris">Estado del diseño</span>
              <span class="chip" [class]="claseEstado()">{{ textoEstado() }}</span>
            </div>
            <dl class="grid grid-cols-2 gap-3 text-[15px]">
              <div><dt class="text-sm text-gris">Prenda</dt><dd class="font-medium">{{ p.tipoPrenda }}</dd></div>
              <div><dt class="text-sm text-gris">Cantidad</dt><dd class="font-medium">{{ p.cantidad }}</dd></div>
              <div><dt class="text-sm text-gris">Entrega</dt><dd class="font-medium">{{ p.fechaEntrega | fecha }}</dd></div>
              <div><dt class="text-sm text-gris">Cliente</dt><dd class="truncate font-medium">{{ p.cliente }}</dd></div>
            </dl>
            @if (p.observaciones) {
              <div class="mt-4 rounded-xl bg-fondo px-4 py-3">
                <p class="text-sm text-gris">Observaciones</p>
                <p class="text-[15px] text-texto">{{ p.observaciones }}</p>
              </div>
            }
          </section>

          <div class="flex flex-col gap-2">
            @if (p.estadoDiseno == 'pendiente') {
              <button type="button" (click)="cambiar('en_proceso')" class="btn btn-primario w-full">
                <svg lucideIcon="palette" class="size-5"></svg> Empezar diseño
              </button>
            }
            @if (p.estadoDiseno != 'terminado') {
              <button type="button" (click)="cambiar('terminado')" class="btn btn-exito w-full">
                <svg lucideIcon="circle-check" class="size-5"></svg> Marcar diseño como terminado
              </button>
            } @else {
              <button type="button" (click)="cambiar('en_proceso')" class="btn btn-secundario w-full">
                <svg lucideIcon="rotate-ccw" class="size-5"></svg> Volver a "En proceso"
              </button>
            }
          </div>
        </div>

        <div>
          @if (p.personalizado) {
            <h2 class="titulo-seccion">Jugadores</h2>
            <app-jugadores [pedidoId]="p.id" [soloLectura]="true" />
          } @else {
            <div class="tarjeta text-[15px] text-gris">Este pedido no lleva nombres ni números por jugador.</div>
          }
        </div>
      </div>
    } @else {
      <app-vacio icono="search" mensaje="No se encontró el diseño.">
        <a routerLink="/disenos" class="btn btn-secundario mt-4">Volver</a>
      </app-vacio>
    }
  `
})
export class DetalleDiseno {
  private pedidos = inject(PedidosService);
  private aviso = inject(AvisoService);

  id = input('');

  pedido = computed(() => this.pedidos.lista().find(p => p.id == Number(this.id())));

  ultimosCambios = computed(() => {
    const p = this.pedido();
    if (!p) {
      return [];
    }
    return p.historial.slice(-3).reverse();
  });

  textoEstado(): string {
    const p = this.pedido();
    if (!p) {
      return '';
    }
    return nombreEstadoDiseno(p.estadoDiseno);
  }

  claseEstado(): string {
    const p = this.pedido();
    if (!p || p.estadoDiseno == 'pendiente') {
      return 'bg-alerta-suave text-amber-700';
    }
    if (p.estadoDiseno == 'en_proceso') {
      return 'bg-lila text-violet-800';
    }
    return 'bg-exito-suave text-exito';
  }

  cambiar(estado: EstadoDiseno) {
    const p = this.pedido();
    if (!p) {
      return;
    }
    this.pedidos.cambiarEstadoDiseno(p.id, estado);
    if (estado == 'terminado') {
      this.aviso.mostrar('Diseño terminado');
    } else {
      this.aviso.mostrar('Diseño en proceso');
    }
  }

  revisado() {
    const p = this.pedido();
    if (!p) {
      return;
    }
    this.pedidos.marcarRevisado(p.id);
    this.aviso.mostrar('Cambios revisados');
  }
}
