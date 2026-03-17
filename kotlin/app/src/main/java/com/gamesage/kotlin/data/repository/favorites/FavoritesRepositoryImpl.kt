package com.gamesage.kotlin.data.repository.favorites

import com.gamesage.kotlin.data.FavoritesDataSource
import com.gamesage.kotlin.data.local.favorites.FavoritesLocalDataSource
import com.gamesage.kotlin.data.model.Favorite
import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.di.LocalDataSource
import com.gamesage.kotlin.di.RemoteDataSource
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import javax.inject.Inject

class FavoritesRepositoryImpl @Inject constructor(
    @RemoteDataSource private val remoteDataSource: FavoritesDataSource,
    @LocalDataSource private val localDataSource: FavoritesDataSource,
    private val scope: CoroutineScope
): FavoritesRepository {

    override suspend fun readAll(): Result<List<Game>> {
        val remoteResult: Result<List<Favorite>> = remoteDataSource.readAll()
        return if (remoteResult.isSuccess) {
            val favorites = remoteResult.getOrNull().orEmpty()
            val games = favorites.map { it.game }
            localDataSource.clear()
            (localDataSource as FavoritesLocalDataSource).addAll(favorites)
            Result.success(games)
        } else {
            val localResult = localDataSource.readAll()
            localResult.map { list -> list.map { it.game } }
        }
    }

    override suspend fun readOne(gameId: Int, platformId: Int): Result<Game> {
        val remoteResult: Result<Favorite> = remoteDataSource.readOne(gameId, platformId)
        return if (remoteResult.isSuccess) {
            remoteResult.map { it.game }
        } else {
            val localResult = localDataSource.readOne(gameId, platformId)
            localResult.map { it.game }
        }
    }

    override fun observe(): Flow<Result<List<Game>>> {
        scope.launch {
            readAll()
        }
        return localDataSource.observe().map { result ->
            result.map { list -> list.map { it.game } }
        }
    }

    override suspend fun add(gameId: Int, platformId: Int): Result<Unit> {
        val result = remoteDataSource.add(gameId, platformId)
        if (result.isSuccess) {
            readAll()
        }
        return result
    }

    override suspend fun remove(gameId: Int, platformId: Int): Result<Unit> {
        val remoteResult = remoteDataSource.remove(gameId, platformId)
        if (remoteResult.isSuccess) {
            localDataSource.remove(gameId, platformId)
        }
        return remoteResult
    }

    override suspend fun clear(): Result<Unit> {
        val remoteResult = remoteDataSource.clear()
        if (remoteResult.isSuccess) {
            localDataSource.clear()
        }
        return remoteResult
    }
}
