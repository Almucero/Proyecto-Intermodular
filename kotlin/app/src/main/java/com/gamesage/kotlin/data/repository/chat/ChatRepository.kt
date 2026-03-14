package com.gamesage.kotlin.data.repository.chat

import com.gamesage.kotlin.data.model.ChatSession
import com.gamesage.kotlin.data.model.ChatMessage
import com.gamesage.kotlin.data.remote.model.SendMessageRequest

interface ChatRepository {
    suspend fun getSessions(): Result<List<ChatSession>>
    suspend fun getSession(id: Int): Result<ChatSession>
    suspend fun sendMessage(request: SendMessageRequest): Result<ChatMessage>
    suspend fun deleteSession(id: Int): Result<Unit>
}
