package com.gamesage.kotlin.data

import com.gamesage.kotlin.data.model.User
import kotlinx.coroutines.flow.Flow

interface UserDataSource {
    suspend fun addAll(userList: List<User>)
    fun observe(): Flow<Result<List<User>>>
    suspend fun readAll(): Result<List<User>>
    suspend fun readOne(id: Long): Result<User>
    suspend fun me(): Result<User>
}