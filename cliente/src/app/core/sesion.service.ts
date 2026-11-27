import { Injectable, computed, inject, signal } from '@angular/core';
import { Empleado } from '../models/empleado';
import { Especialidad } from '../models/especialidad';
import { Rol, Usuario } from '../models/usuario';
import { EmpleadosService } from '../services/empleados.service';
import { oficio } from '../shared/oficios';
import { AlmacenamientoService } from './almacenamiento.service';

// usuarios de prueba que no son operarios
// los operarios salen de la lista de empleados activos
// el login real con jwt se hara despues en el backend
export const USUARIOS_DEMO: Usuario[] = [
  { nombre: 'Deivy Gómez', rol: 'admin', empleadoId: 0 },
  { nombre: 'Laura Hernández', rol: 'disenador', empleadoId: 0 }
];

export function nombreRol(rol: Rol): string {
  if (rol == 'admin') {
    return 'Administrador';
  }
  if (rol == 'disenador') {
    return 'Diseñadora';
  }
  return 'Operario';
}

// pagina principal de cada rol
export function inicioDelRol(rol: Rol): string {
  return '/inicio';
}

@Injectable({ providedIn: 'root' })
export class SesionService {
  private almacen = inject(AlmacenamientoService);
  private empleados = inject(EmpleadosService);

  usuario = signal<Usuario>(this.almacen.leer('sesion', USUARIOS_DEMO[0]));
  // actividad elegida cuando el operario tiene varias especialidades
  private especialidadElegida = signal<string>(this.almacen.leer('especialidad', ''));

  esAdmin = computed(() => this.usuario().rol == 'admin');
  esDisenador = computed(() => this.usuario().rol == 'disenador');
  esOperario = computed(() => this.usuario().rol == 'operario');

  // empleado del operario que tiene la sesion
  empleado = computed(() => {
    if (!this.esOperario()) {
      return undefined;
    }
    return this.empleados.obtener(this.usuario().empleadoId);
  });

  misEspecialidades = computed(() => {
    const e = this.empleado();
    if (!e) {
      return [];
    }
    return e.especialidades;
  });

  // la activa es la elegida; si no es valida se usa la principal
  especialidadActiva = computed(() => {
    const mias = this.misEspecialidades();
    const elegida = this.especialidadElegida();
    for (const esp of mias) {
      if (esp == elegida) {
        return esp;
      }
    }
    const e = this.empleado();
    if (e && e.especialidadPrincipal) {
      return e.especialidadPrincipal;
    }
    if (mias.length > 0) {
      return mias[0];
    }
    return '';
  });

  // operarios activos con los que se puede probar la app
  operariosDemo = computed(() => this.empleados.activos().filter(e => e.rol == 'operario' && e.especialidades.length > 0));

  // texto del cargo que se muestra bajo el nombre
  cargo = computed(() => {
    const e = this.empleado();
    if (!e) {
      return nombreRol(this.usuario().rol);
    }
    return this.cargoDe(e);
  });

  // especialidad que define el avatar
  especialidadAvatar = computed(() => {
    const e = this.empleado();
    if (!e) {
      return '';
    }
    return e.especialidadPrincipal;
  });

  cargoDe(e: Empleado): string {
    let texto = oficio(e.especialidadPrincipal).nombre;
    const otras = e.especialidades.length - 1;
    if (otras == 1) {
      texto = texto + ' y 1 más';
    }
    if (otras > 1) {
      texto = texto + ' y ' + otras + ' más';
    }
    return texto;
  }

  cambiarUsuario(usuario: Usuario) {
    this.usuario.set(usuario);
    this.almacen.guardar('sesion', usuario);
    this.especialidadElegida.set('');
    this.almacen.guardar('especialidad', '');
  }

  entrarComoOperario(empleado: Empleado) {
    this.cambiarUsuario({ nombre: empleado.nombre, rol: 'operario', empleadoId: empleado.id });
  }

  elegirEspecialidad(especialidad: Especialidad) {
    this.especialidadElegida.set(especialidad);
    this.almacen.guardar('especialidad', especialidad);
  }

  tieneRol(roles: Rol[]): boolean {
    return roles.includes(this.usuario().rol);
  }
}
