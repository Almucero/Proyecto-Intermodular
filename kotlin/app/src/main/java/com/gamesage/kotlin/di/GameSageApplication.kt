package com.gamesage.kotlin.di

import android.app.Application
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.Configuration
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.gamesage.kotlin.data.worker.DailyGameWorker
import com.gamesage.kotlin.utils.NotificationHelper.createNotificationChannel
import dagger.hilt.android.HiltAndroidApp
import java.util.concurrent.TimeUnit
import javax.inject.Inject

// Clase principal de la aplicación. Es lo primero que se ejecuta al abrir la app.
@HiltAndroidApp
class GameSageApplication : Application(), Configuration.Provider {

    // Inyectamos la fábrica de trabajadores de Hilt
    @Inject lateinit var workerFactory: HiltWorkerFactory

    // Configuración necesaria para que WorkManager pueda usar la inyección de dependencias (Hilt)
    override val workManagerConfiguration: Configuration get() =
        Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .build()

    override fun onCreate() {
        super.onCreate()
        // Creamos el canal de notificaciones (necesario para Android 8+)
        createNotificationChannel(this)
        // Programamos las tareas que deben ejecutarse en segundo plano
        scheduleDailyGameWork()
    }

    /**
     * Configura la tarea periódica de recomendar un juego cada día.
     */
    private fun scheduleDailyGameWork() {
        // Configuración real para ejecución periódica (comentada para pruebas)
        /*
        val workRequest = PeriodicWorkRequestBuilder<DailyGameWorker>(
            24, TimeUnit.HOURS
        ).setConstraints(
            Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED) // Solo se ejecuta si hay internet
                .build()
        ).build()

        // Encolamos el trabajo de forma que no se duplique si la app se abre varias veces
        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "DailyGameWork",
            ExistingPeriodicWorkPolicy.KEEP,
            workRequest
        )
        */

        // Tarea de prueba: Se lanza una vez inmediatamente al abrir la app para verificar que funciona
        val testWorkRequest = OneTimeWorkRequestBuilder<DailyGameWorker>()
            .build()
        WorkManager.getInstance(this).enqueue(testWorkRequest)
    }
}