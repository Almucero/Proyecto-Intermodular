package com.gamesage.kotlin.data.local.platform

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface PlatformDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(platform: PlatformEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(platformList: List<PlatformEntity>)

    @Delete
    suspend fun delete(platform: PlatformEntity): Int

    @Query("SELECT * FROM platforms")
    suspend fun getAll(): List<PlatformEntity>

    @Query("SELECT * FROM platforms")
    fun observeAll(): Flow<List<PlatformEntity>>

    @Query("SELECT * FROM platforms WHERE id = :id")
    suspend fun readPlatformById(id: Long): PlatformEntity?
}