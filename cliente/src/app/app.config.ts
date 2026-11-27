import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { AlmacenamientoService } from './core/almacenamiento.service';
import { iconosApp } from './core/iconos';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    iconosApp,
    // prepara los datos (migracion o datos de ejemplo) antes de abrir la app
    provideAppInitializer(() => inject(AlmacenamientoService).iniciar())
  ]
};
