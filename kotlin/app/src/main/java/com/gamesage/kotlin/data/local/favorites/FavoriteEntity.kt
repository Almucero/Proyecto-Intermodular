package com.gamesage.kotlin.data.local.favorites

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.gamesage.kotlin.data.model.Game
import java.time.LocalDateTime

@Entity(tableName = "favorites")
data class FavoriteEntity(
    @PrimaryKey
    val gameId: Int,
    val title: String,
    val price: Double?,
    val isOnSale: Boolean,
    val salePrice: Double?,
    val rating: Float?
)

fun Game.toFavoriteEntity(): FavoriteEntity {
    return FavoriteEntity(
        gameId = this.id,
        title = this.title,
        price = this.price,
        isOnSale = this.isOnSale,
        salePrice = this.salePrice,
        rating = this.rating
    )
}

fun List<Game>.toFavoriteEntity(): List<FavoriteEntity> = this.map(Game::toFavoriteEntity)

fun FavoriteEntity.toModel(): Game {
    return Game(
        id = this.gameId,
        title = this.title,
        description = null,
        price = this.price,
        isOnSale = this.isOnSale,
        salePrice = this.salePrice,
        isRefundable = false,
        numberOfSales = 0,
        stockPc = null,
        stockPs5 = null,
        stockXboxX = null,
        stockSwitch = null,
        stockPs4 = null,
        stockXboxOne = null,
        videoUrl = null,
        rating = this.rating,
        releaseDate = null,
        createdAt = LocalDateTime.now(),
        updatedAt = LocalDateTime.now(),
        genres = null,
        platforms = null,
        media = null,
        publisherId = null,
        developerId = null,
        Publisher = null,
        Developer = null
    )
}

fun List<FavoriteEntity>.toModel(): List<Game> = this.map(FavoriteEntity::toModel)
