package com.gamesage.kotlin.di

import com.gamesage.kotlin.data.remote.api.GameSageApi
import com.gamesage.kotlin.data.remote.api.GamesApi
import com.gamesage.kotlin.data.remote.api.GenresApi
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

const val developmentUrl = "http://10.0.2.2:3000"
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
    @Singleton
    fun provideGamesApi(gameSageApi: GameSageApi): GamesApi {
        return gameSageApi
    }
    
    @Provides
    @Singleton
    fun provideGenresApi(gameSageApi: GameSageApi): GenresApi {
        return gameSageApi
    }
    
    @Provides
    fun provideCoroutineScope(): CoroutineScope {
        return CoroutineScope(SupervisorJob() + Dispatchers.Default)
    }
}