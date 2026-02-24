package com.gamesage.kotlin.data.local.cart

import androidx.room.Entity
import com.gamesage.kotlin.data.model.CartItem
import com.gamesage.kotlin.data.model.Developer
import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.data.model.Media
import java.time.LocalDateTime

@Entity(
    tableName = "cart_items",
    primaryKeys = ["gameId", "platformId"]
)
data class CartEntity(
    val gameId: Int,
    val platformId: Int,
    val userId: Int,
    val quantity: Int,
    val title: String,
    val price: Double?,
    val isOnSale: Boolean,
    val salePrice: Double?,
    val rating: Float?,
    val imageUrl: String?,
    val developerName: String?
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
        rating = this.game?.rating,
        imageUrl = this.game?.media?.firstOrNull()?.url,
        developerName = this.game?.Developer?.name
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
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now(),
            genres = null,
            platforms = null,
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
    )
}

fun List<CartEntity>.toModel(): List<CartItem> = this.map(CartEntity::toModel)
