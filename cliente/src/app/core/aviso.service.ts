import { Injectable, signal } from '@angular/core';

// mensaje corto que aparece abajo cuando se guarda algo
@Injectable({ providedIn: 'root' })
export class AvisoService {
  mensaje = signal('');
  tipo = signal('exito');
  private temporizador: any = null;

  mostrar(mensaje: string, tipo: string = 'exito') {
    this.mensaje.set(mensaje);
    this.tipo.set(tipo);
    if (this.temporizador) {
      clearTimeout(this.temporizador);
    }
    this.temporizador = setTimeout(() => {
      this.mensaje.set('');
    }, 2600);
  }
}
