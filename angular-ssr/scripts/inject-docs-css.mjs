/**
 * @file: scripts/inject-docs-css.mjs
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Inyecta CSS personalizado en el archivo style.css de la documentación de Compodoc.
 */

import fs from 'fs';
import path from 'path';

// Resuelve la ruta al archivo CSS principal generado por Compodoc
const docsCssPath = path.join(process.cwd(), 'docs', 'styles', 'style.css');

// Resuelve la ruta al archivo CSS personalizado que contiene los estilos corporativos y el tema oscuro
const customCssPath = path.join(process.cwd(), 'src', 'assets', 'docs-custom.css');

// Comprueba la existencia simultánea de ambos archivos antes de proceder a la inyección
if (fs.existsSync(docsCssPath) && fs.existsSync(customCssPath)) {
    // Lee el contenido de los estilos personalizados de forma síncrona en formato UTF-8
    const customCss = fs.readFileSync(customCssPath, 'utf8');
    
    // Concatena y anexa el CSS personalizado al final del archivo CSS de Compodoc
    fs.appendFileSync(docsCssPath, '\n/* Custom CSS Injected by Script */\n' + customCss);
    
    console.log('Custom CSS appended to Compodoc style.css successfully.');
} else {
    // Si falta alguno de los dos archivos (por ejemplo, si la documentación no ha sido generada todavía)
    console.error('Could not find docs/styles/style.css or src/assets/docs-custom.css');
}
