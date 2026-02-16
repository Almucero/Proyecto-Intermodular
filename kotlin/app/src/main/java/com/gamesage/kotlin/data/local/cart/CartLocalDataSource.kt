package com.gamesage.kotlin.data.local.cart

import com.gamesage.kotlin.data.CartDataSource
import com.gamesage.kotlin.data.model.CartItem
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject

class CartLocalDataSource @Inject constructor(
    private val cartDao: CartDao
): CartDataSource {
    override suspend fun readAll(): Result<List<CartItem>> {
        return Result.success(cartDao.getAll().toModel())
    }

    override suspend fun readOne(gameId: Int, platformId: Int): Result<CartItem> {
        val entity = cartDao.getById(gameId, platformId)
        return if (entity != null) Result.success(entity.toModel())
        else Result.failure(Exception("Item not found"))
    }

    override fun observe(): Flow<Result<List<CartItem>>> {
        return cartDao.observeAll().map { Result.success(it.toModel()) }
    }

    override suspend fun add(gameId: Int, platformId: Int, quantity: Int): Result<Unit> {
        return Result.success(Unit)
    }
    
    suspend fun addAll(items: List<CartItem>) {
        cartDao.insert(items.toEntity())
    }

    override suspend fun update(gameId: Int, platformId: Int, quantity: Int): Result<Unit> {
        val entity = cartDao.getById(gameId, platformId)
        if (entity != null) {
            cartDao.insert(entity.copy(quantity = quantity))
        }
        return Result.success(Unit)
    }

    override suspend fun remove(gameId: Int, platformId: Int): Result<Unit> {
        cartDao.delete(gameId, platformId)
        return Result.success(Unit)
    }

    override suspend fun clear(): Result<Unit> {
        cartDao.clear()
        return Result.success(Unit)
    }
}
