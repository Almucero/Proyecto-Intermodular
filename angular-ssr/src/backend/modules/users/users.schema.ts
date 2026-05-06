import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .optional(),
  email: z.string().email('Email inválido').optional(),
  nickname: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  emailNotificationsEnabled: z.boolean().optional(),
  notificationEmail: z.string().email('Email inválido').nullable().optional(),
  emailNotificationLanguage: z.string().min(2).max(10).nullable().optional(),
  emailNotificationFrequency: z.enum(['immediate', 'daily', 'weekly']).optional(),
  emailNotificationTopics: z.record(z.string(), z.boolean()).optional(),
  emailNotificationPausedUntil: z.coerce.date().nullable().optional(),
  emailQuietHoursStart: z.number().int().min(0).max(23).nullable().optional(),
  emailQuietHoursEnd: z.number().int().min(0).max(23).nullable().optional(),
  emailRecommendationIntervalDays: z.number().int().min(1).max(30).optional(),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .optional(),
  email: z.string().email('Email inválido').optional(),
  nickname: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  emailNotificationsEnabled: z.boolean().optional(),
  notificationEmail: z.string().email('Email inválido').nullable().optional(),
  emailNotificationLanguage: z.string().min(2).max(10).nullable().optional(),
  emailNotificationFrequency: z.enum(['immediate', 'daily', 'weekly']).optional(),
  emailNotificationTopics: z.record(z.string(), z.boolean()).optional(),
  emailNotificationPausedUntil: z.coerce.date().nullable().optional(),
  emailQuietHoursStart: z.number().int().min(0).max(23).nullable().optional(),
  emailQuietHoursEnd: z.number().int().min(0).max(23).nullable().optional(),
  emailRecommendationIntervalDays: z.number().int().min(1).max(30).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z
    .string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
