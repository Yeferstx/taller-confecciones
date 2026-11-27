import { Routes } from '@angular/router';
import { rolGuard } from './core/rol.guard';
import { LayoutPrincipal } from './layouts/layout-principal';

// roles que pueden entrar a cada pantalla
const ADMIN = { roles: ['admin'] };
const ADMIN_OPERARIO = { roles: ['admin', 'operario'] };
const ADMIN_DISENADOR = { roles: ['admin', 'disenador'] };
const OPERARIO = { roles: ['operario'] };

export const routes: Routes = [
  {
    path: '',
    component: LayoutPrincipal,
    canActivateChild: [rolGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      { path: 'inicio', loadComponent: () => import('./features/inicio/inicio').then(m => m.Inicio) },
      { path: 'mis-trabajos', data: OPERARIO, loadComponent: () => import('./features/trabajos/mis-trabajos').then(m => m.MisTrabajos) },
      { path: 'historial', loadComponent: () => import('./features/historial/historial').then(m => m.Historial) },
      { path: 'perfil', loadComponent: () => import('./features/perfil/perfil').then(m => m.Perfil) },
      { path: 'entregas/registrar', data: ADMIN_OPERARIO, loadComponent: () => import('./features/entregas/registrar-entrega').then(m => m.RegistrarEntrega) },

      { path: 'pedidos', data: ADMIN, loadComponent: () => import('./features/pedidos/lista-pedidos').then(m => m.ListaPedidos) },
      { path: 'pedidos/nuevo', data: ADMIN, loadComponent: () => import('./features/pedidos/formulario-pedido').then(m => m.FormularioPedido) },
      { path: 'pedidos/:id', data: ADMIN, loadComponent: () => import('./features/pedidos/detalle-pedido').then(m => m.DetallePedido) },
      { path: 'pedidos/:id/editar', data: ADMIN, loadComponent: () => import('./features/pedidos/formulario-pedido').then(m => m.FormularioPedido) },

      { path: 'disenos', data: ADMIN_DISENADOR, loadComponent: () => import('./features/disenos/lista-disenos').then(m => m.ListaDisenos) },
      { path: 'disenos/:id', data: ADMIN_DISENADOR, loadComponent: () => import('./features/disenos/detalle-diseno').then(m => m.DetalleDiseno) },

      { path: 'produccion', data: ADMIN_OPERARIO, loadComponent: () => import('./features/produccion/produccion').then(m => m.Produccion) },
      { path: 'produccion/registrar', data: ADMIN_OPERARIO, loadComponent: () => import('./features/produccion/registrar-produccion').then(m => m.RegistrarProduccion) },
      { path: 'produccion/pedido/:id', data: ADMIN_OPERARIO, loadComponent: () => import('./features/produccion/produccion-pedido').then(m => m.ProduccionPedido) },
      { path: 'produccion/danadas', data: ADMIN, loadComponent: () => import('./features/produccion/prendas-danadas').then(m => m.PrendasDanadas) },

      { path: 'empleados', data: ADMIN, loadComponent: () => import('./features/empleados/lista-empleados').then(m => m.ListaEmpleados) },
      { path: 'empleados/nuevo', data: ADMIN, loadComponent: () => import('./features/empleados/formulario-empleado').then(m => m.FormularioEmpleado) },
      { path: 'empleados/:id', data: ADMIN, loadComponent: () => import('./features/empleados/detalle-empleado').then(m => m.DetalleEmpleado) },
      { path: 'empleados/:id/editar', data: ADMIN, loadComponent: () => import('./features/empleados/formulario-empleado').then(m => m.FormularioEmpleado) },

      { path: 'pagos', data: ADMIN, loadComponent: () => import('./features/pagos/liquidacion').then(m => m.Liquidacion) },
      { path: 'pagos/historial', data: ADMIN, loadComponent: () => import('./features/pagos/historial-pagos').then(m => m.HistorialPagos) },

      { path: 'clientes', data: ADMIN, loadComponent: () => import('./features/clientes/clientes').then(m => m.Clientes) },
      { path: 'agenda', loadComponent: () => import('./features/agenda/agenda').then(m => m.Agenda) },
      { path: 'saldos', data: ADMIN, loadComponent: () => import('./features/finanzas/saldos').then(m => m.Saldos) },
      { path: 'finanzas', data: ADMIN, loadComponent: () => import('./features/finanzas/finanzas').then(m => m.Finanzas) },
      { path: 'inventario', data: ADMIN, loadComponent: () => import('./features/inventario/inventario').then(m => m.Inventario) },
      { path: 'notificaciones', loadComponent: () => import('./features/notificaciones/notificaciones').then(m => m.Notificaciones) },
      { path: 'configuracion', data: ADMIN, loadComponent: () => import('./features/configuracion/configuracion').then(m => m.ConfiguracionPagina) }
    ]
  },
  { path: '**', redirectTo: '' }
];
