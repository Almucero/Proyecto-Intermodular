package com.gamesage.kotlin.data.worker

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.gamesage.kotlin.data.repository.game.GameRepository
import com.gamesage.kotlin.utils.NotificationHelper
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject

@HiltWorker
class DailyGameWorker @AssistedInject constructor(
    @Assisted appContext: Context,
    @Assisted workerParams: WorkerParameters,
    private val gameRepository: GameRepository
) : CoroutineWorker(appContext, workerParams) {

    //Descarga la lista de juegos.
    //Filtra cuáles están en oferta.
    //Elige uno al azar y llama al NotificationHelper para mostrar el aviso.
    override suspend fun doWork(): Result {
        return try {
            val result = gameRepository.readAll()
            if (result.isSuccess) {
                val allGames = result.getOrNull() ?: emptyList()
                val gamesOnSale = allGames.filter { it.isOnSale }
                val gameToNotify = if (gamesOnSale.isNotEmpty()) {
                    gamesOnSale.random()
                } else if (allGames.isNotEmpty()) {
                    allGames.random()
                } else {
                    null
                }

                gameToNotify?.let { game ->
                    val title = if (game.isOnSale) "¡Oferta del Día!" else "Recomendación del Día"
                    val message = if (game.isOnSale) {
                        "¡${game.title} tiene un precio especial! Échale un vistazo."
                    } else {
                        "Hoy te recomendamos: ${game.title}"
                    }

                    NotificationHelper.showNotification(
                        applicationContext,
                        title,
                        message,
                        game.id.toLong()
                    )
                }
            }
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
