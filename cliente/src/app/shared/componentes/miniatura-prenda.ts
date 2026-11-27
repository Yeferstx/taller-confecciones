import { Component, input } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';

// foto pequeña de la prenda para reconocer el pedido
@Component({
  selector: 'app-miniatura-prenda',
  imports: [LucideDynamicIcon],
  template: `
    <div class="flex items-center justify-center overflow-hidden rounded-control bg-white ring-1 ring-borde" [class]="tamano()">
      @if (imagen()) {
        <img [src]="imagen()" [alt]="texto()" class="size-full object-contain" loading="lazy" />
      } @else {
        <svg lucideIcon="shirt" class="size-1/2 text-gray-400"></svg>
      }
    </div>
  `,
  host: { class: 'shrink-0' }
})
export class MiniaturaPrenda {
  imagen = input('');
  texto = input('Prenda');
  tamano = input('size-14');
}
