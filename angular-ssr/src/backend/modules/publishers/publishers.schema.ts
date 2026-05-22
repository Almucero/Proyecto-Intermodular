/**
 * @file: src/backend/modules/publishers/publishers.schema.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Esquemas de validación Zod para operaciones con editoriales, incluyendo creación, actualización y validación de parámetros.
 */

import { z } from 'zod';

/** Esquema de creación de publisher. */
export const createPublisherSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
});

/** Esquema de actualización de publisher. */
export const updatePublisherSchema = z.object({
  name: z.string().min(1).optional(),
});

/** Tipo inferido para creación de publisher. */
export type CreatePublisherInput = z.infer<typeof createPublisherSchema>;
/** Tipo inferido para actualización de publisher. */
export type UpdatePublisherInput = z.infer<typeof updatePublisherSchema>;
