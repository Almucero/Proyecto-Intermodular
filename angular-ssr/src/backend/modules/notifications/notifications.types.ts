/*
 * @file: src/backend/modules/notifications/notifications.types.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Tipos y interfaces para el módulo de notificaciones, incluyendo configuraciones de idioma, tópicos de notificación y proyecciones de usuario.
 */

/**
 * Idiomas soportados por el motor de notificaciones por correo.
 */
export type Locale = 'es' | 'en' | 'fr' | 'de' | 'it';

/**
 * Claves de categorías/tópicos configurables en preferencias de notificación.
 */
export type TopicKey =
  | 'periodicRecommendations'
  | 'cartReminders'
  | 'favoriteDiscounts'
  | 'backInStock'
  | 'categoryNews'
  | 'weeklyDigest'
  | 'purchaseStatus'
  | 'inactiveAccount';

/**
 * Proyección mínima de usuario necesaria para resolver reglas de envío.
 *
 * Contiene preferencias de idioma, frecuencia, pausa temporal, quiet hours y
 * metadatos operativos para deduplicación/scheduler.
 */
export type UserWithNotifications = {
  id: number;
  email: string;
  name: string;
  emailNotificationsEnabled: boolean;
  notificationEmail: string | null;
  emailNotificationLanguage: string | null;
  emailNotificationFrequency: string;
  emailNotificationTopics: any;
  emailNotificationPausedUntil: Date | null;
  emailQuietHoursStart: number | null;
  emailQuietHoursEnd: number | null;
  emailRecommendationIntervalDays: number;
  emailNotificationMeta: any;
  lastSeenAt: Date;
};

/**
 * Estructura de adjunto compatible con `nodemailer`.
 */
export type MailAttachment = {
  filename: string;
  content: Buffer | string;
  contentType?: string;
};
