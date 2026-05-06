import nodemailer from 'nodemailer';
import { prisma } from '../../config/db';
import type {
  Locale,
  TopicKey,
  UserWithNotifications,
  MailAttachment,
} from './notifications.types';

let schedulerStarted = false;

function normalizeLocale(locale?: string | null): Locale {
  const l = (locale || 'es').toLowerCase();
  if (l.startsWith('en')) return 'en';
  if (l.startsWith('fr')) return 'fr';
  if (l.startsWith('de')) return 'de';
  if (l.startsWith('it')) return 'it';
  return 'es';
}

function isPaused(user: UserWithNotifications): boolean {
  return !!(user.emailNotificationPausedUntil && user.emailNotificationPausedUntil.getTime() > Date.now());
}

function topicEnabled(user: UserWithNotifications, topic: TopicKey): boolean {
  if (!user.emailNotificationsEnabled) return false;
  if (isPaused(user)) return false;
  const topics = (user.emailNotificationTopics || {}) as Record<string, boolean>;
  return topics[topic] !== false;
}

function deliveryEmail(user: UserWithNotifications): string {
  return (user.notificationEmail || user.email).trim().toLowerCase();
}

function preferDaily(user: UserWithNotifications): boolean {
  const f = user.emailNotificationFrequency || 'weekly';
  return f === 'daily' || f === 'immediate';
}

function preferWeekly(user: UserWithNotifications): boolean {
  return (user.emailNotificationFrequency || 'weekly') === 'weekly';
}

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
  const from = process.env['SMTP_FROM'] || 'no-reply@gamesage.local';
  if (!host || !smtpUser || !pass) return;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user: smtpUser, pass },
  });

  await transporter.sendMail({
    from,
    to: deliveryEmail(user),
    subject,
    html,
    text,
    attachments,
  });
}

function variantIndex(seed: string, count: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(hash) % count;
}

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
      invoiceFilename: 'factura',
      invoiceTitlePurchase: 'Factura de compra',
      invoiceTitleRefund: 'Comprobante de reembolso',
      invoiceRef: 'Referencia',
      invoiceDate: 'Fecha',
      invoiceTotal: 'Total',
      invoiceItems: 'Artículos',
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
      invoiceFilename: 'invoice',
      invoiceTitlePurchase: 'Purchase invoice',
      invoiceTitleRefund: 'Refund receipt',
      invoiceRef: 'Reference',
      invoiceDate: 'Date',
      invoiceTotal: 'Total',
      invoiceItems: 'Items',
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
      invoiceFilename: 'facture',
      invoiceTitlePurchase: 'Facture d’achat',
      invoiceTitleRefund: 'Justificatif de remboursement',
      invoiceRef: 'Référence',
      invoiceDate: 'Date',
      invoiceTotal: 'Total',
      invoiceItems: 'Articles',
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
      invoiceFilename: 'rechnung',
      invoiceTitlePurchase: 'Kaufrechnung',
      invoiceTitleRefund: 'Erstattungsbeleg',
      invoiceRef: 'Referenz',
      invoiceDate: 'Datum',
      invoiceTotal: 'Gesamt',
      invoiceItems: 'Artikel',
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
      invoiceFilename: 'fattura',
      invoiceTitlePurchase: 'Fattura di acquisto',
      invoiceTitleRefund: 'Ricevuta di rimborso',
      invoiceRef: 'Riferimento',
      invoiceDate: 'Data',
      invoiceTotal: 'Totale',
      invoiceItems: 'Articoli',
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
  return c[locale];
}

function renderTemplate(template: string, values: Record<string, string | number>): string {
  let out = template;
  for (const [key, value] of Object.entries(values)) {
    out = out.replaceAll(`{${key}}`, String(value));
  }
  return out;
}

function pickVariant(variants: string[], seed: string): string {
  return variants[variantIndex(seed, variants.length)] || variants[0] || '';
}

function listHtml(title: string, games: Array<{ title: string; platform?: string; price?: string }>) {
  return `
    <div style="font-family:Arial,sans-serif">
      <h2>${title}</h2>
      <ul>
        ${games
          .map((g) => `<li><strong>${g.title}</strong>${g.platform ? ` (${g.platform})` : ''}${g.price ? ` - ${g.price}` : ''}</li>`)
          .join('')}
      </ul>
    </div>
  `;
}

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

function wasPriceDropNotified(user: UserWithNotifications, key: string): boolean {
  const meta = (user.emailNotificationMeta || {}) as Record<string, any>;
  return !!meta.priceDropNotified?.[key];
}

async function markPriceDropNotified(user: UserWithNotifications, key: string) {
  const meta = (user.emailNotificationMeta || {}) as Record<string, any>;
  const current = { ...(meta.priceDropNotified || {}) };
  current[key] = true;
  await updateMeta(user.id, { ...meta, priceDropNotified: current });
}

function wasBackInStockNotified(user: UserWithNotifications, key: string): boolean {
  const meta = (user.emailNotificationMeta || {}) as Record<string, any>;
  return !!meta.backInStockNotified?.[key];
}

async function markBackInStockNotified(user: UserWithNotifications, key: string) {
  const meta = (user.emailNotificationMeta || {}) as Record<string, any>;
  const current = { ...(meta.backInStockNotified || {}) };
  current[key] = true;
  await updateMeta(user.id, { ...meta, backInStockNotified: current });
}

function buildInvoicePdf(input: {
  locale: ReturnType<typeof getLocalized>;
  type: 'purchase' | 'refund';
  reference: string;
  total: number;
  games: Array<{ title: string; platform: string; price: number }>;
}): Buffer {
  const header =
    input.type === 'purchase' ? input.locale.invoiceTitlePurchase : input.locale.invoiceTitleRefund;
  const items = input.games
    .map((g) => `- ${g.title} (${g.platform}) ${g.price.toFixed(2)} EUR`)
    .join('\n');
  const body = [
    `${header}`,
    `${input.locale.invoiceRef}: ${input.reference}`,
    `${input.locale.invoiceDate}: ${new Date().toISOString()}`,
    `${input.locale.invoiceTotal}: ${input.total.toFixed(2)} EUR`,
    `${input.locale.invoiceItems}:`,
    items || '-',
  ].join('\n');
  const safe = body.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/\n/g, '\\n');
  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Count 1 /Kids [3 0 R] >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${safe.length + 36} >>
stream
BT
/F1 11 Tf
50 740 Td
(${safe}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000063 00000 n 
0000000122 00000 n 
0000000265 00000 n 
0000000370 00000 n 
trailer
<< /Root 1 0 R /Size 6 >>
startxref
444
%%EOF`;
  return Buffer.from(pdf, 'utf8');
}

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

  const locale = normalizeLocale(user.emailNotificationLanguage);
  const l = getLocalized(locale);
  const priceText = input.salePrice != null ? `${input.salePrice}€` : `${input.price ?? ''}€`;
  const text = renderTemplate(
    pickVariant(l.offerVariants, `${user.id}-${input.gameId}-${Date.now()}`),
    { title: input.gameTitle, platform: input.platformName, price: priceText },
  );
  await sendEmail(
    user,
    l.offerSubject,
    listHtml(l.offerTitle, [{ title: input.gameTitle, platform: input.platformName, price: priceText }]),
    text,
  );
}

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
  const locale = normalizeLocale(user.emailNotificationLanguage);
  const l = getLocalized(locale);
  const subject = input.type === 'purchase' ? l.purchaseSubject : l.refundSubject;
  const title = input.type === 'purchase' ? l.buy : l.refund;
  const text = pickVariant(
    input.type === 'purchase' ? l.purchaseTextVariants : l.refundTextVariants,
    `${user.id}-${input.type}-${Date.now()}`,
  );
  const reference = input.reference || `${input.type.toUpperCase()}-${user.id}-${Date.now()}`;
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
    listHtml(title, input.games.map((g) => ({ title: g.title, platform: g.platform, price: `${g.price}€` }))),
    text,
    true,
    [
      {
        filename: `${l.invoiceFilename}-${reference}.pdf`,
        content: invoicePdf,
        contentType: 'application/pdf',
      },
    ],
  );
}

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
      game: { select: { title: true, price: true, salePrice: true, isOnSale: true } },
    },
  });

  for (const fav of favoriteRows as any[]) {
    const user = fav.user as UserWithNotifications;
    if (!user) continue;
    const locale = normalizeLocale(user.emailNotificationLanguage);
    const l = getLocalized(locale);
    const platformName = fav.platform?.name || 'Platform';
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
        listHtml(l.stockTitle, [{ title: fav.game.title, platform: platformName }]),
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
        listHtml(l.offerTitle, [{ title: fav.game.title, platform: platformName, price: priceText }]),
        txt,
      );
      await markPriceDropNotified(user, key);
    }
  }
}

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

async function runDailyCartReminders(users: UserWithNotifications[]) {
  for (const user of users) {
    if (!topicEnabled(user, 'cartReminders')) continue;
    if (!preferDaily(user)) continue;
    const meta = (user.emailNotificationMeta || {}) as Record<string, any>;
    const last = meta.lastCartReminderAt ? new Date(meta.lastCartReminderAt).getTime() : 0;
    if (Date.now() - last < 24 * 60 * 60 * 1000) continue;
    const cart = await prisma.cartItem.findMany({
      where: { userId: user.id },
      select: { game: { select: { title: true } }, platform: { select: { name: true } } },
      take: 10,
    });
    if (!cart.length) continue;
    const locale = normalizeLocale(user.emailNotificationLanguage);
    const l = getLocalized(locale);
    const text = pickVariant(l.cartTextVariants, `${user.id}-${cart.length}-${Date.now()}`);
    await sendEmail(
      user,
      l.cartSubject,
      listHtml(l.cartTitle, cart.map((c: any) => ({ title: c.game.title, platform: c.platform.name }))),
      text,
    );
    await updateMeta(user.id, { ...meta, lastCartReminderAt: new Date().toISOString() });
  }
}

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
    const locale = normalizeLocale(user.emailNotificationLanguage);
    const l = getLocalized(locale);
    const text = renderTemplate(
      pickVariant(l.inactivityTextVariants, `${user.id}-${days}`),
      { days },
    );
    await sendEmail(user, l.inactivitySubject, `<div style="font-family:Arial"><h2>${l.inactivityTitle}</h2><p>${text}</p></div>`, text);
    await updateMeta(user.id, { ...meta, lastInactivityEmailAt: new Date().toISOString() });
  }
}

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
      select: { id: true, title: true, price: true, isOnSale: true, salePrice: true },
      orderBy: [{ numberOfSales: 'desc' }],
      take: 6,
    });
    if (!games.length) continue;
    const locale = normalizeLocale(user.emailNotificationLanguage);
    const l = getLocalized(locale);
    const text = pickVariant(l.recommendationTextVariants, `${user.id}-${games.length}-${Date.now()}`);
    await sendEmail(
      user,
      l.recSubject,
      listHtml(l.recTitle, games.map((g: any) => ({ title: g.title, price: `${g.isOnSale && g.salePrice != null ? g.salePrice : g.price}€` }))),
      text,
    );
    await updateMeta(user.id, { ...meta, lastPeriodicRecommendationsAt: new Date().toISOString() });
  }
}

async function runCategoryNewsAndPopular(users: UserWithNotifications[]) {
  const popular = await prisma.game.findMany({
    orderBy: [{ numberOfSales: 'desc' }, { updatedAt: 'desc' }],
    select: { title: true, price: true, isOnSale: true, salePrice: true },
    take: 5,
  });
  for (const user of users) {
    if (!topicEnabled(user, 'categoryNews')) continue;
    if (!preferDaily(user)) continue;
    const meta = (user.emailNotificationMeta || {}) as Record<string, any>;
    const last = meta.lastCategoryNewsAt ? new Date(meta.lastCategoryNewsAt).getTime() : 0;
    if (Date.now() - last < 24 * 60 * 60 * 1000) continue;
    const locale = normalizeLocale(user.emailNotificationLanguage);
    const l = getLocalized(locale);
    const searchSignals = (meta.searchSignals || []) as Array<{ title?: string; genre?: string; platform?: string }>;
    const preferredTitle = searchSignals.map((s) => s.title).filter(Boolean).slice(-1)[0];
    const preferredGenre = searchSignals.map((s) => s.genre).filter(Boolean).slice(-1)[0];
    const bySearch = preferredTitle
      ? await prisma.game.findMany({
          where: { title: { contains: preferredTitle, mode: 'insensitive' } },
          select: { title: true, price: true, isOnSale: true, salePrice: true },
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
      select: { title: true, price: true, isOnSale: true, salePrice: true },
      orderBy: [{ updatedAt: 'desc' }],
      take: 3,
    });
    const byGenre = preferredGenre
      ? await prisma.game.findMany({
          where: { genres: { some: { name: { equals: preferredGenre, mode: 'insensitive' } } } },
          select: { title: true, price: true, isOnSale: true, salePrice: true },
          orderBy: [{ numberOfSales: 'desc' }],
          take: 3,
        })
      : [];
    const merged = [...bySearch, ...byPurchase, ...byGenre, ...popular]
      .filter((g, idx, arr) => arr.findIndex((x) => x.title === g.title) === idx)
      .slice(0, 8);
    if (!merged.length) continue;
    const text = pickVariant(l.categoryNewsTextVariants, `${user.id}-${merged.length}-${Date.now()}`);
    const html = `
      <div style="font-family:Arial,sans-serif">
        <h2>${l.bySearchTitle}</h2>
        <ul>${bySearch.slice(0, 3).map((g: any) => `<li>${g.title}</li>`).join('')}</ul>
        <h2>${l.byPurchaseTitle}</h2>
        <ul>${byPurchase.slice(0, 3).map((g: any) => `<li>${g.title}</li>`).join('')}</ul>
        <h2>${l.popularNowTitle}</h2>
        <ul>${popular.slice(0, 5).map((g: any) => `<li>${g.title}</li>`).join('')}</ul>
      </div>
    `;
    await sendEmail(
      user,
      l.popularSubject,
      html || listHtml(l.popularTitle, merged.map((g: any) => ({ title: g.title, price: `${g.isOnSale && g.salePrice != null ? g.salePrice : g.price}€` }))),
      text,
    );
    await updateMeta(user.id, { ...meta, lastCategoryNewsAt: new Date().toISOString() });
  }
}

async function runWeeklyDigest(users: UserWithNotifications[]) {
  for (const user of users) {
    if (!topicEnabled(user, 'weeklyDigest')) continue;
    if (!preferWeekly(user)) continue;
    const meta = (user.emailNotificationMeta || {}) as Record<string, any>;
    const last = meta.lastWeeklyDigestAt ? new Date(meta.lastWeeklyDigestAt).getTime() : 0;
    if (Date.now() - last < 7 * 24 * 60 * 60 * 1000) continue;
    const latestSales = await prisma.game.findMany({
      where: { isOnSale: true },
      select: { title: true, salePrice: true },
      orderBy: { updatedAt: 'desc' },
      take: 6,
    });
    if (!latestSales.length) continue;
    const locale = normalizeLocale(user.emailNotificationLanguage);
    const l = getLocalized(locale);
    const text = pickVariant(l.weeklyTextVariants, `${user.id}-${Date.now()}`);
    await sendEmail(
      user,
      l.weeklySubject,
      listHtml(l.weeklyTitle, latestSales.map((g: any) => ({ title: g.title, price: `${g.salePrice}€` }))),
      text,
    );
    await updateMeta(user.id, { ...meta, lastWeeklyDigestAt: new Date().toISOString() });
  }
}

export async function runEmailJobsNow() {
  const users = await loadUsersForScheduledJobs();
  await runDailyCartReminders(users);
  await runInactivityReminders(users);
  await runPeriodicRecommendations(users);
  await runCategoryNewsAndPopular(users);
  await runWeeklyDigest(users);
}

export function startEmailNotificationScheduler() {
  if (schedulerStarted) return;
  schedulerStarted = true;
  const intervalMs = 60 * 60 * 1000;
  void runEmailJobsNow();
  setInterval(() => {
    void runEmailJobsNow();
  }, intervalMs);
}
