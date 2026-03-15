package com.gamesage.kotlin.utils

import android.Manifest.permission.POST_NOTIFICATIONS
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.NotificationManager.IMPORTANCE_DEFAULT
import android.app.PendingIntent
import android.app.PendingIntent.FLAG_IMMUTABLE
import android.app.PendingIntent.FLAG_UPDATE_CURRENT
import android.app.PendingIntent.getActivity
import android.content.Context
import android.content.Context.NOTIFICATION_SERVICE
import android.content.Intent
import android.content.Intent.FLAG_ACTIVITY_CLEAR_TASK
import android.content.Intent.FLAG_ACTIVITY_NEW_TASK
import android.content.pm.PackageManager.PERMISSION_GRANTED
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat.checkSelfPermission
import com.gamesage.kotlin.MainActivity
import com.gamesage.kotlin.R

// Objeto de utilidad para gestionar la creación y visualización de notificaciones
object NotificationHelper {
    private const val CHANNEL_ID = "daily_game_channel" // ID único del canal de notificaciones
    private const val NOTIFICATION_ID = 1001 // ID único para la notificación (permite actualizarla si es necesario)

    // Canal de notificaciones, obligatorio para Android 8.0 (Oreo) en adelante
    fun createNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Juego del Día"
            val descriptionText = "Notificaciones sobre el juego destacado del día"
            val importance = IMPORTANCE_DEFAULT // Prioridad normal
            
            // Definimos el canal
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
            }
            
            // Registramos el canal en el sistema
            val notificationManager: NotificationManager =
                context.getSystemService(NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

     //Muestra la notificación en la pantalla del usuario.
     //Al pulsarla, abrirá la app en la ficha del juego indicado.
    fun showNotification(context: Context, title: String, message: String, gameId: Long? = null) {
        // Creamos un "Intent": la orden de qué hacer al pulsar la notificación
        val intent = Intent(context, MainActivity::class.java).apply {
            // banderas para que si la app ya estaba abierta, no se cree una nueva instancia encima
            flags = FLAG_ACTIVITY_NEW_TASK or FLAG_ACTIVITY_CLEAR_TASK
            // Adjuntamos el ID del juego como un "extra" para que la MainActivity sepa a dónde ir
            gameId?.let { putExtra("gameId", it) }
        }

        // El PendingIntent es un "vale" que le damos al sistema para que ejecute nuestro Intent más tarde
        val pendingIntent: PendingIntent = getActivity(
            context, 0, intent,
            FLAG_IMMUTABLE or FLAG_UPDATE_CURRENT
        )

        // Configuramos el diseño visual de la notificación
        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.game_sage_logo) // El icono que aparece en la barra superior
            .setContentTitle(title) // Título en negrita
            .setContentText(message) // Texto detalle
            .setPriority(NotificationCompat.PRIORITY_DEFAULT) // Prioridad para que aparezca arriba
            .setContentIntent(pendingIntent) // Qué pasa al pulsar (abre el Intent de arriba)
            .setAutoCancel(true) // Al pulsarla, la notificación desaparece sola

        // Comprobación de permisos (necesario en Android 13+)
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU || checkSelfPermission(
                context,
                POST_NOTIFICATIONS
            ) == PERMISSION_GRANTED
        ) {
            // Si tenemos permiso, lanzamos la notificación al sistema
            with(NotificationManagerCompat.from(context)) {
                notify(NOTIFICATION_ID, builder.build())
            }
        }
    }
}
