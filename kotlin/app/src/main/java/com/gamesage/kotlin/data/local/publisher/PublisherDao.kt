package com.gamesage.kotlin.data.local.publisher

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface PublisherDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(publisher: PublisherEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(publisherList: List<PublisherEntity>)

    @Delete
    suspend fun delete(publisher: PublisherEntity): Int

    @Query("SELECT * FROM publishers")
    suspend fun getAll(): List<PublisherEntity>

    @Query("SELECT * FROM publishers")
    fun observeAll(): Flow<List<PublisherEntity>>

    @Query("SELECT * FROM publishers WHERE id = :id")
    suspend fun readPublisherById(id: Long): PublisherEntity?
}