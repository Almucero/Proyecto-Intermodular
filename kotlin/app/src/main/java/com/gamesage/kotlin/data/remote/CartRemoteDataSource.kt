package com.gamesage.kotlin.data.remote

import com.gamesage.kotlin.data.CartDataSource
import com.gamesage.kotlin.data.model.CartItem
import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.data.remote.api.GameSageApi
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
    private val api: GameSageApi,
    private val scope: CoroutineScope
): CartDataSource {

    override fun observe(): Flow<Result<List<CartItem>>> {
        return flow {
            emit(Result.success(emptyList()))
            val result = readAll()
            emit(result)
        }.shareIn(
            scope = scope,
            started = SharingStarted.WhileSubscribed(5_000L),
            replay = 1
        )
    }

    override suspend fun readAll(): Result<List<CartItem>> {
        return try {
            val apiItems = api.getCart()
            val items = apiItems.map { fetchFullItem(it) }
            Result.success(items)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun readOne(gameId: Int, platformId: Int): Result<CartItem> {
        return try {
            val all = api.getCart()
            val apiItem = all.find { it.id == gameId && it.platform?.id == platformId }
            if (apiItem != null) {
                Result.success(fetchFullItem(apiItem))
            } else {
                Result.failure(Exception("Item not found"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private suspend fun fetchFullItem(apiItem: CartItemApiModel): CartItem {
        val fullGame = try {
            api.readOneGame(apiItem.id)
        } catch (e: Exception) {
            null
        }
        return CartItem(
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
                createdAt = LocalDateTime.now(),
                updatedAt = LocalDateTime.now(),
                genres = fullGame?.genres?.map { it.toDomain() },
                platforms = apiItem.platform?.let { listOf(it.toDomain()) },
                media = fullGame?.media?.map { it.toDomain() },
                publisherId = fullGame?.publisherId,
                developerId = apiItem.Developer?.id,
                Publisher = null,
                Developer = apiItem.Developer?.toDomain()
            )
        )
    }

    override suspend fun add(gameId: Int, platformId: Int, quantity: Int): Result<Unit> {
        return try {
            api.addToCart(mapOf("gameId" to gameId, "quantity" to quantity, "platformId" to platformId))
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun update(gameId: Int, platformId: Int, quantity: Int): Result<Unit> {
        return try {
            api.updateCartItem(gameId, mapOf("quantity" to quantity, "platformId" to platformId))
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun remove(gameId: Int, platformId: Int): Result<Unit> {
        return try {
            api.removeFromCart(gameId, platformId)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun clear(): Result<Unit> {
        return try {
            api.clearCart()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
