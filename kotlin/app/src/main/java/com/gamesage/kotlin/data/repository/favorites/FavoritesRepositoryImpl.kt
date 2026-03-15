package com.gamesage.kotlin.data.repository.favorites

import com.gamesage.kotlin.data.FavoritesDataSource
import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.di.RemoteDataSource
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class FavoritesRepositoryImpl @Inject constructor(
    @RemoteDataSource private val remoteDataSource: FavoritesDataSource,
): FavoritesRepository {

    override suspend fun readAll(): Result<List<Game>> {
        return remoteDataSource.readAll()
    }

    override suspend fun readOne(gameId: Int, platformId: Int): Result<Game> {
        return remoteDataSource.readOne(gameId, platformId)
    }

    override fun observe(): Flow<Result<List<Game>>> {
        return remoteDataSource.observe()
    }

    override suspend fun add(gameId: Int, platformId: Int): Result<Unit> {
        return remoteDataSource.add(gameId, platformId)
    }

    override suspend fun remove(gameId: Int, platformId: Int): Result<Unit> {
        return remoteDataSource.remove(gameId, platformId)
    }

    override suspend fun clear(): Result<Unit> {
        return remoteDataSource.clear()
    }
}
