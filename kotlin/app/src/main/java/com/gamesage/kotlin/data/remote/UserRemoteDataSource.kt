package com.gamesage.kotlin.data.remote

import com.gamesage.kotlin.data.UserDataSource
import com.gamesage.kotlin.data.model.User
import com.gamesage.kotlin.data.remote.api.GamesApi
import com.gamesage.kotlin.data.remote.api.UsersApi
import com.gamesage.kotlin.data.remote.model.UserApiModel
import com.gamesage.kotlin.data.remote.model.toDomain
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.shareIn
import java.time.LocalDateTime
import javax.inject.Inject

class UserRemoteDataSource @Inject constructor(
    private val api: UsersApi,
    private val scope: CoroutineScope
): UserDataSource {

    override fun observe(): Flow<Result<List<User>>> {
        return flow {
            val result = me()
            result.onSuccess { user ->
                emit(Result.success(listOf(user)))
            }.onFailure {
                emit(Result.failure(it))
            }
        }.shareIn(
            scope = scope,
            started = SharingStarted.WhileSubscribed(5_000L),
            replay = 1
        )
    }

    override suspend fun addAll(userList: List<User>) {
        // No para el remoto
    }

    override suspend fun clear() {
        // No para el remoto
    }

    override suspend fun readAll(): Result<List<User>> {
        // el usuario actual envuelto en lista
        return me().map { listOf(it) }
    }

    override suspend fun readOne(id: Long): Result<User> {
         // Si pedimos uno específico por ID, de momento devolvemos 'me' 
         // ya que la API del cliente está limitada a su propio perfil
         return me()
    }

    override suspend fun me(): Result<User> {
        return try {
            val apiModel = api.me()
            val user = mapToDomain(apiModel)
            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun mapToDomain(apiModel: UserApiModel): User {
        return User(
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
    }
}