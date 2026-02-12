package com.gamesage.kotlin.data.local.user

import com.gamesage.kotlin.data.UserDataSource
import com.gamesage.kotlin.data.local.user.exceptions.UserNotFoundException
import com.gamesage.kotlin.data.model.User
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.withContext
import javax.inject.Inject

class UserLocalDataSource @Inject constructor(
    private val scope: CoroutineScope,
    private val userDao: UserDao
): UserDataSource {
    override suspend fun addAll(userList: List<User>) {
        val mutex = Mutex()
        userList.forEach { user ->
            withContext(Dispatchers.IO) {
                userDao.insert(user.toEntity())
            }
        }    }
    override fun observe(): Flow<Result<List<User>>> {
        val databaseFlow = userDao.observeAll()
        return databaseFlow.map { entities ->
            Result.success(entities.toModel())
        }
    }
    override suspend fun readAll(): Result<List<User>> {
        val result = Result.success(userDao.getAll().toModel())
        return result
    }
    override suspend fun readOne(id: Long): Result<User> {
        val entity = userDao.readUserById(id)
        return if (entity == null)
            Result.failure(UserNotFoundException())
        else
            Result.success(entity.toModel())    }

    override suspend fun me(): Result<User> {
         TODO("Not yet implemented")
    }
}