import { z } from 'zod';

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

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export const googleLoginSchema = z.object({
  idToken: z.string().min(20, 'Token de Google inválido'),
});

export const githubLoginSchema = z.object({
  code: z.string().min(10, 'Code de GitHub inválido'),
});

export const passwordRecoveryRequestSchema = z.object({
  email: z.string().email('Email inválido'),
  locale: z.enum(['es', 'en', 'fr', 'de', 'it']).default('es'),
});

export const passwordRecoveryVerifySchema = z.object({
  email: z.string().email('Email inválido'),
  code: z.string().regex(/^\d{6}$/, 'Código inválido'),
});

export const passwordRecoveryResetSchema = z.object({
  email: z.string().email('Email inválido'),
  code: z.string().regex(/^\d{6}$/, 'Código inválido'),
  newPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;
export type GithubLoginInput = z.infer<typeof githubLoginSchema>;
export type PasswordRecoveryRequestInput = z.infer<
  typeof passwordRecoveryRequestSchema
>;
export type PasswordRecoveryVerifyInput = z.infer<
  typeof passwordRecoveryVerifySchema
>;
export type PasswordRecoveryResetInput = z.infer<
  typeof passwordRecoveryResetSchema
>;
