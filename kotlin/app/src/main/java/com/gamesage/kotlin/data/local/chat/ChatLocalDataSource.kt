package com.gamesage.kotlin.data.local.chat

import com.gamesage.kotlin.data.local.chat.exceptions.ChatNotFoundException
import com.gamesage.kotlin.data.model.ChatMessage
import com.gamesage.kotlin.data.model.ChatSession
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject

// Acceso a sesiones y mensajes de chat en la base local (Room).
@Suppress("unused")
class ChatLocalDataSource @Inject constructor(
    private val chatDao: ChatDao
) {
    // Obtiene todas las sesiones guardadas en la base local.
    suspend fun getSessions(): Result<List<ChatSession>> {
        return Result.success(chatDao.getAllSessions().toModel())
    }

    // Obtiene una sesión por id con sus mensajes; falla con ChatNotFoundException si no existe.
    suspend fun getSession(id: Int): Result<ChatSession> {
        val sessionEntity = chatDao.getSessionById(id)
            ?: return Result.failure(ChatNotFoundException())
        val messages = chatDao.getMessagesForSession(id).toModel()
        return Result.success(sessionEntity.toModel(messages))
    }

    // Guarda la lista de sesiones en la base local.
    suspend fun saveSessions(sessions: List<ChatSession>) {
        chatDao.insertSessions(sessions.toEntity())
    }

    // Guarda una sesión y opcionalmente sus mensajes.
    suspend fun saveSession(session: ChatSession) {
        chatDao.insertSession(session.toEntity())
        session.messages?.let { messages ->
            chatDao.insertMessages(messages.toEntity())
        }
    }

    // Guarda una lista de mensajes en la base local.
    suspend fun saveMessages(messages: List<ChatMessage>) {
        chatDao.insertMessages(messages.toEntity())
    }

    // Guarda un solo mensaje en la base local.
    suspend fun saveMessage(message: ChatMessage) {
        chatDao.insertMessage(message.toEntity())
    }

    // Elimina una sesión y todos sus mensajes de la base local.
    suspend fun deleteSession(id: Int) {
        chatDao.deleteSession(id)
        chatDao.deleteMessagesForSession(id)
    }

    // Flujo que emite la lista de mensajes de una sesión cuando cambian en la base.
    fun observeMessages(sessionId: Int): Flow<Result<List<ChatMessage>>> {
        return chatDao.observeMessagesForSession(sessionId).map { Result.success(it.toModel()) }
    }
}
