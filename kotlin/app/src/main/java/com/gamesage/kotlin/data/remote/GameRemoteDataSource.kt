package com.gamesage.kotlin.data.remote

import com.gamesage.kotlin.data.GameDataSource
import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.data.remote.api.GamesApi
import com.gamesage.kotlin.data.remote.model.toDomain
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GameRemoteDataSource @Inject constructor(
    private val api: GamesApi,
    @Suppress("unused") private val scope: CoroutineScope
): GameDataSource {
    override suspend fun addAll(gameList: List<Game>) {
        // No es necesario para remote data source
    }

    override suspend fun addOne(game: Game) {
        // No es necesario para remote data source
    }
    
    override fun observe(): Flow<Result<List<Game>>> {
        // Not implementado para remote - usa readAll, en cambio,
        throw UnsupportedOperationException("Usa readAll() para remote data source")
    }
    
    override suspend fun readAll(): Result<List<Game>> {
        return try {
            val response = api.readAllGames()
            val games = response.map { it.toDomain() }
            Result.success(games)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(e)
        }
    }
    
    override suspend fun readOne(id: Long): Result<Game> {
        return try {
            val response = api.readOneGame(id.toInt())
            Result.success(response.toDomain())
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}