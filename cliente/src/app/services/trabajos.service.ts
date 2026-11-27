import { Injectable, computed, inject } from '@angular/core';
import { SesionService } from '../core/sesion.service';
import { Pedido, Proceso } from '../models/pedido';
import { oficio } from '../shared/oficios';
import { imagenPrenda } from '../shared/prendas';
import { EntregasService } from './entregas.service';
import { PedidosService } from './pedidos.service';
import { ProduccionService } from './produccion.service';

export interface Trabajo {
  pedido: Pedido;
  proceso: Proceso;
  imagen: string;
  disponibles: number;
  pendientes: number;
  hechas: number;
  asignadoAMi: boolean;
}

// trabajos del operario segun la especialidad que tenga activa
// el inicio y "mis trabajos" usan esto, asi no hay una pantalla distinta por oficio
@Injectable({ providedIn: 'root' })
export class TrabajosService {
  private sesion = inject(SesionService);
  private pedidos = inject(PedidosService);
  private produccion = inject(ProduccionService);
  private entregas = inject(EntregasService);

  oficioActivo = computed(() => oficio(this.sesion.especialidadActiva()));

  // trabajos de produccion: los asignados a mi o los que no tienen a nadie asignado
  trabajos = computed(() => {
    const resultado: Trabajo[] = [];
    const proceso = this.oficioActivo().proceso;
    const yo = this.sesion.usuario().empleadoId;
    if (proceso == '') {
      return resultado;
    }
    this.produccion.registros();
    for (const pedido of this.pedidos.activos()) {
      if (!pedido.procesos.includes(proceso) || pedido.estado == 'terminado') {
        continue;
      }
      const asignado = this.pedidos.asignadoA(pedido, proceso);
      if (asignado > 0 && asignado != yo) {
        continue;
      }
      const hechas = this.produccion.avance(pedido.id, proceso);
      const pendientes = pedido.cantidad - hechas;
      if (pendientes <= 0) {
        continue;
      }
      resultado.push({
        pedido: pedido,
        proceso: proceso,
        imagen: imagenPrenda(pedido),
        disponibles: this.produccion.disponibles(pedido, proceso),
        pendientes: pendientes,
        hechas: hechas,
        asignadoAMi: asignado == yo
      });
    }
    // primero lo asignado y luego lo que ya se puede trabajar
    resultado.sort((a, b) => {
      if (a.asignadoAMi != b.asignadoAMi) {
        if (a.asignadoAMi) {
          return -1;
        }
        return 1;
      }
      return b.disponibles - a.disponibles;
    });
    return resultado;
  });

  asignados = computed(() => this.trabajos().filter(t => t.asignadoAMi));

  totalDisponibles = computed(() => {
    let total = 0;
    for (const t of this.trabajos()) {
      total = total + t.disponibles;
    }
    return total;
  });

  totalPendientes = computed(() => {
    let total = 0;
    for (const t of this.trabajos()) {
      total = total + t.pendientes;
    }
    return total;
  });

  // prendas que yo registre en el proceso activo
  misHechas = computed(() => {
    const proceso = this.oficioActivo().proceso;
    const yo = this.sesion.usuario().empleadoId;
    let total = 0;
    for (const r of this.produccion.registros()) {
      if (r.empleadoId == yo && r.proceso == proceso) {
        total = total + r.cantidad;
      }
    }
    return total;
  });

  // ---------- empaque y entregas ----------

  totalPorEntregar = computed(() => {
    let total = 0;
    for (const p of this.entregas.listos()) {
      total = total + this.produccion.porEntregar(p);
    }
    return total;
  });

  misEntregadas = computed(() => {
    const yo = this.sesion.usuario().empleadoId;
    let total = 0;
    for (const item of this.entregas.historial()) {
      if (item.entrega.empleadoId == yo) {
        total = total + item.entrega.cantidad;
      }
    }
    return total;
  });
}
