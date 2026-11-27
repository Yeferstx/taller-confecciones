import { Component, input } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';

@Component({
  selector: 'app-vacio',
  imports: [LucideDynamicIcon],
  template: `
    <div class="flex flex-col items-center px-6 py-10 text-center">
      <div class="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100 text-gris">
        <svg [lucideIcon]="icono()" class="size-6"></svg>
      </div>
      <p class="text-[15px] text-gris">{{ mensaje() }}</p>
      <ng-content />
    </div>
  `
})
export class Vacio {
  icono = input('clipboard-list');
  mensaje = input('');
}
