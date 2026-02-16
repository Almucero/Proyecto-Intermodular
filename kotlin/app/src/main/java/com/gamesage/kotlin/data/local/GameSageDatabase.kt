package com.gamesage.kotlin.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.gamesage.kotlin.data.local.developer.DeveloperDao
import com.gamesage.kotlin.data.local.developer.DeveloperEntity
import com.gamesage.kotlin.data.local.game.GameDao
import com.gamesage.kotlin.data.local.game.GameEntity
import com.gamesage.kotlin.data.local.genre.GenreDao
import com.gamesage.kotlin.data.local.genre.GenreEntity
import com.gamesage.kotlin.data.local.media.MediaDao
import com.gamesage.kotlin.data.local.media.MediaEntity
import com.gamesage.kotlin.data.local.platform.PlatformDao
import com.gamesage.kotlin.data.local.platform.PlatformEntity
import com.gamesage.kotlin.data.local.publisher.PublisherDao
import com.gamesage.kotlin.data.local.publisher.PublisherEntity
import com.gamesage.kotlin.data.local.user.UserDao
import com.gamesage.kotlin.data.local.user.UserEntity
import com.gamesage.kotlin.data.local.cart.CartDao
import com.gamesage.kotlin.data.local.cart.CartEntity
import com.gamesage.kotlin.data.local.favorites.FavoriteDao
import com.gamesage.kotlin.data.local.favorites.FavoriteEntity

@Database(
    entities = [
        DeveloperEntity::class,
        GameEntity::class,
        GenreEntity::class,
        MediaEntity::class,
        PlatformEntity::class,
        PublisherEntity::class,
        UserEntity::class,
        CartEntity::class,
        FavoriteEntity::class
    ],
    version = 1,
)
abstract class GameSageDatabase : RoomDatabase() {

    abstract fun getDeveloperDao(): DeveloperDao
    abstract fun getGameDao(): GameDao
    abstract fun getGenreDao(): GenreDao
    abstract fun getMediaDao(): MediaDao
    abstract fun getPlatformDao(): PlatformDao
    abstract fun getPublisherDao(): PublisherDao
    abstract fun getUserDao(): UserDao
    abstract fun getCartDao(): CartDao
    abstract fun getFavoriteDao(): FavoriteDao
}