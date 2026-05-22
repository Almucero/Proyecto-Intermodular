/**
 * @file: src/main.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Punto de entrada principal para la aplicación Angular en modo cliente (CSR/SSR según configuración).
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { isDevMode } from '@angular/core';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) => {
  if (isDevMode()) console.error(err);
});
