// achica la foto antes de guardarla para no llenar el localStorage
export function reducirImagen(archivo: File, tamanoMaximo: number): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => {
      const imagen = new Image();
      imagen.onload = () => {
        let ancho = imagen.width;
        let alto = imagen.height;
        if (ancho > tamanoMaximo || alto > tamanoMaximo) {
          if (ancho > alto) {
            alto = Math.round((alto * tamanoMaximo) / ancho);
            ancho = tamanoMaximo;
          } else {
            ancho = Math.round((ancho * tamanoMaximo) / alto);
            alto = tamanoMaximo;
          }
        }
        const lienzo = document.createElement('canvas');
        lienzo.width = ancho;
        lienzo.height = alto;
        const contexto = lienzo.getContext('2d');
        if (!contexto) {
          rechazar('No se pudo leer la imagen');
          return;
        }
        contexto.drawImage(imagen, 0, 0, ancho, alto);
        resolver(lienzo.toDataURL('image/jpeg', 0.75));
      };
      imagen.onerror = () => rechazar('El archivo no es una imagen');
      imagen.src = '' + lector.result;
    };
    lector.onerror = () => rechazar('No se pudo leer el archivo');
    lector.readAsDataURL(archivo);
  });
}
