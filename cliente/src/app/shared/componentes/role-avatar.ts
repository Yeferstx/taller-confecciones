import { Component, computed, input } from '@angular/core';
import { Rol } from '../../models/usuario';
import { avatarDe } from '../oficios';
import { Icono } from './icono';

// avatar automatico segun el cargo o la especialidad principal, sin fotos personales
// tamaños sugeridos: listas 36-40, barra superior 44, tarjetas 56, perfil 80
@Component({
  selector: 'app-role-avatar',
  imports: [Icono],
  template: `
    <span class="relative flex items-center justify-center rounded-full" [class]="datos().fondo + ' ' + datos().color"
      [style.width.px]="tamano()" [style.height.px]="tamano()" role="img" [attr.aria-label]="textoAccesible()">
      <app-icono [nombre]="datos().icono" [grosor]="1.9" clase="size-full" [style.width.px]="tamano() * 0.5" [style.height.px]="tamano() * 0.5" />
      @if (datos().detalle) {
        <span class="absolute right-[6%] bottom-[6%] rounded-full bg-rojo ring-2 ring-white"
          [style.width.px]="tamano() * 0.24" [style.height.px]="tamano() * 0.24"></span>
      }
    </span>
  `,
  host: { class: 'inline-flex shrink-0' }
})
export class RoleAvatar {
  rol = input<Rol>('operario');
  especialidad = input('');
  tamano = input(40);
  nombre = input('');

  datos = computed(() => avatarDe(this.rol(), this.especialidad()));

  textoAccesible = computed(() => {
    if (this.nombre()) {
      return this.nombre() + ', ' + this.datos().etiqueta;
    }
    return this.datos().etiqueta;
  });
}
