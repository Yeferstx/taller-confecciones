import { Injectable, inject, signal } from '@angular/core';
import { AlmacenamientoService } from '../core/almacenamiento.service';
import { Material } from '../models/material';
import { nuevoId } from '../shared/constantes';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private almacen = inject(AlmacenamientoService);

  lista = signal<Material[]>(this.almacen.leer('materiales', []));

  guardarMaterial(material: Material) {
    const lista = this.lista().slice();
    if (material.id == 0) {
      material.id = nuevoId(lista);
      lista.push(material);
    } else {
      for (let i = 0; i < lista.length; i++) {
        if (lista[i].id == material.id) {
          lista[i] = material;
        }
      }
    }
    this.guardar(lista);
  }

  // suma o resta existencias (entrada o salida)
  ajustar(id: number, cantidad: number) {
    const lista = this.lista().slice();
    for (let i = 0; i < lista.length; i++) {
      if (lista[i].id == id) {
        let nueva = lista[i].cantidad + cantidad;
        if (nueva < 0) {
          nueva = 0;
        }
        lista[i] = Object.assign({}, lista[i], { cantidad: nueva });
      }
    }
    this.guardar(lista);
  }

  eliminar(id: number) {
    this.guardar(this.lista().filter(m => m.id != id));
  }

  private guardar(lista: Material[]) {
    this.lista.set(lista);
    this.almacen.guardar('materiales', lista);
  }
}
