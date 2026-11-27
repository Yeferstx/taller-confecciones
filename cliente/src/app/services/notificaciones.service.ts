import { Injectable, computed, inject, signal } from '@angular/core';
import { AlmacenamientoService } from '../core/almacenamiento.service';
import { SesionService } from '../core/sesion.service';
import { Especialidad } from '../models/especialidad';
import { Notificacion, TipoNotificacion } from '../models/notificacion';
import { Rol } from '../models/usuario';
import { nuevoId } from '../shared/constantes';
import { ahora } from '../shared/fechas';

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private almacen = inject(AlmacenamientoService);
  private sesion = inject(SesionService);

  lista = signal<Notificacion[]>(this.almacen.leer('notificaciones', []));

  // solo las que le corresponden al usuario actual, las mas nuevas primero
  mias = computed(() => {
    const resultado = this.lista().filter(n => this.esParaMi(n));
    resultado.sort((a, b) => b.fecha.localeCompare(a.fecha));
    return resultado;
  });

  sinLeer = computed(() => this.mias().filter(n => !n.leida).length);

  private esParaMi(n: Notificacion): boolean {
    const usuario = this.sesion.usuario();
    if (!n.para.includes(usuario.rol)) {
      return false;
    }
    if (usuario.rol != 'operario') {
      return true;
    }
    // para operarios se revisa el empleado y sus especialidades
    if (n.empleadoId > 0 && n.empleadoId != usuario.empleadoId) {
      return false;
    }
    if (n.especialidades.length > 0) {
      const mias = this.sesion.misEspecialidades();
      let coincide = false;
      for (const e of n.especialidades) {
        if (mias.includes(e)) {
          coincide = true;
        }
      }
      return coincide;
    }
    return true;
  }

  // crea un aviso para los roles indicados, y opcionalmente para ciertas especialidades o un empleado
  // despues aqui se llamara al backend para enviar la notificacion web push a esos usuarios
  enviar(tipo: TipoNotificacion, titulo: string, mensaje: string, para: Rol[], enlace: string,
    especialidades: Especialidad[] = [], empleadoId: number = 0) {
    const nueva: Notificacion = {
      id: nuevoId(this.lista()),
      fecha: ahora(),
      tipo: tipo,
      titulo: titulo,
      mensaje: mensaje,
      para: para,
      especialidades: especialidades,
      empleadoId: empleadoId,
      enlace: enlace,
      leida: false
    };
    const lista = this.lista().slice();
    lista.push(nueva);
    this.guardar(lista);
  }

  marcarLeida(id: number) {
    const lista = this.lista().slice();
    for (let i = 0; i < lista.length; i++) {
      if (lista[i].id == id) {
        lista[i] = Object.assign({}, lista[i], { leida: true });
      }
    }
    this.guardar(lista);
  }

  marcarTodas() {
    const lista = this.lista().slice();
    for (let i = 0; i < lista.length; i++) {
      if (this.esParaMi(lista[i])) {
        lista[i] = Object.assign({}, lista[i], { leida: true });
      }
    }
    this.guardar(lista);
  }

  private guardar(lista: Notificacion[]) {
    this.lista.set(lista);
    this.almacen.guardar('notificaciones', lista);
  }
}
