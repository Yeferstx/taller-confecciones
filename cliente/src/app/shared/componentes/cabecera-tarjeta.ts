import { Component, input } from '@angular/core';
import { Icono } from './icono';

// recuadro gris con icono rojo que explica para que sirve la pantalla
@Component({
  selector: 'app-cabecera-tarjeta',
  imports: [Icono],
  template: `
    <div class="flex items-center gap-3 rounded-tarjeta bg-gris-claro p-3.5 ring-1 ring-borde">
      <div class="icono-caja size-12 bg-rojo-suave text-rojo">
        <app-icono [nombre]="icono()" clase="size-6" />
      </div>
      <div class="min-w-0">
        <p class="text-[17px] leading-tight font-bold text-texto">{{ titulo() }}</p>
        @if (subtitulo()) {
          <p class="mt-0.5 text-sm text-gris">{{ subtitulo() }}</p>
        }
      </div>
    </div>
  `
})
export class CabeceraTarjeta {
  icono = input('clipboard-list');
  titulo = input('');
  subtitulo = input('');
}
