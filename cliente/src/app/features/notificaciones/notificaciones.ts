import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { SesionService } from '../../core/sesion.service';
import { Notificacion } from '../../models/notificacion';
import { NotificacionesService } from '../../services/notificaciones.service';
import { Encabezado } from '../../shared/componentes/encabezado';
import { Vacio } from '../../shared/componentes/vacio';
import { RoleAvatar } from '../../shared/componentes/role-avatar';
import { FechaPipe } from '../../shared/pipes';

@Component({
  selector: 'app-notificaciones',
  imports: [LucideDynamicIcon, Encabezado, Vacio, RoleAvatar, FechaPipe],
  template: `
    <app-encabezado titulo="Notificaciones" [subtitulo]="notificaciones.sinLeer() + ' sin leer'">
      @if (notificaciones.sinLeer() > 0) {
        <button type="button" (click)="notificaciones.marcarTodas()" class="btn btn-secundario px-3" aria-label="Marcar todas como leídas">
          <svg lucideIcon="check-check" class="size-5"></svg>
          <span class="hidden sm:inline">Marcar leídas</span>
        </button>
      }
    </app-encabezado>

    <div class="tarjeta divide-y divide-borde p-0">
      @for (n of notificaciones.mias(); track n.id) {
        <button type="button" (click)="abrir(n)" class="flex w-full items-start gap-3 px-4 py-3.5 text-left active:bg-slate-50"
          [class.bg-gris-claro]="!n.leida">
          @if (n.especialidades.length > 0) {
            <app-role-avatar rol="operario" [especialidad]="n.especialidades[0]" [tamano]="40" />
          } @else {
            <div class="flex size-10 shrink-0 items-center justify-center rounded-full" [class]="colorTipo(n)">
              <svg [lucideIcon]="iconoTipo(n)" class="size-5"></svg>
            </div>
          }
          <div class="min-w-0 flex-1">
            <p class="text-[15px] text-texto" [class.font-semibold]="!n.leida">{{ n.titulo }}</p>
            <p class="text-sm text-gris">{{ n.mensaje }}</p>
            <p class="mt-0.5 text-xs text-gris">{{ n.fecha | fecha: 'completa' }}</p>
          </div>
          @if (!n.leida) { <span class="mt-2 size-2.5 shrink-0 rounded-full bg-rojo"></span> }
        </button>
      } @empty {
        <app-vacio icono="bell" mensaje="No tienes notificaciones." />
      }
    </div>
  `
})
export class Notificaciones {
  notificaciones = inject(NotificacionesService);
  private router = inject(Router);
  private sesion = inject(SesionService);

  abrir(n: Notificacion) {
    this.notificaciones.marcarLeida(n.id);
    let enlace = n.enlace;
    // el disenador y el operario no entran al detalle con dinero
    if (enlace.startsWith('/pedidos/') && this.sesion.esDisenador()) {
      enlace = enlace.replace('/pedidos/', '/disenos/');
    }
    if (enlace.startsWith('/pedidos/') && this.sesion.esOperario()) {
      enlace = enlace.replace('/pedidos/', '/produccion/pedido/');
    }
    // los operarios ven sus pagos en su historial
    if (enlace == '/pagos' && !this.sesion.esAdmin()) {
      enlace = '/historial';
    }
    // las rutas de operario no aplican para el administrador
    if (enlace == '/mis-trabajos' && !this.sesion.esOperario()) {
      enlace = '/produccion';
    }
    if (enlace) {
      this.router.navigateByUrl(enlace);
    }
  }

  iconoTipo(n: Notificacion): string {
    if (n.tipo == 'pedido') {
      return 'clipboard-list';
    }
    if (n.tipo == 'diseno') {
      return 'palette';
    }
    if (n.tipo == 'produccion') {
      return 'scissors';
    }
    if (n.tipo == 'entrega') {
      return 'truck';
    }
    if (n.tipo == 'pago') {
      return 'wallet';
    }
    return 'triangle-alert';
  }

  colorTipo(n: Notificacion): string {
    if (n.tipo == 'alerta') {
      return 'bg-error-suave text-error';
    }
    if (n.tipo == 'diseno') {
      return 'bg-lila text-violet-700';
    }
    if (n.tipo == 'pago') {
      return 'bg-exito-suave text-exito';
    }
    if (n.tipo == 'entrega') {
      return 'bg-alerta-suave text-amber-700';
    }
    return 'bg-rojo-suave text-rojo';
  }
}
