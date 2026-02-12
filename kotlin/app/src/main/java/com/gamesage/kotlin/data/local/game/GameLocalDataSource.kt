package com.gamesage.kotlin.data.local.game

import com.gamesage.kotlin.data.GameDataSource
import com.gamesage.kotlin.data.local.game.exceptions.GameNotFoundException
import com.gamesage.kotlin.data.model.Game
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.withContext
import javax.inject.Inject

class GameLocalDataSource @Inject constructor(
    private val scope: CoroutineScope,
    private val gameDao: GameDao
): GameDataSource {
    override suspend fun addAll(gameList: List<Game>) {
        val mutex = Mutex()
        gameList.forEach { game ->
            withContext(Dispatchers.IO) {
                gameDao.insert(game.toEntity())
            }
        }
    }
    override fun observe(): Flow<Result<List<Game>>> {
        val databaseFlow = gameDao.observeAll()
        return databaseFlow.map { entities ->
            Result.success(entities.toModel())
        }
    }
    override suspend fun readAll(): Result<List<Game>> {
        val result = Result.success(gameDao.getAll().toModel())
        return result
    }
    override suspend fun readOne(id: Long): Result<Game> {
        val entity = gameDao.readGameById(id)
        return if (entity == null)
            Result.failure(GameNotFoundException())
        else
            Result.success(entity.toModel())
    }
}