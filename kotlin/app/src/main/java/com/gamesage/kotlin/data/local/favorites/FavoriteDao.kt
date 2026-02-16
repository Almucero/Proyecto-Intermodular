package com.gamesage.kotlin.data.local.favorites

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface FavoriteDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(item: FavoriteEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(items: List<FavoriteEntity>)

    @Query("SELECT * FROM favorites")
    suspend fun getAll(): List<FavoriteEntity>

    @Query("SELECT * FROM favorites")
    fun observeAll(): Flow<List<FavoriteEntity>>

    @Query("SELECT * FROM favorites WHERE gameId = :gameId")
    suspend fun getById(gameId: Int): FavoriteEntity?

    @Query("DELETE FROM favorites WHERE gameId = :gameId")
    suspend fun delete(gameId: Int)

    @Query("SELECT EXISTS(SELECT * FROM favorites WHERE gameId = :gameId)")
    suspend fun isFavorite(gameId: Int): Boolean
}
