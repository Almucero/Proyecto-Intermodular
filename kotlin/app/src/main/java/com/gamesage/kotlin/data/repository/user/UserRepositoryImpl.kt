package com.gamesage.kotlin.data.repository.user

import com.gamesage.kotlin.data.UserDataSource
import com.gamesage.kotlin.data.model.User
import com.gamesage.kotlin.di.LocalDataSource
import com.gamesage.kotlin.di.RemoteDataSource
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch
import javax.inject.Inject

class UserRepositoryImpl @Inject constructor(
    @RemoteDataSource private val remoteDataSource: UserDataSource,
    @LocalDataSource private val localDataSource: UserDataSource,
    private val scope: CoroutineScope
): UserRepository {
    override suspend fun readOne(id: Long): Result<User> {
        return remoteDataSource.readOne(id)
    }
    override suspend fun readAll(): Result<List<User>> {
        return remoteDataSource.readAll()
    }
    override fun observe(): Flow<Result<List<User>>> {
        scope.launch {
            remoteDataSource.observe().collect { result ->
                if (result.isSuccess) {
                    localDataSource.addAll(userList = result.getOrNull()!!)
                }
            }
        }
        return localDataSource.observe()
    }
}