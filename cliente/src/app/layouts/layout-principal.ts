import { Component, computed, inject, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { AvisoService } from '../core/aviso.service';
import { MenuService } from '../core/menu.service';
import { SesionService } from '../core/sesion.service';
import { NotificacionesService } from '../services/notificaciones.service';
import { RoleAvatar } from '../shared/componentes/role-avatar';
import { SelectorUsuario } from '../shared/componentes/selector-usuario';
import { fechaCorta, hoy } from '../shared/fechas';

interface OpcionMenu {
  texto: string;
  ruta: string;
  icono: string;
}

@Component({
  selector: 'app-layout-principal',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideDynamicIcon, RoleAvatar, SelectorUsuario],
  templateUrl: './layout-principal.html'
})
export class LayoutPrincipal {
  private router = inject(Router);
  sesion = inject(SesionService);
  notificaciones = inject(NotificacionesService);
  aviso = inject(AvisoService);
  menu = inject(MenuService);

  fechaHoy = fechaCorta(hoy());

  // ruta actual, para saber si se muestra el encabezado grande de inicio
  rutaActual = signal(this.router.url);
  // se muestra una barra de carga mientras se abre una pantalla
  cargando = signal(false);
  perfilAbierto = signal(false);

  constructor() {
    this.router.events.subscribe(evento => {
      if (evento instanceof NavigationStart) {
        this.cargando.set(true);
      }
      if (evento instanceof NavigationEnd) {
        this.cargando.set(false);
        this.rutaActual.set(evento.urlAfterRedirects);
        this.menu.cerrar();
        this.perfilAbierto.set(false);
      }
      if (evento instanceof NavigationCancel || evento instanceof NavigationError) {
        this.cargando.set(false);
      }
    });
  }

  esInicio = computed(() => this.rutaActual().split('?')[0] == '/inicio');

  // en celular el saludo es corto para que quepa en una linea
  saludoCorto = computed(() => 'Hola, ' + this.sesion.usuario().nombre.split(' ')[0]);

  // opciones principales segun el rol (en celular el administrador tiene ademas "Más")
  principales = computed(() => {
    const rol = this.sesion.usuario().rol;
    if (rol == 'disenador') {
      return [
        { texto: 'Inicio', ruta: '/inicio', icono: 'house' },
        { texto: 'Diseños', ruta: '/disenos', icono: 'palette' },
        { texto: 'Historial', ruta: '/historial', icono: 'history' },
        { texto: 'Perfil', ruta: '/perfil', icono: 'circle-user' }
      ];
    }
    if (rol == 'operario') {
      return [
        { texto: 'Inicio', ruta: '/inicio', icono: 'house' },
        { texto: 'Mis trabajos', ruta: '/mis-trabajos', icono: 'clipboard-check' },
        { texto: 'Historial', ruta: '/historial', icono: 'history' },
        { texto: 'Perfil', ruta: '/perfil', icono: 'circle-user' }
      ];
    }
    return [
      { texto: 'Inicio', ruta: '/inicio', icono: 'house' },
      { texto: 'Pedidos', ruta: '/pedidos', icono: 'clipboard-list' },
      { texto: 'Producción', ruta: '/produccion', icono: 'layers' },
      { texto: 'Pagos', ruta: '/pagos', icono: 'wallet' }
    ];
  });

  // modulos extra, solo el administrador los tiene
  secundarias = computed(() => {
    const lista: OpcionMenu[] = [];
    if (this.sesion.esAdmin()) {
      lista.push({ texto: 'Diseños', ruta: '/disenos', icono: 'palette' });
      lista.push({ texto: 'Empleados', ruta: '/empleados', icono: 'users' });
      lista.push({ texto: 'Clientes', ruta: '/clientes', icono: 'user-round' });
      lista.push({ texto: 'Agenda de entregas', ruta: '/agenda', icono: 'calendar-days' });
      lista.push({ texto: 'Anticipos y saldos', ruta: '/saldos', icono: 'hand-coins' });
      lista.push({ texto: 'Ingresos y gastos', ruta: '/finanzas', icono: 'arrow-left-right' });
      lista.push({ texto: 'Prendas dañadas', ruta: '/produccion/danadas', icono: 'triangle-alert' });
      lista.push({ texto: 'Inventario', ruta: '/inventario', icono: 'package' });
      lista.push({ texto: 'Notificaciones', ruta: '/notificaciones', icono: 'bell' });
      lista.push({ texto: 'Configuración', ruta: '/configuracion', icono: 'settings' });
    }
    return lista;
  });

  // la opcion activa se dibuja un poco mas gruesa
  grosorIcono(activa: boolean): number {
    if (activa) {
      return 2.2;
    }
    return 1.8;
  }

  cerrarMenus() {
    this.menu.cerrar();
    this.perfilAbierto.set(false);
  }

  buscar(evento: Event) {
    evento.preventDefault();
    const campo = (evento.target as HTMLFormElement).elements.namedItem('buscar') as HTMLInputElement;
    this.router.navigate(['/pedidos'], { queryParams: { q: campo.value.trim() } });
    campo.value = '';
  }
}
