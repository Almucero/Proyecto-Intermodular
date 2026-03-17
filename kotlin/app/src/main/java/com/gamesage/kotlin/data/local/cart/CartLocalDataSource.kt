package com.gamesage.kotlin.data.local.cart

import com.gamesage.kotlin.data.CartDataSource
import com.gamesage.kotlin.data.local.cart.exceptions.CartNotFoundException
import com.gamesage.kotlin.data.model.CartItem
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject

class CartLocalDataSource @Inject constructor(
    private val cartDao: CartDao
): CartDataSource {
    //Trae todos los items guardados en la DB local
    override suspend fun readAll(): Result<List<CartItem>> {
        return Result.success(cartDao.getAll().toModel())
    }

    //Obtiene un producto específico de la base local
    override suspend fun readOne(gameId: Int, platformId: Int): Result<CartItem> {
        val entity = cartDao.getById(gameId, platformId)
        return if (entity != null) Result.success(entity.toModel())
        else Result.failure(CartNotFoundException())
    }

    //Permite que la UI se actualice automáticamente cuando cambian los items del carrito
    override fun observe(): Flow<Result<List<CartItem>>> {
        return cartDao.observeAll().map { Result.success(it.toModel()) }
    }
    //no toca la DB porque se actualiza con addAll()
    override suspend fun add(gameId: Int, platformId: Int, quantity: Int): Result<Unit> {
        return Result.success(Unit)
    }
    //Inserta una lista de items en la base local
    suspend fun addAll(items: List<CartItem>) {
        cartDao.insert(items.toEntity())
    }

    //no toca la DB porque se actualiza con addAll()
    override suspend fun update(gameId: Int, platformId: Int, quantity: Int): Result<Unit> {
        //val entity = cartDao.getById(gameId, platformId)
        //if (entity != null) {
        //    cartDao.insert(entity.copy(quantity = quantity))
        //}
        return Result.success(Unit)
    }

    //Elimina un producto del carrito local.
    override suspend fun remove(gameId: Int, platformId: Int): Result<Unit> {
        cartDao.delete(gameId, platformId)
        return Result.success(Unit)
    }

    //Vacía la DB del carrito
    override suspend fun clear(): Result<Unit> {
        cartDao.clear()
        return Result.success(Unit)
    }
}
