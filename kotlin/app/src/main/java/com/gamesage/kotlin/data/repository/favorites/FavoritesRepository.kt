package com.gamesage.kotlin.data.repository.favorites

import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.data.remote.api.GameSageApi
import com.gamesage.kotlin.data.remote.model.toDomain
import javax.inject.Inject
import javax.inject.Singleton
import com.gamesage.kotlin.data.remote.model.FavoriteApiModel

@Singleton
class FavoritesRepository @Inject constructor(
    private val api: GameSageApi
) {
    suspend fun getFavorites(): Result<List<Game>> {
        return try {
            val favorites = api.getFavorites()
            val games = favorites.mapNotNull { fav ->
                try {
                    val fullGame = api.readOneGame(fav.gameId)
                    // Combine favorite info with full game details
                    Game(
                        id = fav.gameId,
                        title = fav.title,
                        description = fullGame.description, // Use full description
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
                        createdAt = java.time.LocalDateTime.now(),
                        updatedAt = java.time.LocalDateTime.now(),
                        genres = fullGame.genres?.map { it.toDomain() },
                        media = fullGame.media?.map { it.toDomain() }, // Crucial: Get media from full game
                        platforms = fav.platform?.let { listOf(it.toDomain()) }, // Keep favorite's specific platform
                        publisherId = fullGame.publisherId,
                        developerId = fullGame.developerId,
                        Publisher = fullGame.publisher?.toDomain(),
                        Developer = fullGame.developer?.toDomain()
                    )
                } catch (e: Exception) {
                    null // Skip if game details fail to load
                }
            }
            Result.success(games)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun addToFavorites(gameId: Int, platformId: Int): Result<Unit> {
        return try {
            api.addToFavorites(mapOf("gameId" to gameId, "platformId" to platformId))
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun removeFromFavorites(gameId: Int, platformId: Int): Result<Unit> {
        return try {
            api.removeFromFavorites(gameId, platformId)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun isFavorite(gameId: Int, platformId: Int): Result<Boolean> {
        return try {
            val isFav = api.isFavorite(gameId, platformId)
            Result.success(isFav)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
