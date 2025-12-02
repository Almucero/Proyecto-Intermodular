package com.gamesage.kotlin.data.local.developer

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface DeveloperDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(developer: DeveloperEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(developerList: List<DeveloperEntity>)

    @Delete
    suspend fun delete(developer: DeveloperEntity): Int

    @Query("SELECT * FROM developers")
    suspend fun getAll(): List<DeveloperEntity>

    @Query("SELECT * FROM developers")
    fun observeAll(): Flow<List<DeveloperEntity>>

    @Query("SELECT * FROM developers WHERE id = :id")
    suspend fun readDeveloperById(id: Int): DeveloperEntity?
}