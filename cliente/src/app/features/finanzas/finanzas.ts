import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideDynamicIcon } from '@lucide/angular';
import { AvisoService } from '../../core/aviso.service';
import { FinanzasService } from '../../services/finanzas.service';
import { Encabezado } from '../../shared/componentes/encabezado';
import { Vacio } from '../../shared/componentes/vacio';
import { hoy } from '../../shared/fechas';
import { FechaPipe, PesosPipe } from '../../shared/pipes';

@Component({
  selector: 'app-finanzas',
  imports: [FormsModule, LucideDynamicIcon, Encabezado, Vacio, FechaPipe, PesosPipe],
  template: `
    <app-encabezado titulo="Ingresos y gastos" [subtitulo]="'Mes de ' + nombreMes">
      @if (!formAbierto()) {
        <button type="button" (click)="formAbierto.set(true)" class="btn btn-primario">
          <svg lucideIcon="plus" class="size-5"></svg> Nuevo
        </button>
      }
    </app-encabezado>

    <div class="tarjeta mb-5 grid grid-cols-3 divide-x divide-borde p-0 text-center">
      <div class="px-2 py-4">
        <p class="text-base font-bold text-exito sm:text-xl">{{ ingresosMes() | pesos }}</p>
        <p class="text-xs text-gris">Ingresos</p>
      </div>
      <div class="px-2 py-4">
        <p class="text-base font-bold text-error sm:text-xl">{{ gastosMes() | pesos }}</p>
        <p class="text-xs text-gris">Gastos</p>
      </div>
      <div class="px-2 py-4">
        <p class="text-base font-bold sm:text-xl" [class]="{ 'text-texto': ingresosMes() - gastosMes() >= 0, 'text-error': !(ingresosMes() - gastosMes() >= 0) }">{{ ingresosMes() - gastosMes() | pesos }}</p>
        <p class="text-xs text-gris">Balance</p>
      </div>
    </div>

    @if (formAbierto()) {
      <form (ngSubmit)="guardar()" class="tarjeta mb-5 flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-2">
          <button type="button" (click)="tipo = 'ingreso'" class="min-h-12 rounded-xl border font-semibold"
            [class]="{ 'border-exito bg-exito-suave text-exito': tipo == 'ingreso', 'border-borde text-gris': !(tipo == 'ingreso') }">Ingreso</button>
          <button type="button" (click)="tipo = 'gasto'" class="min-h-12 rounded-xl border font-semibold"
            [class]="{ 'border-error bg-error-suave text-error': tipo == 'gasto', 'border-borde text-gris': !(tipo == 'gasto') }">Gasto</button>
        </div>
        <div>
          <label class="etiqueta" for="concepto">Concepto</label>
          <input id="concepto" name="concepto" class="campo" [(ngModel)]="concepto" placeholder="Ej: compra de hilo" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="etiqueta" for="valor">Valor</label>
            <input id="valor" name="valor" type="number" inputmode="numeric" min="0" class="campo" [(ngModel)]="valor" />
          </div>
          <div>
            <label class="etiqueta" for="fecha">Fecha</label>
            <input id="fecha" name="fecha" type="date" class="campo" [(ngModel)]="fecha" />
          </div>
        </div>
        @if (error) { <p class="text-sm font-medium text-error">{{ error }}</p> }
        <div class="flex gap-2">
          <button type="button" (click)="formAbierto.set(false)" class="btn btn-secundario flex-1">Cancelar</button>
          <button type="submit" class="btn btn-primario flex-1">Guardar</button>
        </div>
      </form>
    }

    <div class="tarjeta divide-y divide-borde p-0">
      @for (m of finanzas.ordenados(); track m.id) {
        <div class="flex items-center gap-3 px-4 py-3">
          <div class="flex size-9 shrink-0 items-center justify-center rounded-full"
            [class]="{ 'bg-exito-suave text-exito': m.tipo == 'ingreso', 'bg-error-suave text-error': !(m.tipo == 'ingreso') }">
            @if (m.tipo == 'ingreso') { <svg lucideIcon="arrow-down-left" class="size-4"></svg> }
            @else { <svg lucideIcon="arrow-up-right" class="size-4"></svg> }
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-[15px] font-medium text-texto">{{ m.concepto }}</p>
            <p class="text-sm text-gris">{{ m.fecha | fecha }}</p>
          </div>
          <p class="shrink-0 font-semibold" [class]="{ 'text-exito': m.tipo == 'ingreso', 'text-texto': !(m.tipo == 'ingreso') }">
            @if (m.tipo == 'ingreso') { + } @else { − }{{ m.valor | pesos }}
          </p>
        </div>
      } @empty {
        <app-vacio icono="arrow-left-right" mensaje="Sin movimientos." />
      }
    </div>
  `
})
export class Finanzas {
  finanzas = inject(FinanzasService);
  private aviso = inject(AvisoService);

  formAbierto = signal(false);
  tipo: 'ingreso' | 'gasto' = 'gasto';
  concepto = '';
  valor = 0;
  fecha = hoy();
  error = '';

  mesActual = hoy().substring(0, 7);
  nombreMes = new Date().toLocaleDateString('es-CO', { month: 'long' });

  ingresosMes = computed(() => this.sumar('ingreso'));
  gastosMes = computed(() => this.sumar('gasto'));

  private sumar(tipo: string): number {
    let suma = 0;
    for (const m of this.finanzas.lista()) {
      if (m.tipo == tipo && m.fecha.startsWith(this.mesActual)) {
        suma = suma + m.valor;
      }
    }
    return suma;
  }

  guardar() {
    this.error = '';
    if (!this.concepto.trim()) {
      this.error = 'Escribe el concepto';
      return;
    }
    if (!this.valor || this.valor <= 0) {
      this.error = 'Escribe el valor';
      return;
    }
    this.finanzas.registrar(this.tipo, this.concepto.trim(), Number(this.valor), this.fecha);
    this.concepto = '';
    this.valor = 0;
    this.formAbierto.set(false);
    this.aviso.mostrar('Movimiento guardado');
  }
}
