// funciones sencillas para manejar fechas en formato AAAA-MM-DD

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

function dosDigitos(numero: number): string {
  if (numero < 10) {
    return '0' + numero;
  }
  return '' + numero;
}

export function fechaATexto(fecha: Date): string {
  return fecha.getFullYear() + '-' + dosDigitos(fecha.getMonth() + 1) + '-' + dosDigitos(fecha.getDate());
}

export function hoy(): string {
  return fechaATexto(new Date());
}

export function sumarDias(dias: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fechaATexto(fecha);
}

// fecha y hora actual, se usa en registros y notificaciones
export function ahora(): string {
  return new Date().toISOString();
}

// fecha y hora de hace unos dias (para los datos de prueba)
export function haceDias(dias: number, hora: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  fecha.setHours(hora, 15, 0, 0);
  return fecha.toISOString();
}

export function textoAFecha(texto: string): Date {
  const partes = texto.substring(0, 10).split('-');
  return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
}

// dias que faltan desde hoy hasta la fecha (negativo si ya paso)
export function diasHasta(texto: string): number {
  const fecha = textoAFecha(texto);
  const actual = textoAFecha(hoy());
  const diferencia = fecha.getTime() - actual.getTime();
  return Math.round(diferencia / 86400000);
}

// convierte una fecha ISO con hora a fecha local AAAA-MM-DD
export function soloFecha(iso: string): string {
  if (iso.length <= 10) {
    return iso;
  }
  return fechaATexto(new Date(iso));
}

export function fechaCorta(texto: string): string {
  const fecha = textoAFecha(soloFecha(texto));
  return DIAS[fecha.getDay()] + ' ' + fecha.getDate() + ' ' + MESES[fecha.getMonth()];
}

export function horaCorta(iso: string): string {
  const fecha = new Date(iso);
  let horas = fecha.getHours();
  let sufijo = 'a. m.';
  if (horas >= 12) {
    sufijo = 'p. m.';
  }
  if (horas > 12) {
    horas = horas - 12;
  }
  if (horas == 0) {
    horas = 12;
  }
  return horas + ':' + dosDigitos(fecha.getMinutes()) + ' ' + sufijo;
}

// texto amigable: hoy, mañana, en 3 días, hace 2 días
export function textoEntrega(texto: string): string {
  const dias = diasHasta(texto);
  if (dias == 0) {
    return 'Hoy';
  }
  if (dias == 1) {
    return 'Mañana';
  }
  if (dias == -1) {
    return 'Ayer';
  }
  if (dias < 0) {
    return 'Hace ' + (dias * -1) + ' días';
  }
  if (dias < 7) {
    return 'En ' + dias + ' días';
  }
  return fechaCorta(texto);
}

// saludo segun la hora: buenos dias, buenas tardes o buenas noches
export function saludo(nombreCompleto: string): string {
  const hora = new Date().getHours();
  const nombre = nombreCompleto.split(' ')[0];
  if (hora < 12) {
    return 'Buenos días, ' + nombre;
  }
  if (hora < 19) {
    return 'Buenas tardes, ' + nombre;
  }
  return 'Buenas noches, ' + nombre;
}
