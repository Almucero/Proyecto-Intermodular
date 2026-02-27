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
        val remoteResult = remoteDataSource.readOne(id)
        
        if (remoteResult.isSuccess) {
            val game = remoteResult.getOrNull()!!
            // Actualizamos la caché local con los datos más recientes
            localDataSource.addOne(game)
            return remoteResult
        }
        
        // Si falla la red, intentamos cargar de local
        return localDataSource.readOne(id)
    }
    override suspend fun readAll(): Result<List<Game>> {
        val remoteResult = remoteDataSource.readAll()
        
        if (remoteResult.isSuccess) {
            val games = remoteResult.getOrNull() ?: emptyList()
            if (games.isNotEmpty()) {
                localDataSource.addAll(games)
            }
            return remoteResult
        }
        
        // Si falla la red, devolvemos lo que tengamos en local
        return localDataSource.readAll()
    }
    override fun observe(): Flow<Result<List<Game>>> {
        scope.launch {
            val result = remoteDataSource.readAll()
            if (result.isSuccess) {
                localDataSource.addAll(gameList = result.getOrNull()!!)
            }
        }
        return localDataSource.observe()
    }
}