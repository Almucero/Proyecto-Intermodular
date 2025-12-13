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
    fun provideGameSageApi(tokenManager: com.gamesage.kotlin.data.local.TokenManager): GameSageApi {
        val authInterceptor = com.gamesage.kotlin.data.remote.AuthInterceptor(tokenManager)
        val client = okhttp3.OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .build()
            
        val retrofit = Retrofit.Builder()
            .baseUrl(developmentUrl)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
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
    @Singleton
    fun provideUsersApi(gameSageApi: GameSageApi): com.gamesage.kotlin.data.remote.api.UsersApi {
        return gameSageApi
    }

    @Provides
    @Singleton
    fun provideAuthApi(gameSageApi: GameSageApi): com.gamesage.kotlin.data.remote.api.AuthApi {
        return gameSageApi
    }

    @Provides
    @Singleton
    fun provideDevelopersApi(gameSageApi: GameSageApi): com.gamesage.kotlin.data.remote.api.DevelopersApi {
        return gameSageApi
    }

    @Provides
    @Singleton
    fun providePublishersApi(gameSageApi: GameSageApi): com.gamesage.kotlin.data.remote.api.PublishersApi {
        return gameSageApi
    }

    @Provides
    @Singleton
    fun providePlatformsApi(gameSageApi: GameSageApi): com.gamesage.kotlin.data.remote.api.PlatformsApi {
        return gameSageApi
    }

    @Provides
    @Singleton
    fun provideMediaApi(gameSageApi: GameSageApi): com.gamesage.kotlin.data.remote.api.MediaApi {
        return gameSageApi
    }
    
    @Provides
    fun provideCoroutineScope(): CoroutineScope {
        return CoroutineScope(SupervisorJob() + Dispatchers.Default)
    }
}