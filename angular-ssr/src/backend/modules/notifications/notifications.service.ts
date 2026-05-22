/**
 * @file: src/backend/modules/notifications/notifications.service.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Servicio de notificaciones que implementa el envío de notificaciones por correo electrónico, incluyendo la gestión de preferencias de usuario, programación y procesamiento de eventos.
 */

import nodemailer from 'nodemailer';
import { prisma } from '../../config/db';
import type {
  Locale,
  TopicKey,
  UserWithNotifications,
  MailAttachment,
} from './notifications.types';

/** Flag para evitar arrancar múltiples veces el scheduler de notificaciones. */
let schedulerStarted = false;

/**
 * Normaliza un locale arbitrario al conjunto soportado por el sistema de notificaciones.
 *
 * @param locale Locale recibido desde perfil o metadatos del usuario.
 * @returns Código de idioma soportado (`es`, `en`, `fr`, `de`, `it`).
 */
function normalizeLocale(locale?: string | null): Locale {
  const l = (locale || 'es').toLowerCase();
  if (l.startsWith('en')) return 'en';
  if (l.startsWith('fr')) return 'fr';
  if (l.startsWith('de')) return 'de';
  if (l.startsWith('it')) return 'it';
  return 'es';
}

/**
 * Resuelve el idioma efectivo de notificaciones para un usuario.
 *
 * Prioriza el último idioma detectado en la web (`lastAppLocale`) para que los
 * correos sigan el idioma real de la interfaz usada por el usuario.
 *
 * @param user Usuario con preferencias de notificación.
 * @returns Locale final que debe usarse para construir asunto y cuerpo del correo.
 */
function resolveUserLocale(user: UserWithNotifications): Locale {
  const meta = (user.emailNotificationMeta || {}) as Record<string, any>;
  const last = typeof meta.lastAppLocale === 'string' ? meta.lastAppLocale : null;
  return normalizeLocale(last || user.emailNotificationLanguage);
}

/**
 * Indica si las notificaciones están temporalmente pausadas para el usuario.
 *
 * @param user Usuario a evaluar.
 * @returns `true` si existe una pausa activa con fecha futura; `false` en caso contrario.
 */
function isPaused(user: UserWithNotifications): boolean {
  return !!(user.emailNotificationPausedUntil && user.emailNotificationPausedUntil.getTime() > Date.now());
}

/**
 * Verifica si un tema concreto de notificación puede enviarse al usuario.
 *
 * Comprueba el master toggle, el estado de pausa temporal y el toggle específico
 * del tema dentro de `emailNotificationTopics`.
 *
 * @param user Usuario a evaluar.
 * @param topic Clave del tema de notificación.
 * @returns `true` cuando el tema está habilitado y puede enviarse.
 */
function topicEnabled(user: UserWithNotifications, topic: TopicKey): boolean {
  if (!user.emailNotificationsEnabled) return false;
  if (isPaused(user)) return false;
  const topics = (user.emailNotificationTopics || {}) as Record<string, boolean>;
  return topics[topic] !== false;
}

/**
 * Obtiene el email de destino efectivo para envío.
 *
 * Prioriza `notificationEmail` (si contiene valor válido tras trim) y usa como fallback
 * el email principal de la cuenta.
 *
 * @param user Usuario destinatario.
 * @returns Dirección de email normalizada en minúsculas.
 */
function deliveryEmail(user: UserWithNotifications): string {
  const preferred = (user.notificationEmail ?? '').trim().toLowerCase();
  const fallback = (user.email ?? '').trim().toLowerCase();
  const chosen = preferred || fallback;
  return chosen;
}

/**
 * Determina si el usuario pertenece al grupo de frecuencia diaria.
 *
 * `immediate` se considera compatible con jobs diarios para no perder envíos
 * de recordatorio/síntesis que dependen de scheduler.
 *
 * @param user Usuario a evaluar.
 * @returns `true` si su frecuencia es `daily` o `immediate`.
 */
function preferDaily(user: UserWithNotifications): boolean {
  const f = user.emailNotificationFrequency || 'weekly';
  return f === 'daily' || f === 'immediate';
}

/**
 * Determina si el usuario pertenece al grupo de frecuencia semanal.
 *
 * @param user Usuario a evaluar.
 * @returns `true` únicamente cuando su frecuencia es `weekly`.
 */
function preferWeekly(user: UserWithNotifications): boolean {
  return (user.emailNotificationFrequency || 'weekly') === 'weekly';
}

/**
 * Envía un correo mediante SMTP respetando reglas de quiet hours.
 *
 * Si faltan credenciales SMTP, el destinatario es inválido o el envío cae en
 * horas silenciosas (salvo bypass), la función no envía nada y termina sin error.
 *
 * @param user Usuario destinatario.
 * @param subject Asunto del correo.
 * @param html Cuerpo en formato HTML.
 * @param text Cuerpo en texto plano.
 * @param bypassQuietHours Permite omitir el bloqueo de quiet hours.
 * @param attachments Adjuntos opcionales (por ejemplo, factura PDF).
 * @returns Promesa resuelta cuando el envío finaliza o se omite.
 */
async function sendEmail(
  user: UserWithNotifications,
  subject: string,
  html: string,
  text: string,
  bypassQuietHours: boolean = false,
  attachments: MailAttachment[] = [],
) {
  if (!bypassQuietHours) {
    const nowHour = new Date().getHours();
    const start = user.emailQuietHoursStart;
    const end = user.emailQuietHoursEnd;
    if (start != null && end != null) {
      const inQuietRange =
        start === end
          ? true
          : start < end
            ? nowHour >= start && nowHour < end
            : nowHour >= start || nowHour < end;
      if (inQuietRange) return;
    }
  }

  const host = process.env['SMTP_HOST'];
  const port = Number(process.env['SMTP_PORT'] || '587');
  const smtpUser = process.env['SMTP_USER'];
  const pass = process.env['SMTP_PASS'];
  const fromAddress = process.env['SMTP_FROM'] || 'no-reply@gamesage.local';
  const fromName = process.env['SMTP_FROM_NAME'] || 'Game Sage';
  const from = `${fromName} <${fromAddress}>`;
  if (!host || !smtpUser || !pass) return;
  const to = deliveryEmail(user);
  if (!to || !to.includes('@')) return;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user: smtpUser, pass },
  });

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
    attachments,
  });
}

/**
 * Calcula el índice de variante de forma determinista a partir de una semilla.
 *
 * @param seed Semilla usada para hash estable.
 * @param count Número total de variantes.
 * @returns Índice válido en el rango `[0, count)`.
 */
function variantIndex(seed: string, count: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(hash) % count;
}

/**
 * Devuelve el catálogo de textos localizados para notificaciones por email.
 *
 * Incluye asuntos, títulos, variantes de copy y etiquetas auxiliares de UI HTML.
 *
 * @param locale Idioma final de renderizado.
 * @returns Diccionario de textos localizados para plantillas de correo.
 */
function getLocalized(locale: Locale) {
  const c = {
    es: {
      purchaseSubject: 'Compra confirmada en Game Sage',
      refundSubject: 'Reembolso procesado en Game Sage',
      cartSubject: 'Tienes juegos en tu cesta',
      inactivitySubject: 'Te echamos de menos en Game Sage',
      stockSubject: 'Un favorito ha vuelto a tener stock',
      offerSubject: 'Oferta detectada en tus favoritos',
      recSubject: 'Recomendaciones para ti',
      popularSubject: 'Lo más popular ahora',
      buy: 'Compra confirmada',
      refund: 'Reembolso procesado',
      cartTitle: 'Recordatorio de cesta',
      inactivityTitle: 'Vuelve cuando quieras',
      stockTitle: 'Stock repuesto',
      offerTitle: 'Oferta en favorito',
      recTitle: 'Basado en tus búsquedas y compras',
      popularTitle: 'Popular ahora',
      weeklySubject: 'Resumen semanal en Game Sage',
      weeklyTitle: 'Resumen semanal',
      bySearchTitle: 'Creemos que esto te puede interesar según tus búsquedas',
      byPurchaseTitle: 'Basado en tus compras recientes',
      popularNowTitle: 'Popular ahora',
      badgeSale: 'OFERTA',
      badgeRestock: 'STOCK',
      badgeDrop: 'BAJADA',
      badgeWeekly: 'SEMANAL',
      platformFallback: 'Plataforma',
      imageFallback: 'Juego',
      greeting: 'Hola {name},',
      footerReport: 'Si quieres reportar un problema, contacta con soporte de Game Sage.',
      footerManage: 'Gestionar tus notificaciones',
      footerCopyright: 'Copyright © 2026 Game Sage. Todos los derechos reservados.',
      footerAddress: 'Calle Sancha de Lara s/n, Barrio Centro Histórico, Distrito Centro, Málaga, Comarca de Málaga, Málaga',
      invoiceFilename: 'factura',
      invoiceTitlePurchase: 'Factura de compra',
      invoiceTitleRefund: 'Comprobante de reembolso',
      invoiceRef: 'Referencia',
      invoiceDate: 'Fecha',
      invoiceTotal: 'Total',
      invoiceItems: 'Artículos',
      invoiceFrom: 'Vendedor',
      invoiceBillTo: 'Cliente',
      invoiceItem: 'Concepto',
      invoiceQty: 'Cant.',
      invoiceUnitPrice: 'Precio',
      invoiceSubtotal: 'Subtotal',
      invoiceThanks: 'Gracias por confiar en Game Sage.',
      purchaseTextVariants: [
        'Tu compra se ha confirmado correctamente.',
        'Pago recibido y compra completada.',
        'Compra realizada con éxito.',
      ],
      refundTextVariants: [
        'Tu reembolso se ha procesado correctamente.',
        'Reembolso confirmado para tu compra.',
        'La devolución ha sido aceptada y procesada.',
      ],
      cartTextVariants: [
        'Tienes artículos pendientes en tu cesta.',
        'Tu cesta sigue esperando por ti.',
        'Aún tienes juegos en la cesta listos para comprar.',
      ],
      inactivityTextVariants: [
        'Llevas {days} días sin entrar. Te esperamos con nuevas ofertas.',
        '{days} días fuera. Tenemos novedades que pueden gustarte.',
        'Han pasado {days} días. Vuelve y descubre juegos recomendados para ti.',
      ],
      recommendationTextVariants: [
        'Estas recomendaciones se adaptan a tu actividad reciente.',
        'Seleccionamos estos juegos según tus gustos.',
        'Hemos preparado nuevas recomendaciones para ti.',
      ],
      categoryNewsTextVariants: [
        'Te enviamos una selección combinada de búsquedas, compras y tendencias.',
        'Novedades basadas en tu actividad y lo más popular ahora.',
        'Descubre juegos relacionados con tu historial y con alta demanda.',
      ],
      weeklyTextVariants: [
        'Este es tu resumen semanal con ofertas y recomendaciones.',
        'Repaso semanal de juegos destacados para ti.',
        'Tu informe semanal ya está disponible.',
      ],
      offerVariants: [
        '{title} ({platform}) ahora está en oferta: {price}',
        'Detectamos descuento en {title} para {platform}: {price}',
        'Buen momento para {title}: oferta activa en {platform} ({price})',
      ],
      stockVariants: [
        '{title} ({platform}) vuelve a tener stock.',
        'Ya hay unidades disponibles de {title} en {platform}.',
        '{title} ha regresado al stock para {platform}.',
      ],
      priceDropVariants: [
        '{title} ({platform}) ha bajado a {price}.',
        'Nuevo precio para {title} en {platform}: {price}.',
        'Bajada detectada en {title} ({platform}), ahora cuesta {price}.',
      ],
    },
    en: {
      purchaseSubject: 'Purchase confirmed on Game Sage',
      refundSubject: 'Refund processed on Game Sage',
      cartSubject: 'You have games in your cart',
      inactivitySubject: 'We miss you on Game Sage',
      stockSubject: 'A favorite is back in stock',
      offerSubject: 'Deal detected in your favorites',
      recSubject: 'Recommendations for you',
      popularSubject: 'Popular right now',
      buy: 'Purchase confirmed',
      refund: 'Refund processed',
      cartTitle: 'Cart reminder',
      inactivityTitle: 'Come back anytime',
      stockTitle: 'Back in stock',
      offerTitle: 'Favorite on sale',
      recTitle: 'Based on your searches and purchases',
      popularTitle: 'Popular now',
      weeklySubject: 'Weekly digest on Game Sage',
      weeklyTitle: 'Weekly digest',
      bySearchTitle: 'We think this may interest you based on your searches',
      byPurchaseTitle: 'Based on your recent purchases',
      popularNowTitle: 'Popular now',
      badgeSale: 'SALE',
      badgeRestock: 'RESTOCK',
      badgeDrop: 'DROP',
      badgeWeekly: 'WEEKLY',
      platformFallback: 'Platform',
      imageFallback: 'Game',
      greeting: 'Hi {name},',
      footerReport: 'If you would like to report an issue, contact Game Sage support.',
      footerManage: 'Manage your notification settings',
      footerCopyright: 'Copyright © 2026 Game Sage. All rights reserved.',
      footerAddress: 'Calle Sancha de Lara s/n, Barrio Centro Histórico, Distrito Centro, Málaga, Comarca de Málaga, Málaga',
      invoiceFilename: 'invoice',
      invoiceTitlePurchase: 'Purchase invoice',
      invoiceTitleRefund: 'Refund receipt',
      invoiceRef: 'Reference',
      invoiceDate: 'Date',
      invoiceTotal: 'Total',
      invoiceItems: 'Items',
      invoiceFrom: 'Seller',
      invoiceBillTo: 'Customer',
      invoiceItem: 'Item',
      invoiceQty: 'Qty',
      invoiceUnitPrice: 'Price',
      invoiceSubtotal: 'Subtotal',
      invoiceThanks: 'Thank you for choosing Game Sage.',
      purchaseTextVariants: [
        'Your purchase has been confirmed successfully.',
        'Payment received and order completed.',
        'Purchase completed successfully.',
      ],
      refundTextVariants: [
        'Your refund has been processed successfully.',
        'Refund confirmed for your purchase.',
        'Your return has been accepted and processed.',
      ],
      cartTextVariants: [
        'You still have items in your cart.',
        'Your cart is waiting for you.',
        'You still have games ready to checkout.',
      ],
      inactivityTextVariants: [
        'You have been away for {days} days. We have new deals for you.',
        '{days} days away. We have news you may like.',
        '{days} days have passed. Come back and discover new recommendations.',
      ],
      recommendationTextVariants: [
        'These picks are tailored to your recent activity.',
        'We selected these games based on your tastes.',
        'We prepared fresh recommendations for you.',
      ],
      categoryNewsTextVariants: [
        'A combined selection from your searches, purchases and trends.',
        'News based on your activity and what is popular now.',
        'Discover games related to your history and top demand.',
      ],
      weeklyTextVariants: [
        'Your weekly digest with deals and recommendations.',
        'Weekly recap of featured games for you.',
        'Your weekly report is now available.',
      ],
      offerVariants: [
        '{title} ({platform}) is now on sale: {price}',
        'Discount detected for {title} on {platform}: {price}',
        'Great timing for {title}: active offer on {platform} ({price})',
      ],
      stockVariants: [
        '{title} ({platform}) is back in stock.',
        '{title} is available again on {platform}.',
        '{title} has returned to stock for {platform}.',
      ],
      priceDropVariants: [
        '{title} ({platform}) dropped to {price}.',
        'New price for {title} on {platform}: {price}.',
        'Price drop detected for {title} ({platform}), now {price}.',
      ],
    },
    fr: {
      purchaseSubject: 'Achat confirmé sur Game Sage',
      refundSubject: 'Remboursement traité sur Game Sage',
      cartSubject: 'Vous avez des jeux dans votre panier',
      inactivitySubject: 'Vous nous manquez sur Game Sage',
      stockSubject: 'Un favori est de nouveau en stock',
      offerSubject: 'Promotion détectée dans vos favoris',
      recSubject: 'Recommandations pour vous',
      popularSubject: 'Tendances du moment',
      buy: 'Achat confirmé',
      refund: 'Remboursement traité',
      cartTitle: 'Rappel de panier',
      inactivityTitle: 'Revenez quand vous voulez',
      stockTitle: 'Stock rétabli',
      offerTitle: 'Favori en promotion',
      recTitle: 'Selon vos recherches et achats',
      popularTitle: 'Populaire maintenant',
      weeklySubject: 'Résumé hebdomadaire sur Game Sage',
      weeklyTitle: 'Résumé hebdomadaire',
      bySearchTitle: 'Nous pensons que cela peut vous intéresser selon vos recherches',
      byPurchaseTitle: 'Selon vos achats récents',
      popularNowTitle: 'Populaire maintenant',
      badgeSale: 'PROMO',
      badgeRestock: 'STOCK',
      badgeDrop: 'BAISSE',
      badgeWeekly: 'HEBDO',
      platformFallback: 'Plateforme',
      imageFallback: 'Jeu',
      greeting: 'Bonjour {name},',
      footerReport: 'Si vous souhaitez signaler un problème, contactez le support Game Sage.',
      footerManage: 'Gérer vos notifications',
      footerCopyright: 'Copyright © 2026 Game Sage. Tous droits réservés.',
      footerAddress: 'Calle Sancha de Lara s/n, Barrio Centro Histórico, Distrito Centro, Málaga, Comarca de Málaga, Málaga',
      invoiceFilename: 'facture',
      invoiceTitlePurchase: 'Facture d’achat',
      invoiceTitleRefund: 'Justificatif de remboursement',
      invoiceRef: 'Référence',
      invoiceDate: 'Date',
      invoiceTotal: 'Total',
      invoiceItems: 'Articles',
      invoiceFrom: 'Vendeur',
      invoiceBillTo: 'Client',
      invoiceItem: 'Article',
      invoiceQty: 'Qté',
      invoiceUnitPrice: 'Prix',
      invoiceSubtotal: 'Sous-total',
      invoiceThanks: 'Merci de faire confiance à Game Sage.',
      purchaseTextVariants: [
        'Votre achat a été confirmé avec succès.',
        'Paiement reçu et achat finalisé.',
        'Achat effectué avec succès.',
      ],
      refundTextVariants: [
        'Votre remboursement a été traité avec succès.',
        'Remboursement confirmé pour votre achat.',
        'Votre retour a été accepté et traité.',
      ],
      cartTextVariants: [
        'Vous avez encore des articles dans votre panier.',
        'Votre panier vous attend.',
        'Vous avez encore des jeux prêts à être achetés.',
      ],
      inactivityTextVariants: [
        'Vous êtes absent depuis {days} jours. Nous avons de nouvelles offres pour vous.',
        '{days} jours d’absence. Nous avons des nouveautés qui peuvent vous plaire.',
        '{days} jours se sont écoulés. Revenez découvrir de nouvelles recommandations.',
      ],
      recommendationTextVariants: [
        'Ces suggestions sont adaptées à votre activité récente.',
        'Nous avons sélectionné ces jeux selon vos goûts.',
        'Nous avons préparé de nouvelles recommandations pour vous.',
      ],
      categoryNewsTextVariants: [
        'Une sélection combinée selon vos recherches, achats et tendances.',
        'Nouveautés basées sur votre activité et les jeux populaires.',
        'Découvrez des jeux liés à votre historique et très demandés.',
      ],
      weeklyTextVariants: [
        'Votre résumé hebdomadaire avec offres et recommandations.',
        'Récapitulatif hebdomadaire des jeux en vedette.',
        'Votre rapport hebdomadaire est disponible.',
      ],
      offerVariants: [
        '{title} ({platform}) est maintenant en promotion: {price}',
        'Réduction détectée pour {title} sur {platform}: {price}',
        'Bon moment pour {title}: offre active sur {platform} ({price})',
      ],
      stockVariants: [
        '{title} ({platform}) est de nouveau en stock.',
        '{title} est à nouveau disponible sur {platform}.',
        '{title} est revenu en stock pour {platform}.',
      ],
      priceDropVariants: [
        '{title} ({platform}) est descendu à {price}.',
        'Nouveau prix pour {title} sur {platform}: {price}.',
        'Baisse détectée pour {title} ({platform}), maintenant à {price}.',
      ],
    },
    de: {
      purchaseSubject: 'Kauf bei Game Sage bestätigt',
      refundSubject: 'Rückerstattung bei Game Sage bearbeitet',
      cartSubject: 'Du hast Spiele im Warenkorb',
      inactivitySubject: 'Wir vermissen dich bei Game Sage',
      stockSubject: 'Ein Favorit ist wieder auf Lager',
      offerSubject: 'Angebot in deinen Favoriten erkannt',
      recSubject: 'Empfehlungen für dich',
      popularSubject: 'Gerade beliebt',
      buy: 'Kauf bestätigt',
      refund: 'Rückerstattung bearbeitet',
      cartTitle: 'Warenkorb-Erinnerung',
      inactivityTitle: 'Komm zurück, wann du willst',
      stockTitle: 'Wieder auf Lager',
      offerTitle: 'Favorit im Angebot',
      recTitle: 'Basierend auf deinen Suchen und Käufen',
      popularTitle: 'Beliebt jetzt',
      weeklySubject: 'Wöchentliche Zusammenfassung bei Game Sage',
      weeklyTitle: 'Wöchentliche Zusammenfassung',
      bySearchTitle: 'Das könnte dich basierend auf deinen Suchen interessieren',
      byPurchaseTitle: 'Basierend auf deinen letzten Käufen',
      popularNowTitle: 'Beliebt jetzt',
      badgeSale: 'ANGEBOT',
      badgeRestock: 'LAGER',
      badgeDrop: 'PREISSTURZ',
      badgeWeekly: 'WOCHE',
      platformFallback: 'Plattform',
      imageFallback: 'Spiel',
      greeting: 'Hallo {name},',
      footerReport: 'Wenn du ein Problem melden möchtest, kontaktiere den Game Sage Support.',
      footerManage: 'Benachrichtigungseinstellungen verwalten',
      footerCopyright: 'Copyright © 2026 Game Sage. Alle Rechte vorbehalten.',
      footerAddress: 'Calle Sancha de Lara s/n, Barrio Centro Histórico, Distrito Centro, Málaga, Comarca de Málaga, Málaga',
      invoiceFilename: 'rechnung',
      invoiceTitlePurchase: 'Kaufrechnung',
      invoiceTitleRefund: 'Erstattungsbeleg',
      invoiceRef: 'Referenz',
      invoiceDate: 'Datum',
      invoiceTotal: 'Gesamt',
      invoiceItems: 'Artikel',
      invoiceFrom: 'Verkäufer',
      invoiceBillTo: 'Kunde',
      invoiceItem: 'Artikel',
      invoiceQty: 'Menge',
      invoiceUnitPrice: 'Preis',
      invoiceSubtotal: 'Zwischensumme',
      invoiceThanks: 'Danke, dass du Game Sage gewählt hast.',
      purchaseTextVariants: [
        'Dein Kauf wurde erfolgreich bestätigt.',
        'Zahlung erhalten und Kauf abgeschlossen.',
        'Kauf erfolgreich abgeschlossen.',
      ],
      refundTextVariants: [
        'Deine Erstattung wurde erfolgreich bearbeitet.',
        'Erstattung für deinen Kauf bestätigt.',
        'Deine Rückgabe wurde akzeptiert und bearbeitet.',
      ],
      cartTextVariants: [
        'Du hast noch Artikel im Warenkorb.',
        'Dein Warenkorb wartet auf dich.',
        'Du hast noch Spiele, die bereit zum Kauf sind.',
      ],
      inactivityTextVariants: [
        'Du warst {days} Tage nicht da. Wir haben neue Angebote für dich.',
        '{days} Tage weg. Wir haben Neuigkeiten, die dir gefallen könnten.',
        '{days} Tage sind vergangen. Komm zurück und entdecke neue Empfehlungen.',
      ],
      recommendationTextVariants: [
        'Diese Empfehlungen passen zu deiner letzten Aktivität.',
        'Wir haben diese Spiele nach deinem Geschmack ausgewählt.',
        'Wir haben neue Empfehlungen für dich vorbereitet.',
      ],
      categoryNewsTextVariants: [
        'Eine kombinierte Auswahl aus Suchen, Käufen und Trends.',
        'Neuigkeiten basierend auf deiner Aktivität und aktuellen Trends.',
        'Entdecke Spiele passend zu deinem Verlauf und hoher Nachfrage.',
      ],
      weeklyTextVariants: [
        'Deine Wochenübersicht mit Angeboten und Empfehlungen.',
        'Wöchentliche Übersicht mit empfohlenen Spielen.',
        'Dein Wochenbericht ist verfügbar.',
      ],
      offerVariants: [
        '{title} ({platform}) ist jetzt im Angebot: {price}',
        'Rabatt für {title} auf {platform} erkannt: {price}',
        'Guter Zeitpunkt für {title}: aktives Angebot auf {platform} ({price})',
      ],
      stockVariants: [
        '{title} ({platform}) ist wieder auf Lager.',
        '{title} ist auf {platform} wieder verfügbar.',
        '{title} ist für {platform} zurück im Lager.',
      ],
      priceDropVariants: [
        '{title} ({platform}) ist auf {price} gefallen.',
        'Neuer Preis für {title} auf {platform}: {price}.',
        'Preissenkung erkannt bei {title} ({platform}), jetzt {price}.',
      ],
    },
    it: {
      purchaseSubject: 'Acquisto confermato su Game Sage',
      refundSubject: 'Rimborso elaborato su Game Sage',
      cartSubject: 'Hai giochi nel carrello',
      inactivitySubject: 'Ci manchi su Game Sage',
      stockSubject: 'Un preferito è tornato disponibile',
      offerSubject: 'Offerta rilevata nei preferiti',
      recSubject: 'Consigli per te',
      popularSubject: 'Popolari adesso',
      buy: 'Acquisto confermato',
      refund: 'Rimborso elaborato',
      cartTitle: 'Promemoria carrello',
      inactivityTitle: 'Torna quando vuoi',
      stockTitle: 'Di nuovo disponibile',
      offerTitle: 'Preferito in offerta',
      recTitle: 'In base alle tue ricerche e acquisti',
      popularTitle: 'Popolare ora',
      weeklySubject: 'Riepilogo settimanale su Game Sage',
      weeklyTitle: 'Riepilogo settimanale',
      bySearchTitle: 'Pensiamo possa interessarti in base alle tue ricerche',
      byPurchaseTitle: 'In base ai tuoi acquisti recenti',
      popularNowTitle: 'Popolare ora',
      badgeSale: 'OFFERTA',
      badgeRestock: 'SCORTE',
      badgeDrop: 'RIBASSO',
      badgeWeekly: 'SETTIMANALE',
      platformFallback: 'Piattaforma',
      imageFallback: 'Gioco',
      greeting: 'Ciao {name},',
      footerReport: 'Se desideri segnalare un problema, contatta il supporto di Game Sage.',
      footerManage: 'Gestisci le impostazioni di notifica',
      footerCopyright: 'Copyright © 2026 Game Sage. Tutti i diritti riservati.',
      footerAddress: 'Calle Sancha de Lara s/n, Barrio Centro Histórico, Distrito Centro, Málaga, Comarca de Málaga, Málaga',
      invoiceFilename: 'fattura',
      invoiceTitlePurchase: 'Fattura di acquisto',
      invoiceTitleRefund: 'Ricevuta di rimborso',
      invoiceRef: 'Riferimento',
      invoiceDate: 'Data',
      invoiceTotal: 'Totale',
      invoiceItems: 'Articoli',
      invoiceFrom: 'Venditore',
      invoiceBillTo: 'Cliente',
      invoiceItem: 'Articolo',
      invoiceQty: 'Qtà',
      invoiceUnitPrice: 'Prezzo',
      invoiceSubtotal: 'Subtotale',
      invoiceThanks: 'Grazie per aver scelto Game Sage.',
      purchaseTextVariants: [
        'Il tuo acquisto è stato confermato con successo.',
        'Pagamento ricevuto e acquisto completato.',
        'Acquisto completato con successo.',
      ],
      refundTextVariants: [
        'Il tuo rimborso è stato elaborato con successo.',
        'Rimborso confermato per il tuo acquisto.',
        'Il tuo reso è stato accettato ed elaborato.',
      ],
      cartTextVariants: [
        'Hai ancora articoli nel carrello.',
        'Il tuo carrello ti sta aspettando.',
        'Hai ancora giochi pronti per l’acquisto.',
      ],
      inactivityTextVariants: [
        'Sono passati {days} giorni dalla tua ultima visita. Abbiamo nuove offerte per te.',
        '{days} giorni di assenza. Abbiamo novità che potrebbero piacerti.',
        'Sono passati {days} giorni. Torna e scopri nuove raccomandazioni.',
      ],
      recommendationTextVariants: [
        'Questi suggerimenti sono basati sulla tua attività recente.',
        'Abbiamo selezionato questi giochi in base ai tuoi gusti.',
        'Abbiamo preparato nuove raccomandazioni per te.',
      ],
      categoryNewsTextVariants: [
        'Una selezione combinata da ricerche, acquisti e trend.',
        'Novità basate sulla tua attività e sui giochi più popolari.',
        'Scopri giochi legati alla tua cronologia e molto richiesti.',
      ],
      weeklyTextVariants: [
        'Il tuo riepilogo settimanale con offerte e consigli.',
        'Riepilogo settimanale dei giochi in evidenza.',
        'Il tuo report settimanale è disponibile.',
      ],
      offerVariants: [
        '{title} ({platform}) è ora in offerta: {price}',
        'Sconto rilevato per {title} su {platform}: {price}',
        'Ottimo momento per {title}: offerta attiva su {platform} ({price})',
      ],
      stockVariants: [
        '{title} ({platform}) è tornato disponibile.',
        '{title} è di nuovo disponibile su {platform}.',
        '{title} è tornato in stock per {platform}.',
      ],
      priceDropVariants: [
        '{title} ({platform}) è sceso a {price}.',
        'Nuovo prezzo per {title} su {platform}: {price}.',
        'Ribasso rilevato per {title} ({platform}), ora {price}.',
      ],
    },
  };
  return { ...c[locale], lang: locale };
}

/**
 * Renderiza una plantilla simple reemplazando placeholders `{key}` por valores.
 *
 * @param template Plantilla base con placeholders.
 * @param values Valores a interpolar en la plantilla.
 * @returns Texto final con sustituciones aplicadas.
 */
function renderTemplate(template: string, values: Record<string, string | number>): string {
  let out = template;
  for (const [key, value] of Object.entries(values)) {
    out = out.replaceAll(`{${key}}`, String(value));
  }
  return out;
}

/**
 * Selecciona una variante textual de forma pseudoaleatoria y estable.
 *
 * @param variants Lista de variantes disponibles.
 * @param seed Semilla usada para repartir variantes.
 * @returns Variante seleccionada o cadena vacía si no hay variantes.
 */
function pickVariant(variants: string[], seed: string): string {
  return variants[variantIndex(seed, variants.length)] || variants[0] || '';
}

/**
 * Escapa caracteres peligrosos para interpolar contenido en HTML.
 *
 * @param value Texto de entrada.
 * @returns Texto saneado para uso seguro en atributos o nodos HTML.
 */
function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Resuelve una URL de imagen en formato absoluto para emails.
 *
 * @param raw URL potencialmente relativa o incompleta.
 * @returns URL absoluta utilizable o `undefined`.
 */
function resolveImageUrl(raw?: string): string | undefined {
  if (!raw) return undefined;
  const value = raw.trim();
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('//')) return `https:${value}`;
  if (value.startsWith('/')) {
    const fromEnv =
      process.env['PUBLIC_APP_URL'] ||
      process.env['FRONTEND_URL'] ||
      process.env['APP_URL'] ||
      process.env['CORS_ORIGIN']?.split(',')[0]?.trim() ||
      '';
    if (!fromEnv) return undefined;
    return `${fromEnv.replace(/\/+$/, '')}${value}`;
  }
  return undefined;
}

/**
 * Escapa caracteres especiales para streams de texto PDF.
 *
 * @param value Texto de entrada.
 * @returns Texto escapado.
 */
function pdfEscape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

/**
 * Divide texto en líneas de longitud máxima para render PDF.
 *
 * @param value Texto completo.
 * @param maxChars Máximo de caracteres por línea.
 * @returns Líneas ajustadas.
 */
function wrapPdfText(value: string, maxChars: number): string[] {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

/**
 * Envuelve contenido HTML en layout común corporativo de email.
 *
 * @param input Datos de composición de cabecera, cuerpo y footer.
 * @returns HTML completo del email.
 */
function wrapEmailLayout(input: {
  lang?: string;
  title: string;
  intro?: string;
  bodyHtml: string;
  recipientName?: string;
  greetingTemplate: string;
  footerReport: string;
  footerManage: string;
  footerCopyright: string;
  footerAddress: string;
}) {
  const safeName = (input.recipientName || '').trim();
  const greetingText = safeName
    ? renderTemplate(input.greetingTemplate, { name: safeName })
    : '';
  const greetingBlock = greetingText
    ? `<p style="margin:0 0 12px 0;color:#0f172a;line-height:1.5;font-size:15px">${escapeHtml(greetingText)}</p>`
    : '';
  const introBlock = input.intro
    ? `<p style="margin:0 0 16px 0;color:#475569;line-height:1.6;font-size:15px;word-break:break-word">${escapeHtml(input.intro)}</p>`
    : '';

  const lang = input.lang ? escapeHtml(input.lang) : 'es';

  return `<!DOCTYPE html>
<html lang="${lang}" xml:lang="${lang}" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Language" content="${lang}">
  <title>${escapeHtml(input.title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;">
    <div style="font-family:Arial,sans-serif;padding:16px 8px;color:#0f172a">
      <div style="max-width:760px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:18px">
        ${greetingBlock}
        <h2 style="margin:0 0 12px 0;color:#0f172a;font-size:22px;line-height:1.25">${escapeHtml(input.title)}</h2>
        ${introBlock}
        ${input.bodyHtml}
        <div style="margin-top:14px;padding-top:14px;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;line-height:1.6">
          <p style="margin:0 0 8px 0">${escapeHtml(input.footerReport)}</p>
          <p style="margin:0 0 8px 0"><a href="https://gamingsage.vercel.app/settings" target="_blank" rel="noopener noreferrer" style="color:#334155;text-decoration:underline">${escapeHtml(input.footerManage)}</a></p>
          <p style="margin:0">${escapeHtml(input.footerCopyright)}<br/>${escapeHtml(input.footerAddress)}</p>
        </div>
      </div>
    </div>
</body>
</html>`;
}

/**
 * Construye una plantilla HTML completa con cabecera, texto introductorio y tarjetas.
 *
 * @param title Título principal del correo.
 * @param games Elementos a mostrar como tarjetas.
 * @param intro Texto introductorio opcional.
 * @param emptyImageLabel Texto a mostrar cuando no hay imagen.
 * @returns HTML final listo para enviar.
 */
function listHtml(
  title: string,
  games: Array<{
    title: string;
    platform?: string;
    price?: string;
    imageUrl?: string;
    subtitle?: string;
    badge?: string;
  }>,
  intro?: string,
  emptyImageLabel: string = 'Game',
  recipientName?: string,
  l10n?: {
    greeting: string;
    footerReport: string;
    footerManage: string;
    footerCopyright: string;
    footerAddress: string;
    lang?: string;
  },
) {
  const cards = games
    .map((g) => {
      const priceBadge = g.price ? `<span style="display:block;width:max-content;background:#eef2ff;color:#3730a3;padding:4px 9px;border-radius:999px;font-size:12px;font-weight:700;line-height:1.2">${escapeHtml(g.price)}</span>` : '';
      const gameBadge = g.badge ? `<span style="display:block;width:max-content;background:#f1f5f9;color:#334155;padding:4px 9px;border-radius:999px;font-size:11px;font-weight:700;line-height:1.2">${escapeHtml(g.badge)}</span>` : '';
      const subtitle = g.subtitle ? `<div class="notranslate" style="color:#64748b;font-size:13px;line-height:1.5;margin-top:8px;word-break:break-word">${escapeHtml(g.subtitle)}</div>` : '';
      const platform = g.platform ? `<div style="color:#334155;font-size:13px;margin-top:6px">${escapeHtml(g.platform)}</div>` : '';
      const resolvedImageUrl = resolveImageUrl(g.imageUrl);
      const image = resolvedImageUrl
        ? `<img src="${escapeHtml(resolvedImageUrl)}" alt="${escapeHtml(g.title)}" width="88" height="88" style="display:block;width:88px;height:88px;object-fit:cover;border-radius:10px;border:1px solid #dbe2ea" />`
        : `<div style="width:88px;height:88px;border-radius:10px;border:1px solid #dbe2ea;background:#f8fafc;color:#64748b;display:flex;align-items:center;justify-content:center;font-size:12px">${escapeHtml(emptyImageLabel)}</div>`;
      return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse:separate;border-spacing:0;margin:0 0 12px 0;border:1px solid #e2e8f0;border-radius:12px;background:#ffffff">
          <tr>
            <td width="104" style="padding:14px 8px 14px 14px;vertical-align:top">
              ${image}
            </td>
            <td style="padding:14px 14px 14px 8px;vertical-align:top">
              <div class="notranslate" style="color:#0f172a;font-size:16px;line-height:1.3;font-weight:700;margin:0 0 4px 0">${escapeHtml(g.title)}</div>
              ${platform}
              <div style="margin-top:8px;display:flex;flex-direction:column;align-items:flex-start;gap:6px">${gameBadge}${priceBadge}</div>
              ${subtitle}
            </td>
          </tr>
        </table>
      `;
    })
    .join('');

  const fallback = {
    greeting: 'Hi {name},',
    footerReport: 'If you would like to report an issue, contact support.',
    footerManage: 'Manage your notification settings',
    footerCopyright: 'Copyright © 2026 Game Sage. All rights reserved.',
    footerAddress: '440 N Barranca Ave #4133 Covina, CA 91723',
    lang: 'en',
  };
  const t = l10n || fallback;
  return wrapEmailLayout({
    lang: t.lang,
    title,
    intro,
    bodyHtml: cards,
    recipientName,
    greetingTemplate: t.greeting,
    footerReport: t.footerReport,
    footerManage: t.footerManage,
    footerCopyright: t.footerCopyright,
    footerAddress: t.footerAddress,
  });
}

/**
 * Construye una sección HTML reutilizable para bloques internos dentro de un correo.
 *
 * @param title Título de la sección.
 * @param games Elementos de la sección.
 * @param emptyImageLabel Texto de fallback para imagen ausente.
 * @returns Fragmento HTML de sección.
 */
function sectionHtml(
  title: string,
  games: Array<{
    title: string;
    platform?: string;
    price?: string;
    imageUrl?: string;
    subtitle?: string;
    badge?: string;
  }>,
  emptyImageLabel: string = 'Game',
) {
  const cards = games
    .map((g) => {
      const priceBadge = g.price ? `<span style="display:block;width:max-content;background:#eef2ff;color:#3730a3;padding:4px 9px;border-radius:999px;font-size:12px;font-weight:700;line-height:1.2">${escapeHtml(g.price)}</span>` : '';
      const gameBadge = g.badge ? `<span style="display:block;width:max-content;background:#f1f5f9;color:#334155;padding:4px 9px;border-radius:999px;font-size:11px;font-weight:700;line-height:1.2">${escapeHtml(g.badge)}</span>` : '';
      const subtitle = g.subtitle ? `<div class="notranslate" style="color:#64748b;font-size:13px;line-height:1.5;margin-top:8px;word-break:break-word">${escapeHtml(g.subtitle)}</div>` : '';
      const platform = g.platform ? `<div style="color:#334155;font-size:13px;margin-top:6px">${escapeHtml(g.platform)}</div>` : '';
      const resolvedImageUrl = resolveImageUrl(g.imageUrl);
      const image = resolvedImageUrl
        ? `<img src="${escapeHtml(resolvedImageUrl)}" alt="${escapeHtml(g.title)}" width="88" height="88" style="display:block;width:88px;height:88px;object-fit:cover;border-radius:10px;border:1px solid #dbe2ea" />`
        : `<div style="width:88px;height:88px;border-radius:10px;border:1px solid #dbe2ea;background:#f8fafc;color:#64748b;display:flex;align-items:center;justify-content:center;font-size:12px">${escapeHtml(emptyImageLabel)}</div>`;
      return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse:separate;border-spacing:0;margin:0 0 10px 0;border:1px solid #e2e8f0;border-radius:12px;background:#ffffff">
          <tr>
            <td width="104" style="padding:12px 8px 12px 12px;vertical-align:top">
              ${image}
            </td>
            <td style="padding:12px 12px 12px 8px;vertical-align:top">
              <div class="notranslate" style="color:#0f172a;font-size:15px;line-height:1.3;font-weight:700;margin:0 0 4px 0">${escapeHtml(g.title)}</div>
              ${platform}
              <div style="margin-top:8px;display:flex;flex-direction:column;align-items:flex-start;gap:6px">${gameBadge}${priceBadge}</div>
              ${subtitle}
            </td>
          </tr>
        </table>
      `;
    })
    .join('');

  return `
    <div style="margin:0 0 16px 0">
      <h3 style="margin:0 0 10px 0;color:#0f172a;font-size:18px">${escapeHtml(title)}</h3>
      ${cards || ''}
    </div>
  `;
}

/**
 * Actualiza parcialmente los metadatos de notificaciones del usuario.
 *
 * @param userId ID del usuario.
 * @param patch Campos a mezclar sobre `emailNotificationMeta`.
 * @returns Promesa resuelta cuando la persistencia termina.
 */
async function updateMeta(userId: number, patch: Record<string, any>) {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailNotificationMeta: true },
  });
  const meta = { ...(u?.emailNotificationMeta as Record<string, any> || {}), ...patch };
  await prisma.user.update({
    where: { id: userId },
    data: { emailNotificationMeta: meta },
  });
}

/**
 * Comprueba si ya se notificó una bajada de precio para la clave indicada.
 *
 * @param user Usuario evaluado.
 * @param key Clave de deduplicación (juego/plataforma).
 * @returns `true` si ya se envió aviso previamente.
 */
function wasPriceDropNotified(user: UserWithNotifications, key: string): boolean {
  const meta = (user.emailNotificationMeta || {}) as Record<string, any>;
  return !!meta.priceDropNotified?.[key];
}

/**
 * Marca una bajada de precio como notificada para evitar duplicados posteriores.
 *
 * @param user Usuario destinatario.
 * @param key Clave de deduplicación.
 * @returns Promesa resuelta al persistir el estado.
 */
async function markPriceDropNotified(user: UserWithNotifications, key: string) {
  const meta = (user.emailNotificationMeta || {}) as Record<string, any>;
  const current = { ...(meta.priceDropNotified || {}) };
  current[key] = true;
  await updateMeta(user.id, { ...meta, priceDropNotified: current });
}

/**
 * Comprueba si ya se notificó una reposición de stock para la clave indicada.
 *
 * @param user Usuario evaluado.
 * @param key Clave de deduplicación (juego/plataforma).
 * @returns `true` si ya se avisó previamente de reposición.
 */
function wasBackInStockNotified(user: UserWithNotifications, key: string): boolean {
  const meta = (user.emailNotificationMeta || {}) as Record<string, any>;
  return !!meta.backInStockNotified?.[key];
}

/**
 * Marca una reposición de stock como notificada para evitar reenvíos.
 *
 * @param user Usuario destinatario.
 * @param key Clave de deduplicación.
 * @returns Promesa resuelta al persistir el estado.
 */
async function markBackInStockNotified(user: UserWithNotifications, key: string) {
  const meta = (user.emailNotificationMeta || {}) as Record<string, any>;
  const current = { ...(meta.backInStockNotified || {}) };
  current[key] = true;
  await updateMeta(user.id, { ...meta, backInStockNotified: current });
}

/**
 * Genera un PDF básico de factura/comprobante en memoria.
 *
 * @param input Datos de cabecera, líneas e importes para el documento.
 * @returns Buffer PDF adjuntable con el detalle de compra/reembolso.
 */
function buildInvoicePdf(input: {
  locale: ReturnType<typeof getLocalized>;
  type: 'purchase' | 'refund';
  reference: string;
  total: number;
  games: Array<{ title: string; platform: string; price: number }>;
}): Buffer {
  const header =
    input.type === 'purchase' ? input.locale.invoiceTitlePurchase : input.locale.invoiceTitleRefund;
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const lines: string[] = [];
  lines.push('GAME SAGE');
  lines.push(header);
  lines.push('');
  lines.push(`${input.locale.invoiceRef}: ${input.reference}`);
  lines.push(`${input.locale.invoiceDate}: ${now}`);
  lines.push(`${input.locale.invoiceFrom}: Game Sage Store`);
  lines.push(`${input.locale.invoiceBillTo}: Customer`);
  lines.push('');
  lines.push(
    `${input.locale.invoiceItem.padEnd(28)} ${input.locale.invoiceQty.padEnd(5)} ${input.locale.invoiceUnitPrice.padEnd(10)} ${input.locale.invoiceSubtotal}`,
  );
  lines.push('-'.repeat(78));
  for (const g of input.games) {
    const titleLines = wrapPdfText(`${g.title} (${g.platform})`, 28);
    for (let i = 0; i < titleLines.length; i += 1) {
      const name = titleLines[i] || '';
      if (i === 0) {
        lines.push(
          `${name.padEnd(28)} ${'1'.padEnd(5)} ${`${g.price.toFixed(2)} EUR`.padEnd(10)} ${g.price.toFixed(2)} EUR`,
        );
      } else {
        lines.push(`${name.padEnd(28)}`);
      }
    }
  }
  lines.push('-'.repeat(78));
  lines.push(`${input.locale.invoiceTotal}: ${input.total.toFixed(2)} EUR`);
  lines.push('');
  lines.push(input.locale.invoiceThanks);
  const safeLines = lines
    .flatMap((line) => wrapPdfText(line, 90))
    .map((line) => `(${pdfEscape(line)}) Tj`)
    .join('\n0 -14 Td\n');
  const streamBody = `BT\n/F1 11 Tf\n50 760 Td\n${safeLines}\nET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Count 1 /Kids [3 0 R] >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${streamBody.length} >>\nstream\n${streamBody}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];

  let content = '%PDF-1.4\n';
  const offsets = [0];
  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(content.length);
    content += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = content.length;
  content += `xref\n0 ${objects.length + 1}\n`;
  content += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i += 1) {
    content += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  content += `trailer\n<< /Root 1 0 R /Size ${objects.length + 1} >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(content, 'utf8');
}

/**
 * Envía una notificación inmediata cuando un favorito está en oferta.
 *
 * @param input Datos de usuario, juego y precios necesarios para el aviso.
 * @returns Promesa resuelta al finalizar el proceso de envío.
 */
export async function notifyFavoriteOfferImmediate(input: {
  userId: number;
  gameId: number;
  gameTitle: string;
  platformName: string;
  isOnSale: boolean;
  salePrice: number | null;
  price: number | null;
}) {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: {
      id: true,
      email: true,
      name: true,
      emailNotificationsEnabled: true,
      notificationEmail: true,
      emailNotificationLanguage: true,
      emailNotificationFrequency: true,
      emailNotificationTopics: true,
      emailNotificationPausedUntil: true,
      emailQuietHoursStart: true,
      emailQuietHoursEnd: true,
      emailRecommendationIntervalDays: true,
      emailNotificationMeta: true,
      lastSeenAt: true,
    },
  }) as UserWithNotifications | null;
  if (!user) return;
  if (!topicEnabled(user, 'favoriteDiscounts')) return;
  if (!input.isOnSale) return;
  const gameMedia = await prisma.game.findUnique({
    where: { id: input.gameId },
    select: {
      media: {
        where: { resourceType: { contains: 'image', mode: 'insensitive' } },
        select: { url: true },
        take: 1,
        orderBy: { id: 'asc' },
      },
    },
  });

  const locale = resolveUserLocale(user);
  const l = getLocalized(locale);
  const priceText = input.salePrice != null ? `${input.salePrice}€` : `${input.price ?? ''}€`;
  const text = renderTemplate(
    pickVariant(l.offerVariants, `${user.id}-${input.gameId}-${Date.now()}`),
    { title: input.gameTitle, platform: input.platformName, price: priceText },
  );
  await sendEmail(
    user,
    l.offerSubject,
    listHtml(
      l.offerTitle,
      [
        {
          title: input.gameTitle,
          platform: input.platformName,
          price: priceText,
          imageUrl: gameMedia?.media?.[0]?.url || undefined,
          badge: l.badgeSale,
        },
      ],
      text,
      l.imageFallback,
      user.name,
      l,
    ),
    text,
  );
}

/**
 * Envía notificación de compra o reembolso con adjunto PDF.
 *
 * @param input Tipo de operación, juegos incluidos, total e identificador de referencia.
 * @returns Promesa resuelta cuando el correo se envía (o se omite por reglas).
 */
export async function notifyPurchaseStatus(input: {
  userId: number;
  type: 'purchase' | 'refund';
  games: Array<{ title: string; platform: string; price: number }>;
  total: number;
  reference?: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: {
      id: true,
      email: true,
      name: true,
      emailNotificationsEnabled: true,
      notificationEmail: true,
      emailNotificationLanguage: true,
      emailNotificationFrequency: true,
      emailNotificationTopics: true,
      emailNotificationPausedUntil: true,
      emailQuietHoursStart: true,
      emailQuietHoursEnd: true,
      emailRecommendationIntervalDays: true,
      emailNotificationMeta: true,
      lastSeenAt: true,
    },
  }) as UserWithNotifications | null;
  if (!user) return;
  if (!topicEnabled(user, 'purchaseStatus')) return;
  const locale = resolveUserLocale(user);
  const l = getLocalized(locale);
  const subject = input.type === 'purchase' ? l.purchaseSubject : l.refundSubject;
  const title = input.type === 'purchase' ? l.buy : l.refund;
  const text = pickVariant(
    input.type === 'purchase' ? l.purchaseTextVariants : l.refundTextVariants,
    `${user.id}-${input.type}-${Date.now()}`,
  );
  const reference = input.reference || `${input.type.toUpperCase()}-${user.id}-${Date.now()}`;
  const shortReference = reference.length > 34 ? `${reference.slice(0, 18)}...${reference.slice(-10)}` : reference;
  const attachmentReference = reference.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 28) || `${input.type}-${user.id}`;
  const titleSet = [...new Set(input.games.map((g) => g.title).filter(Boolean))];
  const gameMediaRows = titleSet.length
    ? await prisma.game.findMany({
      where: { title: { in: titleSet } },
      select: {
        title: true,
        media: {
          where: { resourceType: { contains: 'image', mode: 'insensitive' } },
          select: { url: true },
          take: 1,
          orderBy: { id: 'asc' },
        },
      },
    })
    : [];
  const mediaByTitle = new Map<string, string>();
  for (const row of gameMediaRows as any[]) {
    const url = row.media?.[0]?.url;
    if (url) mediaByTitle.set(row.title, url);
  }
  const invoicePdf = buildInvoicePdf({
    locale: l,
    type: input.type,
    reference,
    total: input.total,
    games: input.games,
  });
  await sendEmail(
    user,
    subject,
    listHtml(
      title,
      input.games.map((g) => ({
        title: g.title,
        platform: g.platform,
        price: `${g.price}€`,
        subtitle: shortReference,
        imageUrl: mediaByTitle.get(g.title),
      })),
      text,
      l.imageFallback,
      user.name,
      l,
    ),
    text,
    true,
    [
      {
        filename: `${l.invoiceFilename}-${attachmentReference}.pdf`,
        content: invoicePdf,
        contentType: 'application/pdf',
      },
    ],
  );
}

/**
 * Evalúa cambios de precio/stock y notifica a usuarios que tengan el juego en favoritos.
 *
 * Aplica deduplicación persistente por juego/plataforma para stock y precio.
 *
 * @param gameId ID del juego actualizado.
 * @param before Estado previo del juego.
 * @param after Estado nuevo del juego.
 * @returns Promesa resuelta al completar todos los envíos aplicables.
 */
export async function notifyPriceDropAndStockReplenished(gameId: number, before: any, after: any) {
  const favoriteRows = await prisma.favorite.findMany({
    where: { gameId },
    select: {
      userId: true,
      platformId: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          emailNotificationsEnabled: true,
          notificationEmail: true,
          emailNotificationLanguage: true,
          emailNotificationFrequency: true,
          emailNotificationTopics: true,
          emailNotificationPausedUntil: true,
          emailQuietHoursStart: true,
          emailQuietHoursEnd: true,
          emailRecommendationIntervalDays: true,
          emailNotificationMeta: true,
          lastSeenAt: true,
        },
      },
      platform: { select: { name: true } },
      game: {
        select: {
          title: true,
          price: true,
          salePrice: true,
          isOnSale: true,
          media: {
            where: { resourceType: { contains: 'image', mode: 'insensitive' } },
            select: { url: true },
            take: 1,
            orderBy: { id: 'asc' },
          },
        },
      },
    },
  });

  for (const fav of favoriteRows as any[]) {
    const user = fav.user as UserWithNotifications;
    if (!user) continue;
    const locale = resolveUserLocale(user);
    const l = getLocalized(locale);
    const platformName = fav.platform?.name || l.platformFallback;
    const key = `${fav.gameId || gameId}:${fav.platformId}`;

    let beforeStock = 0;
    let afterStock = 0;
    const p = platformName.toLowerCase();
    if (p === 'pc') { beforeStock = Number(before.stockPc || 0); afterStock = Number(after.stockPc || 0); }
    if (p === 'ps5' || p === 'playstation 5') { beforeStock = Number(before.stockPs5 || 0); afterStock = Number(after.stockPs5 || 0); }
    if (p === 'xbox series x' || p === 'xbox x') { beforeStock = Number(before.stockXboxX || 0); afterStock = Number(after.stockXboxX || 0); }
    if (p === 'switch' || p === 'nintendo switch') { beforeStock = Number(before.stockSwitch || 0); afterStock = Number(after.stockSwitch || 0); }
    if (p === 'ps4' || p === 'playstation 4') { beforeStock = Number(before.stockPs4 || 0); afterStock = Number(after.stockPs4 || 0); }
    if (p === 'xbox one') { beforeStock = Number(before.stockXboxOne || 0); afterStock = Number(after.stockXboxOne || 0); }

    if (
      topicEnabled(user, 'backInStock') &&
      beforeStock <= 0 &&
      afterStock > 0 &&
      !wasBackInStockNotified(user, key)
    ) {
      const txt = renderTemplate(
        pickVariant(l.stockVariants, `${user.id}-${key}-${Date.now()}`),
        { title: fav.game.title, platform: platformName },
      );
      await sendEmail(
        user,
        l.stockSubject,
        listHtml(
          l.stockTitle,
          [
            {
              title: fav.game.title,
              platform: platformName,
              price: `${fav.game.isOnSale && fav.game.salePrice != null ? fav.game.salePrice : fav.game.price}€`,
              imageUrl: fav.game.media?.[0]?.url || undefined,
              badge: l.badgeRestock,
            },
          ],
          txt,
          l.imageFallback,
          user.name,
          l,
        ),
        txt,
      );
      await markBackInStockNotified(user, key);
    }

    const beforeEffectivePrice = before.isOnSale && before.salePrice != null ? Number(before.salePrice) : Number(before.price || 0);
    const afterEffectivePrice = after.isOnSale && after.salePrice != null ? Number(after.salePrice) : Number(after.price || 0);
    if (
      topicEnabled(user, 'favoriteDiscounts') &&
      afterEffectivePrice > 0 &&
      beforeEffectivePrice > afterEffectivePrice &&
      !wasPriceDropNotified(user, key)
    ) {
      const priceText = `${afterEffectivePrice}€`;
      const txt = renderTemplate(
        pickVariant(l.priceDropVariants, `${user.id}-${key}-${Date.now()}`),
        { title: fav.game.title, platform: platformName, price: priceText },
      );
      await sendEmail(
        user,
        l.offerSubject,
        listHtml(
          l.offerTitle,
          [
            {
              title: fav.game.title,
              platform: platformName,
              price: priceText,
              imageUrl: fav.game.media?.[0]?.url || undefined,
              badge: l.badgeDrop,
            },
          ],
          txt,
          l.imageFallback,
          user.name,
          l,
        ),
        txt,
      );
      await markPriceDropNotified(user, key);
    }
  }
}

/**
 * Registra señales de búsqueda para personalizar recomendaciones y novedades.
 *
 * @param userId ID del usuario autenticado.
 * @param filters Filtros usados en la búsqueda (título, género, plataforma...).
 * @returns Promesa resuelta tras guardar la señal en metadatos.
 */
export async function recordSearchSignal(userId: number, filters: Record<string, any>) {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailNotificationMeta: true },
  });
  const meta = (row?.emailNotificationMeta || {}) as Record<string, any>;
  const prev = (meta.searchSignals || []) as Array<{ at: string; title?: string; genre?: string; platform?: string }>;
  const next = [
    ...prev.slice(-39),
    {
      at: new Date().toISOString(),
      title: filters.title || undefined,
      genre: filters.genre || undefined,
      platform: filters.platform || undefined,
    },
  ];
  await updateMeta(userId, { ...meta, searchSignals: next });
}

/**
 * Carga usuarios con los campos mínimos necesarios para jobs programados.
 *
 * @returns Lista de usuarios con configuración de notificaciones.
 */
async function loadUsersForScheduledJobs(): Promise<UserWithNotifications[]> {
  return (await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      emailNotificationsEnabled: true,
      notificationEmail: true,
      emailNotificationLanguage: true,
      emailNotificationFrequency: true,
      emailNotificationTopics: true,
      emailNotificationPausedUntil: true,
      emailQuietHoursStart: true,
      emailQuietHoursEnd: true,
      emailRecommendationIntervalDays: true,
      emailNotificationMeta: true,
      lastSeenAt: true,
    },
  })) as unknown as UserWithNotifications[];
}

/**
 * Job diario de recordatorio de cesta.
 *
 * @param users Usuarios candidatos.
 * @returns Promesa resuelta al procesar todos los usuarios.
 */
async function runDailyCartReminders(users: UserWithNotifications[]) {
  for (const user of users) {
    if (!topicEnabled(user, 'cartReminders')) continue;
    if (!preferDaily(user)) continue;
    const meta = (user.emailNotificationMeta || {}) as Record<string, any>;
    const last = meta.lastCartReminderAt ? new Date(meta.lastCartReminderAt).getTime() : 0;
    if (Date.now() - last < 24 * 60 * 60 * 1000) continue;
    const cart = await prisma.cartItem.findMany({
      where: { userId: user.id },
      select: {
        game: {
          select: {
            title: true,
            price: true,
            isOnSale: true,
            salePrice: true,
            media: {
              where: { resourceType: { contains: 'image', mode: 'insensitive' } },
              select: { url: true },
              take: 1,
              orderBy: { id: 'asc' },
            },
          },
        },
        platform: { select: { name: true } },
      },
      take: 10,
    });
    if (!cart.length) continue;
    const locale = resolveUserLocale(user);
    const l = getLocalized(locale);
    const text = pickVariant(l.cartTextVariants, `${user.id}-${cart.length}-${Date.now()}`);
    await sendEmail(
      user,
      l.cartSubject,
      listHtml(
        l.cartTitle,
        cart.map((c: any) => ({
          title: c.game.title,
          platform: c.platform.name,
          price: `${c.game.isOnSale && c.game.salePrice != null ? c.game.salePrice : c.game.price}€`,
          imageUrl: c.game.media?.[0]?.url || undefined,
        })),
        text,
        l.imageFallback,
        user.name,
        l,
      ),
      text,
    );
    await updateMeta(user.id, { ...meta, lastCartReminderAt: new Date().toISOString() });
  }
}

/**
 * Job de reactivación para usuarios inactivos.
 *
 * @param users Usuarios candidatos.
 * @returns Promesa resuelta al procesar todos los usuarios.
 */
async function runInactivityReminders(users: UserWithNotifications[]) {
  const now = Date.now();
  for (const user of users) {
    if (!topicEnabled(user, 'inactiveAccount')) continue;
    if (!preferDaily(user)) continue;
    const days = Math.floor((now - new Date(user.lastSeenAt).getTime()) / (1000 * 60 * 60 * 24));
    if (days < 10) continue;
    const meta = (user.emailNotificationMeta || {}) as Record<string, any>;
    const last = meta.lastInactivityEmailAt ? new Date(meta.lastInactivityEmailAt).getTime() : 0;
    if (now - last < 7 * 24 * 60 * 60 * 1000) continue;
    const locale = resolveUserLocale(user);
    const l = getLocalized(locale);
    const text = renderTemplate(
      pickVariant(l.inactivityTextVariants, `${user.id}-${days}`),
      { days },
    );
    await sendEmail(
      user,
      l.inactivitySubject,
      listHtml(
        l.inactivityTitle,
        [{ title: l.inactivityTitle, subtitle: text }],
        text,
        l.imageFallback,
        user.name,
        l,
      ),
      text,
    );
    await updateMeta(user.id, { ...meta, lastInactivityEmailAt: new Date().toISOString() });
  }
}

/**
 * Job de recomendaciones periódicas según compras y afinidad de géneros.
 *
 * @param users Usuarios candidatos.
 * @returns Promesa resuelta al procesar todos los usuarios.
 */
async function runPeriodicRecommendations(users: UserWithNotifications[]) {
  for (const user of users) {
    if (!topicEnabled(user, 'periodicRecommendations')) continue;
    if (!preferDaily(user)) continue;
    const intervalDays = Math.max(1, Number(user.emailRecommendationIntervalDays || 7));
    const meta = (user.emailNotificationMeta || {}) as Record<string, any>;
    const last = meta.lastPeriodicRecommendationsAt ? new Date(meta.lastPeriodicRecommendationsAt).getTime() : 0;
    if (Date.now() - last < intervalDays * 24 * 60 * 60 * 1000) continue;

    const purchases = await prisma.purchaseItem.findMany({
      where: { purchase: { userId: user.id } },
      select: { game: { select: { genres: { select: { id: true } } } } },
      take: 40,
      orderBy: { id: 'desc' },
    });
    const genreCount: Record<number, number> = {};
    for (const p of purchases as any[]) {
      for (const g of p.game.genres || []) genreCount[g.id] = (genreCount[g.id] || 0) + 1;
    }
    const topGenreIds = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => Number(id));
    const games = await prisma.game.findMany({
      where: topGenreIds.length ? { genres: { some: { id: { in: topGenreIds } } } } : {},
      select: {
        id: true,
        title: true,
        price: true,
        isOnSale: true,
        salePrice: true,
        media: {
          where: { resourceType: { contains: 'image', mode: 'insensitive' } },
          select: { url: true },
          take: 1,
          orderBy: { id: 'asc' },
        },
      },
      orderBy: [{ numberOfSales: 'desc' }],
      take: 6,
    });
    if (!games.length) continue;
    const locale = resolveUserLocale(user);
    const l = getLocalized(locale);
    const text = pickVariant(l.recommendationTextVariants, `${user.id}-${games.length}-${Date.now()}`);
    await sendEmail(
      user,
      l.recSubject,
      listHtml(
        l.recTitle,
        games.map((g: any) => ({
          title: g.title,
          price: `${g.isOnSale && g.salePrice != null ? g.salePrice : g.price}€`,
          imageUrl: g.media?.[0]?.url || undefined,
        })),
        text,
        l.imageFallback,
        user.name,
        l,
      ),
      text,
    );
    await updateMeta(user.id, { ...meta, lastPeriodicRecommendationsAt: new Date().toISOString() });
  }
}

/**
 * Job de novedades por señales de búsqueda, historial de compras y tendencia global.
 *
 * @param users Usuarios candidatos.
 * @returns Promesa resuelta al procesar todos los usuarios.
 */
async function runCategoryNewsAndPopular(users: UserWithNotifications[]) {
  const popular = await prisma.game.findMany({
    orderBy: [{ numberOfSales: 'desc' }, { updatedAt: 'desc' }],
    select: {
      title: true,
      price: true,
      isOnSale: true,
      salePrice: true,
      media: {
        where: { resourceType: { contains: 'image', mode: 'insensitive' } },
        select: { url: true },
        take: 1,
        orderBy: { id: 'asc' },
      },
    },
    take: 5,
  });
  for (const user of users) {
    if (!topicEnabled(user, 'categoryNews')) continue;
    if (!preferDaily(user)) continue;
    const meta = (user.emailNotificationMeta || {}) as Record<string, any>;
    const last = meta.lastCategoryNewsAt ? new Date(meta.lastCategoryNewsAt).getTime() : 0;
    if (Date.now() - last < 24 * 60 * 60 * 1000) continue;
    const locale = resolveUserLocale(user);
    const l = getLocalized(locale);
    const searchSignals = (meta.searchSignals || []) as Array<{ title?: string; genre?: string; platform?: string }>;
    const preferredTitle = searchSignals.map((s) => s.title).filter(Boolean).slice(-1)[0];
    const preferredGenre = searchSignals.map((s) => s.genre).filter(Boolean).slice(-1)[0];
    const bySearch = preferredTitle
      ? await prisma.game.findMany({
        where: { title: { contains: preferredTitle, mode: 'insensitive' } },
        select: {
          title: true,
          price: true,
          isOnSale: true,
          salePrice: true,
          media: {
            where: { resourceType: { contains: 'image', mode: 'insensitive' } },
            select: { url: true },
            take: 1,
            orderBy: { id: 'asc' },
          },
        },
        orderBy: [{ numberOfSales: 'desc' }],
        take: 3,
      })
      : [];
    const byPurchase = await prisma.game.findMany({
      where: {
        purchaseItems: {
          some: { purchase: { userId: user.id } },
        },
      },
      select: {
        title: true,
        price: true,
        isOnSale: true,
        salePrice: true,
        media: {
          where: { resourceType: { contains: 'image', mode: 'insensitive' } },
          select: { url: true },
          take: 1,
          orderBy: { id: 'asc' },
        },
      },
      orderBy: [{ updatedAt: 'desc' }],
      take: 3,
    });
    const byGenre = preferredGenre
      ? await prisma.game.findMany({
        where: { genres: { some: { name: { equals: preferredGenre, mode: 'insensitive' } } } },
        select: {
          title: true,
          price: true,
          isOnSale: true,
          salePrice: true,
          media: {
            where: { resourceType: { contains: 'image', mode: 'insensitive' } },
            select: { url: true },
            take: 1,
            orderBy: { id: 'asc' },
          },
        },
        orderBy: [{ numberOfSales: 'desc' }],
        take: 3,
      })
      : [];
    const merged = [...bySearch, ...byPurchase, ...byGenre, ...popular]
      .filter((g, idx, arr) => arr.findIndex((x) => x.title === g.title) === idx)
      .slice(0, 8);
    if (!merged.length) continue;
    const text = pickVariant(l.categoryNewsTextVariants, `${user.id}-${merged.length}-${Date.now()}`);
    const html = wrapEmailLayout({
      lang: l.lang,
      title: l.popularTitle,
      intro: text,
      recipientName: user.name,
      greetingTemplate: l.greeting,
      footerReport: l.footerReport,
      footerManage: l.footerManage,
      footerCopyright: l.footerCopyright,
      footerAddress: l.footerAddress,
      bodyHtml: `
        ${sectionHtml(l.bySearchTitle, bySearch.slice(0, 3).map((g: any) => ({ title: g.title, price: `${g.isOnSale && g.salePrice != null ? g.salePrice : g.price}€`, imageUrl: g.media?.[0]?.url || undefined })), l.imageFallback)}
        ${sectionHtml(l.byPurchaseTitle, byPurchase.slice(0, 3).map((g: any) => ({ title: g.title, price: `${g.isOnSale && g.salePrice != null ? g.salePrice : g.price}€`, imageUrl: g.media?.[0]?.url || undefined })), l.imageFallback)}
        ${sectionHtml(l.popularNowTitle, popular.slice(0, 5).map((g: any) => ({ title: g.title, price: `${g.isOnSale && g.salePrice != null ? g.salePrice : g.price}€`, imageUrl: g.media?.[0]?.url || undefined })), l.imageFallback)}
      `,
    });
    await sendEmail(
      user,
      l.popularSubject,
      html || listHtml(l.popularTitle, merged.map((g: any) => ({ title: g.title, price: `${g.isOnSale && g.salePrice != null ? g.salePrice : g.price}€`, imageUrl: g.media?.[0]?.url || undefined })), text, l.imageFallback, user.name, l),
      text,
    );
    await updateMeta(user.id, { ...meta, lastCategoryNewsAt: new Date().toISOString() });
  }
}

/**
 * Job de resumen semanal de ofertas recientes.
 *
 * @param users Usuarios candidatos.
 * @returns Promesa resuelta al procesar todos los usuarios.
 */
async function runWeeklyDigest(users: UserWithNotifications[]) {
  for (const user of users) {
    if (!topicEnabled(user, 'weeklyDigest')) continue;
    if (!preferWeekly(user)) continue;
    const meta = (user.emailNotificationMeta || {}) as Record<string, any>;
    const last = meta.lastWeeklyDigestAt ? new Date(meta.lastWeeklyDigestAt).getTime() : 0;
    if (Date.now() - last < 7 * 24 * 60 * 60 * 1000) continue;
    const latestSales = await prisma.game.findMany({
      where: { isOnSale: true },
      select: {
        title: true,
        salePrice: true,
        media: {
          where: { resourceType: { contains: 'image', mode: 'insensitive' } },
          select: { url: true },
          take: 1,
          orderBy: { id: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 6,
    });
    if (!latestSales.length) continue;
    const locale = resolveUserLocale(user);
    const l = getLocalized(locale);
    const text = pickVariant(l.weeklyTextVariants, `${user.id}-${Date.now()}`);
    await sendEmail(
      user,
      l.weeklySubject,
      listHtml(
        l.weeklyTitle,
        latestSales.map((g: any) => ({
          title: g.title,
          price: `${g.salePrice}€`,
          imageUrl: g.media?.[0]?.url || undefined,
          badge: l.badgeWeekly,
        })),
        text,
        l.imageFallback,
        user.name,
        l,
      ),
      text,
    );
    await updateMeta(user.id, { ...meta, lastWeeklyDigestAt: new Date().toISOString() });
  }
}

/**
 * Ejecuta manualmente todos los jobs de notificación en secuencia.
 *
 * @returns Promesa resuelta al finalizar la ejecución completa.
 */
export async function runEmailJobsNow() {
  const users = await loadUsersForScheduledJobs();
  await runDailyCartReminders(users);
  await runInactivityReminders(users);
  await runPeriodicRecommendations(users);
  await runCategoryNewsAndPopular(users);
  await runWeeklyDigest(users);
}

/**
 * Inicializa el scheduler de correos en background.
 *
 * Asegura arranque idempotente y lanza una pasada inmediata antes del intervalo.
 *
 * @returns `void`.
 */
export function startEmailNotificationScheduler() {
  if (schedulerStarted) return;
  schedulerStarted = true;
  const intervalMs = 60 * 60 * 1000;
  void runEmailJobsNow();
  setInterval(() => {
    void runEmailJobsNow();
  }, intervalMs);
}
