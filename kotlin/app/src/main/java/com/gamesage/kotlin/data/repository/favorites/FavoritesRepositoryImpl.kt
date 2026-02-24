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
        return if (remoteResult.isSuccess) {
            val games = remoteResult.getOrNull() ?: emptyList()
            localDataSource.clear() // Sincronización limpia
            (localDataSource as FavoritesLocalDataSource).addAll(games)
            remoteResult
        } else {
            localDataSource.readAll()
        }
    }

    override suspend fun readOne(gameId: Int, platformId: Int): Result<Game> {
        val remoteResult = remoteDataSource.readOne(gameId, platformId)
        return if (remoteResult.isSuccess) {
            remoteResult
        } else {
            localDataSource.readOne(gameId, platformId)
        }
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

    override suspend fun clear(): Result<Unit> {
        val result = remoteDataSource.clear()
        if (result.isSuccess) {
            localDataSource.clear()
        }
        return result
    }

}
