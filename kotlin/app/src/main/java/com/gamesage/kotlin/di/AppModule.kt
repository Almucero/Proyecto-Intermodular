package com.gamesage.kotlin.di

import com.gamesage.kotlin.data.GameSageDataSource
import com.gamesage.kotlin.data.local.GameSageLocalDataSource
import com.gamesage.kotlin.data.remote.GameSageRemoteDataSource
import com.gamesage.kotlin.data.repository.GameSageRepository
import com.gamesage.kotlin.data.repository.GameSageRepositoryImpl
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Qualifier
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class AppModule {
    @Singleton
    @Binds
    @RemoteDataSource
    abstract fun gameSageRemoteDataSource(ds: GameSageRemoteDataSource): GameSageDataSource
    @Singleton
    @Binds
    @LocalDataSource
    abstract fun gameSageLocalDataSource(ds: GameSageLocalDataSource): GameSageDataSource
    @Singleton
    @Binds
    abstract fun bindGameSageRepository(repository: GameSageRepositoryImpl): GameSageRepository
}

@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class LocalDataSource

@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class RemoteDataSource