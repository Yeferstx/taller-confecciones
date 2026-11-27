import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SesionService } from '../../core/sesion.service';
import { Pedido } from '../../models/pedido';
import { PedidosService } from '../../services/pedidos.service';
import { Encabezado } from '../../shared/componentes/encabezado';
import { Vacio } from '../../shared/componentes/vacio';
import { diasHasta } from '../../shared/fechas';
import { FechaPipe } from '../../shared/pipes';

interface Grupo {
  titulo: string;
  color: string;
  pedidos: Pedido[];
}

// entregas agrupadas: atrasadas, hoy, esta semana y despues
@Component({
  selector: 'app-agenda',
  imports: [RouterLink, Encabezado, Vacio, FechaPipe],
  template: `
    <app-encabezado titulo="Agenda de entregas" [subtitulo]="pedidos.activos().length + ' pedidos por entregar'" />

    @for (g of grupos(); track g.titulo) {
      @if (g.pedidos.length > 0) {
        <h2 class="titulo-seccion" [class]="g.color">{{ g.titulo }}</h2>
        <div class="tarjeta mb-6 divide-y divide-borde p-0">
          @for (p of g.pedidos; track p.id) {
            <a [routerLink]="enlace(p)" class="flex items-center gap-4 px-4 py-3 active:bg-slate-50">
              <div class="w-14 shrink-0 text-center">
                <p class="text-xs font-semibold text-gris uppercase">{{ (p.fechaEntrega | fecha).split(' ')[0] }}</p>
                <p class="text-xl leading-tight font-bold text-texto">{{ p.fechaEntrega.substring(8, 10) }}</p>
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-[15px] font-semibold text-texto">{{ p.equipo }}</p>
                <p class="truncate text-sm text-gris">{{ p.numero }} · {{ p.cantidad }} {{ p.tipoPrenda.toLowerCase() }}</p>
              </div>
              <span class="shrink-0 text-sm font-medium" [class]="g.color">{{ p.fechaEntrega | fecha: 'entrega' }}</span>
            </a>
          }
        </div>
      }
    }
    @if (pedidos.activos().length == 0) {
      <app-vacio icono="calendar-days" mensaje="No hay entregas pendientes." />
    }
  `
})
export class Agenda {
  pedidos = inject(PedidosService);
  private sesion = inject(SesionService);

  grupos = computed(() => {
    const atrasados: Pedido[] = [];
    const hoy: Pedido[] = [];
    const semana: Pedido[] = [];
    const despues: Pedido[] = [];
    for (const p of this.pedidos.activos()) {
      const dias = diasHasta(p.fechaEntrega);
      if (dias < 0) {
        atrasados.push(p);
      } else if (dias == 0) {
        hoy.push(p);
      } else if (dias <= 7) {
        semana.push(p);
      } else {
        despues.push(p);
      }
    }
    const resultado: Grupo[] = [
      { titulo: 'Atrasados', color: 'text-error', pedidos: atrasados },
      { titulo: 'Hoy', color: 'text-rojo', pedidos: hoy },
      { titulo: 'Próximos 7 días', color: 'text-texto', pedidos: semana },
      { titulo: 'Más adelante', color: 'text-gris', pedidos: despues }
    ];
    return resultado;
  });

  // cada rol abre el pedido en su propia pantalla
  enlace(pedido: Pedido): string {
    if (this.sesion.esDisenador()) {
      return '/disenos/' + pedido.id;
    }
    if (this.sesion.esOperario()) {
      return '/produccion/pedido/' + pedido.id;
    }
    return '/pedidos/' + pedido.id;
  }
}
