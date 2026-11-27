import { Injectable, computed, inject, signal } from '@angular/core';
import { AlmacenamientoService } from '../core/almacenamiento.service';
import { Pago } from '../models/pago';
import { RegistroProduccion } from '../models/produccion';
import { nuevoId } from '../shared/constantes';
import { ahora, soloFecha } from '../shared/fechas';
import { EmpleadosService } from './empleados.service';
import { FinanzasService } from './finanzas.service';
import { NotificacionesService } from './notificaciones.service';
import { ProduccionService } from './produccion.service';

@Injectable({ providedIn: 'root' })
export class PagosService {
  private almacen = inject(AlmacenamientoService);
  private produccion = inject(ProduccionService);
  private empleados = inject(EmpleadosService);
  private finanzas = inject(FinanzasService);
  private notificaciones = inject(NotificacionesService);

  lista = signal<Pago[]>(this.almacen.leer('pagos', []));

  recientes = computed(() => {
    const resultado = this.lista().slice();
    resultado.sort((a, b) => b.fecha.localeCompare(a.fecha));
    return resultado;
  });

  // trabajos aprobados que todavia se deben, filtrados por fechas
  pendientes(empleadoId: number, desde: string, hasta: string): RegistroProduccion[] {
    const resultado = this.produccion.registros().filter(r => {
      if (r.empleadoId != empleadoId || !r.aprobado || r.abonado >= r.total) {
        return false;
      }
      const dia = soloFecha(r.fecha);
      if (desde && dia < desde) {
        return false;
      }
      if (hasta && dia > hasta) {
        return false;
      }
      return true;
    });
    // los mas viejos primero, asi se pagan en orden
    resultado.sort((a, b) => a.fecha.localeCompare(b.fecha));
    return resultado;
  }

  porAprobar(empleadoId: number): RegistroProduccion[] {
    return this.produccion.registros().filter(r => r.empleadoId == empleadoId && !r.aprobado);
  }

  totalPendiente(empleadoId: number): number {
    let total = 0;
    for (const r of this.pendientes(empleadoId, '', '')) {
      total = total + (r.total - r.abonado);
    }
    return total;
  }

  delEmpleado(empleadoId: number): Pago[] {
    return this.recientes().filter(p => p.empleadoId == empleadoId);
  }

  totalPagado(empleadoId: number): number {
    let total = 0;
    for (const p of this.delEmpleado(empleadoId)) {
      total = total + p.valor;
    }
    return total;
  }

  // registra un pago completo o parcial, devuelve un error o vacio
  registrarPago(empleadoId: number, registros: RegistroProduccion[], valor: number, nota: string): string {
    const empleado = this.empleados.obtener(empleadoId);
    if (!empleado) {
      return 'Selecciona un empleado';
    }
    let deuda = 0;
    for (const r of registros) {
      deuda = deuda + (r.total - r.abonado);
    }
    if (deuda <= 0) {
      return 'No hay trabajos pendientes por pagar';
    }
    if (!valor || valor <= 0) {
      return 'Escribe el valor a pagar';
    }
    if (valor > deuda) {
      return 'El valor es mayor a lo que se debe';
    }

    // evita pagos duplicados por tocar dos veces el boton
    const ultimo = this.delEmpleado(empleadoId)[0];
    if (ultimo && ultimo.valor == valor) {
      const segundos = (new Date().getTime() - new Date(ultimo.fecha).getTime()) / 1000;
      if (segundos < 60) {
        return 'Este pago ya se registró hace un momento';
      }
    }

    // reparte el dinero entre los trabajos, del mas viejo al mas nuevo
    let restante = valor;
    const pagados: number[] = [];
    for (const r of registros) {
      if (restante <= 0) {
        break;
      }
      const debe = r.total - r.abonado;
      let abono = debe;
      if (restante < debe) {
        abono = restante;
      }
      this.produccion.abonar(r.id, abono);
      pagados.push(r.id);
      restante = restante - abono;
    }

    let tipo: 'completo' | 'parcial' = 'completo';
    if (valor < deuda) {
      tipo = 'parcial';
    }
    const lista = this.lista().slice();
    lista.push({
      id: nuevoId(lista),
      empleadoId: empleado.id,
      empleadoNombre: empleado.nombre,
      fecha: ahora(),
      valor: valor,
      tipo: tipo,
      registros: pagados,
      nota: nota.trim()
    });
    this.lista.set(lista);
    this.almacen.guardar('pagos', lista);

    this.finanzas.registrar('gasto', 'Pago a ' + empleado.nombre, valor);
    this.notificaciones.enviar('pago', 'Pago registrado',
      'Se pagaron ' + this.formato(valor) + ' a ' + empleado.nombre + '.', ['admin', 'operario'], '/pagos', [], empleado.id);
    return '';
  }

  private formato(valor: number): string {
    return '$ ' + valor.toLocaleString('es-CO');
  }
}
