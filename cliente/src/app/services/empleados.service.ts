import { Injectable, computed, inject, signal } from '@angular/core';
import { AlmacenamientoService } from '../core/almacenamiento.service';
import { CambioTarifa, Empleado } from '../models/empleado';
import { Proceso } from '../models/pedido';
import { nuevoId } from '../shared/constantes';
import { ahora } from '../shared/fechas';
import { procesosDe } from '../shared/oficios';

@Injectable({ providedIn: 'root' })
export class EmpleadosService {
  private almacen = inject(AlmacenamientoService);

  lista = signal<Empleado[]>(this.almacen.leer('empleados', []));

  activos = computed(() => this.lista().filter(e => e.activo));

  obtener(id: number): Empleado | undefined {
    return this.lista().find(e => e.id == id);
  }

  // tarifa que se le paga al empleado por una prenda en un proceso
  tarifa(empleadoId: number, tipoPrenda: string, proceso: Proceso): number {
    const empleado = this.obtener(empleadoId);
    if (!empleado) {
      return 0;
    }
    for (const t of empleado.tarifas) {
      if (t.tipoPrenda == tipoPrenda && t.proceso == proceso) {
        return t.valor;
      }
    }
    return 0;
  }

  // especialidad principal para dibujar el avatar en listas de registros
  especialidadDe(id: number): string {
    const e = this.obtener(id);
    if (!e) {
      return '';
    }
    return e.especialidadPrincipal;
  }

  // operarios activos que tienen una especialidad
  conEspecialidad(especialidad: string): Empleado[] {
    return this.activos().filter(e => e.especialidades.some(x => x == especialidad));
  }

  guardarEmpleado(empleado: Empleado): Empleado {
    // los procesos que puede registrar salen de sus especialidades
    empleado.procesos = procesosDe(empleado.especialidades);
    const anterior = this.obtener(empleado.id);
    if (anterior) {
      empleado.historialTarifas = anterior.historialTarifas.concat(this.cambiosDeTarifa(anterior, empleado));
    }
    const lista = this.lista().slice();
    if (empleado.id == 0) {
      empleado.id = nuevoId(lista);
      lista.push(empleado);
    } else {
      for (let i = 0; i < lista.length; i++) {
        if (lista[i].id == empleado.id) {
          lista[i] = empleado;
        }
      }
    }
    this.guardar(lista);
    return empleado;
  }

  // compara las tarifas viejas con las nuevas y guarda lo que cambio
  private cambiosDeTarifa(anterior: Empleado, nuevo: Empleado): CambioTarifa[] {
    const cambios: CambioTarifa[] = [];
    for (const t of nuevo.tarifas) {
      const vieja = anterior.tarifas.find(x => x.tipoPrenda == t.tipoPrenda && x.proceso == t.proceso);
      let valorViejo = 0;
      if (vieja) {
        valorViejo = vieja.valor;
      }
      if (valorViejo != t.valor) {
        cambios.push({ fecha: ahora(), tipoPrenda: t.tipoPrenda, proceso: t.proceso, anterior: valorViejo, nuevo: t.valor });
      }
    }
    for (const vieja of anterior.tarifas) {
      const sigue = nuevo.tarifas.find(x => x.tipoPrenda == vieja.tipoPrenda && x.proceso == vieja.proceso);
      if (!sigue) {
        cambios.push({ fecha: ahora(), tipoPrenda: vieja.tipoPrenda, proceso: vieja.proceso, anterior: vieja.valor, nuevo: 0 });
      }
    }
    return cambios;
  }

  cambiarEstado(id: number) {
    const lista = this.lista().slice();
    for (let i = 0; i < lista.length; i++) {
      if (lista[i].id == id) {
        lista[i] = Object.assign({}, lista[i], { activo: !lista[i].activo });
      }
    }
    this.guardar(lista);
  }

  private guardar(lista: Empleado[]) {
    this.lista.set(lista);
    this.almacen.guardar('empleados', lista);
  }
}
