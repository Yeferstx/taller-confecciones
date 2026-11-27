import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideDynamicIcon } from '@lucide/angular';
import { AvisoService } from '../../core/aviso.service';
import { Material } from '../../models/material';
import { InventarioService } from '../../services/inventario.service';
import { Encabezado } from '../../shared/componentes/encabezado';
import { Vacio } from '../../shared/componentes/vacio';

@Component({
  selector: 'app-inventario',
  imports: [FormsModule, LucideDynamicIcon, Encabezado, Vacio],
  template: `
    <app-encabezado titulo="Inventario" subtitulo="Materiales del taller">
      @if (!formAbierto()) {
        <button type="button" (click)="nuevo()" class="btn btn-primario">
          <svg lucideIcon="plus" class="size-5"></svg> Nuevo
        </button>
      }
    </app-encabezado>

    @if (bajos().length > 0) {
      <p class="mb-4 flex items-center gap-2 rounded-xl bg-alerta-suave px-4 py-3 text-[15px] text-amber-900">
        <svg lucideIcon="triangle-alert" class="size-5 shrink-0"></svg>
        {{ bajos().length }} material(es) por debajo del mínimo
      </p>
    }

    @if (formAbierto()) {
      <form (ngSubmit)="guardar()" class="tarjeta mb-5 flex flex-col gap-4">
        <div>
          <label class="etiqueta" for="m-nombre">Material</label>
          <input id="m-nombre" name="nombre" class="campo" [(ngModel)]="form.nombre" placeholder="Ej: Tela dry-fit roja" />
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="etiqueta" for="m-cant">Cantidad</label>
            <input id="m-cant" name="cantidad" type="number" inputmode="decimal" min="0" class="campo px-3" [(ngModel)]="form.cantidad" />
          </div>
          <div>
            <label class="etiqueta" for="m-unidad">Unidad</label>
            <input id="m-unidad" name="unidad" class="campo px-3" [(ngModel)]="form.unidad" placeholder="metros" />
          </div>
          <div>
            <label class="etiqueta" for="m-min">Mínimo</label>
            <input id="m-min" name="minimo" type="number" inputmode="decimal" min="0" class="campo px-3" [(ngModel)]="form.minimo" />
          </div>
        </div>
        @if (error) { <p class="text-sm font-medium text-error">{{ error }}</p> }
        <div class="flex gap-2">
          @if (form.id) {
            <button type="button" (click)="eliminar()" class="btn btn-peligro" aria-label="Eliminar material">
              <svg lucideIcon="trash" class="size-5"></svg>
            </button>
          }
          <button type="button" (click)="formAbierto.set(false)" class="btn btn-secundario flex-1">Cancelar</button>
          <button type="submit" class="btn btn-primario flex-1">Guardar</button>
        </div>
      </form>
    }

    <div class="tarjeta divide-y divide-borde p-0">
      @for (m of lista(); track m.id) {
        <div class="flex items-center gap-3 px-4 py-3">
          <button type="button" (click)="editar(m)" class="min-w-0 flex-1 text-left">
            <p class="truncate text-[15px] font-semibold text-texto">{{ m.nombre }}</p>
            <p class="text-sm" [class]="{ 'font-medium text-amber-700': m.cantidad <= m.minimo, 'text-gris': !(m.cantidad <= m.minimo) }">
              {{ m.cantidad }} {{ m.unidad }} · mínimo {{ m.minimo }}
            </p>
          </button>
          <div class="flex shrink-0 items-center gap-1">
            <button type="button" (click)="ajustar(m, -1)" class="flex size-11 items-center justify-center rounded-xl border border-borde" [attr.aria-label]="'Restar ' + m.nombre">
              <svg lucideIcon="minus" class="size-5"></svg>
            </button>
            <button type="button" (click)="ajustar(m, 1)" class="flex size-11 items-center justify-center rounded-xl border border-borde" [attr.aria-label]="'Sumar ' + m.nombre">
              <svg lucideIcon="plus" class="size-5"></svg>
            </button>
          </div>
        </div>
      } @empty {
        <app-vacio icono="package" mensaje="No hay materiales registrados." />
      }
    </div>
  `
})
export class Inventario {
  private inventario = inject(InventarioService);
  private aviso = inject(AvisoService);

  formAbierto = signal(false);
  form: Material = { id: 0, nombre: '', unidad: '', cantidad: 0, minimo: 0 };
  error = '';

  lista = computed(() => {
    const resultado = this.inventario.lista().slice();
    resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
    return resultado;
  });

  bajos = computed(() => this.inventario.lista().filter(m => m.cantidad <= m.minimo));

  nuevo() {
    this.form = { id: 0, nombre: '', unidad: 'metros', cantidad: 0, minimo: 0 };
    this.error = '';
    this.formAbierto.set(true);
  }

  editar(material: Material) {
    this.form = Object.assign({}, material);
    this.error = '';
    this.formAbierto.set(true);
    window.scrollTo(0, 0);
  }

  ajustar(material: Material, cantidad: number) {
    this.inventario.ajustar(material.id, cantidad);
  }

  guardar() {
    if (!this.form.nombre.trim()) {
      this.error = 'Escribe el nombre del material';
      return;
    }
    this.form.cantidad = Number(this.form.cantidad) || 0;
    this.form.minimo = Number(this.form.minimo) || 0;
    this.inventario.guardarMaterial(this.form);
    this.formAbierto.set(false);
    this.aviso.mostrar('Material guardado');
  }

  eliminar() {
    if (!confirm('¿Eliminar este material?')) {
      return;
    }
    this.inventario.eliminar(this.form.id);
    this.formAbierto.set(false);
    this.aviso.mostrar('Material eliminado');
  }
}
