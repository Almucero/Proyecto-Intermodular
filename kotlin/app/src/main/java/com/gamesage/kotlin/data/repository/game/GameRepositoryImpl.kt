package com.gamesage.kotlin.data.repository.game

import com.gamesage.kotlin.data.GameDataSource
import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.di.LocalDataSource
import com.gamesage.kotlin.di.RemoteDataSource
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch
import javax.inject.Inject

class GameRepositoryImpl @Inject constructor(
    @RemoteDataSource private val remoteDataSource: GameDataSource,
    @LocalDataSource private val localDataSource: GameDataSource,
    private val scope: CoroutineScope
): GameRepository {
    override suspend fun readOne(id: Long): Result<Game> {
        return remoteDataSource.readOne(id)
    }
    override suspend fun readAll(): Result<List<Game>> {
        return remoteDataSource.readAll()
    }
    override fun observe(): Flow<Result<List<Game>>> {
        scope.launch {
            remoteDataSource.observe().collect { result ->
                if (result.isSuccess) {
                    localDataSource.addAll(gameList = result.getOrNull()!!)
                }
            }
        }
        return localDataSource.observe()
    }
}