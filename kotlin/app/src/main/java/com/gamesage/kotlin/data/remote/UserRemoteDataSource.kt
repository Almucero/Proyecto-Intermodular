package com.gamesage.kotlin.data.remote

import com.gamesage.kotlin.data.UserDataSource
import com.gamesage.kotlin.data.model.User
import com.gamesage.kotlin.data.remote.api.GamesApi
import com.gamesage.kotlin.data.remote.api.UsersApi
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class UserRemoteDataSource @Inject constructor(
    private val api: UsersApi,
    private val scope: CoroutineScope
): UserDataSource {
    override suspend fun addAll(userList: List<User>) {
        TODO("Not yet implemented")
    }
    override fun observe(): Flow<Result<List<User>>> {
        TODO("Not yet implemented")
    }
    override suspend fun readAll(): Result<List<User>> {
        TODO("Not yet implemented")
    }
    override suspend fun readOne(id: Long): Result<User> {
        TODO("Not yet implemented")
    }
}