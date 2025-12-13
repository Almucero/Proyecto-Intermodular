package com.gamesage.kotlin.data.local.user

import com.gamesage.kotlin.data.UserDataSource
import com.gamesage.kotlin.data.model.User
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class UserLocalDataSource @Inject constructor(
    private val scope: CoroutineScope,
    private val userDao: UserDao
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

    override suspend fun me(): Result<User> {
         TODO("Not yet implemented")
    }
}