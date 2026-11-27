import { Cliente } from '../models/cliente';
import { Configuracion } from '../models/configuracion';
import { Tarifa } from '../models/empleado';
import { Material } from '../models/material';
import { Movimiento } from '../models/movimiento';
import { Pago } from '../models/pago';
import { Jugador, Pedido, Proceso } from '../models/pedido';
import { RegistroProduccion } from '../models/produccion';
import { haceDias, sumarDias } from '../shared/fechas';

// datos de ejemplo para la demostracion
// las fechas se calculan desde hoy para que siempre se vean actuales

// imagenes de ejemplo que estan en public/ideal-sport
const IMG = 'ideal-sport/';

function tarifas(lista: any[]): Tarifa[] {
  const resultado: Tarifa[] = [];
  for (const fila of lista) {
    resultado.push({ tipoPrenda: fila[0], proceso: fila[1], valor: fila[2] });
  }
  return resultado;
}

function jugadores(lista: string[][]): Jugador[] {
  const resultado: Jugador[] = [];
  let id = 1;
  for (const fila of lista) {
    resultado.push({ id: id, nombre: fila[0], numero: fila[1], talla: fila[2] });
    id++;
  }
  return resultado;
}

// las especialidades y demas campos nuevos los completa migraciones.ts
const EMPLEADOS: any[] = [
  {
    id: 1, nombre: 'Luis Archila', telefono: '312 548 9021', procesos: ['corte', 'sublimacion'], activo: true,
    tarifas: tarifas([
      ['Camiseta', 'corte', 500], ['Camiseta', 'sublimacion', 1000],
      ['Uniforme completo', 'corte', 900], ['Uniforme completo', 'sublimacion', 1800],
      ['Pantaloneta', 'corte', 400], ['Pantaloneta', 'sublimacion', 800],
      ['Sudadera', 'corte', 1200], ['Polo', 'corte', 600]
    ])
  },
  {
    id: 2, nombre: 'David Hernández', telefono: '301 227 6634', procesos: ['corte', 'costura'], activo: true,
    tarifas: tarifas([
      ['Camiseta', 'corte', 500], ['Camiseta', 'costura', 1500],
      ['Uniforme completo', 'corte', 900], ['Uniforme completo', 'costura', 2800],
      ['Pantaloneta', 'corte', 400], ['Pantaloneta', 'costura', 1200],
      ['Sudadera', 'corte', 1200], ['Sudadera', 'costura', 3500],
      ['Polo', 'corte', 600], ['Polo', 'costura', 2500]
    ])
  },
  {
    id: 3, nombre: 'Yeymy Archila', telefono: '315 880 1247', procesos: ['costura'], activo: true,
    tarifas: tarifas([
      ['Camiseta', 'costura', 1500], ['Uniforme completo', 'costura', 2800], ['Pantaloneta', 'costura', 1200],
      ['Sudadera', 'costura', 3500], ['Polo', 'costura', 2500]
    ])
  },
  {
    id: 4, nombre: 'Yuliana Cárdenas', telefono: '320 614 3398', procesos: ['costura'], activo: true,
    tarifas: tarifas([
      ['Camiseta', 'costura', 1500], ['Uniforme completo', 'costura', 2800], ['Pantaloneta', 'costura', 1200],
      ['Sudadera', 'costura', 3500], ['Polo', 'costura', 2500]
    ])
  },
  {
    id: 5, nombre: 'Heber Mojica', telefono: '318 902 4410', procesos: ['sublimacion'], activo: true,
    tarifas: tarifas([
      ['Camiseta', 'sublimacion', 1000], ['Uniforme completo', 'sublimacion', 1800],
      ['Pantaloneta', 'sublimacion', 800], ['Sudadera', 'sublimacion', 1500]
    ])
  },
  {
    id: 6, nombre: 'Diana Patiño', telefono: '304 551 7789', procesos: ['costura'], activo: false,
    tarifas: tarifas([['Camiseta', 'costura', 1400], ['Pantaloneta', 'costura', 1100]])
  }
];

const CLIENTES: Cliente[] = [
  { id: 1, nombre: 'Edwin Salazar', telefono: '311 402 7788', ciudad: 'Bogotá', notas: 'Entrenador de la Escuela de Fútbol Ciudad Bolívar' },
  { id: 2, nombre: 'Martha Lucía Vargas', telefono: '316 245 9012', ciudad: 'Ibagué', notas: 'Delegada del Club Deportivo Pijaos del Tolima' },
  { id: 3, nombre: 'Colegio Simón Bolívar de Soacha', telefono: '601 742 3310', ciudad: 'Soacha', notas: 'Habla con la coordinadora, señora Gloria' },
  { id: 4, nombre: 'Ferretería La Sabana', telefono: '313 778 2045', ciudad: 'Bogotá', notas: 'Dotación para empleados' },
  { id: 5, nombre: 'Óscar Beltrán', telefono: '300 615 4477', ciudad: 'Bogotá', notas: 'Organizador de la liga de microfútbol de Kennedy' },
  { id: 6, nombre: 'Paula Andrea Mejía', telefono: '317 330 9821', ciudad: 'Tunja', notas: 'Club de ciclismo, pide licras en temporada' }
];

function pedido(datos: any): Pedido {
  const base: Pedido = {
    id: 0, numero: '', clienteId: 0, cliente: '', telefono: '', equipo: '', tipoPrenda: 'Camiseta', cantidad: 0,
    fechaRegistro: '', fechaEntrega: '', precioTotal: 0, anticipo: 0, abonos: 0, imagen: '', observaciones: '',
    procesos: ['corte', 'sublimacion', 'costura'], estado: 'pendiente', personalizado: false, jugadores: [],
    historial: [], estadoDiseno: 'pendiente', disenoRevisar: false, entregadas: 0, entregas: [], asignaciones: []
  };
  return Object.assign(base, datos);
}

const PEDIDOS: Pedido[] = [
  pedido({
    id: 1, numero: 'P-0001', clienteId: 1, cliente: 'Edwin Salazar', telefono: '311 402 7788',
    equipo: 'Torneo Interbarrios Ciudad Bolívar', tipoPrenda: 'Camiseta', cantidad: 100,
    fechaRegistro: sumarDias(-6), fechaEntrega: sumarDias(5), precioTotal: 2500000, anticipo: 1250000,
    imagen: IMG + 'camiseta-negra-roja-frente.webp',
    observaciones: 'Camisetas negras con trazos rojos. Logo del torneo en el pecho, sin nombres.',
    estado: 'en_produccion', estadoDiseno: 'terminado'
  }),
  pedido({
    id: 2, numero: 'P-0002', clienteId: 2, cliente: 'Martha Lucía Vargas', telefono: '316 245 9012',
    equipo: 'Club Deportivo Pijaos del Tolima', tipoPrenda: 'Uniforme completo', cantidad: 18,
    fechaRegistro: sumarDias(-8), fechaEntrega: sumarDias(0), precioTotal: 1170000, anticipo: 600000,
    imagen: IMG + 'uniforme-completo.webp',
    observaciones: 'Camiseta negra con trazos rojos y pantaloneta negra. Escudo en el pecho, número adelante y atrás.',
    estado: 'en_produccion', estadoDiseno: 'en_proceso', personalizado: true,
    jugadores: jugadores([
      ['Juan', '11', 'L'], ['Jefferson', '7', 'M'], ['Carlos', '10', 'XL'], ['Andrés', '23', 'S'],
      ['Brayan', '9', 'M'], ['Kevin', '10', 'L'], ['Santiago', '1', 'L'], ['Sebastián', '5', 'M'],
      ['Duván', '8', 'S'], ['Yeison', '', 'M'], ['Cristian', '14', 'L'], ['Mateo', '17', 'M'],
      ['Alejandro', '3', 'XL'], ['Johan', '20', 'M'], ['Esteban', '6', 'L']
    ]),
    historial: [
      { fecha: haceDias(8, 10), texto: 'Se registraron 12 jugadores' },
      { fecha: haceDias(5, 16), texto: 'Se agregaron Alejandro, Johan y Esteban' },
      { fecha: haceDias(3, 9), texto: 'Andrés cambió de talla M a S' }
    ]
  }),
  pedido({
    id: 3, numero: 'P-0003', clienteId: 3, cliente: 'Colegio Simón Bolívar de Soacha', telefono: '601 742 3310',
    equipo: 'Colegio Simón Bolívar de Soacha - Grado 11', tipoPrenda: 'Sudadera', cantidad: 45,
    fechaRegistro: sumarDias(-15), fechaEntrega: sumarDias(-2), precioTotal: 3825000, anticipo: 2000000, abonos: 500000,
        observaciones: 'Sudadera azul oscuro. Nombre del colegio en la espalda y "Promoción 2026" en la manga.',
    estado: 'en_produccion', estadoDiseno: 'terminado'
  }),
  pedido({
    id: 4, numero: 'P-0004', clienteId: 4, cliente: 'Ferretería La Sabana', telefono: '313 778 2045',
    equipo: 'Ferretería La Sabana', tipoPrenda: 'Polo', cantidad: 30,
    fechaRegistro: sumarDias(-1), fechaEntrega: sumarDias(9), precioTotal: 1140000, anticipo: 500000,
    observaciones: 'Polo gris con logo en el pecho izquierdo. Tallas: 10 M, 12 L y 8 XL.',
    procesos: ['corte', 'costura'], estado: 'pendiente', estadoDiseno: 'pendiente'
  }),
  pedido({
    id: 5, numero: 'P-0005', clienteId: 5, cliente: 'Óscar Beltrán', telefono: '300 615 4477',
    equipo: 'Liga Microfútbol Kennedy', tipoPrenda: 'Camiseta', cantidad: 12,
    fechaRegistro: sumarDias(-3), fechaEntrega: sumarDias(2), precioTotal: 360000, anticipo: 180000,
    imagen: IMG + 'camiseta-roja-blanca.webp',
    observaciones: 'Roja con franja blanca. Nombre arriba del número en la espalda.',
    estado: 'en_produccion', estadoDiseno: 'terminado', personalizado: true,
    jugadores: jugadores([
      ['Luis', '1', 'M'], ['Miguel', '4', 'L'], ['Stiven', '7', 'M'], ['Edwin', '9', 'L'],
      ['Daniel', '10', 'M'], ['Camilo', '11', 'S'], ['Felipe', '13', 'L'], ['Nicolás', '15', 'M'],
      ['Jhon', '16', 'XL'], ['Óscar', '19', 'L'], ['Diego', '21', 'M'], ['Andrés', '22', 'M']
    ]),
    historial: [{ fecha: haceDias(3, 11), texto: 'Se registraron 12 jugadores' }]
  }),
  pedido({
    id: 6, numero: 'P-0006', clienteId: 6, cliente: 'Paula Andrea Mejía', telefono: '317 330 9821',
    equipo: 'Club de Ciclismo Alto de Letras', tipoPrenda: 'Camiseta', cantidad: 20,
    fechaRegistro: sumarDias(-25), fechaEntrega: sumarDias(-10), precioTotal: 900000, anticipo: 450000, abonos: 450000,
    imagen: IMG + 'camiseta-negra-roja-espalda.webp',
    observaciones: 'Camiseta de ciclismo manga corta con bolsillos atrás.',
    estado: 'entregado', estadoDiseno: 'terminado'
  }),
  pedido({
    id: 7, numero: 'P-0007', clienteId: 1, cliente: 'Edwin Salazar', telefono: '311 402 7788',
    equipo: 'Ciudad Bolívar - Categoría infantil', tipoPrenda: 'Pantaloneta', cantidad: 30,
    fechaRegistro: sumarDias(-2), fechaEntrega: sumarDias(12), precioTotal: 540000, anticipo: 0,
    imagen: IMG + 'pantaloneta-negra.webp',
    observaciones: 'Pantaloneta negra con franja roja, tallas de niño (8 a 14).',
    estado: 'pendiente', estadoDiseno: 'pendiente'
  })
];

// arma un registro de produccion de ejemplo
function registro(id: number, pedidoId: number, proceso: Proceso, empleadoId: number, cantidad: number, tarifa: number, dias: number, extra: any): RegistroProduccion {
  let pedidoEncontrado = PEDIDOS[0];
  for (const p of PEDIDOS) {
    if (p.id == pedidoId) {
      pedidoEncontrado = p;
    }
  }
  let empleadoEncontrado = EMPLEADOS[0];
  for (const e of EMPLEADOS) {
    if (e.id == empleadoId) {
      empleadoEncontrado = e;
    }
  }
  const nuevo: RegistroProduccion = {
    id: id, pedidoId: pedidoId, numeroPedido: pedidoEncontrado.numero, tipoPrenda: pedidoEncontrado.tipoPrenda,
    proceso: proceso, empleadoId: empleadoId, empleadoNombre: empleadoEncontrado.nombre, cantidad: cantidad,
    danadas: 0, fecha: haceDias(dias, 9 + (id % 8)), tarifa: tarifa, total: cantidad * tarifa,
    aprobado: true, autorizadoExceso: false, abonado: 0
  };
  return Object.assign(nuevo, extra);
}

const REGISTROS: RegistroProduccion[] = [
  registro(1, 6, 'corte', 1, 20, 500, 20, { abonado: 10000 }),
  registro(2, 6, 'sublimacion', 5, 20, 1000, 18, { abonado: 20000 }),
  registro(3, 6, 'costura', 4, 20, 1500, 15, { abonado: 30000 }),
  registro(4, 3, 'corte', 2, 45, 1200, 12, { abonado: 30000 }),
  registro(5, 3, 'sublimacion', 5, 45, 1500, 9, {}),
  registro(6, 2, 'corte', 1, 18, 900, 6, {}),
  registro(7, 1, 'corte', 1, 60, 500, 5, {}),
  registro(8, 1, 'corte', 2, 40, 500, 5, {}),
  registro(9, 3, 'costura', 3, 20, 3500, 4, {}),
  registro(10, 1, 'sublimacion', 5, 80, 1000, 3, {}),
  registro(11, 2, 'sublimacion', 1, 12, 1800, 2, { danadas: 1 }),
  registro(12, 3, 'costura', 4, 18, 3500, 2, { danadas: 2 }),
  registro(13, 1, 'costura', 3, 30, 1500, 1, {}),
  registro(14, 1, 'costura', 4, 20, 1500, 1, {}),
  registro(15, 5, 'corte', 1, 12, 500, 0, { aprobado: false })
];

const PAGOS: Pago[] = [
  { id: 1, empleadoId: 1, empleadoNombre: 'Luis Archila', fecha: haceDias(14, 17), valor: 10000, tipo: 'completo', registros: [1], nota: '' },
  { id: 2, empleadoId: 5, empleadoNombre: 'Heber Mojica', fecha: haceDias(14, 17), valor: 20000, tipo: 'completo', registros: [2], nota: '' },
  { id: 3, empleadoId: 4, empleadoNombre: 'Yuliana Cárdenas', fecha: haceDias(12, 17), valor: 30000, tipo: 'completo', registros: [3], nota: '' },
  { id: 4, empleadoId: 2, empleadoNombre: 'David Hernández', fecha: haceDias(7, 17), valor: 30000, tipo: 'parcial', registros: [4], nota: 'Abono, el resto el sábado' }
];

const NOTIFICACIONES: any[] = [
  { id: 1, fecha: haceDias(3, 15), tipo: 'produccion', titulo: 'Prendas listas para costura', mensaje: 'P-0001: 80 camisetas sublimadas esperan costura.', para: ['admin', 'operario'], enlace: '/produccion', leida: true },
  { id: 2, fecha: haceDias(2, 10), tipo: 'pedido', titulo: 'Nuevo pedido registrado', mensaje: 'P-0007: 30 pantalonetas para Ciudad Bolívar.', para: ['admin', 'disenador'], enlace: '/pedidos/7', leida: true },
  { id: 3, fecha: haceDias(1, 11), tipo: 'pedido', titulo: 'Nuevo pedido registrado', mensaje: 'P-0004: 30 polos para Ferretería La Sabana.', para: ['admin', 'disenador'], enlace: '/pedidos/4', leida: false },
  { id: 4, fecha: haceDias(0, 7), tipo: 'alerta', titulo: 'Pedido atrasado', mensaje: 'P-0003 del Colegio Simón Bolívar de Soacha debía entregarse hace 2 días.', para: ['admin'], enlace: '/pedidos/3', leida: false },
  { id: 5, fecha: haceDias(0, 7), tipo: 'entrega', titulo: 'Entrega pendiente hoy', mensaje: 'P-0002 de Pijaos del Tolima se entrega hoy.', para: ['admin'], enlace: '/pedidos/2', leida: false },
  { id: 6, fecha: haceDias(0, 8), tipo: 'produccion', titulo: 'Producción por aprobar', mensaje: 'Luis Archila registró 12 cortes en P-0005.', para: ['admin'], enlace: '/produccion', leida: false },
  { id: 7, fecha: haceDias(1, 16), tipo: 'diseno', titulo: 'Diseño pendiente', mensaje: 'P-0004 y P-0007 esperan diseño.', para: ['disenador'], enlace: '/disenos', leida: false },
  { id: 8, fecha: haceDias(1, 9), tipo: 'produccion', titulo: 'Prendas disponibles para sublimar', mensaje: 'P-0002: hay 6 uniformes cortados por sublimar.', para: ['operario'], enlace: '/produccion', leida: false }
];

const MATERIALES: Material[] = [
  { id: 1, nombre: 'Tela dry-fit blanca', unidad: 'metros', cantidad: 180, minimo: 50 },
  { id: 2, nombre: 'Tela anti-fluido azul oscuro', unidad: 'metros', cantidad: 35, minimo: 40 },
  { id: 3, nombre: 'Papel de sublimación', unidad: 'rollos', cantidad: 6, minimo: 3 },
  { id: 4, nombre: 'Tinta de sublimación CMYK', unidad: 'juegos', cantidad: 2, minimo: 2 },
  { id: 5, nombre: 'Hilo poliéster blanco', unidad: 'conos', cantidad: 24, minimo: 10 },
  { id: 6, nombre: 'Hilo poliéster negro', unidad: 'conos', cantidad: 8, minimo: 10 },
  { id: 7, nombre: 'Resorte de 3 cm', unidad: 'metros', cantidad: 120, minimo: 30 },
  { id: 8, nombre: 'Cuello rib', unidad: 'unidades', cantidad: 60, minimo: 40 }
];

const MOVIMIENTOS: Movimiento[] = [
  { id: 1, fecha: sumarDias(-25), tipo: 'ingreso', concepto: 'Anticipo P-0006', valor: 450000 },
  { id: 2, fecha: sumarDias(-20), tipo: 'gasto', concepto: 'Arriendo del local', valor: 1200000 },
  { id: 3, fecha: sumarDias(-15), tipo: 'ingreso', concepto: 'Anticipo P-0003', valor: 2000000 },
  { id: 4, fecha: sumarDias(-14), tipo: 'gasto', concepto: 'Pago a Luis Archila', valor: 10000 },
  { id: 5, fecha: sumarDias(-14), tipo: 'gasto', concepto: 'Pago a Heber Mojica', valor: 20000 },
  { id: 6, fecha: sumarDias(-12), tipo: 'gasto', concepto: 'Pago a Yuliana Cárdenas', valor: 30000 },
  { id: 7, fecha: sumarDias(-10), tipo: 'ingreso', concepto: 'Saldo P-0006', valor: 450000 },
  { id: 8, fecha: sumarDias(-10), tipo: 'gasto', concepto: 'Compra de tela dry-fit (60 m)', valor: 850000 },
  { id: 9, fecha: sumarDias(-8), tipo: 'ingreso', concepto: 'Anticipo P-0002', valor: 600000 },
  { id: 10, fecha: sumarDias(-7), tipo: 'gasto', concepto: 'Pago a David Hernández', valor: 30000 },
  { id: 11, fecha: sumarDias(-6), tipo: 'ingreso', concepto: 'Anticipo P-0001', valor: 1250000 },
  { id: 12, fecha: sumarDias(-6), tipo: 'gasto', concepto: 'Papel y tinta de sublimación', valor: 260000 },
  { id: 13, fecha: sumarDias(-5), tipo: 'ingreso', concepto: 'Abono P-0003', valor: 500000 },
  { id: 14, fecha: sumarDias(-3), tipo: 'ingreso', concepto: 'Anticipo P-0005', valor: 180000 },
  { id: 15, fecha: sumarDias(-1), tipo: 'ingreso', concepto: 'Anticipo P-0004', valor: 500000 }
];

const CONFIGURACION: Configuracion = {
  nombreTaller: 'Ideal Publicidad Sport',
  propietario: 'Deivy Gómez',
  telefono: '310 456 7821',
  tiposPrenda: ['Camiseta', 'Uniforme completo', 'Pantaloneta', 'Sudadera', 'Polo', 'Chaqueta']
};

export function crearDatosIniciales() {
  return {
    configuracion: CONFIGURACION,
    empleados: EMPLEADOS,
    clientes: CLIENTES,
    pedidos: PEDIDOS,
    produccion: REGISTROS,
    pagos: PAGOS,
    notificaciones: NOTIFICACIONES,
    materiales: MATERIALES,
    movimientos: MOVIMIENTOS
  };
}
