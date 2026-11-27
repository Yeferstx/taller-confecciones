import { Injectable, computed, inject } from '@angular/core';
import { SesionService } from '../core/sesion.service';
import { Entrega, Pedido } from '../models/pedido';
import { nuevoId } from '../shared/constantes';
import { ahora } from '../shared/fechas';
import { NotificacionesService } from './notificaciones.service';
import { PedidosService } from './pedidos.service';
import { ProduccionService } from './produccion.service';

export interface EntregaConPedido {
  pedido: Pedido;
  entrega: Entrega;
}

// entregas completas o parciales de los pedidos
@Injectable({ providedIn: 'root' })
export class EntregasService {
  private pedidos = inject(PedidosService);
  private produccion = inject(ProduccionService);
  private sesion = inject(SesionService);
  private notificaciones = inject(NotificacionesService);

  // pedidos que tienen prendas terminadas sin entregar
  listos = computed(() => {
    this.produccion.registros();
    return this.pedidos.activos().filter(p => this.produccion.porEntregar(p) > 0);
  });

  // todas las entregas registradas, las mas nuevas primero
  historial = computed(() => {
    const lista: EntregaConPedido[] = [];
    for (const p of this.pedidos.lista()) {
      for (const e of p.entregas) {
        lista.push({ pedido: p, entrega: e });
      }
    }
    lista.sort((a, b) => b.entrega.fecha.localeCompare(a.entrega.fecha));
    return lista;
  });

  // devuelve un error o vacio si se guardo
  registrar(pedidoId: number, cantidad: number, nota: string): string {
    const pedido = this.pedidos.obtener(pedidoId);
    if (!pedido) {
      return 'Selecciona el pedido';
    }
    const valor = Math.floor(Number(cantidad) || 0);
    if (valor <= 0) {
      return 'Escribe cuántas prendas se entregan';
    }
    const disponibles = this.produccion.porEntregar(pedido);
    if (valor > disponibles) {
      return 'Solo hay ' + disponibles + ' prendas terminadas para entregar';
    }
    // evita registrar dos veces la misma entrega
    const ultima = pedido.entregas[pedido.entregas.length - 1];
    if (ultima && ultima.cantidad == valor) {
      const segundos = (new Date().getTime() - new Date(ultima.fecha).getTime()) / 1000;
      if (segundos < 60) {
        return 'Esta entrega ya se registró hace un momento';
      }
    }

    const usuario = this.sesion.usuario();
    const entrega: Entrega = {
      id: nuevoId(pedido.entregas),
      fecha: ahora(),
      cantidad: valor,
      empleadoId: usuario.empleadoId,
      nombre: usuario.nombre,
      nota: nota.trim()
    };
    this.pedidos.agregarEntrega(pedido.id, entrega);

    let texto = 'parcial';
    if (pedido.entregadas + valor >= pedido.cantidad) {
      texto = 'completa';
    }
    this.notificaciones.enviar('entrega', 'Entrega ' + texto + ' registrada',
      pedido.numero + ' ' + pedido.equipo + ': se entregaron ' + valor + ' prendas.', ['admin'], '/pedidos/' + pedido.id);
    return '';
  }
}
