import { Injectable, inject, signal } from '@angular/core';
import { AlmacenamientoService } from '../core/almacenamiento.service';
import { Configuracion } from '../models/configuracion';

@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  private almacen = inject(AlmacenamientoService);

  datos = signal<Configuracion>(this.almacen.leer('configuracion', {
    nombreTaller: 'Mi taller', propietario: '', telefono: '', tiposPrenda: ['Camiseta']
  }));

  guardarDatos(datos: Configuracion) {
    this.datos.set(datos);
    this.almacen.guardar('configuracion', datos);
  }
}
