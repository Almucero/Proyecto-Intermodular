package com.gamesage.kotlin.data.local.game

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.gamesage.kotlin.data.model.Game
import java.time.LocalDateTime

@Entity(tableName = "games")
data class GameEntity(
    @PrimaryKey
    val id: Int,
    val title: String,
    val description: String?,
    val price: Double?,
    val isOnSale: Boolean,
    val salePrice: Double?,
    val isRefundable: Boolean,
    val numberOfSales: Int,
    val stock: Int?,
    val videoUrl: String?,
    val rating: Float?,
    val releaseDate: String?,
    val createdAt: String,
    val updatedAt: String,
    val publisherId: Int?,
    val developerId: Int?
)

fun Game.toEntity(): GameEntity {
    return GameEntity(
        id = this.id,
        title = this.title,
        description = this.description,
        price = this.price,
        isOnSale = this.isOnSale,
        salePrice = this.salePrice,
        isRefundable = this.isRefundable,
        numberOfSales = this.numberOfSales,
        stock = this.stock,
        videoUrl = this.videoUrl,
        rating = this.rating,
        releaseDate = this.releaseDate?.toString(),
        createdAt = this.createdAt.toString(),
        updatedAt = this.updatedAt.toString(),
        publisherId = this.publisherId,
        developerId = this.developerId
    )
}

fun List<Game>.toEntity(): List<GameEntity> = this.map(Game::toEntity)

fun GameEntity.toModel(): Game {
    return Game(
        id = this.id,
        title = this.title,
        description = this.description,
        price = this.price,
        isOnSale = this.isOnSale,
        salePrice = this.salePrice,
        isRefundable = this.isRefundable,
        numberOfSales = this.numberOfSales,
        stock = this.stock,
        videoUrl = this.videoUrl,
        rating = this.rating,
        releaseDate = this.releaseDate?.let { LocalDateTime.parse(it) },
        createdAt = LocalDateTime.parse(this.createdAt),
        updatedAt = LocalDateTime.parse(this.updatedAt),
        publisherId = this.publisherId,
        developerId = this.developerId,
        genres = null,
        platforms = null,
        media = null,
        Publisher = null,
        Developer = null
    )
}

fun List<GameEntity>.toModel(): List<Game> = this.map(GameEntity::toModel)