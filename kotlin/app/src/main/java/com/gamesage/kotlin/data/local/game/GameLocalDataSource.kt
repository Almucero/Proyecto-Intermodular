package com.gamesage.kotlin.data.local.game

import com.gamesage.kotlin.data.GameDataSource
import com.gamesage.kotlin.data.model.Game
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GameLocalDataSource @Inject constructor(
    private val scope: CoroutineScope,
    private val gameDao: GameDao
): GameDataSource {
    override suspend fun addAll(gameList: List<Game>) {
        TODO("Not yet implemented")
    }
    override fun observe(): Flow<Result<List<Game>>> {
        TODO("Not yet implemented")
    }
    override suspend fun readAll(): Result<List<Game>> {
        TODO("Not yet implemented")
    }
    override suspend fun readOne(id: Long): Result<Game> {
        TODO("Not yet implemented")
    }
}