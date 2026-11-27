import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { AvisoService } from '../../core/aviso.service';
import { EmpleadosService } from '../../services/empleados.service';
import { PagosService } from '../../services/pagos.service';
import { CabeceraTarjeta } from '../../shared/componentes/cabecera-tarjeta';
import { Encabezado } from '../../shared/componentes/encabezado';
import { MiniaturaPrenda } from '../../shared/componentes/miniatura-prenda';
import { RoleAvatar } from '../../shared/componentes/role-avatar';
import { imagenPorTipo } from '../../shared/prendas';
import { Vacio } from '../../shared/componentes/vacio';
import { FechaPipe, PesosPipe, ProcesoPipe } from '../../shared/pipes';

@Component({
  selector: 'app-liquidacion',
  imports: [FormsModule, RouterLink, LucideDynamicIcon, Encabezado, CabeceraTarjeta, MiniaturaPrenda, RoleAvatar, Vacio, FechaPipe, PesosPipe, ProcesoPipe],
  templateUrl: './liquidacion.html'
})
export class Liquidacion implements OnInit {
  private empleados = inject(EmpleadosService);
  private aviso = inject(AvisoService);
  pagos = inject(PagosService);

  // llega desde el detalle del empleado: /pagos?empleado=2
  empleado = input('');

  empleadoId = signal(0);
  desde = signal('');
  hasta = signal('');
  valor = signal<number | null>(null);
  nota = '';
  error = signal('');

  ngOnInit() {
    if (this.empleado()) {
      this.elegir(Number(this.empleado()));
    }
  }

  // empleados con su saldo pendiente, los que mas se les debe primero
  resumen = computed(() => {
    this.pagos.lista();
    const lista = this.empleados.lista().map(e => {
      return { empleado: e, pendiente: this.pagos.totalPendiente(e.id), porAprobar: this.pagos.porAprobar(e.id).length };
    });
    const resultado = lista.filter(item => item.pendiente > 0 || item.porAprobar > 0 || item.empleado.activo);
    resultado.sort((a, b) => b.pendiente - a.pendiente);
    return resultado;
  });

  totalGeneral = computed(() => {
    let total = 0;
    for (const item of this.resumen()) {
      total = total + item.pendiente;
    }
    return total;
  });

  elegido = computed(() => this.empleados.obtener(this.empleadoId()));

  trabajos = computed(() => {
    this.pagos.lista();
    return this.pagos.pendientes(this.empleadoId(), this.desde(), this.hasta());
  });

  porAprobar = computed(() => this.pagos.porAprobar(this.empleadoId()));

  deuda = computed(() => {
    let total = 0;
    for (const r of this.trabajos()) {
      total = total + (r.total - r.abonado);
    }
    return total;
  });

  imagenPorTipo = imagenPorTipo;

  // cantidad de prendas que suman los trabajos pendientes
  prendas = computed(() => {
    let total = 0;
    for (const r of this.trabajos()) {
      total = total + r.cantidad;
    }
    return total;
  });

  elegir(id: number) {
    this.empleadoId.set(id);
    this.desde.set('');
    this.hasta.set('');
    this.nota = '';
    this.error.set('');
    this.valor.set(this.pagos.totalPendiente(id));
  }

  mitad(): number {
    return Math.round(this.deuda() / 2);
  }

  cambiarFechas() {
    this.valor.set(this.deuda());
  }

  pagar() {
    this.error.set('');
    const e = this.elegido();
    if (!e) {
      return;
    }
    const valor = Number(this.valor()) || 0;
    if (!confirm('¿Registrar pago de $ ' + valor.toLocaleString('es-CO') + ' a ' + e.nombre + '?')) {
      return;
    }
    const mensaje = this.pagos.registrarPago(e.id, this.trabajos(), valor, this.nota);
    if (mensaje) {
      this.error.set(mensaje);
      return;
    }
    this.aviso.mostrar('Pago registrado');
    this.nota = '';
    this.valor.set(this.deuda());
  }
}
