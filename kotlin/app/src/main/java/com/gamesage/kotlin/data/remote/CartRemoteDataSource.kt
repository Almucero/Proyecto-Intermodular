package com.gamesage.kotlin.data.remote

import com.gamesage.kotlin.data.CartDataSource
import com.gamesage.kotlin.data.model.CartItem
import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.data.remote.api.CartApi
import com.gamesage.kotlin.data.remote.model.CartItemApiModel
import com.gamesage.kotlin.data.remote.model.toDomain
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.shareIn
import java.time.LocalDateTime
import javax.inject.Inject

class CartRemoteDataSource @Inject constructor(
    private val cartApi: CartApi,
    private val scope: CoroutineScope
): CartDataSource {

    override fun observe(): Flow<Result<List<CartItem>>> {
        return flow {
            emit(readAll())
        }.shareIn(
            scope = scope,
            started = SharingStarted.WhileSubscribed(5_000L),
            replay = 1
        )
    }

    override suspend fun readAll(): Result<List<CartItem>> {
        return try {
            val apiItems = cartApi.getCart()
            val items = apiItems.map { it.asDomainModel() }
            Result.success(items)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun readOne(gameId: Int, platformId: Int): Result<CartItem> {
        return try {
            val all = cartApi.getCart()
            val apiItem = all.find { it.id == gameId && it.platform?.id == platformId }
            if (apiItem != null) {
                Result.success(apiItem.asDomainModel())
            } else {
                Result.failure(Exception("Item not found"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun CartItemApiModel.asDomainModel(): CartItem {
        return CartItem(
            userId = 0,
            gameId = this.id,
            platformId = this.platform?.id ?: 0,
            quantity = this.quantity,
            game = Game(
                id = this.id,
                title = this.title,
                description = null, // No se necesita en la lista del carrito
                price = this.price,
                isOnSale = this.isOnSale ?: false,
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
                platforms = this.platform?.let { listOf(it.toDomain()) },
                media = this.media?.map { it.toDomain() },
                publisherId = null,
                developerId = this.developer?.id,
                Publisher = null,
                Developer = this.developer?.toDomain()
            )
        )
    }

    override suspend fun add(gameId: Int, platformId: Int, quantity: Int): Result<Unit> {
        return try {
            cartApi.addToCart(mapOf("gameId" to gameId, "platformId" to platformId, "quantity" to quantity))
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun update(gameId: Int, platformId: Int, quantity: Int): Result<Unit> {
        return try {
            cartApi.updateCartItem(gameId, mapOf("quantity" to quantity, "platformId" to platformId))
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun remove(gameId: Int, platformId: Int): Result<Unit> {
        return try {
            cartApi.removeFromCart(gameId, platformId)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun clear(): Result<Unit> {
        return try {
            cartApi.clearCart()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
