import { Component, computed, input } from '@angular/core';

// barra sencilla para mostrar avance: 80/100
@Component({
  selector: 'app-barra-progreso',
  template: `
    <div class="h-2.5 w-full overflow-hidden rounded-full bg-borde">
      <div class="h-full rounded-full transition-all" [class]="colorBarra()" [style.width.%]="porcentaje()"></div>
    </div>
  `
})
export class BarraProgreso {
  valor = input(0);
  total = input(0);

  porcentaje = computed(() => {
    if (this.total() <= 0) {
      return 0;
    }
    const resultado = (this.valor() / this.total()) * 100;
    if (resultado > 100) {
      return 100;
    }
    return resultado;
  });

  colorBarra = computed(() => {
    if (this.valor() > this.total()) {
      return 'bg-alerta';
    }
    if (this.porcentaje() >= 100) {
      return 'bg-exito';
    }
    return 'bg-rojo';
  });
}
