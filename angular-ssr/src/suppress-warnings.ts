/*
 * @file: src/suppress-warnings.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Supresión de advertencias específicas del framework para mantener limpio el log de consola.
 */

/**
 * Referencia respaldada al `console.warn` original del navegador/entorno de ejecución.
 */
const origWarn = console.warn;

/**
 * Sobrescribe la consola de advertencias para filtrar mensajes obsoletos de navegación de Angular.
 * @param args Argumentos pasados a la consola de advertencia.
 */
console.warn = (...args: unknown[]) => {
  const s = typeof args[0] === 'string' ? args[0] : String(args[0] ?? '');
  if (s.includes('router deprecated') && s.includes('Promise-like')) return;
  origWarn.apply(console, args);
};
