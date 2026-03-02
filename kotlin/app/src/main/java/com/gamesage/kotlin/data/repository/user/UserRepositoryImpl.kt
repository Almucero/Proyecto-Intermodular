package com.gamesage.kotlin.data.repository.user

import com.gamesage.kotlin.data.UserDataSource
import com.gamesage.kotlin.data.local.TokenManager
import com.gamesage.kotlin.data.model.User
import com.gamesage.kotlin.data.remote.api.GameSageApi
import com.gamesage.kotlin.data.remote.model.SignUpRequest
import com.gamesage.kotlin.data.remote.model.SignInRequest
import com.gamesage.kotlin.di.LocalDataSource
import com.gamesage.kotlin.di.RemoteDataSource
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import javax.inject.Inject

class UserRepositoryImpl @Inject constructor(
    @RemoteDataSource private val remoteDataSource: UserDataSource,
    @LocalDataSource private val localDataSource: UserDataSource,
    private val scope: CoroutineScope,
    private val tokenManager: TokenManager,
    private val api: GameSageApi
): UserRepository {
    override suspend fun signUp(request: SignUpRequest): Result<Unit> {
        return try {
            api.register(request)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun signIn(request: SignInRequest): Result<Unit> {
        return try {
            //Llamada a la API para hacer login enviando email y password
            val response = api.login(request)
            //Guarda el token recibido para futuras peticiones
            tokenManager.saveToken(response.token)
            //Llama a "me()" para obtener los datos del usuario autenticado
            me()
            //Si salió bien, devolvemos éxito
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    override suspend fun saveRememberMe(remember: Boolean) {
        tokenManager.saveRememberMe(remember)
    }

    override fun observeRememberMe(): Flow<Boolean> {
        return tokenManager.rememberMe
    }

    override suspend fun readOne(id: Long): Result<User> {
        return remoteDataSource.readOne(id)
    }

    override suspend fun me(): Result<User> {
        val remoteResult = remoteDataSource.me()
        return if (remoteResult.isSuccess) {
            val user = remoteResult.getOrNull()!!
            localDataSource.addAll(listOf(user))
            remoteResult
        } else {
            localDataSource.me()
        }
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
    override fun observeMe(): Flow<Result<User>> {
        scope.launch {
            remoteDataSource.me().onSuccess { user ->
                localDataSource.addAll(listOf(user))
            }
        }
        return localDataSource.observe().map { result ->
            result.getOrNull()?.firstOrNull()?.let { 
                Result.success(it) 
            } ?: Result.failure(Exception("Usuario no encontrado localmente"))
        }
    }
    override suspend fun logout(): Result<Unit> {
        return try {
            tokenManager.deleteToken()
            localDataSource.clear()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}