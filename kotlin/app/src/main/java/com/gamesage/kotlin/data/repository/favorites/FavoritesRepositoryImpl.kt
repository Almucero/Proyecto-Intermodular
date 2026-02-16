package com.gamesage.kotlin.data.repository.favorites

import com.gamesage.kotlin.data.FavoritesDataSource
import com.gamesage.kotlin.data.local.favorites.FavoritesLocalDataSource
import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.di.LocalDataSource
import com.gamesage.kotlin.di.RemoteDataSource
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch
import javax.inject.Inject

class FavoritesRepositoryImpl @Inject constructor(
    @RemoteDataSource private val remoteDataSource: FavoritesDataSource,
    @LocalDataSource private val localDataSource: FavoritesDataSource,
    private val scope: CoroutineScope
): FavoritesRepository {
    override suspend fun readAll(): Result<List<Game>> {
        val remoteResult = remoteDataSource.readAll()
        if (remoteResult.isSuccess) {
            val games = remoteResult.getOrNull() ?: emptyList()
            (localDataSource as FavoritesLocalDataSource).addAll(games)
        }
        return remoteResult
    }

    override suspend fun readOne(gameId: Int, platformId: Int): Result<Game> {
        return remoteDataSource.readOne(gameId, platformId)
    }

    override fun observe(): Flow<Result<List<Game>>> {
        scope.launch {
            readAll()
        }
        return localDataSource.observe()
    }

    override suspend fun add(gameId: Int, platformId: Int): Result<Unit> {
        val result = remoteDataSource.add(gameId, platformId)
        if (result.isSuccess) {
            readAll()
        }
        return result
    }

    override suspend fun remove(gameId: Int, platformId: Int): Result<Unit> {
        val result = remoteDataSource.remove(gameId, platformId)
        if (result.isSuccess) {
            readAll()
        }
        return result
    }

    override suspend fun isFavorite(gameId: Int, platformId: Int): Result<Boolean> {
        return remoteDataSource.isFavorite(gameId, platformId)
    }
}
