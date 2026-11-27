import { Especialidad } from '../models/especialidad';
import { Proceso } from '../models/pedido';
import { Rol } from '../models/usuario';

// configuracion central de cada especialidad: textos, icono y proceso que registra
// el inicio del operario se arma con esto, asi no hay una pantalla por cada oficio
export interface Oficio {
  clave: Especialidad;
  nombre: string;
  actividad: string;
  proceso: Proceso | '';
  icono: string;
  accion: string;
  textoDisponibles: string;
  textoHechas: string;
}

export const OFICIOS: Oficio[] = [
  {
    clave: 'cortador', nombre: 'Cortador', actividad: 'Corte', proceso: 'corte', icono: 'scissors',
    accion: 'Registrar corte', textoDisponibles: 'Por cortar', textoHechas: 'Cortadas'
  },
  {
    clave: 'impresor', nombre: 'Impresor', actividad: 'Impresión', proceso: 'impresion', icono: 'printer',
    accion: 'Registrar impresión', textoDisponibles: 'Por imprimir', textoHechas: 'Impresas'
  },
  {
    clave: 'sublimador', nombre: 'Sublimador', actividad: 'Sublimación', proceso: 'sublimacion', icono: 'plancha-termica',
    accion: 'Registrar sublimación', textoDisponibles: 'Por sublimar', textoHechas: 'Sublimadas'
  },
  {
    clave: 'confeccionista', nombre: 'Confeccionista', actividad: 'Costura', proceso: 'costura', icono: 'maquina-coser',
    accion: 'Registrar costura', textoDisponibles: 'Por coser', textoHechas: 'Confeccionadas'
  },
  {
    clave: 'entregas', nombre: 'Empaque y entregas', actividad: 'Entregas', proceso: '', icono: 'package-check',
    accion: 'Registrar entrega', textoDisponibles: 'Por entregar', textoHechas: 'Entregadas'
  }
];

export function oficio(clave: string): Oficio {
  for (const o of OFICIOS) {
    if (o.clave == clave) {
      return o;
    }
  }
  return OFICIOS[0];
}

// especialidad que se encarga de un proceso
export function especialidadDeProceso(proceso: Proceso): Especialidad {
  for (const o of OFICIOS) {
    if (o.proceso == proceso) {
      return o.clave;
    }
  }
  return 'cortador';
}

// procesos que puede registrar alguien con estas especialidades
export function procesosDe(especialidades: Especialidad[]): Proceso[] {
  const resultado: Proceso[] = [];
  for (const o of OFICIOS) {
    if (o.proceso != '' && especialidades.includes(o.clave)) {
      resultado.push(o.proceso);
    }
  }
  return resultado;
}

// datos para dibujar el avatar automatico segun el cargo
export interface DatosAvatar {
  icono: string;
  fondo: string;
  color: string;
  detalle: boolean;
  etiqueta: string;
}

export function avatarDe(rol: Rol, especialidad: string): DatosAvatar {
  if (rol == 'admin') {
    return { icono: 'shield-user', fondo: 'bg-negro-avatar', color: 'text-white', detalle: true, etiqueta: 'Administrador' };
  }
  if (rol == 'disenador') {
    return { icono: 'pen-tool', fondo: 'bg-rojo-suave', color: 'text-rojo-avatar', detalle: false, etiqueta: 'Diseñador' };
  }
  const o = oficio(especialidad);
  return { icono: o.icono, fondo: 'bg-gris-avatar', color: 'text-negro-2', detalle: false, etiqueta: o.nombre };
}
