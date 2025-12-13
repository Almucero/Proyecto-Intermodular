package com.gamesage.kotlin.data.repository.cart

import com.gamesage.kotlin.data.model.CartItem
import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.data.remote.api.GameSageApi
import com.gamesage.kotlin.data.remote.model.toDomain
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CartRepository @Inject constructor(
    private val api: GameSageApi
) {
    suspend fun getCart(): Result<List<CartItem>> {
        return try {
            val apiItems = api.getCart()
            val items = apiItems.map { apiItem ->
                // Fetch full game details to get media (since cart endpoint implies no media in this context)
                val fullGame = try {
                    api.readOneGame(apiItem.id)
                } catch (e: Exception) {
                    null
                }

                CartItem(
                    userId = 0,
                    gameId = apiItem.id,
                    platformId = apiItem.platform?.id ?: 0,
                    quantity = apiItem.quantity,
                    game = Game(
                        id = apiItem.id,
                        title = apiItem.title,
                        description = fullGame?.description,
                        price = apiItem.price,
                        isOnSale = apiItem.isOnSale ?: false,
                        salePrice = apiItem.salePrice,
                        isRefundable = fullGame?.isRefundable ?: false,
                        numberOfSales = fullGame?.numberOfSales ?: 0,
                        stockPc = fullGame?.stockPc,
                        stockPs5 = fullGame?.stockPs5,
                        stockXboxX = fullGame?.stockXboxX,
                        stockSwitch = fullGame?.stockSwitch,
                        stockPs4 = fullGame?.stockPs4,
                        stockXboxOne = fullGame?.stockXboxOne,
                        videoUrl = fullGame?.videoUrl,
                        rating = apiItem.rating,
                        releaseDate = null,
                        createdAt = java.time.LocalDateTime.now(),
                        updatedAt = java.time.LocalDateTime.now(),
                        genres = fullGame?.genres?.map { it.toDomain() },
                        platforms = apiItem.platform?.let { listOf(it.toDomain()) },
                        media = fullGame?.media?.map { it.toDomain() }, // Use media from full game details
                        publisherId = fullGame?.publisherId,
                        developerId = apiItem.Developer?.id,
                        Publisher = null,
                        Developer = apiItem.Developer?.toDomain()
                    )
                )
            }
            Result.success(items)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun addToCart(gameId: Int, platformId: Int, quantity: Int): Result<Unit> {
        return try {
            api.addToCart(mapOf("gameId" to gameId, "quantity" to quantity, "platformId" to platformId))
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateCartItem(gameId: Int, platformId: Int, quantity: Int): Result<Unit> {
        return try {
            api.updateCartItem(gameId, mapOf("quantity" to quantity, "platformId" to platformId))
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun removeFromCart(gameId: Int, platformId: Int): Result<Unit> {
        return try {
            api.removeFromCart(gameId, platformId)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
