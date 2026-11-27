import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { SesionService, inicioDelRol } from './sesion.service';

// revisa que el rol actual pueda entrar a la ruta
// en el backend esto se validara con el token jwt
export const rolGuard: CanActivateFn = (ruta: ActivatedRouteSnapshot) => {
  const sesion = inject(SesionService);
  const router = inject(Router);
  const roles = ruta.data['roles'];

  if (!roles || sesion.tieneRol(roles)) {
    return true;
  }
  return router.parseUrl(inicioDelRol(sesion.usuario().rol));
};
