package com.gamesage.kotlin.data.local.cart

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface CartDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(item: CartEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(items: List<CartEntity>)

    @Query("SELECT * FROM cart_items")
    suspend fun getAll(): List<CartEntity>

    @Query("SELECT * FROM cart_items")
    fun observeAll(): Flow<List<CartEntity>>

    @Query("SELECT * FROM cart_items WHERE gameId = :gameId AND platformId = :platformId")
    suspend fun getById(gameId: Int, platformId: Int): CartEntity?

    @Query("DELETE FROM cart_items WHERE gameId = :gameId AND platformId = :platformId")
    suspend fun delete(gameId: Int, platformId: Int)

    @Query("DELETE FROM cart_items")
    suspend fun clear()
}
