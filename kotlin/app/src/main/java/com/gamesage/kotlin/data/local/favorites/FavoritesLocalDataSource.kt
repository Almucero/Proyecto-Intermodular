package com.gamesage.kotlin.data.local.favorites

import com.gamesage.kotlin.data.FavoritesDataSource
import com.gamesage.kotlin.data.model.Game
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject

class FavoritesLocalDataSource @Inject constructor(
    private val favoriteDao: FavoriteDao
): FavoritesDataSource {
    override suspend fun readAll(): Result<List<Game>> {
        return Result.success(favoriteDao.getAll().toModel())
    }

    override suspend fun readOne(gameId: Int, platformId: Int): Result<Game> {
        val entity = favoriteDao.getById(gameId)
        return if (entity != null) Result.success(entity.toModel())
        else Result.failure(Exception("Favorite not found"))
    }

    override fun observe(): Flow<Result<List<Game>>> {
        return favoriteDao.observeAll().map { Result.success(it.toModel()) }
    }

    override suspend fun add(gameId: Int, platformId: Int): Result<Unit> {
        return Result.success(Unit)
    }
    
    suspend fun addAll(games: List<Game>) {
        favoriteDao.insert(games.toFavoriteEntity())
    }

    override suspend fun remove(gameId: Int, platformId: Int): Result<Unit> {
        favoriteDao.delete(gameId)
        return Result.success(Unit)
    }
}
