import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideDynamicIcon } from '@lucide/angular';
import { AvisoService } from '../../core/aviso.service';
import { EntregasService } from '../../services/entregas.service';
import { PedidosService } from '../../services/pedidos.service';
import { ProduccionService } from '../../services/produccion.service';
import { CabeceraTarjeta } from '../../shared/componentes/cabecera-tarjeta';
import { Encabezado } from '../../shared/componentes/encabezado';
import { MiniaturaPrenda } from '../../shared/componentes/miniatura-prenda';
import { imagenPrenda } from '../../shared/prendas';

// entrega completa o parcial de un pedido
@Component({
  selector: 'app-registrar-entrega',
  imports: [FormsModule, LucideDynamicIcon, Encabezado, CabeceraTarjeta, MiniaturaPrenda],
  template: `
    <app-encabezado titulo="Entregas" volver="/inicio" />

    <form (ngSubmit)="guardar()" class="mx-auto flex max-w-xl flex-col gap-5">
      <app-cabecera-tarjeta icono="package-check" titulo="Registrar entrega" subtitulo="Puede ser completa o solo una parte." />

      <div class="tarjeta flex flex-col gap-5">
        <div>
          <label class="etiqueta" for="pedido">Pedido</label>
          <select id="pedido" name="pedido" class="campo" [ngModel]="pedidoId()" (ngModelChange)="elegir($event)">
            <option [ngValue]="0" disabled>Selecciona un pedido</option>
            @for (p of entregas.listos(); track p.id) {
              <option [ngValue]="p.id">{{ p.numero }} – {{ p.equipo }}</option>
            }
          </select>
          @if (entregas.listos().length == 0) {
            <p class="mt-2 text-sm text-gris">No hay pedidos con prendas terminadas por entregar.</p>
          }
        </div>

        @if (pedido(); as p) {
          <div class="flex items-center gap-3 rounded-control bg-gris-claro p-3 ring-1 ring-borde">
            <app-miniatura-prenda [imagen]="imagen()" [texto]="p.tipoPrenda" tamano="size-14" />
            <div class="min-w-0 flex-1">
              <p class="truncate font-bold text-texto">{{ p.cliente }}</p>
              <p class="text-[13px] text-gris">Entregadas {{ p.entregadas }} de {{ p.cantidad }} {{ p.tipoPrenda.toLowerCase() }}</p>
              @if (p.telefono) {
                <a [href]="'tel:' + p.telefono" class="mt-0.5 inline-flex min-h-8 items-center gap-1.5 text-sm font-semibold text-rojo">
                  <svg lucideIcon="phone" class="size-4"></svg> {{ p.telefono }}
                </a>
              }
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-control bg-exito-suave px-4 py-3 text-center">
              <p class="text-[28px] leading-none font-bold text-texto">{{ disponibles() }}</p>
              <p class="mt-1 text-xs font-semibold text-exito">Listas para entregar</p>
            </div>
            <div class="rounded-control bg-gris-claro px-4 py-3 text-center ring-1 ring-borde">
              <p class="text-[28px] leading-none font-bold text-texto">{{ p.cantidad - p.entregadas }}</p>
              <p class="mt-1 text-xs font-semibold text-gris">Faltan del pedido</p>
            </div>
          </div>

          <div>
            <label class="etiqueta" for="cantidad">Cantidad a entregar</label>
            <div class="relative">
              <input id="cantidad" name="cantidad" type="number" inputmode="numeric" min="1" class="campo min-h-16 pr-24 text-2xl font-bold"
                [ngModel]="cantidad()" (ngModelChange)="cantidad.set($event)" />
              <span class="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[15px] font-medium text-gris">prendas</span>
            </div>
            <button type="button" (click)="cantidad.set(disponibles())" class="btn btn-gris mt-2 min-h-11 text-sm">Entregar todas las listas</button>
          </div>
          <div>
            <label class="etiqueta" for="nota">Nota <span class="font-normal text-gris">(opcional)</span></label>
            <input id="nota" name="nota" class="campo" [(ngModel)]="nota" placeholder="Ej: recibió el entrenador" />
          </div>
        }

        @if (error()) {
          <p class="flex items-start gap-2 rounded-control bg-error-suave px-4 py-3 text-[15px] font-medium text-error" role="alert">
            <svg lucideIcon="circle-alert" class="mt-0.5 size-5 shrink-0"></svg> {{ error() }}
          </p>
        }
      </div>

      <button type="submit" class="btn btn-primario min-h-14 w-full" [disabled]="!pedido()">
        <svg lucideIcon="package-check" class="size-5"></svg> Registrar entrega
      </button>
    </form>
  `
})
export class RegistrarEntrega implements OnInit {
  entregas = inject(EntregasService);
  private pedidos = inject(PedidosService);
  private produccion = inject(ProduccionService);
  private aviso = inject(AvisoService);

  // viene de la url: /entregas/registrar?pedido=3
  pedidoParam = input('', { alias: 'pedido' });

  pedidoId = signal(0);
  cantidad = signal<number | null>(null);
  nota = '';
  error = signal('');

  pedido = computed(() => this.pedidos.lista().find(p => p.id == this.pedidoId()));

  imagen = computed(() => {
    const p = this.pedido();
    if (!p) {
      return '';
    }
    return imagenPrenda(p);
  });

  disponibles = computed(() => {
    const p = this.pedido();
    if (!p) {
      return 0;
    }
    this.produccion.registros();
    return this.produccion.porEntregar(p);
  });

  ngOnInit() {
    if (this.pedidoParam()) {
      this.elegir(Number(this.pedidoParam()));
    }
  }

  elegir(id: number) {
    this.pedidoId.set(Number(id));
    this.error.set('');
    this.cantidad.set(this.disponibles());
  }

  guardar() {
    this.error.set('');
    const mensaje = this.entregas.registrar(this.pedidoId(), Number(this.cantidad()) || 0, this.nota);
    if (mensaje) {
      this.error.set(mensaje);
      return;
    }
    this.aviso.mostrar('Entrega registrada');
    this.nota = '';
    this.cantidad.set(this.disponibles());
    if (this.disponibles() == 0) {
      this.pedidoId.set(0);
    }
  }
}
