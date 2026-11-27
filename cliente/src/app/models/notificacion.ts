import { Especialidad } from './especialidad';
import { Rol } from './usuario';

export type TipoNotificacion = 'pedido' | 'diseno' | 'produccion' | 'entrega' | 'pago' | 'alerta';

export interface Notificacion {
  id: number;
  fecha: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  // roles que deben recibir el aviso
  para: Rol[];
  // si tiene especialidades, solo les llega a los operarios con alguna de ellas
  especialidades: Especialidad[];
  // si es mayor a cero, solo le llega a ese empleado (luego sera el usuario de web push)
  empleadoId: number;
  enlace: string;
  leida: boolean;
}
