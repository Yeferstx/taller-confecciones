import { Injectable, computed, inject, signal } from '@angular/core';
import { AlmacenamientoService } from '../core/almacenamiento.service';
import { Movimiento } from '../models/movimiento';
import { nuevoId } from '../shared/constantes';
import { hoy } from '../shared/fechas';

// ingresos y gastos del taller
@Injectable({ providedIn: 'root' })
export class FinanzasService {
  private almacen = inject(AlmacenamientoService);

  lista = signal<Movimiento[]>(this.almacen.leer('movimientos', []));

  ordenados = computed(() => {
    const resultado = this.lista().slice();
    resultado.sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);
    return resultado;
  });

  registrar(tipo: 'ingreso' | 'gasto', concepto: string, valor: number, fecha: string = '') {
    if (valor <= 0) {
      return;
    }
    let dia = fecha;
    if (!dia) {
      dia = hoy();
    }
    const lista = this.lista().slice();
    lista.push({ id: nuevoId(lista), fecha: dia, tipo: tipo, concepto: concepto, valor: valor });
    this.guardar(lista);
  }

  eliminar(id: number) {
    this.guardar(this.lista().filter(m => m.id != id));
  }

  private guardar(lista: Movimiento[]) {
    this.lista.set(lista);
    this.almacen.guardar('movimientos', lista);
  }
}
