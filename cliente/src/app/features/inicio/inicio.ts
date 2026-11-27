import { Component, computed, inject } from '@angular/core';
import { SesionService } from '../../core/sesion.service';
import { fechaCorta, hoy, saludo } from '../../shared/fechas';
import { InicioAdmin } from './inicio-admin';
import { InicioDisenador } from './inicio-disenador';
import { InicioOperario } from './inicio-operario';

// inicio de cada rol; el encabezado del celular esta en el layout
@Component({
  selector: 'app-inicio',
  imports: [InicioAdmin, InicioDisenador, InicioOperario],
  template: `
    <!-- computador: banner de bienvenida con fondo en css y la camiseta aparte -->
    <section class="fondo-inicio relative mb-6 hidden h-[236px] overflow-hidden rounded-encabezado text-white shadow-card lg:block">
      <div class="puntos-suaves pointer-events-none absolute inset-0" aria-hidden="true"></div>
      <div class="absolute inset-y-0 left-0 w-1.5 bg-rojo"></div>
      <svg class="pointer-events-none absolute right-[18%] -bottom-10 h-56 w-[70%] text-rojo/20" viewBox="0 0 600 200" fill="none" aria-hidden="true">
        <path d="M0 190 C 200 120, 380 70, 600 40" stroke="currentColor" stroke-width="2.5" />
        <path d="M60 200 C 240 140, 420 100, 600 80" stroke="currentColor" stroke-width="1.25" opacity="0.6" />
      </svg>
      <img src="ideal-sport/camiseta-ideal.webp" alt="" aria-hidden="true" width="760" height="724"
        class="camiseta-integrada pointer-events-none absolute top-[-10%] right-[0%] h-[175%] w-auto select-none" />
      <div class="relative flex h-full max-w-[56%] flex-col justify-center pl-10">
        <p class="text-sm font-medium text-white/60 capitalize">{{ fechaHoy }}</p>
        <h1 class="mt-1 text-[34px] leading-[1.15] font-bold">{{ saludo() }}</h1>
        <p class="mt-2 font-normal text-white/70">{{ subtitulo() }}</p>
      </div>
    </section>

    @if (sesion.esAdmin()) {
      <app-inicio-admin />
    } @else if (sesion.esDisenador()) {
      <app-inicio-disenador />
    } @else {
      <app-inicio-operario />
    }
  `
})
export class Inicio {
  sesion = inject(SesionService);

  fechaHoy = fechaCorta(hoy());
  saludo = computed(() => saludo(this.sesion.usuario().nombre));

  subtitulo = computed(() => {
    if (this.sesion.esAdmin()) {
      return 'Esto es lo más importante del taller hoy.';
    }
    if (this.sesion.esDisenador()) {
      return 'Estos son los diseños que tienes pendientes.';
    }
    return 'Este es el trabajo disponible para ti.';
  });
}
