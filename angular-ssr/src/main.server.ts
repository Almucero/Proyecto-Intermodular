import {
  BootstrapContext,
  bootstrapApplication,
} from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

/**
 * Función bootstrap de Angular usada por el runtime SSR.
 *
 * @param context Contexto de bootstrap del servidor.
 * @returns Promesa de aplicación arrancada.
 */
const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(AppComponent, config, context);

export default bootstrap;
