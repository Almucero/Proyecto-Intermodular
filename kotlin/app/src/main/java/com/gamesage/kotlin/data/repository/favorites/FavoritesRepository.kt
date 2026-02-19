package com.gamesage.kotlin.data.repository.favorites

import com.gamesage.kotlin.data.model.Game
import kotlinx.coroutines.flow.Flow

interface FavoritesRepository {
    suspend fun readAll(): Result<List<Game>>
    suspend fun readOne(gameId: Int, platformId: Int): Result<Game>
    fun observe(): Flow<Result<List<Game>>>
    suspend fun add(gameId: Int, platformId: Int): Result<Unit>
    suspend fun remove(gameId: Int, platformId: Int): Result<Unit>
}
