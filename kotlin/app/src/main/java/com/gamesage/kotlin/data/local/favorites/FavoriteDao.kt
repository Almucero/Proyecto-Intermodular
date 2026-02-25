package com.gamesage.kotlin.data.local.favorites

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface FavoriteDao {
    // Inserta un solo favorito en la tabla.
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(item: FavoriteEntity)

    // Inserta una lista de favoritos.
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(items: List<FavoriteEntity>)

    // Devuelve todos los favoritos.
    @Query("SELECT * FROM favorites")
    suspend fun getAll(): List<FavoriteEntity>

    // Devuelve un Flow que emite la lista cada vez que cambia la tabla
    @Query("SELECT * FROM favorites")
    fun observeAll(): Flow<List<FavoriteEntity>>

    // Busca un favorito concreto por gameId y platformId
    @Query("SELECT * FROM favorites WHERE gameId = :gameId AND platformId = :platformId")
    suspend fun getById(gameId: Int, platformId: Int): FavoriteEntity?

    // Elimina un favorito específico de la tabla
    @Query("DELETE FROM favorites WHERE gameId = :gameId AND platformId = :platformId")
    suspend fun delete(gameId: Int, platformId: Int)

    // Borra todos los favoritos de la tabla
    @Query("DELETE FROM favorites")
    suspend fun clear()
}
