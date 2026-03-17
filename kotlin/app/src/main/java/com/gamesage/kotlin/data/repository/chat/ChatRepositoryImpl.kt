package com.gamesage.kotlin.data.repository.chat

import com.gamesage.kotlin.data.ChatDataSource
import com.gamesage.kotlin.data.local.chat.ChatLocalDataSource
import com.gamesage.kotlin.data.local.chat.exceptions.ChatNotFoundException
import com.gamesage.kotlin.data.model.ChatMessage
import com.gamesage.kotlin.data.model.ChatSession
import com.gamesage.kotlin.data.remote.model.SendMessageRequest
import com.gamesage.kotlin.data.remote.model.toModel
import com.gamesage.kotlin.di.RemoteDataSource
import kotlinx.coroutines.CoroutineScope
import java.time.LocalDateTime
import javax.inject.Inject

// Implementación del repositorio de chat: remoto primero, fallback a local.
class ChatRepositoryImpl @Inject constructor(
    @RemoteDataSource private val remoteDataSource: ChatDataSource,
    private val localDataSource: ChatLocalDataSource,
    @Suppress("unused") private val scope: CoroutineScope
) : ChatRepository {

    // Obtiene la lista de sesiones (remoto primero; si falla, devuelve las locales si hay).
    override suspend fun getSessions(): Result<List<ChatSession>> {
        return try {
            val remoteSessions = remoteDataSource.getSessions()
            val domainSessions = remoteSessions.map { it.toModel() }
            localDataSource.saveSessions(domainSessions)
            Result.success(domainSessions)
        } catch (e: Exception) {
            e.printStackTrace()
            val localResult = localDataSource.getSessions()
            if (localResult.isSuccess) {
                val localSessions = localResult.getOrNull().orEmpty()
                if (localSessions.isNotEmpty()) {
                    Result.success(localSessions)
                } else {
                    Result.failure(e)
                }
            } else {
                Result.failure(e)
            }
        }
    }

    // Obtiene una sesión por id (remoto primero; fallback a local con ChatNotFoundException si no existe).
    override suspend fun getSession(id: Int): Result<ChatSession> {
        return try {
            val remoteSession = remoteDataSource.getSession(id)
            val domainSession = remoteSession.toModel()
            localDataSource.saveSession(domainSession)
            Result.success(domainSession)
        } catch (e: Exception) {
            e.printStackTrace()
            val localResult = localDataSource.getSession(id)
            if (localResult.isSuccess) {
                localResult
            } else {
                val localError = localResult.exceptionOrNull()
                if (localError is ChatNotFoundException) {
                    Result.failure(localError)
                } else {
                    Result.failure(e)
                }
            }
        }
    }

    // Envía el mensaje al remoto, construye la respuesta en dominio, la guarda en local y la devuelve.
    override suspend fun sendMessage(request: SendMessageRequest): Result<ChatMessage> {
        return try {
            val response = remoteDataSource.sendMessage(request)
            val assistantMessage = ChatMessage(
                id = null,
                sessionId = response.sessionId,
                role = "assistant",
                content = response.text,
                createdAt = LocalDateTime.now(),
                games = response.games.map { it.toModel() }
            )
            
            localDataSource.saveMessage(assistantMessage)
            Result.success(assistantMessage)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(e)
        }
    }

    // Elimina la sesión en remoto y local; si falla el remoto, intenta borrar solo en local y devuelve failure.
    override suspend fun deleteSession(id: Int): Result<Unit> {
        return try {
            remoteDataSource.deleteSession(id)
            localDataSource.deleteSession(id)
            Result.success(Unit)
        } catch (e: Exception) {
            e.printStackTrace()
            try {
                localDataSource.deleteSession(id)
            } catch (_: Exception) {}
            Result.failure(e)
        }
    }
}
