import { Component, inject, output } from '@angular/core';
import { Router } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { AvisoService } from '../../core/aviso.service';
import { SesionService, USUARIOS_DEMO, inicioDelRol, nombreRol } from '../../core/sesion.service';
import { Empleado } from '../../models/empleado';
import { Usuario } from '../../models/usuario';
import { RoleAvatar } from './role-avatar';

// lista para probar la app como administrador, diseñadora o cualquier operario
// el inicio de sesion real se hara con el backend
@Component({
  selector: 'app-selector-usuario',
  imports: [LucideDynamicIcon, RoleAvatar],
  template: `
    <p class="mb-2 text-[13px] font-semibold text-gris">Ver la app como (demostración)</p>
    <div class="flex flex-col gap-1.5">
      @for (usuario of usuarios; track usuario.rol) {
        <button type="button" (click)="verComo(usuario)"
          class="flex min-h-14 items-center gap-3 rounded-control border px-3 text-left transition-colors"
          [class]="{ 'border-rojo bg-rojo-suave': esActual(usuario.rol, 0), 'border-borde hover:bg-gris-claro': !(esActual(usuario.rol, 0)) }">
          <app-role-avatar [rol]="usuario.rol" [tamano]="38" [nombre]="usuario.nombre" />
          <span class="min-w-0 flex-1 leading-tight">
            <span class="block truncate text-[15px] font-semibold text-texto">{{ usuario.nombre }}</span>
            <span class="block text-[13px] font-normal text-gris">{{ textoRol(usuario) }}</span>
          </span>
          @if (esActual(usuario.rol, 0)) { <svg lucideIcon="check" class="size-5 text-rojo"></svg> }
        </button>
      }
      @for (e of sesion.operariosDemo(); track e.id) {
        <button type="button" (click)="verComoOperario(e)"
          class="flex min-h-14 items-center gap-3 rounded-control border px-3 text-left transition-colors"
          [class]="{ 'border-rojo bg-rojo-suave': esActual('operario', e.id), 'border-borde hover:bg-gris-claro': !(esActual('operario', e.id)) }">
          <app-role-avatar rol="operario" [especialidad]="e.especialidadPrincipal" [tamano]="38" [nombre]="e.nombre" />
          <span class="min-w-0 flex-1 leading-tight">
            <span class="block truncate text-[15px] font-semibold text-texto">{{ e.nombre }}</span>
            <span class="block text-[13px] font-normal text-gris">{{ sesion.cargoDe(e) }}</span>
          </span>
          @if (esActual('operario', e.id)) { <svg lucideIcon="check" class="size-5 text-rojo"></svg> }
        </button>
      }
    </div>
  `
})
export class SelectorUsuario {
  sesion = inject(SesionService);
  private router = inject(Router);
  private aviso = inject(AvisoService);

  cambiado = output();
  usuarios = USUARIOS_DEMO;

  textoRol(usuario: Usuario): string {
    return nombreRol(usuario.rol);
  }

  esActual(rol: string, empleadoId: number): boolean {
    const actual = this.sesion.usuario();
    return actual.rol == rol && actual.empleadoId == empleadoId;
  }

  verComo(usuario: Usuario) {
    this.sesion.cambiarUsuario(usuario);
    this.terminar(usuario.nombre);
  }

  verComoOperario(e: Empleado) {
    this.sesion.entrarComoOperario(e);
    this.terminar(e.nombre);
  }

  private terminar(nombre: string) {
    this.cambiado.emit();
    this.router.navigateByUrl(inicioDelRol(this.sesion.usuario().rol));
    this.aviso.mostrar('Ahora ves la app como ' + nombre.split(' ')[0]);
  }
}
