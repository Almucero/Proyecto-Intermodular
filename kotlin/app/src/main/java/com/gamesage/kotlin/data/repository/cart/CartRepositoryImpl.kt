package com.gamesage.kotlin.data.repository.cart

import com.gamesage.kotlin.data.CartDataSource
import com.gamesage.kotlin.data.local.cart.CartLocalDataSource
import com.gamesage.kotlin.data.model.CartItem
import com.gamesage.kotlin.di.LocalDataSource
import com.gamesage.kotlin.di.RemoteDataSource
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch
import javax.inject.Inject

class CartRepositoryImpl @Inject constructor(
    @RemoteDataSource private val remoteDataSource: CartDataSource,
    @LocalDataSource private val localDataSource: CartDataSource,
    private val scope: CoroutineScope
): CartRepository {
    override suspend fun readAll(): Result<List<CartItem>> {
        val remoteResult = remoteDataSource.readAll()
        if (remoteResult.isSuccess) {
            val items = remoteResult.getOrNull() ?: emptyList()
            (localDataSource as CartLocalDataSource).addAll(items)
        }
        return remoteResult
    }

    override suspend fun readOne(gameId: Int, platformId: Int): Result<CartItem> {
        return remoteDataSource.readOne(gameId, platformId)
    }

    override fun observe(): Flow<Result<List<CartItem>>> {
        scope.launch {
            readAll()
        }
        return localDataSource.observe()
    }

    override suspend fun add(gameId: Int, platformId: Int, quantity: Int): Result<Unit> {
        val result = remoteDataSource.add(gameId, platformId, quantity)
        if (result.isSuccess) {
            readAll()
        }
        return result
    }

    override suspend fun update(gameId: Int, platformId: Int, quantity: Int): Result<Unit> {
        val result = remoteDataSource.update(gameId, platformId, quantity)
        if (result.isSuccess) {
            readAll()
        }
        return result
    }

    override suspend fun remove(gameId: Int, platformId: Int): Result<Unit> {
        val result = remoteDataSource.remove(gameId, platformId)
        if (result.isSuccess) {
            readAll()
        }
        return result
    }

    override suspend fun clear(): Result<Unit> {
        val result = remoteDataSource.clear()
        if (result.isSuccess) {
            localDataSource.clear()
        }
        return result
    }
}
