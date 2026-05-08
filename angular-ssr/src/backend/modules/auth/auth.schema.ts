import { z } from 'zod';

/** Esquema de validación para registro local. */
export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  surname: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  accountAt: z.string().optional(),
  accountId: z.string().optional(),
  nickname: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

/** Esquema de validación para login local. */
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

/** Esquema de validación para login OAuth con Google. */
export const googleLoginSchema = z.object({
  idToken: z.string().min(20, 'Token de Google inválido'),
});

/** Esquema de validación para login OAuth con GitHub. */
export const githubLoginSchema = z.object({
  code: z.string().min(10, 'Code de GitHub inválido'),
});

/** Esquema de solicitud de recuperación de contraseña. */
export const passwordRecoveryRequestSchema = z.object({
  email: z.string().email('Email inválido'),
  locale: z.enum(['es', 'en', 'fr', 'de', 'it']).default('es'),
});

/** Esquema de verificación de código de recuperación. */
export const passwordRecoveryVerifySchema = z.object({
  email: z.string().email('Email inválido'),
  code: z.string().regex(/^\d{6}$/, 'Código inválido'),
});

/** Esquema de reseteo final de contraseña con código. */
export const passwordRecoveryResetSchema = z.object({
  email: z.string().email('Email inválido'),
  code: z.string().regex(/^\d{6}$/, 'Código inválido'),
  newPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

/** Tipo inferido del payload de registro. */
export type RegisterInput = z.infer<typeof registerSchema>;
/** Tipo inferido del payload de login. */
export type LoginInput = z.infer<typeof loginSchema>;
/** Tipo inferido del payload de login Google. */
export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;
/** Tipo inferido del payload de login GitHub. */
export type GithubLoginInput = z.infer<typeof githubLoginSchema>;
/** Tipo inferido de solicitud de recuperación. */
export type PasswordRecoveryRequestInput = z.infer<
  typeof passwordRecoveryRequestSchema
>;
/** Tipo inferido de verificación de código. */
export type PasswordRecoveryVerifyInput = z.infer<
  typeof passwordRecoveryVerifySchema
>;
/** Tipo inferido de reseteo de contraseña. */
export type PasswordRecoveryResetInput = z.infer<
  typeof passwordRecoveryResetSchema
>;
