package com.gamesage.kotlin.data

import com.gamesage.kotlin.data.model.Game
import kotlinx.coroutines.flow.Flow

interface FavoritesDataSource {
    suspend fun readAll(): Result<List<Game>>
    suspend fun readOne(gameId: Int, platformId: Int): Result<Game>
    fun observe(): Flow<Result<List<Game>>>
    suspend fun add(gameId: Int, platformId: Int): Result<Unit>
    suspend fun remove(gameId: Int, platformId: Int): Result<Unit>
    suspend fun isFavorite(gameId: Int, platformId: Int): Result<Boolean>
}
