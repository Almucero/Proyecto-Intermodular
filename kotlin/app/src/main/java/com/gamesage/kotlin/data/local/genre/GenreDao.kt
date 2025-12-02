package com.gamesage.kotlin.data.local.genre

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface GenreDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(genre: GenreEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(genreList: List<GenreEntity>)

    @Delete
    suspend fun delete(genre: GenreEntity): Int

    @Query("SELECT * FROM genres")
    suspend fun getAll(): List<GenreEntity>

    @Query("SELECT * FROM genres")
    fun observeAll(): Flow<List<GenreEntity>>

    @Query("SELECT * FROM genres WHERE id = :id")
    suspend fun readGenreById(id: Int): GenreEntity?
}