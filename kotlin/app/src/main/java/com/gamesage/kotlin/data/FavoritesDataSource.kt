package com.gamesage.kotlin.data

import com.gamesage.kotlin.data.model.Favorite
import kotlinx.coroutines.flow.Flow

interface FavoritesDataSource {
    suspend fun readAll(): Result<List<Favorite>>
    suspend fun readOne(gameId: Int, platformId: Int): Result<Favorite>
    fun observe(): Flow<Result<List<Favorite>>>
    suspend fun add(gameId: Int, platformId: Int): Result<Unit>
    suspend fun remove(gameId: Int, platformId: Int): Result<Unit>
    suspend fun clear(): Result<Unit>
}
