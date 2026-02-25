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
    // para lanzar corrutinas
    private val scope: CoroutineScope
): FavoritesRepository {
    override suspend fun readAll(): Result<List<Game>> {
        val remoteResult = remoteDataSource.readAll()
        return if (remoteResult.isSuccess) {
            // Si hay internet: actualizamos la BBDD y devolvemos los datos frescos
            val games = remoteResult.getOrNull() ?: emptyList()
            // Limpia los datos locales antiguos para sincronizar
            localDataSource.clear()
            (localDataSource as FavoritesLocalDataSource).addAll(games)
            remoteResult
        } else {
            // Si no hay internet se busca lo que haya en la BBDD local
            localDataSource.readAll()
        }
    }

    // Llama al servidor y devuelve el resultado
    override suspend fun readOne(gameId: Int, platformId: Int): Result<Game> {
        val remoteResult = remoteDataSource.readOne(gameId, platformId)
        return if (remoteResult.isSuccess) {
            remoteResult
        } else {
            localDataSource.readOne(gameId, platformId)
        }
    }

    // La UI observa la base local
    // El repositorio sincroniza con el servidor
    // Si llegan datos nuevos, se guardan localmente
    // El Flow emite automáticamente
    override fun observe(): Flow<Result<List<Game>>> {
        scope.launch {
            readAll()
        }
        return localDataSource.observe()
    }

    // Llama al servidor para añadir a favoritos
    // Si funciona, vuelve a llamar a readAll()
    // Devuelve el resultado
    override suspend fun add(gameId: Int, platformId: Int): Result<Unit> {
        val result = remoteDataSource.add(gameId, platformId)
        if (result.isSuccess) {
            readAll()
        }
        return result
    }

    // Borra en servidor
    override suspend fun remove(gameId: Int, platformId: Int): Result<Unit> {
        val result = remoteDataSource.remove(gameId, platformId)
        if (result.isSuccess) {
            readAll()
        }
        return result
    }

    // Llama al servidor para vaciar favoritos
    // Si sale bien, limpia base local
    // Devuelve resultado
    override suspend fun clear(): Result<Unit> {
        val result = remoteDataSource.clear()
        if (result.isSuccess) {
            localDataSource.clear()
        }
        return result
    }
}
