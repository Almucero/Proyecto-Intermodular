package com.gamesage.kotlin.data.worker

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.gamesage.kotlin.data.repository.game.GameRepository
import com.gamesage.kotlin.utils.NotificationHelper
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
                    val title = if (game.isOnSale) "¡Oferta del Día!" else "Recomendación del Día"
                    val message = if (game.isOnSale) {
                        "¡${game.title} tiene un precio especial! Échale un vistazo."
                    } else {
                        "Hoy te recomendamos: ${game.title}"
                    }

                    // Usamos nuestra utilidad de notificaciones para mostrar el aviso
                    NotificationHelper.showNotification(
                        applicationContext,
                        title,
                        message,
                        game.id.toLong() // Pasamos el ID del juego para que al pulsar se abra su ficha
                    )
                }
            }
            Result.success() // La tarea se completó con éxito
        } catch (e: Exception) {
            Result.retry() // Si hubo un error (ej: fallo de red), se reintentará más tarde
        }
    }
}
