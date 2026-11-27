import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { AvisoService } from '../../core/aviso.service';
import { Proceso } from '../../models/pedido';
import { EmpleadosService } from '../../services/empleados.service';
import { PedidosService } from '../../services/pedidos.service';
import { Icono } from '../../shared/componentes/icono';
import { especialidadDeProceso } from '../../shared/oficios';
import { iconoProceso } from '../../shared/prendas';
import { nombreProceso } from '../../shared/constantes';
import { ProduccionService } from '../../services/produccion.service';
import { FilaAvance } from '../../shared/componentes/fila-avance';
import { MiniaturaPrenda } from '../../shared/componentes/miniatura-prenda';
import { imagenPrenda } from '../../shared/prendas';
import { Encabezado } from '../../shared/componentes/encabezado';
import { EstadoPedidoChip } from '../../shared/componentes/estado-pedido';
import { Vacio } from '../../shared/componentes/vacio';
import { nombreEstadoDiseno } from '../../shared/constantes';
import { diasHasta } from '../../shared/fechas';
import { FechaPipe, PesosPipe } from '../../shared/pipes';
import { Jugadores } from './jugadores';

@Component({
  selector: 'app-detalle-pedido',
  imports: [FormsModule, RouterLink, LucideDynamicIcon, Encabezado, EstadoPedidoChip, FilaAvance, MiniaturaPrenda, Icono, Vacio, Jugadores,
    FechaPipe, PesosPipe],
  templateUrl: './detalle-pedido.html'
})
export class DetallePedido {
  private router = inject(Router);
  private aviso = inject(AvisoService);
  pedidos = inject(PedidosService);
  produccion = inject(ProduccionService);
  private empleados = inject(EmpleadosService);

  id = input('');
  // si el pedido lleva jugadores se abre esa pestaña primero
  pestanaElegida = signal('');
  pestana = computed(() => {
    if (this.pestanaElegida()) {
      return this.pestanaElegida();
    }
    const p = this.pedido();
    if (p && p.personalizado) {
      return 'jugadores';
    }
    return 'detalles';
  });
  valorAbono = 0;
  diferencias = signal<string[]>([]);

  pedido = computed(() => this.pedidos.lista().find(p => p.id == Number(this.id())));

  atrasado = computed(() => {
    const p = this.pedido();
    if (!p || p.estado == 'entregado' || p.estado == 'cancelado') {
      return false;
    }
    return diasHasta(p.fechaEntrega) < 0;
  });

  // avance de cada proceso del pedido
  avances = computed(() => {
    const p = this.pedido();
    if (!p) {
      return [];
    }
    this.produccion.registros();
    return p.procesos.map(proceso => {
      return { proceso: proceso, hecho: this.produccion.avance(p.id, proceso), danadas: this.produccion.danadas(p.id, proceso) };
    });
  });

  imagen = computed(() => {
    const p = this.pedido();
    if (!p) {
      return '';
    }
    return imagenPrenda(p);
  });

  procesoActual = computed(() => {
    const p = this.pedido();
    if (!p) {
      return '';
    }
    this.produccion.registros();
    return this.produccion.procesoActual(p);
  });

  abierto = computed(() => {
    const p = this.pedido();
    if (!p) {
      return false;
    }
    return p.estado != 'entregado' && p.estado != 'cancelado';
  });

  // ---------- asignar trabajos ----------

  // trabajadores activos con la especialidad del proceso
  candidatos(proceso: Proceso) {
    return this.empleados.conEspecialidad(especialidadDeProceso(proceso));
  }

  asignado(proceso: Proceso): number {
    const p = this.pedido();
    if (!p) {
      return 0;
    }
    return this.pedidos.asignadoA(p, proceso);
  }

  asignar(proceso: Proceso, empleadoId: number) {
    const p = this.pedido();
    if (!p) {
      return;
    }
    this.pedidos.asignar(p.id, proceso, Number(empleadoId));
    if (Number(empleadoId) > 0) {
      this.aviso.mostrar(nombreProceso(proceso) + ' asignado');
    } else {
      this.aviso.mostrar('Cualquiera puede hacer ' + nombreProceso(proceso).toLowerCase());
    }
  }

  icono(proceso: string): string {
    return iconoProceso(proceso);
  }

  nombre(proceso: string): string {
    return nombreProceso(proceso);
  }

  textoDiseno(): string {
    const p = this.pedido();
    if (!p) {
      return '';
    }
    return nombreEstadoDiseno(p.estadoDiseno);
  }

  saldo(): number {
    const p = this.pedido();
    if (!p) {
      return 0;
    }
    return this.pedidos.saldo(p);
  }

  registrarAbono() {
    const p = this.pedido();
    if (!p) {
      return;
    }
    const error = this.pedidos.registrarAbono(p.id, Number(this.valorAbono) || 0);
    if (error) {
      this.aviso.mostrar(error, 'error');
      return;
    }
    this.valorAbono = 0;
    this.aviso.mostrar('Abono registrado');
  }

  finalizar() {
    const p = this.pedido();
    if (!p) {
      return;
    }
    const lista = this.produccion.finalizar(p.id);
    this.diferencias.set(lista);
    if (lista.length == 0) {
      this.aviso.mostrar('Pedido listo para entregar');
    } else {
      this.aviso.mostrar('Las cantidades no coinciden', 'error');
    }
  }

  entregar() {
    const p = this.pedido();
    if (!p) {
      return;
    }
    if (this.saldo() > 0 && !confirm('El cliente todavía debe ' + this.saldo().toLocaleString('es-CO') + ' pesos. ¿Entregar de todas formas?')) {
      return;
    }
    this.pedidos.cambiarEstado(p.id, 'entregado');
    this.aviso.mostrar('Pedido entregado');
  }

  cancelar() {
    const p = this.pedido();
    if (!p) {
      return;
    }
    if (!confirm('¿Seguro que quieres cancelar el pedido ' + p.numero + '?')) {
      return;
    }
    this.pedidos.cambiarEstado(p.id, 'cancelado');
    this.aviso.mostrar('Pedido cancelado');
    this.router.navigateByUrl('/pedidos');
  }

  reactivar() {
    const p = this.pedido();
    if (!p) {
      return;
    }
    this.pedidos.cambiarEstado(p.id, 'pendiente');
    this.aviso.mostrar('Pedido reactivado');
  }
}
