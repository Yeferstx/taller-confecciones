import { Injectable, computed, inject, signal } from '@angular/core';
import { AlmacenamientoService } from '../core/almacenamiento.service';
import { SesionService } from '../core/sesion.service';
import { Pedido, Proceso } from '../models/pedido';
import { RegistroProduccion } from '../models/produccion';
import { nombreProceso, nuevoId } from '../shared/constantes';
import { ahora } from '../shared/fechas';
import { especialidadDeProceso, oficio } from '../shared/oficios';
import { EmpleadosService } from './empleados.service';
import { NotificacionesService } from './notificaciones.service';
import { PedidosService } from './pedidos.service';

export interface DatosRegistro {
  pedidoId: number;
  proceso: Proceso;
  empleadoId: number;
  cantidad: number;
  danadas: number;
  autorizarExceso: boolean;
}

export interface AporteTrabajador {
  nombre: string;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class ProduccionService {
  private almacen = inject(AlmacenamientoService);
  private sesion = inject(SesionService);
  private pedidos = inject(PedidosService);
  private empleados = inject(EmpleadosService);
  private notificaciones = inject(NotificacionesService);

  registros = signal<RegistroProduccion[]>(this.almacen.leer('produccion', []));

  // los mas recientes primero
  recientes = computed(() => {
    const lista = this.registros().slice();
    lista.sort((a, b) => b.fecha.localeCompare(a.fecha));
    return lista;
  });

  porAprobar = computed(() => this.recientes().filter(r => !r.aprobado));

  delPedido(pedidoId: number): RegistroProduccion[] {
    return this.recientes().filter(r => r.pedidoId == pedidoId);
  }

  // prendas terminadas de un proceso
  avance(pedidoId: number, proceso: Proceso): number {
    let total = 0;
    for (const r of this.registros()) {
      if (r.pedidoId == pedidoId && r.proceso == proceso) {
        total = total + r.cantidad;
      }
    }
    return total;
  }

  danadas(pedidoId: number, proceso: Proceso): number {
    let total = 0;
    for (const r of this.registros()) {
      if (r.pedidoId == pedidoId && r.proceso == proceso) {
        total = total + r.danadas;
      }
    }
    return total;
  }

  // porcentaje general del pedido (promedio de sus procesos)
  porcentaje(pedido: Pedido): number {
    if (pedido.procesos.length == 0 || pedido.cantidad == 0) {
      return 0;
    }
    let suma = 0;
    for (const proceso of pedido.procesos) {
      let hecho = this.avance(pedido.id, proceso);
      if (hecho > pedido.cantidad) {
        hecho = pedido.cantidad;
      }
      suma = suma + hecho / pedido.cantidad;
    }
    return Math.round((suma / pedido.procesos.length) * 100);
  }

  // primer proceso que todavia no esta completo
  procesoActual(pedido: Pedido): string {
    for (const proceso of pedido.procesos) {
      if (this.avance(pedido.id, proceso) < pedido.cantidad) {
        return nombreProceso(proceso);
      }
    }
    return 'Terminado';
  }

  // cuanto hizo cada trabajador en un proceso
  porTrabajador(pedidoId: number, proceso: Proceso): AporteTrabajador[] {
    const resultado: AporteTrabajador[] = [];
    for (const r of this.registros()) {
      if (r.pedidoId == pedidoId && r.proceso == proceso) {
        let encontrado = resultado.find(a => a.nombre == r.empleadoNombre);
        if (!encontrado) {
          encontrado = { nombre: r.empleadoNombre, cantidad: 0 };
          resultado.push(encontrado);
        }
        encontrado.cantidad = encontrado.cantidad + r.cantidad;
      }
    }
    return resultado;
  }

  delEmpleado(empleadoId: number): RegistroProduccion[] {
    return this.recientes().filter(r => r.empleadoId == empleadoId);
  }

  // devuelve un texto con el error, o vacio si se guardo bien
  registrar(datos: DatosRegistro): string {
    const pedido = this.pedidos.obtener(datos.pedidoId);
    if (!pedido) {
      return 'Selecciona un pedido';
    }
    if (pedido.estado == 'cancelado' || pedido.estado == 'entregado') {
      return 'Este pedido ya está cerrado';
    }
    if (!pedido.procesos.includes(datos.proceso)) {
      return 'Este pedido no necesita ' + nombreProceso(datos.proceso).toLowerCase();
    }
    const empleado = this.empleados.obtener(datos.empleadoId);
    if (!empleado) {
      return 'Selecciona el trabajador';
    }
    if (!empleado.activo) {
      return empleado.nombre + ' está inactivo';
    }
    if (!empleado.procesos.includes(datos.proceso)) {
      return empleado.nombre + ' no hace ' + nombreProceso(datos.proceso).toLowerCase();
    }
    const cantidad = Math.floor(Number(datos.cantidad) || 0);
    const danadas = Math.floor(Number(datos.danadas) || 0);
    if (cantidad <= 0 && danadas <= 0) {
      return 'Escribe cuántas prendas terminó';
    }
    if (cantidad < 0 || danadas < 0) {
      return 'Las cantidades no pueden ser negativas';
    }

    // evita guardar dos veces lo mismo por tocar el boton dos veces
    const ultimo = this.recientes().find(r => r.empleadoId == empleado.id);
    if (ultimo && ultimo.pedidoId == pedido.id && ultimo.proceso == datos.proceso && ultimo.cantidad == cantidad) {
      const segundos = (new Date().getTime() - new Date(ultimo.fecha).getTime()) / 1000;
      if (segundos < 60) {
        return 'Este registro ya se guardó hace un momento';
      }
    }

    // el operario solo puede registrar lo que ya le llego del proceso anterior
    if (!this.sesion.esAdmin()) {
      const libres = this.disponibles(pedido, datos.proceso);
      if (cantidad > libres) {
        return 'Solo hay ' + libres + ' prendas disponibles para ' + nombreProceso(datos.proceso).toLowerCase() + '.';
      }
    }

    const hecho = this.avance(pedido.id, datos.proceso);
    const faltan = pedido.cantidad - hecho;
    let exceso = false;
    if (cantidad > faltan) {
      if (!this.sesion.esAdmin()) {
        return 'Solo faltan ' + faltan + ' prendas. Pide al administrador que autorice la diferencia.';
      }
      if (!datos.autorizarExceso) {
        return 'Solo faltan ' + faltan + ' prendas. Marca "Autorizar cantidad extra" si es correcto.';
      }
      exceso = true;
    }

    const tarifa = this.empleados.tarifa(empleado.id, pedido.tipoPrenda, datos.proceso);
    const lista = this.registros().slice();
    const nuevo: RegistroProduccion = {
      id: nuevoId(lista),
      pedidoId: pedido.id,
      numeroPedido: pedido.numero,
      tipoPrenda: pedido.tipoPrenda,
      proceso: datos.proceso,
      empleadoId: empleado.id,
      empleadoNombre: empleado.nombre,
      cantidad: cantidad,
      danadas: danadas,
      fecha: ahora(),
      tarifa: tarifa,
      total: cantidad * tarifa,
      // lo que registra el administrador queda aprobado de una vez
      aprobado: this.sesion.esAdmin(),
      autorizadoExceso: exceso,
      abonado: 0
    };
    lista.push(nuevo);
    this.guardar(lista);

    if (pedido.estado == 'pendiente') {
      this.pedidos.cambiarEstado(pedido.id, 'en_produccion');
    }
    this.avisarSiguienteProceso(pedido, datos.proceso, cantidad);
    if (!nuevo.aprobado) {
      this.notificaciones.enviar('produccion', 'Producción por aprobar',
        empleado.nombre + ' registró ' + cantidad + ' en ' + nombreProceso(datos.proceso).toLowerCase() + ' (' + pedido.numero + ').',
        ['admin'], '/produccion');
    }
    return '';
  }

  // procesos que reciben las prendas de este, segun los procesos que tenga el pedido
  siguientes(pedido: Pedido, proceso: Proceso): Proceso[] {
    const tiene = pedido.procesos;
    if ((proceso == 'corte' || proceso == 'impresion') && tiene.includes('sublimacion')) {
      return ['sublimacion'];
    }
    if (proceso == 'corte' && tiene.includes('costura')) {
      return ['costura'];
    }
    if (proceso == 'sublimacion' && tiene.includes('costura')) {
      return ['costura'];
    }
    return [];
  }

  // prendas que ya se pueden trabajar en un proceso
  // depende de lo que hayan terminado los procesos anteriores que tenga el pedido
  disponibles(pedido: Pedido, proceso: Proceso): number {
    const tiene = pedido.procesos;
    let llegan = pedido.cantidad;
    if (proceso == 'impresion' && pedido.estadoDiseno != 'terminado') {
      llegan = 0;
    }
    if (proceso == 'sublimacion') {
      if (tiene.includes('corte')) {
        llegan = Math.min(llegan, this.avance(pedido.id, 'corte'));
      }
      if (tiene.includes('impresion')) {
        llegan = Math.min(llegan, this.avance(pedido.id, 'impresion'));
      }
    }
    if (proceso == 'costura') {
      if (tiene.includes('sublimacion')) {
        llegan = Math.min(llegan, this.avance(pedido.id, 'sublimacion'));
      } else if (tiene.includes('corte')) {
        llegan = Math.min(llegan, this.avance(pedido.id, 'corte'));
      }
    }
    const resultado = llegan - this.avance(pedido.id, proceso);
    if (resultado < 0) {
      return 0;
    }
    return resultado;
  }

  // prendas que terminaron todos los procesos del pedido
  terminadas(pedido: Pedido): number {
    let menor = pedido.cantidad;
    for (const proceso of pedido.procesos) {
      menor = Math.min(menor, this.avance(pedido.id, proceso));
    }
    return menor;
  }

  // prendas listas que todavia no se entregan
  porEntregar(pedido: Pedido): number {
    if (pedido.estado == 'cancelado' || pedido.estado == 'entregado') {
      return 0;
    }
    const resultado = this.terminadas(pedido) - pedido.entregadas;
    if (resultado < 0) {
      return 0;
    }
    return resultado;
  }

  // avisa solo a las especialidades de los procesos que ya pueden seguir trabajando
  private avisarSiguienteProceso(pedido: Pedido, proceso: Proceso, cantidad: number) {
    if (cantidad <= 0) {
      return;
    }
    const enlace = '/produccion/pedido/' + pedido.id;
    if (this.avance(pedido.id, proceso) >= pedido.cantidad) {
      this.notificaciones.enviar('produccion', nombreProceso(proceso) + ' completado',
        pedido.numero + ' ' + pedido.equipo + ' terminó ' + nombreProceso(proceso).toLowerCase() + '.', ['admin'], enlace);
    }

    for (const siguiente of this.siguientes(pedido, proceso)) {
      const libres = this.disponibles(pedido, siguiente);
      if (libres > 0) {
        const datos = oficio(especialidadDeProceso(siguiente));
        this.notificaciones.enviar('produccion', 'Prendas disponibles: ' + datos.actividad.toLowerCase(),
          pedido.numero + ': hay ' + libres + ' prendas listas para ' + datos.actividad.toLowerCase() + '.',
          ['operario'], '/mis-trabajos', [datos.clave], this.pedidos.asignadoA(pedido, siguiente));
      }
    }

    // si ya hay prendas terminadas se avisa a empaque y entregas
    const listas = this.porEntregar(pedido);
    const esUltimo = pedido.procesos[pedido.procesos.length - 1] == proceso;
    if (esUltimo && listas > 0) {
      this.notificaciones.enviar('entrega', 'Hay prendas listas para entregar',
        pedido.numero + ' ' + pedido.equipo + ': ' + listas + ' prendas terminadas.', ['operario'], '/mis-trabajos', ['entregas']);
    }

    let todoListo = true;
    for (const p of pedido.procesos) {
      if (this.avance(pedido.id, p) < pedido.cantidad) {
        todoListo = false;
      }
    }
    if (todoListo) {
      this.notificaciones.enviar('produccion', 'Producción completa',
        pedido.numero + ' tiene todos los procesos terminados. Revisa y finaliza el pedido.', ['admin'], enlace);
    }
  }

  aprobar(id: number) {
    const lista = this.registros().slice();
    for (let i = 0; i < lista.length; i++) {
      if (lista[i].id == id) {
        lista[i] = Object.assign({}, lista[i], { aprobado: true });
      }
    }
    this.guardar(lista);
  }

  // correccion del administrador: borrar un registro mal hecho
  eliminar(id: number): string {
    const registro = this.registros().find(r => r.id == id);
    if (!registro) {
      return 'No se encontró el registro';
    }
    if (registro.abonado > 0) {
      return 'Este trabajo ya tiene pagos, no se puede borrar';
    }
    this.guardar(this.registros().filter(r => r.id != id));
    return '';
  }

  // abona dinero a un registro (lo usa el servicio de pagos)
  abonar(id: number, valor: number) {
    const lista = this.registros().slice();
    for (let i = 0; i < lista.length; i++) {
      if (lista[i].id == id) {
        lista[i] = Object.assign({}, lista[i], { abonado: lista[i].abonado + valor });
      }
    }
    this.guardar(lista);
  }

  // al finalizar se revisa que todos los procesos tengan la cantidad pedida
  diferencias(pedido: Pedido): string[] {
    const resultado: string[] = [];
    for (const proceso of pedido.procesos) {
      const hecho = this.avance(pedido.id, proceso);
      if (hecho < pedido.cantidad) {
        resultado.push(nombreProceso(proceso) + ': faltan ' + (pedido.cantidad - hecho));
      }
      if (hecho > pedido.cantidad) {
        resultado.push(nombreProceso(proceso) + ': sobran ' + (hecho - pedido.cantidad));
      }
    }
    return resultado;
  }

  finalizar(pedidoId: number): string[] {
    const pedido = this.pedidos.obtener(pedidoId);
    if (!pedido) {
      return ['No se encontró el pedido'];
    }
    const lista = this.diferencias(pedido);
    if (lista.length > 0) {
      this.notificaciones.enviar('alerta', 'Diferencias de producción',
        pedido.numero + ': ' + lista.join('. ') + '.', ['admin'], '/produccion/pedido/' + pedido.id);
      return lista;
    }
    this.pedidos.cambiarEstado(pedido.id, 'terminado');
    return [];
  }

  private guardar(lista: RegistroProduccion[]) {
    this.registros.set(lista);
    this.almacen.guardar('produccion', lista);
  }
}
