/**
 * Configuración específica para el renderizado en el lado del servidor (SSR).
 * Extiende la configuración base de la aplicación.
 */
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';

import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes(serverRoutes))],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
