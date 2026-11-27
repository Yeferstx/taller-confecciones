import { Component, ElementRef, computed, inject, input, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideDynamicIcon } from '@lucide/angular';
import { AvisoService } from '../../core/aviso.service';
import { Jugador } from '../../models/pedido';
import { PedidosService } from '../../services/pedidos.service';
import { ORDEN_TALLAS, OTRAS_TALLAS, TALLAS_PRINCIPALES } from '../../shared/constantes';
import { FechaPipe } from '../../shared/pipes';

interface ConteoTalla {
  talla: string;
  cantidad: number;
}

// registro rapido de nombre, numero y talla de cada jugador
@Component({
  selector: 'app-jugadores',
  imports: [FormsModule, LucideDynamicIcon, FechaPipe],
  templateUrl: './jugadores.html'
})
export class Jugadores {
  private pedidos = inject(PedidosService);
  private aviso = inject(AvisoService);

  pedidoId = input(0);
  // el disenador solo puede ver
  soloLectura = input(false);

  campoNombre = viewChild<ElementRef>('campoNombre');

  tallasPrincipales = TALLAS_PRINCIPALES;
  otrasTallas = OTRAS_TALLAS;
  verOtras = signal(false);

  nombre = '';
  numero = '';
  talla = signal('');
  editandoId = signal(0);
  error = signal('');

  pedido = computed(() => this.pedidos.lista().find(p => p.id == this.pedidoId()));

  jugadores = computed(() => {
    const pedido = this.pedido();
    if (!pedido) {
      return [];
    }
    return pedido.jugadores;
  });

  faltan = computed(() => {
    const pedido = this.pedido();
    if (!pedido) {
      return 0;
    }
    return pedido.cantidad - pedido.jugadores.length;
  });

  // cuantas prendas hay de cada talla
  resumenTallas = computed(() => {
    const resultado: ConteoTalla[] = [];
    for (const jugador of this.jugadores()) {
      let conteo = resultado.find(c => c.talla == jugador.talla);
      if (!conteo) {
        conteo = { talla: jugador.talla, cantidad: 0 };
        resultado.push(conteo);
      }
      conteo.cantidad++;
    }
    resultado.sort((a, b) => ORDEN_TALLAS.indexOf(a.talla) - ORDEN_TALLAS.indexOf(b.talla));
    return resultado;
  });

  // numeros que estan mas de una vez
  repetidos = computed(() => {
    const textos: string[] = [];
    const vistos: string[] = [];
    for (const jugador of this.jugadores()) {
      if (jugador.numero && !vistos.includes(jugador.numero)) {
        vistos.push(jugador.numero);
        const mismos = this.jugadores().filter(j => j.numero == jugador.numero);
        if (mismos.length > 1) {
          textos.push('#' + jugador.numero + ': ' + mismos.map(j => j.nombre || 'sin nombre').join(', '));
        }
      }
    }
    return textos;
  });

  incompletos = computed(() => this.jugadores().filter(j => !j.nombre || !j.numero));

  historial = computed(() => {
    const pedido = this.pedido();
    if (!pedido) {
      return [];
    }
    return pedido.historial.slice().reverse();
  });

  // texto corto para la advertencia de datos incompletos
  textoIncompleto(jugador: Jugador): string {
    let nombre = jugador.nombre;
    if (!nombre) {
      nombre = 'Sin nombre';
    }
    let numero = 'sin número';
    if (jugador.numero) {
      numero = '#' + jugador.numero;
    }
    return nombre + ' (' + numero + ')';
  }

  esRepetido(jugador: Jugador): boolean {
    if (!jugador.numero) {
      return false;
    }
    return this.jugadores().filter(j => j.numero == jugador.numero).length > 1;
  }

  elegirTalla(talla: string) {
    this.talla.set(talla);
    this.error.set('');
  }

  guardar() {
    this.error.set('');
    if (!this.nombre.trim() && !this.numero.trim()) {
      this.error.set('Escribe al menos el nombre o el número');
      return;
    }
    if (!this.talla()) {
      this.error.set('Selecciona la talla');
      return;
    }
    if (this.editandoId() > 0) {
      this.pedidos.editarJugador(this.pedidoId(), {
        id: this.editandoId(), nombre: this.nombre.trim(), numero: this.numero.trim(), talla: this.talla()
      });
      this.aviso.mostrar('Jugador actualizado');
    } else {
      this.pedidos.agregarJugador(this.pedidoId(), this.nombre, this.numero, this.talla());
      this.aviso.mostrar('Jugador guardado');
    }
    this.limpiar();
  }

  editar(jugador: Jugador) {
    if (this.soloLectura()) {
      return;
    }
    this.editandoId.set(jugador.id);
    this.nombre = jugador.nombre;
    this.numero = jugador.numero;
    this.talla.set(jugador.talla);
    if (!this.tallasPrincipales.includes(jugador.talla)) {
      this.verOtras.set(true);
    }
    this.enfocar();
  }

  eliminar() {
    if (!confirm('¿Quitar este jugador del pedido?')) {
      return;
    }
    this.pedidos.eliminarJugador(this.pedidoId(), this.editandoId());
    this.aviso.mostrar('Jugador eliminado');
    this.limpiar();
  }

  limpiar() {
    this.nombre = '';
    this.numero = '';
    this.talla.set('');
    this.editandoId.set(0);
    this.error.set('');
    this.enfocar();
  }

  // deja el cursor listo para escribir el siguiente jugador
  private enfocar() {
    setTimeout(() => {
      const campo = this.campoNombre();
      if (campo) {
        campo.nativeElement.focus();
      }
    }, 0);
  }
}
