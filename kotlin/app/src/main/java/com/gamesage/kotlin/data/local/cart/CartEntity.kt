package com.gamesage.kotlin.data.local.cart

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.gamesage.kotlin.data.model.CartItem
import com.gamesage.kotlin.data.model.Game

@Entity(tableName = "cart_items")
data class CartEntity(
    @PrimaryKey
    val gameId: Int,
    val platformId: Int,
    val userId: Int,
    val quantity: Int,
    val title: String,
    val price: Double?,
    val isOnSale: Boolean,
    val salePrice: Double?,
    val rating: Float?
)

fun CartItem.toEntity(): CartEntity {
    return CartEntity(
        gameId = this.gameId,
        platformId = this.platformId,
        userId = this.userId,
        quantity = this.quantity,
        title = this.game?.title ?: "",
        price = this.game?.price,
        isOnSale = this.game?.isOnSale ?: false,
        salePrice = this.game?.salePrice,
        rating = this.game?.rating
    )
}

fun List<CartItem>.toEntity(): List<CartEntity> = this.map(CartItem::toEntity)

fun CartEntity.toModel(): CartItem {
    return CartItem(
        userId = this.userId,
        gameId = this.gameId,
        platformId = this.platformId,
        quantity = this.quantity,
        game = Game(
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
            createdAt = java.time.LocalDateTime.now(),
            updatedAt = java.time.LocalDateTime.now(),
            genres = null,
            platforms = null,
            media = null,
            publisherId = null,
            developerId = null,
            Publisher = null,
            Developer = null
        )
    )
}

fun List<CartEntity>.toModel(): List<CartItem> = this.map(CartEntity::toModel)
