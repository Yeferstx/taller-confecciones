import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideDynamicIcon } from '@lucide/angular';
import { AvisoService } from '../../core/aviso.service';
import { Cliente } from '../../models/cliente';
import { ClientesService } from '../../services/clientes.service';
import { PedidosService } from '../../services/pedidos.service';
import { Encabezado } from '../../shared/componentes/encabezado';
import { Vacio } from '../../shared/componentes/vacio';
import { normalizar } from '../../shared/constantes';

@Component({
  selector: 'app-clientes',
  imports: [FormsModule, LucideDynamicIcon, Encabezado, Vacio],
  template: `
    <app-encabezado titulo="Clientes" [subtitulo]="clientes.lista().length + ' registrados'">
      @if (!formAbierto()) {
        <button type="button" (click)="nuevo()" class="btn btn-primario">
          <svg lucideIcon="plus" class="size-5"></svg> Nuevo
        </button>
      }
    </app-encabezado>

    @if (formAbierto()) {
      <form (ngSubmit)="guardar()" class="tarjeta mb-5 flex flex-col gap-4">
        <h2 class="font-semibold">@if (form.id) { Editar cliente } @else { Nuevo cliente }</h2>
        <div>
          <label class="etiqueta" for="c-nombre">Nombre</label>
          <input id="c-nombre" name="nombre" class="campo" [(ngModel)]="form.nombre" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="etiqueta" for="c-tel">Teléfono</label>
            <input id="c-tel" name="telefono" type="tel" class="campo" [(ngModel)]="form.telefono" />
          </div>
          <div>
            <label class="etiqueta" for="c-ciudad">Ciudad</label>
            <input id="c-ciudad" name="ciudad" class="campo" [(ngModel)]="form.ciudad" />
          </div>
        </div>
        <div>
          <label class="etiqueta" for="c-notas">Notas</label>
          <input id="c-notas" name="notas" class="campo" [(ngModel)]="form.notas" placeholder="Equipo, contacto, preferencias..." />
        </div>
        @if (error) { <p class="text-sm font-medium text-error">{{ error }}</p> }
        <div class="flex gap-2">
          @if (form.id) {
            <button type="button" (click)="eliminar()" class="btn btn-peligro" aria-label="Eliminar cliente">
              <svg lucideIcon="trash" class="size-5"></svg>
            </button>
          }
          <button type="button" (click)="formAbierto.set(false)" class="btn btn-secundario flex-1">Cancelar</button>
          <button type="submit" class="btn btn-primario flex-1">Guardar</button>
        </div>
      </form>
    }

    <div class="relative mb-4">
      <svg lucideIcon="search" class="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-gris"></svg>
      <input type="search" class="campo pl-11" placeholder="Buscar cliente" [ngModel]="texto()" (ngModelChange)="texto.set($event)" />
    </div>

    <div class="tarjeta divide-y divide-borde p-0">
      @for (c of lista(); track c.id) {
        <div class="flex items-center gap-3 px-4 py-3">
          <button type="button" (click)="editar(c)" class="min-w-0 flex-1 text-left">
            <p class="truncate text-[15px] font-semibold text-texto">{{ c.nombre }}</p>
            <p class="truncate text-sm text-gris">{{ c.ciudad || 'Sin ciudad' }} · {{ cantidadPedidos(c.id) }} pedido(s)</p>
            @if (c.notas) { <p class="truncate text-sm text-gris">{{ c.notas }}</p> }
          </button>
          @if (c.telefono) {
            <a [href]="'tel:' + c.telefono" class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-rojo-suave text-rojo" [attr.aria-label]="'Llamar a ' + c.nombre">
              <svg lucideIcon="phone" class="size-5"></svg>
            </a>
          }
        </div>
      } @empty {
        <app-vacio icono="user-round" mensaje="No hay clientes con ese nombre." />
      }
    </div>
  `
})
export class Clientes {
  clientes = inject(ClientesService);
  private pedidos = inject(PedidosService);
  private aviso = inject(AvisoService);

  texto = signal('');
  formAbierto = signal(false);
  form: Cliente = { id: 0, nombre: '', telefono: '', ciudad: '', notas: '' };
  error = '';

  lista = computed(() => {
    const buscado = normalizar(this.texto());
    const resultado = this.clientes.lista().filter(c => normalizar(c.nombre + ' ' + c.notas).includes(buscado));
    resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
    return resultado;
  });

  cantidadPedidos(id: number): number {
    return this.pedidos.lista().filter(p => p.clienteId == id).length;
  }

  nuevo() {
    this.form = { id: 0, nombre: '', telefono: '', ciudad: '', notas: '' };
    this.error = '';
    this.formAbierto.set(true);
  }

  editar(cliente: Cliente) {
    this.form = Object.assign({}, cliente);
    this.error = '';
    this.formAbierto.set(true);
    window.scrollTo(0, 0);
  }

  guardar() {
    if (!this.form.nombre.trim()) {
      this.error = 'Escribe el nombre';
      return;
    }
    const otro = this.clientes.buscarPorNombre(this.form.nombre);
    if (otro && otro.id != this.form.id) {
      this.error = 'Ya existe un cliente con ese nombre';
      return;
    }
    this.form.nombre = this.form.nombre.trim();
    this.clientes.guardarCliente(this.form);
    this.formAbierto.set(false);
    this.aviso.mostrar('Cliente guardado');
  }

  eliminar() {
    if (this.cantidadPedidos(this.form.id) > 0) {
      this.error = 'No se puede eliminar porque tiene pedidos';
      return;
    }
    if (!confirm('¿Eliminar este cliente?')) {
      return;
    }
    this.clientes.eliminar(this.form.id);
    this.formAbierto.set(false);
    this.aviso.mostrar('Cliente eliminado');
  }
}
