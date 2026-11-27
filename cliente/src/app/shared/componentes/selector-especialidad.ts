import { Component, computed, inject } from '@angular/core';
import { SesionService } from '../../core/sesion.service';
import { Especialidad } from '../../models/especialidad';
import { oficio } from '../oficios';
import { Icono } from './icono';

// solo aparece si el operario tiene varias especialidades; al cambiar se actualiza todo su inicio
@Component({
  selector: 'app-selector-especialidad',
  imports: [Icono],
  template: `
    @if (opciones().length > 1) {
      <div class="segmentos mb-4" [style.grid-template-columns]="'repeat(' + opciones().length + ', minmax(0, 1fr))'"
        role="tablist" aria-label="Actividad">
        @for (o of opciones(); track o.clave) {
          <button type="button" role="tab" (click)="elegir(o.clave)" class="segmento px-1"
            [class.segmento-activo]="sesion.especialidadActiva() == o.clave" [attr.aria-selected]="sesion.especialidadActiva() == o.clave">
            <app-icono [nombre]="o.icono" clase="size-[18px]" />
            <span class="truncate">{{ o.actividad }}</span>
          </button>
        }
      </div>
    }
  `
})
export class SelectorEspecialidad {
  sesion = inject(SesionService);

  opciones = computed(() => this.sesion.misEspecialidades().map(e => oficio(e)));

  elegir(clave: Especialidad) {
    this.sesion.elegirEspecialidad(clave);
  }
}
