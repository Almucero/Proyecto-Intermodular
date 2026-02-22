package com.gamesage.kotlin.data.remote

import com.gamesage.kotlin.data.UserDataSource
import com.gamesage.kotlin.data.model.User
import com.gamesage.kotlin.data.remote.api.GamesApi
import com.gamesage.kotlin.data.remote.api.UsersApi
import com.gamesage.kotlin.data.remote.model.toDomain
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import java.time.LocalDateTime
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

    override suspend fun me(): Result<User> {
        return try {
            val apiModel = api.me()
            val user = User(
                id = apiModel.id,
                accountId = apiModel.accountId,
                email = apiModel.email,
                accountAt = apiModel.accountAt,
                nickname = apiModel.nickname,
                name = apiModel.name,
                surname = apiModel.surname,
                passwordHash = "",
                balance = apiModel.balance,
                points = apiModel.points ?: 0,
                createdAt = LocalDateTime.now(),
                updatedAt = LocalDateTime.now(),
                isAdmin = apiModel.isAdmin,
                addressLine1 = apiModel.addressLine1,
                addressLine2 = apiModel.addressLine2,
                city = apiModel.city,
                region = apiModel.region,
                postalCode = apiModel.postalCode,
                country = apiModel.country,
                avatar = apiModel.avatar ?: apiModel.media?.lastOrNull()?.url,
                media = apiModel.media?.map { it.toDomain() }
            )
            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}