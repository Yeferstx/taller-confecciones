import { Component, computed, input } from '@angular/core';
import { nombreProceso } from '../constantes';
import { iconoProceso } from '../prendas';
import { BarraProgreso } from './barra-progreso';
import { Icono } from './icono';

// avance de un proceso: icono, nombre, barra, porcentaje y "18 de 30 prendas"
@Component({
  selector: 'app-fila-avance',
  imports: [Icono, BarraProgreso],
  template: `
    <div class="flex items-center gap-3">
      <div class="icono-caja size-10 bg-gris-claro text-texto">
        <app-icono [nombre]="icono()" clase="size-5" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="mb-1.5 flex items-baseline justify-between gap-2">
          <span class="truncate text-[15px] font-semibold text-texto">{{ nombre() }}</span>
          <span class="shrink-0 text-xs text-gris">{{ hecho() }} de {{ total() }} prendas</span>
        </div>
        <app-barra-progreso [valor]="hecho()" [total]="total()" />
      </div>
      <span class="chip w-14 justify-center" [class]="clasePorcentaje()">{{ porcentaje() }}%</span>
    </div>
  `
})
export class FilaAvance {
  proceso = input('');
  hecho = input(0);
  total = input(0);

  nombre = computed(() => nombreProceso(this.proceso()));
  icono = computed(() => iconoProceso(this.proceso()));

  porcentaje = computed(() => {
    if (this.total() <= 0) {
      return 0;
    }
    return Math.round((this.hecho() / this.total()) * 100);
  });

  clasePorcentaje = computed(() => {
    if (this.hecho() > this.total()) {
      return 'bg-alerta-suave text-amber-700';
    }
    if (this.porcentaje() >= 100) {
      return 'bg-exito-suave text-exito';
    }
    if (this.porcentaje() > 0) {
      return 'bg-rojo-suave text-rojo';
    }
    return 'bg-gris-claro text-gris';
  });
}
