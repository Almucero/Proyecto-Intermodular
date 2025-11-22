package com.gamesage.kotlin.di

import com.gamesage.kotlin.data.remote.GameSageApi
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import javax.inject.Singleton

const val developmentUrl = "http://localhost:3000"
const val productionUrl = "https://gamesage-service.onrender.com"

@Module
@InstallIn(SingletonComponent::class)
class RemoteModule {
    @Provides
    @Singleton
    fun provideGameSageApi(): GameSageApi {
        val retrofit = Retrofit.Builder().baseUrl(developmentUrl).addConverterFactory(GsonConverterFactory.create()).build()
        return retrofit.create(GameSageApi::class.java)
    }
    @Provides
    fun provideCoroutineScope(): CoroutineScope {
        return CoroutineScope(SupervisorJob() + Dispatchers.Default)
    }
}