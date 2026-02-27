package com.gamesage.kotlin.data

import com.gamesage.kotlin.data.model.Game
import kotlinx.coroutines.flow.Flow

interface GameDataSource {
    suspend fun addAll(gameList: List<Game>)
    suspend fun addOne(game: Game)
    fun observe(): Flow<Result<List<Game>>>
    suspend fun readAll(): Result<List<Game>>
    suspend fun readOne(id: Long): Result<Game>
}