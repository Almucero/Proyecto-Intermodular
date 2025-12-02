package com.gamesage.kotlin.data.remote

import com.gamesage.kotlin.data.DeveloperDataSource
import com.gamesage.kotlin.data.GameDataSource
import com.gamesage.kotlin.data.model.Developer
import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.data.remote.api.GamesApi
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GameRemoteDataSource @Inject constructor(
    private val api: GamesApi,
    private val scope: CoroutineScope
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