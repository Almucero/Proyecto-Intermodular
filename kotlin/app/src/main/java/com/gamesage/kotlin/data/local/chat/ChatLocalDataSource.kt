package com.gamesage.kotlin.data.local.chat

import com.gamesage.kotlin.data.model.ChatMessage
import com.gamesage.kotlin.data.model.ChatSession
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject

@Suppress("unused")
class ChatLocalDataSource @Inject constructor(
    private val chatDao: ChatDao
) {
    suspend fun getSessions(): List<ChatSession> {
        return chatDao.getAllSessions().toModel()
    }

    suspend fun getSession(id: Int): ChatSession? {
        val sessionEntity = chatDao.getSessionById(id) ?: return null
        val messages = chatDao.getMessagesForSession(id).toModel()
        return sessionEntity.toModel(messages)
    }

    suspend fun saveSessions(sessions: List<ChatSession>) {
        chatDao.insertSessions(sessions.toEntity())
    }

    suspend fun saveSession(session: ChatSession) {
        chatDao.insertSession(session.toEntity())
        session.messages?.let { messages ->
            chatDao.insertMessages(messages.toEntity())
        }
    }

    suspend fun saveMessages(messages: List<ChatMessage>) {
        chatDao.insertMessages(messages.toEntity())
    }
    
    suspend fun saveMessage(message: ChatMessage) {
        chatDao.insertMessage(message.toEntity())
    }

    suspend fun deleteSession(id: Int) {
        chatDao.deleteSession(id)
        chatDao.deleteMessagesForSession(id)
    }

    fun observeMessages(sessionId: Int): Flow<List<ChatMessage>> {
        return chatDao.observeMessagesForSession(sessionId).map { it.toModel() }
    }
}
