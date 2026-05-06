export type Locale = 'es' | 'en' | 'fr' | 'de' | 'it';

export type TopicKey =
  | 'periodicRecommendations'
  | 'cartReminders'
  | 'favoriteDiscounts'
  | 'backInStock'
  | 'categoryNews'
  | 'weeklyDigest'
  | 'purchaseStatus'
  | 'inactiveAccount';

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

export type MailAttachment = {
  filename: string;
  content: Buffer | string;
  contentType?: string;
};
