import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { EstadoDiseno } from '../../models/pedido';
import { PedidosService } from '../../services/pedidos.service';
import { Encabezado } from '../../shared/componentes/encabezado';
import { Vacio } from '../../shared/componentes/vacio';
import { FechaPipe } from '../../shared/pipes';

// vista del disenador: solo diseno, sin dinero
@Component({
  selector: 'app-lista-disenos',
  imports: [RouterLink, LucideDynamicIcon, Encabezado, Vacio, FechaPipe],
  template: `
    <app-encabezado titulo="Diseños" subtitulo="Pedidos que necesitan diseño" />

    @if (porRevisar().length > 0) {
      <h2 class="titulo-seccion text-amber-700">Cambios por revisar</h2>
      <div class="mb-6 flex flex-col gap-2">
        @for (p of porRevisar(); track p.id) {
          <a [routerLink]="'/disenos/' + p.id" class="flex min-h-14 items-center gap-3 rounded-2xl bg-alerta-suave px-4 py-3 text-amber-900">
            <svg lucideIcon="triangle-alert" class="size-5 shrink-0"></svg>
            <span class="min-w-0 flex-1">
              <span class="block truncate font-semibold">{{ p.equipo }}</span>
              <span class="block text-sm">Se cambiaron datos de jugadores después de terminar</span>
            </span>
            <svg lucideIcon="chevron-right" class="size-5"></svg>
          </a>
        }
      </div>
    }

    <div class="mb-4 grid grid-cols-3 gap-1 rounded-xl bg-white p-1 ring-1 ring-borde">
      @for (f of filtros; track f.valor) {
        <button type="button" (click)="filtro.set(f.valor)" class="min-h-11 rounded-lg text-sm font-semibold"
          [class]="{ 'bg-negro text-white': filtro() == f.valor, 'text-gris': !(filtro() == f.valor) }">
          {{ f.texto }} ({{ contar(f.valor) }})
        </button>
      }
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      @for (p of lista(); track p.id) {
        <a [routerLink]="'/disenos/' + p.id" class="tarjeta flex gap-3 active:bg-slate-50">
          @if (p.imagen) {
            <img [src]="p.imagen" alt="" class="size-20 shrink-0 rounded-xl border border-borde object-contain bg-white" />
          } @else {
            <div class="flex size-20 shrink-0 items-center justify-center rounded-xl bg-lila text-violet-700">
              <svg lucideIcon="palette" class="size-7"></svg>
            </div>
          }
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold text-gris">{{ p.numero }}</p>
            <p class="truncate font-semibold text-texto">{{ p.equipo }}</p>
            <p class="text-sm text-gris">{{ p.cantidad }} · {{ p.tipoPrenda }}</p>
            <p class="mt-1 text-sm text-gris">
              Entrega {{ p.fechaEntrega | fecha: 'entrega' }}
              @if (p.personalizado) { · {{ p.jugadores.length }} jugadores }
            </p>
          </div>
        </a>
      }
    </div>
    @if (lista().length == 0) {
      <app-vacio icono="palette" mensaje="No hay diseños en este estado." />
    }
  `
})
export class ListaDisenos {
  private pedidos = inject(PedidosService);

  filtro = signal<EstadoDiseno>('pendiente');

  filtros: { valor: EstadoDiseno; texto: string }[] = [
    { valor: 'pendiente', texto: 'Pendientes' },
    { valor: 'en_proceso', texto: 'En proceso' },
    { valor: 'terminado', texto: 'Listos' }
  ];

  // solo pedidos que siguen abiertos
  abiertos = computed(() => this.pedidos.activos());

  porRevisar = computed(() => this.abiertos().filter(p => p.disenoRevisar));

  lista = computed(() => this.abiertos().filter(p => p.estadoDiseno == this.filtro()));

  contar(estado: EstadoDiseno): number {
    return this.abiertos().filter(p => p.estadoDiseno == estado).length;
  }
}
