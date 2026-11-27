import { Injectable, computed, inject, signal } from '@angular/core';
import { AlmacenamientoService } from '../core/almacenamiento.service';
import { Entrega, EstadoDiseno, EstadoPedido, Jugador, Pedido, Proceso } from '../models/pedido';
import { normalizar, nombreProceso, nuevoId } from '../shared/constantes';
import { ahora, diasHasta, hoy } from '../shared/fechas';
import { especialidadDeProceso } from '../shared/oficios';
import { ClientesService } from './clientes.service';
import { EmpleadosService } from './empleados.service';
import { FinanzasService } from './finanzas.service';
import { NotificacionesService } from './notificaciones.service';

@Injectable({ providedIn: 'root' })
export class PedidosService {
  private almacen = inject(AlmacenamientoService);
  private clientes = inject(ClientesService);
  private finanzas = inject(FinanzasService);
  private notificaciones = inject(NotificacionesService);
  private empleados = inject(EmpleadosService);

  lista = signal<Pedido[]>(this.almacen.leer('pedidos', []));

  // pedidos que todavia no se entregan ni se cancelan
  activos = computed(() => {
    const resultado = this.lista().filter(p => p.estado != 'entregado' && p.estado != 'cancelado');
    resultado.sort((a, b) => a.fechaEntrega.localeCompare(b.fechaEntrega));
    return resultado;
  });

  atrasados = computed(() => this.activos().filter(p => diasHasta(p.fechaEntrega) < 0));

  entregasHoy = computed(() => this.activos().filter(p => diasHasta(p.fechaEntrega) == 0));

  proximos = computed(() => this.activos().filter(p => diasHasta(p.fechaEntrega) > 0));

  obtener(id: number): Pedido | undefined {
    return this.lista().find(p => p.id == id);
  }

  saldo(pedido: Pedido): number {
    return pedido.precioTotal - pedido.anticipo - pedido.abonos;
  }

  buscar(texto: string, estado: string): Pedido[] {
    const buscado = normalizar(texto.trim());
    let resultado = this.lista().slice();
    if (estado == 'activos') {
      resultado = resultado.filter(p => p.estado != 'entregado' && p.estado != 'cancelado');
    } else if (estado != 'todos') {
      resultado = resultado.filter(p => p.estado == estado);
    }
    if (buscado) {
      resultado = resultado.filter(p =>
        normalizar(p.cliente).includes(buscado) ||
        normalizar(p.equipo).includes(buscado) ||
        normalizar(p.numero).includes(buscado)
      );
    }
    resultado.sort((a, b) => a.fechaEntrega.localeCompare(b.fechaEntrega));
    return resultado;
  }

  siguienteNumero(): string {
    const id = nuevoId(this.lista());
    let texto = '' + id;
    while (texto.length < 4) {
      texto = '0' + texto;
    }
    return 'P-' + texto;
  }

  crear(pedido: Pedido): Pedido {
    const cliente = this.clientes.asegurarCliente(pedido.cliente, pedido.telefono);
    pedido.id = nuevoId(this.lista());
    pedido.numero = this.siguienteNumero();
    pedido.clienteId = cliente.id;
    pedido.fechaRegistro = hoy();
    pedido.estado = 'pendiente';
    pedido.estadoDiseno = 'pendiente';
    pedido.disenoRevisar = false;
    pedido.abonos = 0;
    pedido.jugadores = [];
    pedido.historial = [];
    pedido.entregadas = 0;
    pedido.entregas = [];
    pedido.asignaciones = [];

    const lista = this.lista().slice();
    lista.push(pedido);
    this.guardar(lista);

    this.finanzas.registrar('ingreso', 'Anticipo ' + pedido.numero, pedido.anticipo);
    this.notificaciones.enviar('pedido', 'Nuevo pedido registrado',
      pedido.numero + ': ' + pedido.cantidad + ' ' + pedido.tipoPrenda.toLowerCase() + ' para ' + pedido.equipo + '.',
      ['admin', 'disenador'], '/pedidos/' + pedido.id);
    // a los cortadores les llega el trabajo nuevo
    if (pedido.procesos.includes('corte')) {
      this.notificaciones.enviar('produccion', 'Tienes un nuevo trabajo',
        pedido.numero + ': corte de ' + pedido.cantidad + ' ' + pedido.tipoPrenda.toLowerCase() + '.',
        ['operario'], '/mis-trabajos', ['cortador']);
    }
    return pedido;
  }

  actualizar(pedido: Pedido) {
    const anterior = this.obtener(pedido.id);
    if (anterior && pedido.anticipo > anterior.anticipo) {
      this.finanzas.registrar('ingreso', 'Ajuste de anticipo ' + pedido.numero, pedido.anticipo - anterior.anticipo);
    }
    const cliente = this.clientes.asegurarCliente(pedido.cliente, pedido.telefono);
    pedido.clienteId = cliente.id;
    this.reemplazar(pedido);
  }

  cambiarEstado(id: number, estado: EstadoPedido) {
    const pedido = this.obtener(id);
    if (!pedido) {
      return;
    }
    pedido.estado = estado;
    if (estado == 'entregado') {
      pedido.entregadas = pedido.cantidad;
    }
    this.reemplazar(pedido);
    if (estado == 'terminado') {
      this.notificaciones.enviar('entrega', 'Pedido listo para entregar',
        pedido.numero + ' de ' + pedido.equipo + ' está completo.', ['admin'], '/pedidos/' + id);
    }
  }

  registrarAbono(id: number, valor: number): string {
    const pedido = this.obtener(id);
    if (!pedido) {
      return 'No se encontró el pedido';
    }
    if (valor <= 0) {
      return 'Escribe un valor mayor a cero';
    }
    if (valor > this.saldo(pedido)) {
      return 'El abono es mayor que el saldo pendiente';
    }
    pedido.abonos = pedido.abonos + valor;
    this.reemplazar(pedido);
    this.finanzas.registrar('ingreso', 'Abono ' + pedido.numero, valor);
    return '';
  }

  // ---------- jugadores ----------

  agregarJugador(pedidoId: number, nombre: string, numero: string, talla: string) {
    const pedido = this.obtener(pedidoId);
    if (!pedido) {
      return;
    }
    const jugador: Jugador = { id: nuevoId(pedido.jugadores), nombre: nombre.trim(), numero: numero.trim(), talla: talla };
    pedido.jugadores.push(jugador);
    this.anotarCambio(pedido, 'Se agregó a ' + this.describir(jugador));
  }

  editarJugador(pedidoId: number, editado: Jugador) {
    const pedido = this.obtener(pedidoId);
    if (!pedido) {
      return;
    }
    for (let i = 0; i < pedido.jugadores.length; i++) {
      const actual = pedido.jugadores[i];
      if (actual.id == editado.id) {
        const cambios: string[] = [];
        if (actual.nombre != editado.nombre) {
          cambios.push('nombre "' + actual.nombre + '" a "' + editado.nombre + '"');
        }
        if (actual.numero != editado.numero) {
          cambios.push('número ' + this.textoNumero(actual.numero) + ' a ' + this.textoNumero(editado.numero));
        }
        if (actual.talla != editado.talla) {
          cambios.push('talla ' + actual.talla + ' a ' + editado.talla);
        }
        pedido.jugadores[i] = editado;
        if (cambios.length > 0) {
          this.anotarCambio(pedido, editado.nombre + ': cambió ' + cambios.join(', '));
        }
      }
    }
  }

  eliminarJugador(pedidoId: number, jugadorId: number) {
    const pedido = this.obtener(pedidoId);
    if (!pedido) {
      return;
    }
    const jugador = pedido.jugadores.find(j => j.id == jugadorId);
    if (!jugador) {
      return;
    }
    pedido.jugadores = pedido.jugadores.filter(j => j.id != jugadorId);
    this.anotarCambio(pedido, 'Se quitó a ' + this.describir(jugador));
  }

  // guarda el cambio en el historial y avisa al disenador si el diseno ya estaba listo
  private anotarCambio(pedido: Pedido, texto: string) {
    pedido.historial.push({ fecha: ahora(), texto: texto });
    if (pedido.estadoDiseno == 'terminado') {
      pedido.disenoRevisar = true;
      this.notificaciones.enviar('diseno', 'Cambio en los jugadores',
        pedido.numero + ' ' + pedido.equipo + ': ' + texto + '. Revisa el diseño.', ['disenador', 'admin'], '/disenos/' + pedido.id);
    }
    this.reemplazar(pedido);
  }

  private describir(jugador: Jugador): string {
    let texto = jugador.nombre;
    if (!texto) {
      texto = 'jugador sin nombre';
    }
    return texto + ' (' + this.textoNumero(jugador.numero) + ', talla ' + jugador.talla + ')';
  }

  private textoNumero(numero: string): string {
    if (!numero) {
      return 'sin número';
    }
    return '#' + numero;
  }

  // ---------- diseno ----------

  cambiarEstadoDiseno(id: number, estado: EstadoDiseno) {
    const pedido = this.obtener(id);
    if (!pedido) {
      return;
    }
    pedido.estadoDiseno = estado;
    if (estado == 'terminado') {
      pedido.disenoRevisar = false;
      this.notificaciones.enviar('diseno', 'Diseño terminado',
        pedido.numero + ' ' + pedido.equipo + ' ya tiene el diseño listo.', ['admin'], '/pedidos/' + id);
      // el impresor ya puede imprimir el papel de sublimacion
      if (pedido.procesos.includes('impresion')) {
        this.notificaciones.enviar('diseno', 'Diseño aprobado disponible',
          pedido.numero + ' ' + pedido.equipo + ' ya se puede imprimir.', ['operario'], '/mis-trabajos', ['impresor'],
          this.asignadoA(pedido, 'impresion'));
      }
    }
    this.reemplazar(pedido);
  }

  marcarRevisado(id: number) {
    const pedido = this.obtener(id);
    if (!pedido) {
      return;
    }
    pedido.disenoRevisar = false;
    pedido.historial.push({ fecha: ahora(), texto: 'La diseñadora revisó los cambios' });
    this.reemplazar(pedido);
  }

  // ---------- asignaciones y entregas ----------

  // empleado asignado a un proceso del pedido (0 si cualquiera lo puede hacer)
  asignadoA(pedido: Pedido, proceso: Proceso): number {
    for (const a of pedido.asignaciones) {
      if (a.proceso == proceso) {
        return a.empleadoId;
      }
    }
    return 0;
  }

  asignar(pedidoId: number, proceso: Proceso, empleadoId: number) {
    const pedido = this.obtener(pedidoId);
    if (!pedido) {
      return;
    }
    pedido.asignaciones = pedido.asignaciones.filter(a => a.proceso != proceso);
    if (empleadoId > 0) {
      pedido.asignaciones.push({ proceso: proceso, empleadoId: empleadoId });
      this.notificaciones.enviar('produccion', 'Tienes un nuevo trabajo',
        pedido.numero + ': ' + pedido.cantidad + ' ' + pedido.tipoPrenda.toLowerCase() + ' para ' + pedido.equipo + '.',
        ['operario'], '/mis-trabajos', [especialidadDeProceso(proceso)], empleadoId);
    }
    this.reemplazar(pedido);
  }

  // la usa el servicio de entregas despues de validar la cantidad
  agregarEntrega(pedidoId: number, entrega: Entrega) {
    const pedido = this.obtener(pedidoId);
    if (!pedido) {
      return;
    }
    pedido.entregas = pedido.entregas.concat([entrega]);
    pedido.entregadas = pedido.entregadas + entrega.cantidad;
    if (pedido.entregadas >= pedido.cantidad) {
      pedido.estado = 'entregado';
    }
    this.reemplazar(pedido);
  }

  procesosTexto(pedido: Pedido): string {
    return pedido.procesos.map(p => nombreProceso(p)).join(', ');
  }

  private reemplazar(pedido: Pedido) {
    const lista = this.lista().slice();
    for (let i = 0; i < lista.length; i++) {
      if (lista[i].id == pedido.id) {
        // se hacen copias nuevas para que la pantalla detecte el cambio
        const copia = Object.assign({}, pedido);
        copia.jugadores = pedido.jugadores.slice();
        copia.historial = pedido.historial.slice();
        copia.asignaciones = pedido.asignaciones.slice();
        lista[i] = copia;
      }
    }
    this.guardar(lista);
  }

  private guardar(lista: Pedido[]) {
    this.lista.set(lista);
    this.almacen.guardar('pedidos', lista);
  }
}
