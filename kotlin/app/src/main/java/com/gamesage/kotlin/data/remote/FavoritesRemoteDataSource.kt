package com.gamesage.kotlin.data.remote

import android.util.Log
import com.gamesage.kotlin.data.FavoritesDataSource
import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.data.remote.api.FavoritesApi
import com.gamesage.kotlin.data.remote.model.FavoriteApiModel
import com.gamesage.kotlin.data.remote.model.toDomain
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import java.time.LocalDateTime
import javax.inject.Inject

class FavoritesRemoteDataSource @Inject constructor(
    private val favoritesApi: FavoritesApi
): FavoritesDataSource {

    override fun observe(): Flow<Result<List<Game>>> {
        return flow {
            emit(readAll())
        }
    }

    override suspend fun readAll(): Result<List<Game>> {
        return try {
            val apiItems = favoritesApi.getFavorites()
            val items = apiItems.map { it.asDomainModel() }
            Result.success(items)
        } catch (e: Exception) {
            Log.e("FavoritesRemoteDS", "readAll Error: ${e.message}")
            Result.failure(e)
        }
    }

    override suspend fun readOne(gameId: Int, platformId: Int): Result<Game> {
        return try {
            val all = favoritesApi.getFavorites()
            val apiItem = all.find { it.realGameId == gameId && it.realPlatformId == platformId }
            if (apiItem != null) {
                Result.success(apiItem.asDomainModel())
            } else {
                Result.failure(Exception("Favorite not found"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun FavoriteApiModel.asDomainModel(): Game {
        return Game(
            id = this.realGameId,
            title = this.title,
            description = null,
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
            developerId = this.Developer?.id,
            Publisher = null,
            Developer = this.Developer?.toDomain()
        )
    }

    override suspend fun add(gameId: Int, platformId: Int): Result<Unit> {
        return try {
            Log.d("FavoritesRemoteDS", "Adding favorite: gameId=$gameId, platformId=$platformId")
            favoritesApi.addToFavorites(mapOf("gameId" to gameId, "platformId" to platformId))
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("FavoritesRemoteDS", "add FAILED: ${e.message}")
            Result.failure(e)
        }
    }

    override suspend fun remove(gameId: Int, platformId: Int): Result<Unit> {
        return try {
            Log.d("FavoritesRemoteDS", "Deleting favorite: gameId=$gameId, platformId=$platformId")
            favoritesApi.removeFromFavorites(gameId, platformId)
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("FavoritesRemoteDS", "remove FAILED: ${e.message}")
            Result.failure(e)
        }
    }

    override suspend fun clear(): Result<Unit> {
        return Result.success(Unit)
    }
}