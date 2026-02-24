package com.gamesage.kotlin.data.local.cart

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface CartDao {
    //Inserta un solo producto en la tabla.
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(item: CartEntity)

    //Inserta una lista de productos.
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(items: List<CartEntity>)

    //Devuelve todos los productos del carrito.
    @Query("SELECT * FROM cart_items")
    suspend fun getAll(): List<CartEntity>

    //Devuelve un Flow que emite la lista cada vez que cambia la tabla
    @Query("SELECT * FROM cart_items")
    fun observeAll(): Flow<List<CartEntity>>

    //Busca un producto concreto por gameId y platformId
    @Query("SELECT * FROM cart_items WHERE gameId = :gameId AND platformId = :platformId")
    suspend fun getById(gameId: Int, platformId: Int): CartEntity?

    //Elimina un producto específico del carrito
    @Query("DELETE FROM cart_items WHERE gameId = :gameId AND platformId = :platformId")
    suspend fun delete(gameId: Int, platformId: Int)

    //Borra todos los productos de la tabla
    @Query("DELETE FROM cart_items")
    suspend fun clear()
}
