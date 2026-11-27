import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { AvisoService } from '../../core/aviso.service';
import { SesionService } from '../../core/sesion.service';
import { PedidosService } from '../../services/pedidos.service';
import { ProduccionService } from '../../services/produccion.service';
import { FilaAvance } from '../../shared/componentes/fila-avance';
import { MiniaturaPrenda } from '../../shared/componentes/miniatura-prenda';
import { RoleAvatar } from '../../shared/componentes/role-avatar';
import { EmpleadosService } from '../../services/empleados.service';
import { imagenPrenda } from '../../shared/prendas';
import { Encabezado } from '../../shared/componentes/encabezado';
import { Vacio } from '../../shared/componentes/vacio';
import { FechaPipe, PesosPipe, ProcesoPipe } from '../../shared/pipes';

@Component({
  selector: 'app-produccion',
  imports: [RouterLink, LucideDynamicIcon, Encabezado, FilaAvance, MiniaturaPrenda, RoleAvatar, Vacio, FechaPipe, PesosPipe, ProcesoPipe],
  templateUrl: './produccion.html'
})
export class Produccion {
  sesion = inject(SesionService);
  produccion = inject(ProduccionService);
  empleados = inject(EmpleadosService);
  private pedidos = inject(PedidosService);
  private aviso = inject(AvisoService);

  // pedidos en curso con el avance de cada proceso
  enCurso = computed(() => {
    this.produccion.registros();
    return this.pedidos.activos().map(p => {
      return {
        pedido: p,
        imagen: imagenPrenda(p),
        procesos: p.procesos.map(proceso => {
          return { proceso: proceso, hecho: this.produccion.avance(p.id, proceso) };
        })
      };
    });
  });

  // el operario solo ve lo suyo
  recientes = computed(() => {
    let lista = this.produccion.recientes();
    if (this.sesion.esOperario()) {
      lista = lista.filter(r => r.empleadoId == this.sesion.usuario().empleadoId);
    }
    return lista.slice(0, 8);
  });

  aprobar(id: number) {
    this.produccion.aprobar(id);
    this.aviso.mostrar('Registro aprobado');
  }

  rechazar(id: number) {
    if (!confirm('¿Borrar este registro? Las prendas se descuentan del avance.')) {
      return;
    }
    const error = this.produccion.eliminar(id);
    if (error) {
      this.aviso.mostrar(error, 'error');
      return;
    }
    this.aviso.mostrar('Registro borrado');
  }
}
