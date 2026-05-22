/**
 * @file: src/app/app.config.server.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Configuración específica para el renderizado en el lado del servidor (SSR). Extiende la configuración base de la aplicación.
 */

import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

/** Configuración de providers específica para ejecución SSR. */
const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes(serverRoutes))],
};

/** Configuración final de aplicación para servidor. */
export const config = mergeApplicationConfig(appConfig, serverConfig);
