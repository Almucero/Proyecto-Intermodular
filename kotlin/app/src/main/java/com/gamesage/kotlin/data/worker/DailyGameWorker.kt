package com.gamesage.kotlin.data.worker

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.gamesage.kotlin.R
import com.gamesage.kotlin.data.repository.game.GameRepository
import com.gamesage.kotlin.utils.NotificationHelper
import com.gamesage.kotlin.utils.LanguageUtils
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject

// Clase que ejecuta una tarea en segundo plano (Worker)
// Se encarga de buscar un juego destacado y lanzar una notificación diaria
@HiltWorker
class DailyGameWorker @AssistedInject constructor(
    @Assisted appContext: Context,
    @Assisted workerParams: WorkerParameters,
    private val gameRepository: GameRepository // Repositorio de juegos inyectado por Hilt
) : CoroutineWorker(appContext, workerParams) {

    // Función principal que ejecuta la tarea
    override suspend fun doWork(): Result {
        return try {
            // Intentamos leer todos los juegos
            val result = gameRepository.readAll()
            if (result.isSuccess) {
                val allGames = result.getOrNull() ?: emptyList()
                
                // Prioridad: 1. Juegos en oferta, 2. Cualquier juego si no hay ofertas
                val gamesOnSale = allGames.filter { it.isOnSale }
                val gameToNotify = if (gamesOnSale.isNotEmpty()) {
                    gamesOnSale.random() // Elegimos una oferta al azar
                } else if (allGames.isNotEmpty()) {
                    allGames.random() // Si no hay ofertas, elegimos cualquier juego al azar
                } else {
                    null
                }

                // Si hemos encontrado un juego para recomendar, lanzamos la notificación
                gameToNotify?.let { game ->
                    // Aplicamos el locale guardado por el usuario para que la notificación
                    // respete el idioma seleccionado en la app.
                    val localizedContext = LanguageUtils.onAttach(applicationContext)

                    val titleRes = if (game.isOnSale) {
                        R.string.notification_daily_sale_title
                    } else {
                        R.string.notification_daily_recommendation_title
                    }
                    val messageRes = if (game.isOnSale) {
                        R.string.notification_daily_sale_message
                    } else {
                        R.string.notification_daily_recommendation_message
                    }

                    val title = localizedContext.getString(titleRes)
                    val message = localizedContext.getString(messageRes, game.title)

                    // Usamos nuestra utilidad de notificaciones para mostrar el aviso
                    NotificationHelper.showNotification(
                        localizedContext,
                        title,
                        message,
                        game.id.toLong() // Pasamos el ID del juego para que al pulsar se abra su ficha
                    )
                }
            }
            Result.success() // La tarea se completó con éxito
        } catch (_: Exception) {
            Result.retry() // Si hubo un error (ej: fallo de red), se reintentará más tarde
        }
    }
}
