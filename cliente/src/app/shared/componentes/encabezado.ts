import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';

// titulo de cada pantalla, con boton de volver opcional
@Component({
  selector: 'app-encabezado',
  imports: [RouterLink, LucideDynamicIcon],
  template: `
    <div class="mb-5 flex items-start gap-3">
      @if (volver()) {
        <a [routerLink]="volver()" aria-label="Volver"
          class="-ml-2 flex size-11 shrink-0 items-center justify-center rounded-xl text-texto hover:bg-white">
          <svg lucideIcon="chevron-left" class="size-6"></svg>
        </a>
      }
      <div class="min-w-0 flex-1 pt-1">
        <h1 class="text-[26px] leading-[1.15] font-bold text-texto sm:text-[28px] lg:text-[34px]">{{ titulo() }}</h1>
        @if (subtitulo()) {
          <p class="mt-0.5 text-[15px] text-gris">{{ subtitulo() }}</p>
        }
      </div>
      <ng-content />
    </div>
  `
})
export class Encabezado {
  titulo = input('');
  subtitulo = input('');
  volver = input('');
}
