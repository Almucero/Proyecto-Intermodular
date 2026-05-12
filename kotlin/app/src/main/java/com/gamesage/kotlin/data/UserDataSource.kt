package com.gamesage.kotlin.data

import com.gamesage.kotlin.data.model.User
import com.gamesage.kotlin.data.remote.model.UpdateProfileRequest
import kotlinx.coroutines.flow.Flow

interface UserDataSource {
    suspend fun addAll(userList: List<User>)
    fun observe(): Flow<Result<List<User>>>
    suspend fun readAll(): Result<List<User>>
    suspend fun readOne(id: Long): Result<User>
    suspend fun me(): Result<User>
    suspend fun updateMe(user: UpdateProfileRequest): Result<User>
    suspend fun clear()
}