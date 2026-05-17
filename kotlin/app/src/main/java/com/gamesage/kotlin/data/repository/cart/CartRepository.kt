package com.gamesage.kotlin.data.repository.cart

import com.gamesage.kotlin.data.model.CartItem
import com.gamesage.kotlin.data.remote.model.CheckoutSessionResponse
import kotlinx.coroutines.flow.Flow

interface CartRepository {
    suspend fun readAll(): Result<List<CartItem>>
    suspend fun readOne(gameId: Int, platformId: Int): Result<CartItem>
    fun observe(): Flow<Result<List<CartItem>>>
    suspend fun add(gameId: Int, platformId: Int, quantity: Int): Result<Unit>
    suspend fun update(gameId: Int, platformId: Int, quantity: Int): Result<Unit>
    suspend fun remove(gameId: Int, platformId: Int): Result<Unit>
    suspend fun clear(): Result<Unit>
    suspend fun createCheckoutSession(locale: String?): Result<CheckoutSessionResponse>
    suspend fun confirmCheckoutSession(sessionId: String): Result<Unit>
}
