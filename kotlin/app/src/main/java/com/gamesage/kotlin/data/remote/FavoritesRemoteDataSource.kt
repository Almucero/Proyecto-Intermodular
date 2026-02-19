package com.gamesage.kotlin.data.remote

import com.gamesage.kotlin.data.FavoritesDataSource
import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.data.model.Media
import com.gamesage.kotlin.data.remote.api.GameSageApi
import com.gamesage.kotlin.data.remote.model.FavoriteApiModel
import com.gamesage.kotlin.data.remote.model.toDomain
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.shareIn
import java.time.LocalDateTime
import javax.inject.Inject

class FavoritesRemoteDataSource @Inject constructor(
    private val api: GameSageApi,
    private val scope: CoroutineScope
): FavoritesDataSource {

    override fun observe(): Flow<Result<List<Game>>> {
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
    override suspend fun readAll(): Result<List<Game>> {
        return try {
            val apiItems = api.getFavorites()
            val items = apiItems.map { fetchFullFavorite(it) }
            Result.success(items)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun readOne(gameId: Int, platformId: Int): Result<Game> {
        return try {
            val all = api.getFavorites()
            val apiItem = all.find { it.gameId == gameId && it.platform?.id == platformId }
            if (apiItem != null) {
                Result.success(fetchFullFavorite(apiItem))
            } else {
                Result.failure(Exception("Favorite not found"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private suspend fun fetchFullFavorite(apiItem: FavoriteApiModel): Game {
        val fullGame = try {
            api.readOneGame(apiItem.gameId)
        } catch (e: Exception) {
            null
        }
        return Game(
            id = apiItem.gameId,
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
            developerId = fullGame?.developerId,
            Publisher = fullGame?.publisher?.toDomain(),
            Developer = fullGame?.developer?.toDomain()
        )
    }

    override suspend fun add(gameId: Int, platformId: Int): Result<Unit> {
        return try {
            api.addToFavorites(mapOf("gameId" to gameId, "platformId" to platformId))
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun remove(gameId: Int, platformId: Int): Result<Unit> {
        return try {
            api.removeFromFavorites(gameId, platformId)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

}
