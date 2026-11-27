import { Injectable, signal } from '@angular/core';

// controla el menu "Más" del celular, se puede abrir desde cualquier pantalla
@Injectable({ providedIn: 'root' })
export class MenuService {
  abierto = signal(false);

  abrir() {
    this.abierto.set(true);
  }

  cerrar() {
    this.abierto.set(false);
  }
}
