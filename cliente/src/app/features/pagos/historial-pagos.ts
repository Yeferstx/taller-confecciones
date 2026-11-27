import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmpleadosService } from '../../services/empleados.service';
import { PagosService } from '../../services/pagos.service';
import { Encabezado } from '../../shared/componentes/encabezado';
import { Vacio } from '../../shared/componentes/vacio';
import { soloFecha } from '../../shared/fechas';
import { FechaPipe, PesosPipe } from '../../shared/pipes';

@Component({
  selector: 'app-historial-pagos',
  imports: [FormsModule, Encabezado, Vacio, FechaPipe, PesosPipe],
  template: `
    <app-encabezado titulo="Historial de pagos" volver="/pagos" />

    <div class="mb-4 grid gap-3 sm:grid-cols-3">
      <select class="campo" aria-label="Empleado" [ngModel]="empleadoId()" (ngModelChange)="empleadoId.set($event)">
        <option [ngValue]="0">Todos los empleados</option>
        @for (e of empleados.lista(); track e.id) {
          <option [ngValue]="e.id">{{ e.nombre }}</option>
        }
      </select>
      <input type="date" class="campo" aria-label="Desde" [ngModel]="desde()" (ngModelChange)="desde.set($event)" />
      <input type="date" class="campo" aria-label="Hasta" [ngModel]="hasta()" (ngModelChange)="hasta.set($event)" />
    </div>

    <div class="tarjeta mb-4 flex items-center justify-between">
      <span class="text-[15px] text-gris">Total pagado</span>
      <span class="text-xl font-bold text-texto">{{ total() | pesos }}</span>
    </div>

    <div class="tarjeta divide-y divide-borde p-0">
      @for (p of lista(); track p.id) {
        <div class="flex items-center gap-3 px-4 py-3">
          <div class="min-w-0 flex-1">
            <p class="truncate text-[15px] font-semibold text-texto">{{ p.empleadoNombre }}</p>
            <p class="text-sm text-gris">{{ p.fecha | fecha: 'completa' }} · {{ p.registros.length }} trabajo(s)
              @if (p.nota) { · {{ p.nota }} }
            </p>
          </div>
          <div class="text-right">
            <p class="font-semibold">{{ p.valor | pesos }}</p>
            <span class="chip" [class]="{ 'bg-exito-suave text-exito': p.tipo == 'completo', 'bg-alerta-suave text-amber-700': !(p.tipo == 'completo') }">{{ p.tipo }}</span>
          </div>
        </div>
      } @empty {
        <app-vacio icono="wallet" mensaje="No hay pagos con estos filtros." />
      }
    </div>
  `
})
export class HistorialPagos {
  empleados = inject(EmpleadosService);
  private pagos = inject(PagosService);

  empleadoId = signal(0);
  desde = signal('');
  hasta = signal('');

  lista = computed(() => this.pagos.recientes().filter(p => {
    if (this.empleadoId() && p.empleadoId != this.empleadoId()) {
      return false;
    }
    const dia = soloFecha(p.fecha);
    if (this.desde() && dia < this.desde()) {
      return false;
    }
    if (this.hasta() && dia > this.hasta()) {
      return false;
    }
    return true;
  }));

  total = computed(() => {
    let suma = 0;
    for (const p of this.lista()) {
      suma = suma + p.valor;
    }
    return suma;
  });
}
