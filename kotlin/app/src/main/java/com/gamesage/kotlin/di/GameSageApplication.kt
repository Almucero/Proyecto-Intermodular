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

@HiltAndroidApp
class GameSageApplication : Application(), Configuration.Provider {

    @Inject lateinit var workerFactory: HiltWorkerFactory

    override val workManagerConfiguration: Configuration get() =
        Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .build()

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel(this)
        scheduleDailyGameWork()
    }

    private fun scheduleDailyGameWork() {
        //Configuración real, cada 24 horas recomienda el juego y solo si hay internet
        /*
        val workRequest = PeriodicWorkRequestBuilder<DailyGameWorker>(
            24, TimeUnit.HOURS
        ).setConstraints(
            Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()
        ).build()

        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "DailyGameWork",
            ExistingPeriodicWorkPolicy.KEEP,
            workRequest
        )
        */

        // Lanzar una vez inmediatamente para probar la notificación
        val testWorkRequest = OneTimeWorkRequestBuilder<DailyGameWorker>()
            .build()
        WorkManager.getInstance(this).enqueue(testWorkRequest)
    }
}