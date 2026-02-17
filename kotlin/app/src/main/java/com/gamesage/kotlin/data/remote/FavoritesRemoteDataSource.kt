package com.gamesage.kotlin.data.remote

import com.gamesage.kotlin.data.FavoritesDataSource
import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.data.remote.api.GameSageApi
import com.gamesage.kotlin.data.remote.model.toDomain
import kotlinx.coroutines.flow.Flow
import java.time.LocalDateTime
import javax.inject.Inject

class FavoritesRemoteDataSource @Inject constructor(
    private val api: GameSageApi
): FavoritesDataSource {
    override suspend fun readAll(): Result<List<Game>> {
        return try {
            val favorites = api.getFavorites()
            val games = favorites.mapNotNull { fav ->
                try {
                    val fullGame = api.readOneGame(fav.gameId)
                    Game(
                        id = fav.gameId,
                        title = fav.title,
                        description = fullGame.description,
                        price = fav.price,
                        isOnSale = fav.isOnSale ?: false,
                        salePrice = fav.salePrice,
                        isRefundable = fullGame.isRefundable ?: false,
                        numberOfSales = fullGame.numberOfSales ?: 0,
                        stockPc = fullGame.stockPc,
                        stockPs5 = fullGame.stockPs5,
                        stockXboxX = fullGame.stockXboxX,
                        stockSwitch = fullGame.stockSwitch,
                        stockPs4 = fullGame.stockPs4,
                        stockXboxOne = fullGame.stockXboxOne,
                        videoUrl = fullGame.videoUrl,
                        rating = fav.rating,
                        releaseDate = null,
                        createdAt = LocalDateTime.now(),
                        updatedAt = LocalDateTime.now(),
                        genres = fullGame.genres?.map { it.toDomain() },
                        media = fullGame.media?.map { it.toDomain() },
                        platforms = fav.platform?.let { listOf(it.toDomain()) },
                        publisherId = fullGame.publisherId,
                        developerId = fullGame.developerId,
                        Publisher = fullGame.publisher?.toDomain(),
                        Developer = fullGame.developer?.toDomain()
                    )
                } catch (e: Exception) {
                    null
                }
            }
            Result.success(games)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun readOne(gameId: Int, platformId: Int): Result<Game> {
        return try {
            val all = readAll()
            val game = all.getOrNull()?.find { it.id == gameId && it.platforms?.any { p -> p.id == platformId } == true }
            if (game != null) {
                Result.success(game)
            } else {
                Result.failure(Exception("Game not found in favorites"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override fun observe(): Flow<Result<List<Game>>> {
        throw UnsupportedOperationException("Use readAll() for remote data source")
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

    override suspend fun isFavorite(gameId: Int, platformId: Int): Result<Boolean> {
        return try {
            val isFav = api.isFavorite(gameId, platformId)
            Result.success(isFav)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
