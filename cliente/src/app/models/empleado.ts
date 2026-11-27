import { Especialidad } from './especialidad';
import { Proceso } from './pedido';
import { Rol } from './usuario';

export interface Tarifa {
  tipoPrenda: string;
  proceso: Proceso;
  valor: number;
}

// cada cambio de tarifa queda guardado; los pagos viejos usan la tarifa copiada en el registro
export interface CambioTarifa {
  fecha: string;
  tipoPrenda: string;
  proceso: Proceso;
  anterior: number;
  nuevo: number;
}

export interface Empleado {
  id: number;
  nombre: string;
  telefono: string;
  rol: Rol;
  especialidades: Especialidad[];
  especialidadPrincipal: Especialidad | '';
  // procesos que puede registrar, se calculan con las especialidades
  procesos: Proceso[];
  tarifas: Tarifa[];
  historialTarifas: CambioTarifa[];
  activo: boolean;
}
