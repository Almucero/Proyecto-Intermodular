package com.gamesage.kotlin.data.repository.user

import com.gamesage.kotlin.data.model.User
import com.gamesage.kotlin.data.remote.model.SignUpRequest
import com.gamesage.kotlin.data.remote.model.SignInRequest
import kotlinx.coroutines.flow.Flow

interface UserRepository {
    suspend fun signUp(request: SignUpRequest): Result<Unit>
    suspend fun signIn(request: SignInRequest): Result<Unit>
    suspend fun saveRememberMe(remember: Boolean)
    fun observeRememberMe(): Flow<Boolean>
    suspend fun readOne(id:Long): Result<User>
    suspend fun me(): Result<User>
    suspend fun readAll(): Result<List<User>>
    fun observe(): Flow<Result<List<User>>>
    fun observeMe(): Flow<Result<User>>
    suspend fun logout(): Result<Unit>
}