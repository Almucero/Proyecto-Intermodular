/**
 * @file: api/index.mjs
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Punto de entrada de la API SSR.
 */

const { reqHandler, backendReady } = await import("../dist/game-sage/server/server.mjs");
await backendReady;

export default reqHandler;

