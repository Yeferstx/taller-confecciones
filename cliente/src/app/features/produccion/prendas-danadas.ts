import { Component, computed, inject } from '@angular/core';
import { ProduccionService } from '../../services/produccion.service';
import { Encabezado } from '../../shared/componentes/encabezado';
import { Vacio } from '../../shared/componentes/vacio';
import { FechaPipe, ProcesoPipe } from '../../shared/pipes';

@Component({
  selector: 'app-prendas-danadas',
  imports: [Encabezado, Vacio, FechaPipe, ProcesoPipe],
  template: `
    <app-encabezado titulo="Prendas dañadas" subtitulo="Reportadas al registrar producción" volver="/produccion" />

    <div class="tarjeta mb-5 flex items-center justify-between">
      <span class="text-[15px] text-gris">Total dañadas</span>
      <span class="text-2xl font-bold text-error">{{ total() }}</span>
    </div>

    <div class="tarjeta divide-y divide-borde p-0">
      @for (r of lista(); track r.id) {
        <div class="flex items-center gap-3 px-4 py-3">
          <div class="min-w-0 flex-1">
            <p class="truncate text-[15px] font-medium text-texto">{{ r.numeroPedido }} · {{ r.tipoPrenda }}</p>
            <p class="text-sm text-gris">{{ r.proceso | proceso }} · {{ r.empleadoNombre }} · {{ r.fecha | fecha }}</p>
          </div>
          <span class="chip bg-error-suave text-error">{{ r.danadas }}</span>
        </div>
      } @empty {
        <app-vacio icono="circle-check" mensaje="No hay prendas dañadas reportadas." />
      }
    </div>
  `
})
export class PrendasDanadas {
  private produccion = inject(ProduccionService);

  lista = computed(() => this.produccion.recientes().filter(r => r.danadas > 0));

  total = computed(() => {
    let suma = 0;
    for (const r of this.lista()) {
      suma = suma + r.danadas;
    }
    return suma;
  });
}
