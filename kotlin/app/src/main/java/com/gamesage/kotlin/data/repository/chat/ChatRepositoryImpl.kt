package com.gamesage.kotlin.data.repository.chat

import com.gamesage.kotlin.data.ChatDataSource
import com.gamesage.kotlin.data.remote.model.ChatResponseApiModel
import com.gamesage.kotlin.data.remote.model.ChatSessionApiModel
import com.gamesage.kotlin.data.remote.model.SendMessageRequest
import com.gamesage.kotlin.di.RemoteDataSource
import javax.inject.Inject

class ChatRepositoryImpl @Inject constructor(
    @RemoteDataSource private val chatDataSource: ChatDataSource
) : ChatRepository {
    override suspend fun getSessions(): List<ChatSessionApiModel> = chatDataSource.getSessions()

    override suspend fun getSession(id: Int): ChatSessionApiModel = chatDataSource.getSession(id)

    override suspend fun sendMessage(request: SendMessageRequest): ChatResponseApiModel = chatDataSource.sendMessage(request)

    override suspend fun deleteSession(id: Int) = chatDataSource.deleteSession(id)
}
