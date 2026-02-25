package com.gamesage.kotlin.data.local.favorites

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.gamesage.kotlin.data.model.Developer
import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.data.model.Media
import com.gamesage.kotlin.data.model.Platform
import java.time.LocalDateTime

@Entity(
    tableName = "favorites",
    primaryKeys = ["gameId", "platformId"]
)
data class FavoriteEntity(
    val gameId: Int,
    val platformId: Int,
    val title: String,
    val price: Double?,
    val isOnSale: Boolean,
    val salePrice: Double?,
    val rating: Float?,
    val imageUrl: String?,
    val developerName: String?,
    val platformName: String?
)

fun Game.toEntity(): FavoriteEntity {
    return FavoriteEntity(
        gameId = this.id,
        platformId = this.platforms?.firstOrNull()?.id ?: 0,
        title = this.title,
        price = this.price,
        isOnSale = this.isOnSale,
        salePrice = this.salePrice,
        rating = this.rating,
        imageUrl = this.media?.firstOrNull()?.url,
        developerName = this.Developer?.name,
        platformName = this.platforms?.firstOrNull()?.name
    )
}

fun List<Game>.toEntity(): List<FavoriteEntity> = this.map(Game::toEntity)

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
        platforms = listOf(
            Platform(
                this.platformId,
                this.platformName ?: "Múltiple",
                LocalDateTime.now(),
                LocalDateTime.now(),
                null
            )
        ),
        media = this.imageUrl?.let {
            listOf(
                Media(
                    id = 0,
                    url = it,
                    publicId = null,
                    format = null,
                    resourceType = "cover",
                    bytes = null,
                    width = null,
                    height = null,
                    originalName = null,
                    folder = null,
                    altText = null,
                    createdAt = LocalDateTime.now(),
                    updatedAt = LocalDateTime.now(),
                    gameId = this.gameId,
                    Game = null,
                    userId = null,
                    User = null
                )
            )
        },
        publisherId = null,
        developerId = null,
        Publisher = null,
        Developer = this.developerName?.let {
            Developer(0, it, LocalDateTime.now(), LocalDateTime.now(), null)
        }
    )
}

fun List<FavoriteEntity>.toModel(): List<Game> = this.map(FavoriteEntity::toModel)
