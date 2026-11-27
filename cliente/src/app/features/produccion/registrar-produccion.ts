import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideDynamicIcon } from '@lucide/angular';
import { AvisoService } from '../../core/aviso.service';
import { SesionService } from '../../core/sesion.service';
import { Proceso } from '../../models/pedido';
import { EmpleadosService } from '../../services/empleados.service';
import { PedidosService } from '../../services/pedidos.service';
import { ProduccionService } from '../../services/produccion.service';
import { CabeceraTarjeta } from '../../shared/componentes/cabecera-tarjeta';
import { FilaAvance } from '../../shared/componentes/fila-avance';
import { MiniaturaPrenda } from '../../shared/componentes/miniatura-prenda';
import { iconoProceso, imagenPrenda } from '../../shared/prendas';
import { oficio } from '../../shared/oficios';
import { Icono } from '../../shared/componentes/icono';
import { Encabezado } from '../../shared/componentes/encabezado';
import { PROCESOS } from '../../shared/constantes';
import { PesosPipe, ProcesoPipe } from '../../shared/pipes';

@Component({
  selector: 'app-registrar-produccion',
  imports: [FormsModule, LucideDynamicIcon, Encabezado, CabeceraTarjeta, FilaAvance, MiniaturaPrenda, Icono, PesosPipe, ProcesoPipe],
  templateUrl: './registrar-produccion.html'
})
export class RegistrarProduccion implements OnInit {
  sesion = inject(SesionService);
  pedidos = inject(PedidosService);
  empleados = inject(EmpleadosService);
  private produccion = inject(ProduccionService);
  private aviso = inject(AvisoService);

  // pueden llegar por la url: /produccion/registrar?pedido=1&proceso=corte
  pedido = input('');
  proceso = input('');

  procesos = PROCESOS;
  iconoProceso = iconoProceso;

  pedidoId = signal(0);
  procesoElegido = signal<Proceso | ''>('');
  empleadoId = signal(0);
  cantidad = signal<number | null>(null);
  danadas = signal<number | null>(null);
  verDanadas = signal(false);
  autorizar = signal(false);
  error = signal('');

  ngOnInit() {
    if (this.pedido()) {
      this.pedidoId.set(Number(this.pedido()));
    }
    if (this.proceso()) {
      this.procesoElegido.set(this.proceso() as Proceso);
    }
    if (this.sesion.esOperario()) {
      this.empleadoId.set(this.sesion.usuario().empleadoId);
      // si no llega el proceso se usa el de su especialidad activa
      const permitidos = this.procesosPermitidos();
      if (!this.procesoElegido() || !permitidos.includes(this.procesoElegido() as Proceso)) {
        const delOficio = oficio(this.sesion.especialidadActiva()).proceso;
        if (delOficio != '' && permitidos.includes(delOficio)) {
          this.procesoElegido.set(delOficio);
        } else if (permitidos.length > 0) {
          this.procesoElegido.set(permitidos[0]);
        }
      }
    }
  }

  // el operario solo ve los procesos de sus especialidades
  procesosPermitidos = computed(() => {
    if (!this.sesion.esOperario()) {
      return PROCESOS;
    }
    const e = this.sesion.empleado();
    if (!e) {
      return [];
    }
    return e.procesos;
  });

  // si solo tiene una actividad no se le pregunta
  mostrarProcesos = computed(() => this.procesosPermitidos().length > 1);

  // titulo y boton segun la actividad elegida
  textoTitulo = computed(() => {
    const proceso = this.procesoElegido();
    if (this.sesion.esOperario() && proceso) {
      for (const o of [oficio('cortador'), oficio('impresor'), oficio('sublimador'), oficio('confeccionista')]) {
        if (o.proceso == proceso) {
          return o.accion;
        }
      }
    }
    return 'Registrar producción';
  });

  iconoTitulo = computed(() => {
    const proceso = this.procesoElegido();
    if (proceso) {
      return iconoProceso(proceso);
    }
    return 'layers';
  });

  disponibles = computed(() => {
    const p = this.pedidoElegido();
    const proceso = this.procesoElegido();
    if (!p || !proceso) {
      return 0;
    }
    this.produccion.registros();
    return this.produccion.disponibles(p, proceso);
  });

  // solo pedidos donde se puede registrar trabajo
  // al operario se le muestran los que tienen prendas disponibles y no estan asignados a otra persona
  pedidosAbiertos = computed(() => {
    const abiertos = this.pedidos.activos().filter(p => p.estado != 'terminado');
    const proceso = this.procesoElegido();
    if (!this.sesion.esOperario() || !proceso) {
      return abiertos;
    }
    this.produccion.registros();
    const yo = this.sesion.usuario().empleadoId;
    return abiertos.filter(p => {
      if (p.id == this.pedidoId()) {
        return true;
      }
      if (!p.procesos.includes(proceso)) {
        return false;
      }
      const asignado = this.pedidos.asignadoA(p, proceso);
      if (asignado > 0 && asignado != yo) {
        return false;
      }
      return this.produccion.disponibles(p, proceso) > 0;
    });
  });

  pedidoElegido = computed(() => this.pedidos.lista().find(p => p.id == this.pedidoId()));

  hecho = computed(() => {
    const p = this.pedidoElegido();
    const proceso = this.procesoElegido();
    if (!p || !proceso) {
      return 0;
    }
    this.produccion.registros();
    return this.produccion.avance(p.id, proceso);
  });

  // avance de todos los procesos del pedido elegido
  avancesPedido = computed(() => {
    const p = this.pedidoElegido();
    if (!p) {
      return [];
    }
    this.produccion.registros();
    return p.procesos.map(proceso => {
      return { proceso: proceso, hecho: this.produccion.avance(p.id, proceso) };
    });
  });

  imagenPedido = computed(() => {
    const p = this.pedidoElegido();
    if (!p) {
      return '';
    }
    return imagenPrenda(p);
  });

  faltan = computed(() => {
    const p = this.pedidoElegido();
    if (!p) {
      return 0;
    }
    return p.cantidad - this.hecho();
  });

  // trabajadores activos que hacen el proceso elegido
  trabajadores = computed(() => {
    const proceso = this.procesoElegido();
    if (!proceso) {
      return this.empleados.activos();
    }
    return this.empleados.activos().filter(e => e.procesos.includes(proceso));
  });

  nombreOperario = computed(() => {
    const empleado = this.empleados.obtener(this.sesion.usuario().empleadoId);
    if (!empleado) {
      return '';
    }
    return empleado.nombre;
  });

  tarifa = computed(() => {
    const p = this.pedidoElegido();
    const proceso = this.procesoElegido();
    if (!p || !proceso || !this.empleadoId()) {
      return 0;
    }
    return this.empleados.tarifa(this.empleadoId(), p.tipoPrenda, proceso);
  });

  excede = computed(() => {
    const cantidad = Number(this.cantidad()) || 0;
    return this.pedidoElegido() != undefined && this.procesoElegido() != '' && cantidad > this.faltan();
  });

  volver(): string {
    if (this.sesion.esOperario()) {
      return '/inicio';
    }
    return '/produccion';
  }

  // columnas de los botones de proceso segun cuantos tenga
  claseProcesos(): string {
    const cantidad = this.procesosPermitidos().length;
    if (cantidad > 3) {
      return 'grid-cols-2 sm:grid-cols-4';
    }
    if (cantidad == 3) {
      return 'grid-cols-3';
    }
    return 'grid-cols-2';
  }

  cambiarPedido(id: number) {
    this.pedidoId.set(Number(id));
    this.error.set('');
    const p = this.pedidoElegido();
    const proceso = this.procesoElegido();
    if (p && proceso && !p.procesos.includes(proceso)) {
      this.procesoElegido.set('');
    }
  }

  elegirProceso(proceso: Proceso) {
    this.procesoElegido.set(proceso);
    this.error.set('');
    // si el trabajador elegido no hace ese proceso se limpia
    if (!this.sesion.esOperario()) {
      const empleado = this.empleados.obtener(this.empleadoId());
      if (empleado && !empleado.procesos.includes(proceso)) {
        this.empleadoId.set(0);
      }
    }
  }

  guardar() {
    this.error.set('');
    const proceso = this.procesoElegido();
    if (!this.pedidoId()) {
      this.error.set('Selecciona el pedido');
      return;
    }
    if (!proceso) {
      this.error.set('Selecciona el proceso');
      return;
    }
    if (!this.empleadoId()) {
      this.error.set('Selecciona el trabajador');
      return;
    }
    const mensaje = this.produccion.registrar({
      pedidoId: this.pedidoId(),
      proceso: proceso,
      empleadoId: Number(this.empleadoId()),
      cantidad: Number(this.cantidad()) || 0,
      danadas: Number(this.danadas()) || 0,
      autorizarExceso: this.autorizar()
    });
    if (mensaje) {
      this.error.set(mensaje);
      return;
    }
    let texto = 'Producción guardada';
    if (this.sesion.esOperario()) {
      texto = 'Guardado. Falta la aprobación del administrador';
    }
    this.aviso.mostrar(texto);
    // se deja el pedido y el proceso para registrar al siguiente trabajador rapido
    this.cantidad.set(null);
    this.danadas.set(null);
    this.verDanadas.set(false);
    this.autorizar.set(false);
    if (!this.sesion.esOperario()) {
      this.empleadoId.set(0);
    }
  }
}
