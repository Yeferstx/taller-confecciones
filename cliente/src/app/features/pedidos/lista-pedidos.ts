import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { PedidosService } from '../../services/pedidos.service';
import { Encabezado } from '../../shared/componentes/encabezado';
import { Vacio } from '../../shared/componentes/vacio';
import { TarjetaPedido } from './tarjeta-pedido';

@Component({
  selector: 'app-lista-pedidos',
  imports: [FormsModule, RouterLink, LucideDynamicIcon, Encabezado, Vacio, TarjetaPedido],
  template: `
    <app-encabezado titulo="Pedidos" [subtitulo]="pedidos.activos().length + ' activos'">
      <a routerLink="/pedidos/nuevo" class="btn btn-primario">
        <svg lucideIcon="plus" class="size-5"></svg> Nuevo
      </a>
    </app-encabezado>

    <div class="relative mb-3">
      <svg lucideIcon="search" class="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-gris"></svg>
      <input type="search" class="campo pl-11 lg:max-w-md" placeholder="Buscar cliente, equipo o número"
        [ngModel]="texto()" (ngModelChange)="texto.set($event)" />
    </div>

    <div class="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
      @for (filtro of filtros; track filtro.valor) {
        <button type="button" (click)="estado.set(filtro.valor)"
          class="min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors"
          [class]="{ 'bg-negro text-white': estado() == filtro.valor, 'bg-white text-texto shadow-card ring-1 ring-borde': !(estado() == filtro.valor) }">
          {{ filtro.texto }}
        </button>
      }
    </div>

    <div class="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      @for (pedido of resultados(); track pedido.id) {
        <app-tarjeta-pedido [pedido]="pedido" [enlace]="'/pedidos/' + pedido.id" />
      }
    </div>
    @if (resultados().length == 0) {
      <app-vacio icono="search" mensaje="No se encontraron pedidos." />
    }
  `
})
export class ListaPedidos {
  pedidos = inject(PedidosService);

  // texto que llega desde el buscador del encabezado: /pedidos?q=halcones
  q = input('');

  texto = signal('');
  estado = signal('activos');

  constructor() {
    effect(() => {
      const buscado = this.q();
      if (buscado) {
        this.texto.set(buscado);
        this.estado.set('todos');
      }
    });
  }

  filtros = [
    { valor: 'activos', texto: 'Activos' },
    { valor: 'pendiente', texto: 'Pendientes' },
    { valor: 'en_produccion', texto: 'En producción' },
    { valor: 'terminado', texto: 'Listos' },
    { valor: 'entregado', texto: 'Entregados' },
    { valor: 'cancelado', texto: 'Cancelados' },
    { valor: 'todos', texto: 'Todos' }
  ];

  resultados = computed(() => {
    // se lee la lista para que se actualice cuando cambie
    this.pedidos.lista();
    return this.pedidos.buscar(this.texto(), this.estado());
  });
}
