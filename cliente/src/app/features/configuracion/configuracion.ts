import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideDynamicIcon } from '@lucide/angular';
import { AlmacenamientoService } from '../../core/almacenamiento.service';
import { AvisoService } from '../../core/aviso.service';
import { Configuracion } from '../../models/configuracion';
import { ConfiguracionService } from '../../services/configuracion.service';
import { Encabezado } from '../../shared/componentes/encabezado';

@Component({
  selector: 'app-configuracion',
  imports: [FormsModule, LucideDynamicIcon, Encabezado],
  template: `
    <app-encabezado titulo="Configuración" />

    <div class="mx-auto flex max-w-2xl flex-col gap-5">
      <form (ngSubmit)="guardar()" class="tarjeta flex flex-col gap-4">
        <h2 class="font-semibold">Datos del taller</h2>
        <div>
          <label class="etiqueta" for="taller">Nombre del taller</label>
          <input id="taller" name="taller" class="campo" [(ngModel)]="form.nombreTaller" />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="etiqueta" for="dueno">Propietario</label>
            <input id="dueno" name="dueno" class="campo" [(ngModel)]="form.propietario" />
          </div>
          <div>
            <label class="etiqueta" for="tel">Teléfono</label>
            <input id="tel" name="tel" type="tel" class="campo" [(ngModel)]="form.telefono" />
          </div>
        </div>

        <div>
          <span class="etiqueta">Tipos de prenda</span>
          <div class="mb-3 flex flex-wrap gap-2">
            @for (tipo of form.tiposPrenda; track tipo) {
              <span class="inline-flex min-h-11 items-center gap-1 rounded-xl border border-borde pr-1 pl-3 text-[15px]">
                {{ tipo }}
                <button type="button" (click)="quitarTipo(tipo)" class="flex size-8 items-center justify-center rounded-lg text-gris hover:text-error" [attr.aria-label]="'Quitar ' + tipo">
                  <svg lucideIcon="x" class="size-4"></svg>
                </button>
              </span>
            }
          </div>
          <div class="flex gap-2">
            <input name="nuevoTipo" class="campo flex-1" placeholder="Agregar tipo de prenda" [(ngModel)]="nuevoTipo" (keydown.enter)="agregarTipo($event)" />
            <button type="button" (click)="agregarTipo(null)" class="btn btn-secundario">Agregar</button>
          </div>
        </div>
        <button type="submit" class="btn btn-primario w-full">Guardar cambios</button>
      </form>

      <section class="tarjeta">
        <h2 class="font-semibold">Datos de demostración</h2>
        <p class="mt-1 mb-4 text-sm text-gris">
          La información se guarda en este navegador. Puedes volver a los datos de ejemplo cuando quieras.
        </p>
        <button type="button" (click)="reiniciar()" class="btn btn-peligro w-full">
          <svg lucideIcon="rotate-ccw" class="size-5"></svg> Restaurar datos de ejemplo
        </button>
      </section>

      <section class="tarjeta text-sm text-gris">
        <h2 class="mb-1 text-[15px] font-semibold text-texto">Próximamente</h2>
        <p>Inicio de sesión con usuario y contraseña, base de datos en línea y notificaciones push en el celular.</p>
      </section>
    </div>
  `
})
export class ConfiguracionPagina {
  private configuracion = inject(ConfiguracionService);
  private almacen = inject(AlmacenamientoService);
  private aviso = inject(AvisoService);

  form: Configuracion = Object.assign({}, this.configuracion.datos());
  nuevoTipo = '';

  constructor() {
    this.form.tiposPrenda = this.configuracion.datos().tiposPrenda.slice();
  }

  agregarTipo(evento: Event | null) {
    if (evento) {
      evento.preventDefault();
    }
    const tipo = this.nuevoTipo.trim();
    if (tipo && !this.form.tiposPrenda.includes(tipo)) {
      this.form.tiposPrenda.push(tipo);
    }
    this.nuevoTipo = '';
  }

  quitarTipo(tipo: string) {
    if (this.form.tiposPrenda.length == 1) {
      this.aviso.mostrar('Debe quedar al menos un tipo de prenda', 'error');
      return;
    }
    this.form.tiposPrenda = this.form.tiposPrenda.filter(t => t != tipo);
  }

  guardar() {
    if (!this.form.nombreTaller.trim()) {
      this.aviso.mostrar('Escribe el nombre del taller', 'error');
      return;
    }
    this.configuracion.guardarDatos(Object.assign({}, this.form));
    this.aviso.mostrar('Configuración guardada');
  }

  async reiniciar() {
    if (!confirm('Se borrarán todos los cambios y se cargarán los datos de ejemplo. ¿Continuar?')) {
      return;
    }
    await this.almacen.reiniciar();
    location.href = document.baseURI;
  }
}
