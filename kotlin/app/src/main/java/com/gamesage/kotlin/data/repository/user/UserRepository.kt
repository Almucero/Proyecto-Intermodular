package com.gamesage.kotlin.data.repository.user

import com.gamesage.kotlin.data.model.User
import kotlinx.coroutines.flow.Flow

interface UserRepository {
    suspend fun readOne(id:Long): Result<User>
    suspend fun me(): Result<User>
    suspend fun readAll(): Result<List<User>>
    fun observe(): Flow<Result<List<User>>>

    suspend fun logout()
}