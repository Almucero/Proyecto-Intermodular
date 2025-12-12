package com.gamesage.kotlin.di

import com.gamesage.kotlin.data.DeveloperDataSource
import com.gamesage.kotlin.data.GameDataSource
import com.gamesage.kotlin.data.GenreDataSource
import com.gamesage.kotlin.data.MediaDataSource
import com.gamesage.kotlin.data.PlatformDataSource
import com.gamesage.kotlin.data.PublisherDataSource
import com.gamesage.kotlin.data.UserDataSource
import com.gamesage.kotlin.data.local.developer.DeveloperLocalDataSource
import com.gamesage.kotlin.data.local.game.GameLocalDataSource
import com.gamesage.kotlin.data.local.genre.GenreLocalDataSource
import com.gamesage.kotlin.data.local.media.MediaLocalDataSource
import com.gamesage.kotlin.data.local.platform.PlatformLocalDataSource
import com.gamesage.kotlin.data.local.publisher.PublisherLocalDataSource
import com.gamesage.kotlin.data.local.user.UserLocalDataSource
import com.gamesage.kotlin.data.remote.DeveloperRemoteDataSource
import com.gamesage.kotlin.data.remote.GameRemoteDataSource
import com.gamesage.kotlin.data.remote.GenreRemoteDataSource
import com.gamesage.kotlin.data.remote.MediaRemoteDataSource
import com.gamesage.kotlin.data.remote.PlatformRemoteDataSource
import com.gamesage.kotlin.data.remote.PublisherRemoteDataSource
import com.gamesage.kotlin.data.remote.UserRemoteDataSource
import com.gamesage.kotlin.data.repository.developer.DeveloperRepository
import com.gamesage.kotlin.data.repository.developer.DeveloperRepositoryImpl
import com.gamesage.kotlin.data.repository.game.GameRepository
import com.gamesage.kotlin.data.repository.game.GameRepositoryImpl
import com.gamesage.kotlin.data.repository.genre.GenreRepository
import com.gamesage.kotlin.data.repository.genre.GenreRepositoryImpl
import com.gamesage.kotlin.data.repository.media.MediaRepository
import com.gamesage.kotlin.data.repository.media.MediaRepositoryImpl
import com.gamesage.kotlin.data.repository.platform.PlatformRepository
import com.gamesage.kotlin.data.repository.platform.PlatformRepositoryImpl
import com.gamesage.kotlin.data.repository.publisher.PublisherRepository
import com.gamesage.kotlin.data.repository.publisher.PublisherRepositoryImpl
import com.gamesage.kotlin.data.repository.user.UserRepository
import com.gamesage.kotlin.data.repository.user.UserRepositoryImpl
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
    abstract fun bindsRemoteDeveloperDataSource(ds: DeveloperRemoteDataSource): DeveloperDataSource
    @Singleton
    @Binds
    @LocalDataSource
    abstract fun bindsLocalDeveloperDataSource(ds: DeveloperLocalDataSource): DeveloperDataSource
    @Binds
    @Singleton
    abstract fun bindDeveloperRepository(repository: DeveloperRepositoryImpl): DeveloperRepository

    @Singleton
    @Binds
    @RemoteDataSource
    abstract fun bindsRemoteGameDataSource(ds: GameRemoteDataSource): GameDataSource
    @Singleton
    @Binds
    @LocalDataSource
    abstract fun bindsLocalGameDataSource(ds: GameLocalDataSource): GameDataSource
    @Binds
    @Singleton
    abstract fun bindGameRepository(repository: GameRepositoryImpl): GameRepository

    @Singleton
    @Binds
    @RemoteDataSource
    abstract fun bindsRemoteGenreDataSource(ds: GenreRemoteDataSource): GenreDataSource
    @Singleton
    @Binds
    @LocalDataSource
    abstract fun bindsLocalGenreDataSource(ds: GenreLocalDataSource): GenreDataSource
    @Binds
    @Singleton
    abstract fun bindGenreRepository(repository: GenreRepositoryImpl): GenreRepository

    @Singleton
    @Binds
    @RemoteDataSource
    abstract fun bindsRemoteMediaDataSource(ds: MediaRemoteDataSource): MediaDataSource
    @Singleton
    @Binds
    @LocalDataSource
    abstract fun bindsLocalMediaDataSource(ds: MediaLocalDataSource): MediaDataSource
    @Binds
    @Singleton
    abstract fun bindMediaRepository(repository: MediaRepositoryImpl): MediaRepository

    @Singleton
    @Binds
    @RemoteDataSource
    abstract fun bindsRemotePlatformDataSource(ds: PlatformRemoteDataSource): PlatformDataSource
    @Singleton
    @Binds
    @LocalDataSource
    abstract fun bindsLocalPlatformDataSource(ds: PlatformLocalDataSource): PlatformDataSource
    @Binds
    @Singleton
    abstract fun bindPlatformRepository(repository: PlatformRepositoryImpl): PlatformRepository

    @Singleton
    @Binds
    @RemoteDataSource
    abstract fun bindsRemotePublisherDataSource(ds: PublisherRemoteDataSource): PublisherDataSource
    @Singleton
    @Binds
    @LocalDataSource
    abstract fun bindsLocalPublisherDataSource(ds: PublisherLocalDataSource): PublisherDataSource
    @Binds
    @Singleton
    abstract fun bindPublisherRepository(repository: PublisherRepositoryImpl): PublisherRepository

    @Singleton
    @Binds
    @RemoteDataSource
    abstract fun bindsRemoteUserDataSource(ds: UserRemoteDataSource): UserDataSource
    @Singleton
    @Binds
    @LocalDataSource
    abstract fun bindsLocalUserDataSource(ds: UserLocalDataSource): UserDataSource
    @Binds
    @Singleton
    abstract fun bindUserRepository(repository: UserRepositoryImpl): UserRepository
}

@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class LocalDataSource

@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class RemoteDataSource