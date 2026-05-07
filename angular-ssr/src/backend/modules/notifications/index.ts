/**
 * API pública del módulo de notificaciones por correo.
 *
 * Reexporta las funciones de dominio que se consumen desde controladores,
 * middleware de aplicación y scheduler de backend.
 */
export {
  notifyFavoriteOfferImmediate,
  notifyPurchaseStatus,
  notifyPriceDropAndStockReplenished,
  recordSearchSignal,
  runEmailJobsNow,
  startEmailNotificationScheduler,
} from './notifications.service';
