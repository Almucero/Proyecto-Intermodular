/**
 * Definición de rutas específicas del lado del servidor.
 * Configura el modo de renderizado (Server, SSG, etc.) para las rutas de Angular.
 */
import { RenderMode, ServerRoute } from '@angular/ssr';


export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
