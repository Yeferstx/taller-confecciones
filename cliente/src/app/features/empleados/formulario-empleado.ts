import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { AvisoService } from '../../core/aviso.service';
import { nombreRol } from '../../core/sesion.service';
import { Empleado, Tarifa } from '../../models/empleado';
import { Especialidad } from '../../models/especialidad';
import { Rol } from '../../models/usuario';
import { ConfiguracionService } from '../../services/configuracion.service';
import { EmpleadosService } from '../../services/empleados.service';
import { Encabezado } from '../../shared/componentes/encabezado';
import { Icono } from '../../shared/componentes/icono';
import { RoleAvatar } from '../../shared/componentes/role-avatar';
import { OFICIOS, procesosDe } from '../../shared/oficios';
import { ProcesoPipe } from '../../shared/pipes';

@Component({
  selector: 'app-formulario-empleado',
  imports: [FormsModule, LucideDynamicIcon, Encabezado, Icono, RoleAvatar, ProcesoPipe],
  template: `
    <app-encabezado [titulo]="tituloPagina()" [volver]="volver()" />

    <form (ngSubmit)="guardar()" class="grid gap-5 lg:grid-cols-2 lg:items-start">
      <div class="flex flex-col gap-5">
        <section class="tarjeta flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <app-role-avatar [rol]="rol()" [especialidad]="principal()" [tamano]="56" [nombre]="form.nombre || 'Nuevo empleado'" />
            <p class="text-[13px] text-gris">El avatar se crea solo según el cargo. No hace falta subir fotos.</p>
          </div>
          <div>
            <label class="etiqueta" for="nombre">Nombre completo</label>
            <input id="nombre" name="nombre" class="campo" [(ngModel)]="form.nombre" placeholder="Ej: Yeymy Archila" />
          </div>
          <div>
            <label class="etiqueta" for="telefono">Teléfono</label>
            <input id="telefono" name="telefono" type="tel" inputmode="tel" class="campo" [(ngModel)]="form.telefono" placeholder="300 000 0000" />
          </div>
          <div>
            <span class="etiqueta" id="titulo-rol">Rol en la app</span>
            <div class="segmentos grid-cols-3" role="radiogroup" aria-labelledby="titulo-rol">
              @for (r of roles; track r) {
                <button type="button" role="radio" (click)="rol.set(r)" class="segmento px-1 text-[13px]"
                  [class.segmento-activo]="rol() == r" [attr.aria-checked]="rol() == r">{{ textoRol(r) }}</button>
              }
            </div>
            <p class="mt-1.5 text-xs text-gris">El rol define qué puede ver. Las especialidades definen qué trabajo hace.</p>
          </div>
          <label class="flex min-h-12 cursor-pointer items-center gap-3 rounded-control border border-borde px-4">
            <input type="checkbox" name="activo" class="size-5 accent-rojo" [(ngModel)]="form.activo" />
            <span class="text-[15px]">Empleado activo</span>
          </label>
        </section>

        @if (rol() == 'operario') {
          <section class="tarjeta">
            <h2 class="titulo-seccion mb-1">Especialidades autorizadas</h2>
            <p class="mb-4 text-[13px] text-gris">Puede tener varias. Marca la principal con la estrella.</p>
            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
              @for (o of oficios; track o.clave) {
                <div class="flex min-h-16 items-center gap-2 rounded-control border px-3 transition-colors"
                  [class]="{ 'border-rojo bg-rojo-suave': tiene(o.clave), 'border-borde bg-white': !(tiene(o.clave)) }">
                  <button type="button" (click)="cambiarEspecialidad(o.clave)" class="flex min-h-14 flex-1 items-center gap-3 text-left"
                    [attr.aria-pressed]="tiene(o.clave)">
                    <span class="icono-caja size-10" [class]="{ 'bg-white text-rojo': tiene(o.clave), 'bg-gris-avatar text-negro-2': !(tiene(o.clave)) }">
                      <app-icono [nombre]="o.icono" clase="size-5" />
                    </span>
                    <span class="min-w-0 flex-1 leading-tight">
                      <span class="block font-semibold text-texto">{{ o.nombre }}</span>
                      @if (principal() == o.clave) { <span class="block text-xs font-semibold text-rojo">Principal</span> }
                    </span>
                    <span class="flex size-6 shrink-0 items-center justify-center rounded-md border"
                      [class]="{ 'border-rojo bg-rojo text-white': tiene(o.clave), 'border-borde bg-white': !(tiene(o.clave)) }">
                      @if (tiene(o.clave)) { <svg lucideIcon="check" class="size-4"></svg> }
                    </span>
                  </button>
                  @if (tiene(o.clave) && especialidades().length > 1 && principal() != o.clave) {
                    <button type="button" (click)="principal.set(o.clave)" class="flex size-11 items-center justify-center rounded-control text-gris hover:text-rojo"
                      [attr.aria-label]="'Hacer principal: ' + o.nombre" title="Hacer principal">
                      <svg lucideIcon="star" class="size-5"></svg>
                    </button>
                  }
                </div>
              }
            </div>
          </section>
        }
      </div>

      <div class="flex flex-col gap-5">
        @if (procesos().length > 0) {
          <section class="tarjeta">
            <h2 class="titulo-seccion mb-1">Tarifas por prenda</h2>
            <p class="mb-4 text-[13px] text-gris">Valor por cada prenda. Los pagos anteriores conservan la tarifa con la que se registraron.</p>
            <div class="flex flex-col gap-4">
              @for (prenda of configuracion.datos().tiposPrenda; track prenda) {
                <div>
                  <p class="mb-2 text-[15px] font-semibold text-texto">{{ prenda }}</p>
                  <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    @for (proceso of procesos(); track proceso) {
                      <label class="block">
                        <span class="mb-1 block text-xs font-medium text-gris">{{ proceso | proceso }}</span>
                        <input type="number" inputmode="numeric" min="0" class="campo min-h-11 px-3"
                          [name]="prenda + proceso" [(ngModel)]="tarifas[clave(prenda, proceso)]" placeholder="0" />
                      </label>
                    }
                  </div>
                </div>
              }
            </div>
          </section>
        }

        @if (error) {
          <p class="rounded-control bg-error-suave px-4 py-3 text-[15px] font-medium text-error" role="alert">{{ error }}</p>
        }
        <button type="submit" class="btn btn-primario min-h-14 w-full">
          <svg lucideIcon="check" class="size-5"></svg> Guardar
        </button>
      </div>
    </form>
  `
})
export class FormularioEmpleado implements OnInit {
  private empleados = inject(EmpleadosService);
  private router = inject(Router);
  private aviso = inject(AvisoService);
  configuracion = inject(ConfiguracionService);

  id = input('');

  oficios = OFICIOS;
  roles: Rol[] = ['operario', 'disenador', 'admin'];
  editando = false;
  error = '';
  form: Empleado = {
    id: 0, nombre: '', telefono: '', rol: 'operario', especialidades: [], especialidadPrincipal: '',
    procesos: [], tarifas: [], historialTarifas: [], activo: true
  };
  // las tarifas se guardan por clave "prenda|proceso" mientras se edita
  tarifas: any = {};

  rol = signal<Rol>('operario');
  especialidades = signal<Especialidad[]>([]);
  principal = signal<Especialidad | ''>('');

  // solo se piden tarifas de los procesos de sus especialidades
  procesos = computed(() => {
    if (this.rol() != 'operario') {
      return [];
    }
    return procesosDe(this.especialidades());
  });

  ngOnInit() {
    if (this.id()) {
      const empleado = this.empleados.obtener(Number(this.id()));
      if (empleado) {
        this.editando = true;
        this.form = Object.assign({}, empleado);
        this.rol.set(empleado.rol);
        this.especialidades.set(empleado.especialidades.slice());
        this.principal.set(empleado.especialidadPrincipal);
        for (const t of empleado.tarifas) {
          this.tarifas[this.clave(t.tipoPrenda, t.proceso)] = t.valor;
        }
      }
    }
  }

  textoRol(rol: Rol): string {
    return nombreRol(rol);
  }

  clave(prenda: string, proceso: string): string {
    return prenda + '|' + proceso;
  }

  tiene(especialidad: Especialidad): boolean {
    return this.especialidades().includes(especialidad);
  }

  cambiarEspecialidad(especialidad: Especialidad) {
    let lista = this.especialidades().slice();
    if (lista.includes(especialidad)) {
      lista = lista.filter(e => e != especialidad);
    } else {
      lista.push(especialidad);
    }
    this.especialidades.set(lista);
    // la principal siempre es una de las elegidas
    if (!lista.includes(this.principal() as Especialidad)) {
      if (lista.length > 0) {
        this.principal.set(lista[0]);
      } else {
        this.principal.set('');
      }
    }
  }

  guardar() {
    this.error = '';
    if (!this.form.nombre.trim()) {
      this.error = 'Escribe el nombre del empleado';
      return;
    }
    if (this.rol() == 'operario' && this.especialidades().length == 0) {
      this.error = 'Selecciona al menos una especialidad';
      return;
    }
    const lista: Tarifa[] = [];
    for (const prenda of this.configuracion.datos().tiposPrenda) {
      for (const proceso of this.procesos()) {
        const valor = Number(this.tarifas[this.clave(prenda, proceso)]) || 0;
        if (valor > 0) {
          lista.push({ tipoPrenda: prenda, proceso: proceso, valor: valor });
        }
      }
    }
    this.form.nombre = this.form.nombre.trim();
    this.form.rol = this.rol();
    if (this.rol() == 'operario') {
      this.form.especialidades = this.especialidades();
      this.form.especialidadPrincipal = this.principal();
    } else {
      this.form.especialidades = [];
      this.form.especialidadPrincipal = '';
    }
    this.form.tarifas = lista;
    const guardado = this.empleados.guardarEmpleado(this.form);
    this.aviso.mostrar('Empleado guardado');
    this.router.navigateByUrl('/empleados/' + guardado.id);
  }

  tituloPagina(): string {
    if (this.editando) {
      return 'Editar empleado';
    }
    return 'Nuevo empleado';
  }

  volver(): string {
    if (this.editando) {
      return '/empleados/' + this.form.id;
    }
    return '/empleados';
  }
}
