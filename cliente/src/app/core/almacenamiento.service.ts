import { Injectable } from '@angular/core';
import { migrarAVersion3, migrarAVersion4 } from './migraciones';

const PREFIJO = 'taller_';
const VERSION_DATOS = '4';
const CLAVES = ['configuracion', 'empleados', 'clientes', 'pedidos', 'produccion', 'pagos', 'notificaciones', 'materiales', 'movimientos'];

// guarda y lee los datos del navegador (localStorage)
// cuando exista el backend, los servicios llamaran a la api en vez de usar esto
@Injectable({ providedIn: 'root' })
export class AlmacenamientoService {

  // se llama una vez al abrir la app (app.config.ts), antes de mostrar las pantallas
  async iniciar() {
    const version = localStorage.getItem(PREFIJO + 'version');
    if (version == null) {
      await this.cargarDatosDemo();
      return;
    }
    if (version != VERSION_DATOS) {
      this.migrar(version);
    }
  }

  leer(clave: string, porDefecto: any): any {
    const texto = localStorage.getItem(PREFIJO + clave);
    if (texto == null) {
      return porDefecto;
    }
    try {
      return JSON.parse(texto);
    } catch (error) {
      return porDefecto;
    }
  }

  guardar(clave: string, valor: any): boolean {
    try {
      localStorage.setItem(PREFIJO + clave, JSON.stringify(valor));
      return true;
    } catch (error) {
      // pasa cuando el navegador se queda sin espacio (imagenes muy grandes)
      alert('No se pudo guardar. El almacenamiento del navegador está lleno, intenta con una imagen más pequeña.');
      return false;
    }
  }

  // actualiza los datos que ya estan guardados sin borrarlos
  private migrar(version: string) {
    const datos: any = {};
    for (const clave of CLAVES) {
      datos[clave] = this.leer(clave, []);
    }
    datos.sesion = this.leer('sesion', null);
    // cada paso se aplica solo si los datos son mas viejos
    if (Number(version) < 3) {
      migrarAVersion3(datos);
    }
    migrarAVersion4(datos);
    for (const clave of CLAVES) {
      localStorage.setItem(PREFIJO + clave, JSON.stringify(datos[clave]));
    }
    if (datos.sesion) {
      localStorage.setItem(PREFIJO + 'sesion', JSON.stringify(datos.sesion));
    }
    localStorage.setItem(PREFIJO + 'version', VERSION_DATOS);
  }

  // los datos de ejemplo se descargan solo cuando hacen falta
  async cargarDatosDemo() {
    const modulo = await import('./datos-iniciales');
    const datos: any = modulo.crearDatosIniciales();
    migrarAVersion3(datos);
    migrarAVersion4(datos);
    for (const clave of Object.keys(datos)) {
      localStorage.setItem(PREFIJO + clave, JSON.stringify(datos[clave]));
    }
    localStorage.setItem(PREFIJO + 'version', VERSION_DATOS);
  }

  // borra todo y vuelve a los datos de ejemplo (solo desde Configuración)
  async reiniciar() {
    const claves: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const clave = localStorage.key(i);
      if (clave != null && clave.startsWith(PREFIJO)) {
        claves.push(clave);
      }
    }
    for (const clave of claves) {
      localStorage.removeItem(clave);
    }
    await this.cargarDatosDemo();
  }
}
