package com.gamesage.kotlin.data.repository.chat

import com.gamesage.kotlin.data.ChatDataSource
import com.gamesage.kotlin.data.local.chat.ChatLocalDataSource
import com.gamesage.kotlin.data.model.ChatMessage
import com.gamesage.kotlin.data.model.ChatSession
import com.gamesage.kotlin.data.remote.model.SendMessageRequest
import com.gamesage.kotlin.data.remote.model.toModel
import com.gamesage.kotlin.di.RemoteDataSource
import kotlinx.coroutines.CoroutineScope
import java.time.LocalDateTime
import javax.inject.Inject

class ChatRepositoryImpl @Inject constructor(
    @RemoteDataSource private val remoteDataSource: ChatDataSource,
    private val localDataSource: ChatLocalDataSource,
    @Suppress("unused") private val scope: CoroutineScope
) : ChatRepository {

    override suspend fun getSessions(): Result<List<ChatSession>> {
        return try {
            val remoteSessions = remoteDataSource.getSessions()
            val domainSessions = remoteSessions.map { it.toModel() }
            localDataSource.saveSessions(domainSessions)
            Result.success(domainSessions)
        } catch (e: Exception) {
            e.printStackTrace()
            // Fallback to local
            val localSessions = localDataSource.getSessions()
            if (localSessions.isNotEmpty()) {
                Result.success(localSessions)
            } else {
                Result.failure(e)
            }
        }
    }

    override suspend fun getSession(id: Int): Result<ChatSession> {
        return try {
            val remoteSession = remoteDataSource.getSession(id)
            val domainSession = remoteSession.toModel()
            localDataSource.saveSession(domainSession)
            Result.success(domainSession)
        } catch (e: Exception) {
            e.printStackTrace()
            // Fallback to local
            val localSession = localDataSource.getSession(id)
            if (localSession != null) {
                Result.success(localSession)
            } else {
                Result.failure(e)
            }
        }
    }

    override suspend fun sendMessage(request: SendMessageRequest): Result<ChatMessage> {
        return try {
            val response = remoteDataSource.sendMessage(request)
            
            // The response contains text and games, but we must construct the ChatMessage Domain Object
            val assistantMessage = ChatMessage(
                id = null, // Will fetch true ID later if needed or rely on session refresh
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

    override suspend fun deleteSession(id: Int): Result<Unit> {
        return try {
            remoteDataSource.deleteSession(id)
            localDataSource.deleteSession(id)
            Result.success(Unit)
        } catch (e: Exception) {
            e.printStackTrace()
            // Maybe it was deleted remotely but local failed, or vice versa. Still want to delete local
            try {
                localDataSource.deleteSession(id)
            } catch (_: Exception) {}
            Result.failure(e)
        }
    }
}
