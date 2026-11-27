import { procesosDe } from '../shared/oficios';
import { ahora } from '../shared/fechas';

// actualiza los datos guardados cuando cambian los modelos, sin borrar nada
// se usa con los datos del navegador y tambien con los datos de ejemplo

function siguienteId(lista: any[]): number {
  let mayor = 0;
  for (const item of lista) {
    if (item.id > mayor) {
      mayor = item.id;
    }
  }
  return mayor + 1;
}

// version 3: especialidades, impresion, entregas parciales, asignaciones y avisos por especialidad
export function migrarAVersion3(datos: any) {
  migrarEmpleados(datos);
  migrarPedidos(datos);
  migrarNotificaciones(datos);
}

function migrarEmpleados(datos: any) {
  const empleados: any[] = datos.empleados || [];
  for (const e of empleados) {
    if (!e.rol) {
      e.rol = 'operario';
    }
    if (!e.especialidades) {
      // las especialidades salen de los procesos que ya hacia
      e.especialidades = [];
      const procesos: string[] = e.procesos || [];
      if (procesos.includes('corte')) {
        e.especialidades.push('cortador');
      }
      if (procesos.includes('sublimacion')) {
        e.especialidades.push('sublimador');
      }
      if (procesos.includes('costura')) {
        e.especialidades.push('confeccionista');
      }
    }
    if (!e.especialidadPrincipal) {
      e.especialidadPrincipal = '';
      if (e.especialidades.length > 0) {
        e.especialidadPrincipal = e.especialidades[0];
      }
    }
    if (!e.historialTarifas) {
      e.historialTarifas = [];
    }
    if (!e.tarifas) {
      e.tarifas = [];
    }
    // el sublimador del ejemplo tambien imprime el papel
    if (e.id == 5 && (e.nombre == 'Wilmer Quintero' || e.nombre == 'Heber Mojica') && !e.especialidades.includes('impresor')) {
      e.especialidades.push('impresor');
      e.tarifas.push({ tipoPrenda: 'Camiseta', proceso: 'impresion', valor: 300 });
      e.tarifas.push({ tipoPrenda: 'Uniforme completo', proceso: 'impresion', valor: 500 });
      e.tarifas.push({ tipoPrenda: 'Pantaloneta', proceso: 'impresion', valor: 250 });
      e.tarifas.push({ tipoPrenda: 'Sudadera', proceso: 'impresion', valor: 400 });
    }
    e.procesos = procesosDe(e.especialidades);
  }

  // si nadie se encarga de empaque y entregas se agrega un empleado de ejemplo
  let hayEntregas = false;
  for (const e of empleados) {
    if (e.especialidades.includes('entregas')) {
      hayEntregas = true;
    }
  }
  if (!hayEntregas) {
    empleados.push({
      id: siguienteId(empleados), nombre: 'Andrés Felipe Ruiz', telefono: '319 704 2286', rol: 'operario',
      especialidades: ['entregas'], especialidadPrincipal: 'entregas', procesos: [], tarifas: [],
      historialTarifas: [], activo: true
    });
  }
  datos.empleados = empleados;
}

function migrarPedidos(datos: any) {
  const pedidos: any[] = datos.pedidos || [];
  const registros: any[] = datos.produccion || [];
  for (const p of pedidos) {
    if (p.entregadas == undefined) {
      p.entregadas = 0;
      if (p.estado == 'entregado') {
        p.entregadas = p.cantidad;
      }
    }
    if (!p.entregas) {
      p.entregas = [];
    }
    if (!p.asignaciones) {
      p.asignaciones = [];
    }
    // a los pedidos de ejemplo que no han empezado a sublimar se les agrega la impresion
    const ejemplo = p.numero == 'P-0005' || p.numero == 'P-0007';
    const abierto = p.estado != 'entregado' && p.estado != 'cancelado';
    if (ejemplo && abierto && p.procesos.includes('sublimacion') && !p.procesos.includes('impresion')) {
      const sublimadas = registros.filter(r => r.pedidoId == p.id && r.proceso == 'sublimacion').length;
      if (sublimadas == 0) {
        const nuevos: string[] = [];
        for (const proceso of ['corte', 'impresion', 'sublimacion', 'costura']) {
          if (proceso == 'impresion' || p.procesos.includes(proceso)) {
            nuevos.push(proceso);
          }
        }
        p.procesos = nuevos;
      }
    }
    // trabajo asignado de ejemplo para el cortador
    if (p.numero == 'P-0007' && abierto && p.asignaciones.length == 0) {
      p.asignaciones.push({ proceso: 'corte', empleadoId: 1 });
    }
  }
  datos.pedidos = pedidos;
}

function migrarNotificaciones(datos: any) {
  const lista: any[] = datos.notificaciones || [];
  for (const n of lista) {
    if (!n.especialidades) {
      n.especialidades = [];
    }
    if (n.empleadoId == undefined) {
      n.empleadoId = 0;
    }
  }
  const pedidos: any[] = datos.pedidos || [];
  const p7 = pedidos.find(p => p.numero == 'P-0007');
  const p5 = pedidos.find(p => p.numero == 'P-0005');
  const p3 = pedidos.find(p => p.numero == 'P-0003');
  // avisos de ejemplo para cada especialidad
  if (p7) {
    lista.push({
      id: siguienteId(lista), fecha: ahora(), tipo: 'produccion', titulo: 'Tienes un nuevo trabajo',
      mensaje: 'P-0007: corte de 30 pantalonetas para Estrellas del Sur.', para: ['operario'],
      especialidades: ['cortador'], empleadoId: 1, enlace: '/mis-trabajos', leida: false
    });
  }
  if (p5) {
    lista.push({
      id: siguienteId(lista), fecha: ahora(), tipo: 'diseno', titulo: 'Diseño aprobado disponible',
      mensaje: 'P-0005 Liga Microfútbol Kennedy ya se puede imprimir.', para: ['operario'],
      especialidades: ['impresor'], empleadoId: 0, enlace: '/mis-trabajos', leida: false
    });
  }
  if (p3) {
    lista.push({
      id: siguienteId(lista), fecha: ahora(), tipo: 'entrega', titulo: 'Hay prendas listas para entregar',
      mensaje: 'P-0003 Colegio Nuevo Horizonte tiene sudaderas terminadas.', para: ['operario'],
      especialidades: ['entregas'], empleadoId: 0, enlace: '/mis-trabajos', leida: false
    });
  }
  datos.notificaciones = lista;
}

// version 4: nombres nuevos del equipo y equipos de clientes mas colombianos
// se cambia el texto exacto en todos los datos guardados, sin borrar nada
const NOMBRES_NUEVOS = [
  ['Hernando Gómez', 'Deivy Gómez'],
  ['Laura Restrepo', 'Laura Hernández'],
  ['Juan Camilo Rojas', 'Luis Archila'],
  ['Jefferson Moreno', 'David Hernández'],
  ['Luz Marina Ortiz', 'Yeymy Archila'],
  ['Wilmer Quintero', 'Heber Mojica'],
  ['Estrellas del Sur', 'Ciudad Bolívar'],
  ['Los Halcones', 'Pijaos del Tolima'],
  ['Colegio Nuevo Horizonte', 'Colegio Simón Bolívar de Soacha'],
  ['Ferretería El Tornillo', 'Ferretería La Sabana'],
  ['Montaña Fría', 'Alto de Letras']
];

export function migrarAVersion4(datos: any) {
  for (const clave of Object.keys(datos)) {
    let texto = JSON.stringify(datos[clave]);
    for (const par of NOMBRES_NUEVOS) {
      texto = texto.split(par[0]).join(par[1]);
    }
    datos[clave] = JSON.parse(texto);
  }
}
