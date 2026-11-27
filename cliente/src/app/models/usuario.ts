export type Rol = 'admin' | 'disenador' | 'operario';

export interface Usuario {
  nombre: string;
  rol: Rol;
  // solo para el operario: el empleado que es
  empleadoId: number;
}
