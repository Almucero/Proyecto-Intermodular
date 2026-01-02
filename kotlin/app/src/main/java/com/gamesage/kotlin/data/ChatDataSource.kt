package com.gamesage.kotlin.data

import com.gamesage.kotlin.data.remote.model.ChatResponseApiModel
import com.gamesage.kotlin.data.remote.model.ChatSessionApiModel
import com.gamesage.kotlin.data.remote.model.SendMessageRequest

interface ChatDataSource {
    suspend fun getSessions(): List<ChatSessionApiModel>
    suspend fun getSession(id: Int): ChatSessionApiModel
    suspend fun sendMessage(request: SendMessageRequest): ChatResponseApiModel
    suspend fun deleteSession(id: Int)
}
