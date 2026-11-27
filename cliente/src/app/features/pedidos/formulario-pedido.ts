import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { AvisoService } from '../../core/aviso.service';
import { Pedido, Proceso } from '../../models/pedido';
import { ClientesService } from '../../services/clientes.service';
import { ConfiguracionService } from '../../services/configuracion.service';
import { PedidosService } from '../../services/pedidos.service';
import { Encabezado } from '../../shared/componentes/encabezado';
import { PROCESOS } from '../../shared/constantes';
import { sumarDias } from '../../shared/fechas';
import { reducirImagen } from '../../shared/imagen';
import { PesosPipe, ProcesoPipe } from '../../shared/pipes';

@Component({
  selector: 'app-formulario-pedido',
  imports: [FormsModule, LucideDynamicIcon, Encabezado, PesosPipe, ProcesoPipe],
  templateUrl: './formulario-pedido.html'
})
export class FormularioPedido implements OnInit {
  private pedidos = inject(PedidosService);
  private router = inject(Router);
  private aviso = inject(AvisoService);
  clientes = inject(ClientesService);
  configuracion = inject(ConfiguracionService);

  // viene de la ruta cuando se edita
  id = input('');

  procesos = PROCESOS;
  editando = false;
  error = '';
  imagen = signal('');
  cargandoImagen = signal(false);

  form: Pedido = this.pedidoVacio();

  ngOnInit() {
    if (this.id()) {
      const pedido = this.pedidos.obtener(Number(this.id()));
      if (pedido) {
        this.editando = true;
        // se copia para no cambiar el original hasta guardar
        this.form = Object.assign({}, pedido);
        this.form.procesos = pedido.procesos.slice();
        this.imagen.set(pedido.imagen);
      }
    }
  }

  pedidoVacio(): Pedido {
    return {
      id: 0, numero: '', clienteId: 0, cliente: '', telefono: '', equipo: '', tipoPrenda: 'Camiseta',
      cantidad: 0, fechaRegistro: '', fechaEntrega: sumarDias(8), precioTotal: 0, anticipo: 0, abonos: 0,
      imagen: '', observaciones: '', procesos: ['corte', 'impresion', 'sublimacion', 'costura'], estado: 'pendiente',
      personalizado: false, jugadores: [], historial: [], estadoDiseno: 'pendiente', disenoRevisar: false,
      entregadas: 0, entregas: [], asignaciones: []
    };
  }

  // al escoger un cliente de la lista se llena el telefono
  clienteCambio() {
    const cliente = this.clientes.buscarPorNombre(this.form.cliente);
    if (cliente) {
      this.form.telefono = cliente.telefono;
    }
  }

  cambiarProceso(proceso: Proceso) {
    if (this.form.procesos.includes(proceso)) {
      this.form.procesos = this.form.procesos.filter(p => p != proceso);
    } else {
      // se mantiene el orden corte, sublimacion, costura
      const nuevos: Proceso[] = [];
      for (const p of PROCESOS) {
        if (p == proceso || this.form.procesos.includes(p)) {
          nuevos.push(p);
        }
      }
      this.form.procesos = nuevos;
    }
  }

  saldo(): number {
    return (Number(this.form.precioTotal) || 0) - (Number(this.form.anticipo) || 0) - (this.form.abonos || 0);
  }

  async elegirImagen(evento: Event) {
    const campo = evento.target as HTMLInputElement;
    if (!campo.files || campo.files.length == 0) {
      return;
    }
    this.cargandoImagen.set(true);
    try {
      const texto = await reducirImagen(campo.files[0], 900);
      this.imagen.set(texto);
    } catch (error) {
      this.aviso.mostrar('No se pudo cargar la imagen', 'error');
    }
    this.cargandoImagen.set(false);
    campo.value = '';
  }

  guardar() {
    this.error = '';
    const f = this.form;
    f.cantidad = Math.floor(Number(f.cantidad) || 0);
    f.precioTotal = Number(f.precioTotal) || 0;
    f.anticipo = Number(f.anticipo) || 0;

    if (!f.cliente.trim()) {
      this.error = 'Escribe el nombre del cliente';
      return;
    }
    if (f.cantidad <= 0) {
      this.error = 'Escribe cuántas prendas son';
      return;
    }
    if (!f.fechaEntrega) {
      this.error = 'Selecciona la fecha de entrega';
      return;
    }
    if (f.procesos.length == 0) {
      this.error = 'Selecciona al menos un proceso';
      return;
    }
    if (f.anticipo > f.precioTotal) {
      this.error = 'El anticipo no puede ser mayor al precio total';
      return;
    }
    if (!f.equipo.trim()) {
      f.equipo = f.cliente.trim();
    }
    f.imagen = this.imagen();

    if (this.editando) {
      this.pedidos.actualizar(f);
      this.aviso.mostrar('Pedido actualizado');
      this.router.navigateByUrl('/pedidos/' + f.id);
    } else {
      const nuevo = this.pedidos.crear(f);
      this.aviso.mostrar('Pedido ' + nuevo.numero + ' creado');
      this.router.navigateByUrl('/pedidos/' + nuevo.id);
    }
  }

  tituloPagina(): string {
    if (this.editando) {
      return 'Editar ' + this.form.numero;
    }
    return 'Nuevo pedido';
  }

  volver(): string {
    if (this.editando) {
      return '/pedidos/' + this.form.id;
    }
    return '/pedidos';
  }
}
