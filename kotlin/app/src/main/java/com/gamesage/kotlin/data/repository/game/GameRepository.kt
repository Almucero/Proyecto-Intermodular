package com.gamesage.kotlin.data.repository.game

import com.gamesage.kotlin.data.model.Game
import kotlinx.coroutines.flow.Flow

interface GameRepository {
    suspend fun readOne(id:Long): Result<Game>
    suspend fun readAll(): Result<List<Game>>
    fun observe(): Flow<Result<List<Game>>>
}