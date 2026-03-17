package com.gamesage.kotlin.data.local.favorites

import com.gamesage.kotlin.data.FavoritesDataSource
import com.gamesage.kotlin.data.local.favorites.exceptions.FavoriteNotFoundException
import com.gamesage.kotlin.data.model.Favorite
import com.gamesage.kotlin.data.model.Game
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject

class FavoritesLocalDataSource @Inject constructor(
    private val favoriteDao: FavoriteDao
): FavoritesDataSource {
    // Trae todos los items guardados en la DB local como Favorite
    override suspend fun readAll(): Result<List<Favorite>> {
        return Result.success(favoriteDao.getAll().toModel())
    }

    // Obtiene un favorito específico de la base local
    override suspend fun readOne(gameId: Int, platformId: Int): Result<Favorite> {
        val entity = favoriteDao.getById(gameId, platformId)
        return if (entity != null) Result.success(entity.toModel())
        else Result.failure(FavoriteNotFoundException())
    }

    // Permite que la UI se actualice automáticamente cuando cambian los favoritos
    override fun observe(): Flow<Result<List<Favorite>>> {
        return favoriteDao.observeAll().map { Result.success(it.toModel()) }
    }

    // no toca la DB porque se actualiza con addAll()
    override suspend fun add(gameId: Int, platformId: Int): Result<Unit> {
        return Result.success(Unit)
    }
    
    // Inserta una lista de favoritos en la base local
    suspend fun addAll(favorites: List<Favorite>) {
        // Aprovechamos el Game interno para mapear a entidad
        val games: List<Game> = favorites.map { it.game }
        favoriteDao.insert(games.toEntity())
    }

    // Elimina un favorito local.
    override suspend fun remove(gameId: Int, platformId: Int): Result<Unit> {
        favoriteDao.delete(gameId, platformId)
        return Result.success(Unit)
    }

    // Vacía la DB de favoritos
    override suspend fun clear(): Result<Unit> {
        favoriteDao.clear()
        return Result.success(Unit)
    }
}
