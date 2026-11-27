import { Injectable, inject, signal } from '@angular/core';
import { AlmacenamientoService } from '../core/almacenamiento.service';
import { Cliente } from '../models/cliente';
import { normalizar, nuevoId } from '../shared/constantes';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private almacen = inject(AlmacenamientoService);

  lista = signal<Cliente[]>(this.almacen.leer('clientes', []));

  buscarPorNombre(nombre: string): Cliente | undefined {
    const buscado = normalizar(nombre.trim());
    return this.lista().find(c => normalizar(c.nombre) == buscado);
  }

  guardarCliente(cliente: Cliente): Cliente {
    const lista = this.lista().slice();
    if (cliente.id == 0) {
      cliente.id = nuevoId(lista);
      lista.push(cliente);
    } else {
      for (let i = 0; i < lista.length; i++) {
        if (lista[i].id == cliente.id) {
          lista[i] = cliente;
        }
      }
    }
    this.guardar(lista);
    return cliente;
  }

  eliminar(id: number) {
    this.guardar(this.lista().filter(c => c.id != id));
  }

  // si el cliente no existe lo crea, se usa al registrar un pedido
  asegurarCliente(nombre: string, telefono: string): Cliente {
    const existente = this.buscarPorNombre(nombre);
    if (existente) {
      if (telefono && existente.telefono != telefono) {
        return this.guardarCliente(Object.assign({}, existente, { telefono: telefono }));
      }
      return existente;
    }
    return this.guardarCliente({ id: 0, nombre: nombre.trim(), telefono: telefono, ciudad: '', notas: '' });
  }

  private guardar(lista: Cliente[]) {
    this.lista.set(lista);
    this.almacen.guardar('clientes', lista);
  }
}
