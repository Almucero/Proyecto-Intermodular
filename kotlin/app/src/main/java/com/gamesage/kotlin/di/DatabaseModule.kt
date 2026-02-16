package com.gamesage.kotlin.di

import android.content.Context
import androidx.room.Room
import com.gamesage.kotlin.data.local.*
import com.gamesage.kotlin.data.local.developer.DeveloperDao
import com.gamesage.kotlin.data.local.game.GameDao
import com.gamesage.kotlin.data.local.genre.GenreDao
import com.gamesage.kotlin.data.local.media.MediaDao
import com.gamesage.kotlin.data.local.platform.PlatformDao
import com.gamesage.kotlin.data.local.publisher.PublisherDao
import com.gamesage.kotlin.data.local.user.UserDao
import com.gamesage.kotlin.data.local.cart.CartDao
import com.gamesage.kotlin.data.local.favorites.FavoriteDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
class DatabaseModule {
    @Provides
    @Singleton
    fun provideDatabase(
        @ApplicationContext applicationContext: Context
    ): GameSageDatabase {
        return Room.databaseBuilder(
            context = applicationContext,
            klass = GameSageDatabase::class.java,
            name = "gamesage-db"
        ).build()
    }
    @Provides
    fun provideDeveloperDao(database: GameSageDatabase): DeveloperDao {
        return database.getDeveloperDao()
    }
    @Provides
    fun provideGameDao(database: GameSageDatabase): GameDao {
        return database.getGameDao()
    }
    @Provides
    fun provideGenreDao(database: GameSageDatabase): GenreDao {
        return database.getGenreDao()
    }
    @Provides
    fun provideMediaDao(database: GameSageDatabase): MediaDao {
        return database.getMediaDao()
    }
    @Provides
    fun providePlatformDao(database: GameSageDatabase): PlatformDao {
        return database.getPlatformDao()
    }
    @Provides
    fun providePublisherDao(database: GameSageDatabase): PublisherDao {
        return database.getPublisherDao()
    }
    @Provides
    fun provideUserDao(database: GameSageDatabase): UserDao {
        return database.getUserDao()
    }

    @Provides
    fun provideCartDao(database: GameSageDatabase): CartDao {
        return database.getCartDao()
    }

    @Provides
    fun provideFavoriteDao(database: GameSageDatabase): FavoriteDao {
        return database.getFavoriteDao()
    }
}