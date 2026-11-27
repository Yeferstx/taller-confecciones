import { Component, input } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';

// muestra un icono de lucide o uno propio del taller (plancha termica y maquina de coser)
// los propios usan el mismo estilo lineal de lucide: viewBox 24, trazo 2 y puntas redondas
@Component({
  selector: 'app-icono',
  imports: [LucideDynamicIcon],
  template: `
    @if (nombre() == 'plancha-termica') {
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" [attr.stroke-width]="grosor()"
        stroke-linecap="round" stroke-linejoin="round" [class]="clase()" aria-hidden="true">
        <rect x="3" y="6.5" width="13" height="4.5" rx="1.5" />
        <path d="M16 8.75h3.5V4H15" />
        <path d="M19.5 8.75V20" />
        <path d="M3 16h13" />
        <path d="M2.5 20h19" />
        <path d="M6.5 13v.5M9.5 13v.5M12.5 13v.5" />
      </svg>
    } @else if (nombre() == 'maquina-coser') {
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" [attr.stroke-width]="grosor()"
        stroke-linecap="round" stroke-linejoin="round" [class]="clase()" aria-hidden="true">
        <path d="M19.5 16V6.5A1.5 1.5 0 0 0 18 5H6.5A1.5 1.5 0 0 0 5 6.5V11h5" />
        <path d="M7.5 11v3" />
        <path d="M13.5 5V3" />
        <circle cx="15.5" cy="10" r="1.5" />
        <rect x="2.5" y="16" width="19" height="3.5" rx="1" />
      </svg>
    } @else {
      <svg [lucideIcon]="nombre()" [class]="clase()" [strokeWidth]="grosor()"></svg>
    }
  `,
  host: { class: 'inline-flex shrink-0' }
})
export class Icono {
  nombre = input('circle');
  clase = input('size-5');
  grosor = input(2);
}
